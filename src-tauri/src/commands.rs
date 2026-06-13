use std::{
    path::{Path, PathBuf},
    process::Command,
    thread,
    time::{SystemTime, UNIX_EPOCH},
};

use tauri::{AppHandle, Emitter, State};
use uuid::Uuid;

use crate::{
    models::{Game, GameProcessEvent, RunningGameInfo},
    store::{load_games, remove_cover, resolve_cover, save_games},
    RunningGameProcess, RunningGamesState,
};

fn today_string() -> Result<String, String> {
    let duration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|error| format!("system time error: {error}"))?;
    let days = duration.as_secs() / 86_400;
    let z = days as i64 + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1_460 + doe / 36_524 - doe / 146_096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = mp + if mp < 10 { 3 } else { -9 };
    let year = y + if m <= 2 { 1 } else { 0 };
    Ok(format!("{year:04}-{m:02}-{d:02}"))
}

fn derive_default_name(exe_path: &Path) -> String {
    exe_path
        .file_stem()
        .and_then(|value| value.to_str())
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or("Unknown Game")
        .to_string()
}

#[tauri::command]
pub fn get_games(app: AppHandle) -> Result<Vec<Game>, String> {
    load_games(&app)
}

#[tauri::command]
pub fn get_running_games(state: State<RunningGamesState>) -> Result<Vec<RunningGameInfo>, String> {
    let guard = state
        .processes
        .lock()
        .map_err(|_| "failed to read running game state".to_string())?;

    Ok(guard
        .iter()
        .map(|(id, process)| RunningGameInfo {
            id: id.clone(),
            pid: process.pid,
        })
        .collect())
}

#[tauri::command(rename_all = "camelCase")]
pub fn add_game(
    app: AppHandle,
    exe_path: String,
    name: Option<String>,
    cover_src: Option<String>,
) -> Result<Game, String> {
    let exe = PathBuf::from(&exe_path);
    if !exe.exists() {
        return Err("executable file does not exist".into());
    }

    let mut games = load_games(&app)?;
    let default_name = derive_default_name(&exe);
    let display_name = name
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or(default_name.as_str())
        .to_string();
    let cover_path = resolve_cover(&app, &exe_path, cover_src.as_deref(), &display_name)?;

    let game = Game {
        id: Uuid::new_v4().to_string(),
        name: display_name,
        default_name,
        exe_path,
        cover_path,
        added_date: today_string()?,
        status: "unplayed".to_string(),
    };

    games.push(game.clone());
    save_games(&app, &games)?;

    Ok(game)
}

#[tauri::command(rename_all = "camelCase")]
pub fn update_game_name(
    app: AppHandle,
    id: String,
    name: Option<String>,
) -> Result<Game, String> {
    let mut games = load_games(&app)?;
    let updated_game = {
        let game = games
            .iter_mut()
            .find(|game| game.id == id)
            .ok_or_else(|| "game not found".to_string())?;

        game.name = name
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .unwrap_or(game.default_name.as_str())
            .to_string();

        game.clone()
    };

    save_games(&app, &games)?;
    Ok(updated_game)
}

#[tauri::command]
pub fn update_game_status(app: AppHandle, id: String, status: String) -> Result<(), String> {
    if !matches!(status.as_str(), "unplayed" | "playing" | "finished") {
        return Err("invalid status value".into());
    }

    let mut games = load_games(&app)?;
    let game = games
        .iter_mut()
        .find(|game| game.id == id)
        .ok_or_else(|| "game not found".to_string())?;

    game.status = status;
    save_games(&app, &games)
}

#[tauri::command]
pub fn launch_game(
    app: AppHandle,
    state: State<RunningGamesState>,
    id: String,
) -> Result<String, String> {
    let games = load_games(&app)?;
    let game = games
        .iter()
        .find(|game| game.id == id)
        .ok_or_else(|| "game not found".to_string())?;

    {
        let guard = state
            .processes
            .lock()
            .map_err(|_| "failed to read running game state".to_string())?;
        if guard.contains_key(&id) {
            return Ok(format!("Game already running: {}", game.name));
        }
    }

    let exe_path = PathBuf::from(&game.exe_path);
    if !exe_path.exists() {
        return Err("executable file does not exist".into());
    }

    let work_dir = exe_path
        .parent()
        .ok_or_else(|| "failed to resolve game working directory".to_string())?;

    let mut child = Command::new(&exe_path)
        .current_dir(work_dir)
        .spawn()
        .map_err(|error| format!("failed to launch game: {error}"))?;

    let pid = child.id();
    {
        let mut guard = state
            .processes
            .lock()
            .map_err(|_| "failed to write running game state".to_string())?;
        guard.insert(id.clone(), RunningGameProcess { pid });
    }

    let _ = app.emit(
        "game-process-changed",
        GameProcessEvent {
            id: id.clone(),
            running: true,
            pid: Some(pid),
        },
    );

    let app_handle = app.clone();
    let processes = state.processes.clone();
    let game_id = id.clone();
    thread::spawn(move || {
        let _ = child.wait();
        if let Ok(mut guard) = processes.lock() {
            guard.remove(&game_id);
        }
        let _ = app_handle.emit(
            "game-process-changed",
            GameProcessEvent {
                id: game_id,
                running: false,
                pid: Some(pid),
            },
        );
    });

    Ok(format!("Game launched: {}", game.name))
}

#[tauri::command]
pub fn terminate_game(
    app: AppHandle,
    state: State<RunningGamesState>,
    id: String,
) -> Result<String, String> {
    let pid = {
        let guard = state
            .processes
            .lock()
            .map_err(|_| "failed to read running game state".to_string())?;
        guard
            .get(&id)
            .map(|process| process.pid)
            .ok_or_else(|| "no running game process found".to_string())?
    };

    let output = Command::new("taskkill")
        .args(["/PID", &pid.to_string(), "/T", "/F"])
        .output()
        .map_err(|error| format!("failed to terminate game: {error}"))?;

    if output.status.success() {
        return Ok("Terminate signal sent".to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    let combined = format!("{stdout}{stderr}");
    let lowered = combined.to_lowercase();

    if lowered.contains("not found") || combined.contains("没有找到") {
        if let Ok(mut guard) = state.processes.lock() {
            guard.remove(&id);
        }
        let _ = app.emit(
            "game-process-changed",
            GameProcessEvent {
                id,
                running: false,
                pid: Some(pid),
            },
        );
        return Ok("Game process already closed".to_string());
    }

    Err(format!("failed to terminate game: {}", combined.trim()))
}

#[tauri::command]
pub fn delete_game(
    app: AppHandle,
    state: State<RunningGamesState>,
    id: String,
) -> Result<(), String> {
    {
        let guard = state
            .processes
            .lock()
            .map_err(|_| "failed to read running game state".to_string())?;
        if guard.contains_key(&id) {
            return Err("please terminate the running game first".to_string());
        }
    }

    let mut games = load_games(&app)?;
    let target = games
        .iter()
        .find(|game| game.id == id)
        .cloned()
        .ok_or_else(|| "game not found".to_string())?;

    games.retain(|game| game.id != id);
    save_games(&app, &games)?;
    remove_cover(&target.cover_path)?;

    Ok(())
}
