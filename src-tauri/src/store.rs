use std::{
    fs,
    path::{Path, PathBuf},
    process::Command,
};

use tauri::{AppHandle, Manager};
use uuid::Uuid;

use crate::models::Game;

pub type StoreResult<T> = Result<T, String>;

fn ensure_data_dir(app: &AppHandle) -> StoreResult<PathBuf> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("failed to get app data dir: {error}"))?;

    fs::create_dir_all(&data_dir)
        .map_err(|error| format!("failed to create app data dir: {error}"))?;

    let covers_dir = data_dir.join("covers");
    fs::create_dir_all(&covers_dir)
        .map_err(|error| format!("failed to create covers dir: {error}"))?;

    Ok(data_dir)
}

fn covers_dir(app: &AppHandle) -> StoreResult<PathBuf> {
    Ok(ensure_data_dir(app)?.join("covers"))
}

fn normalize_path(path: PathBuf) -> String {
    path.to_string_lossy().replace('\\', "/")
}

fn escape_ps_literal(value: &str) -> String {
    value.replace('\'', "''")
}

fn run_powershell(script: &str) -> StoreResult<()> {
    let mut last_error = String::from("failed to run PowerShell icon extraction script");

    for shell in ["powershell", "pwsh"] {
        match Command::new(shell)
            .args(["-NoProfile", "-NonInteractive", "-Command", script])
            .status()
        {
            Ok(status) if status.success() => return Ok(()),
            Ok(status) => {
                last_error = format!("{shell} exited with status {status}");
            }
            Err(error) => {
                last_error = format!("failed to start {shell}: {error}");
            }
        }
    }

    Err(last_error)
}

pub fn games_file(app: &AppHandle) -> StoreResult<PathBuf> {
    Ok(ensure_data_dir(app)?.join("games.json"))
}

pub fn load_games(app: &AppHandle) -> StoreResult<Vec<Game>> {
    let games_file = games_file(app)?;
    if !games_file.exists() {
        return Ok(Vec::new());
    }

    let content = fs::read_to_string(&games_file)
        .map_err(|error| format!("failed to read games file: {error}"))?;

    if content.trim().is_empty() {
        return Ok(Vec::new());
    }

    let mut games = serde_json::from_str::<Vec<Game>>(&content)
        .map_err(|error| format!("failed to parse games file: {error}"))?;

    for game in &mut games {
        if game.default_name.trim().is_empty() {
            game.default_name = game.name.clone();
        }
    }

    Ok(games)
}

pub fn save_games(app: &AppHandle, games: &[Game]) -> StoreResult<()> {
    let games_file = games_file(app)?;
    let json = serde_json::to_string_pretty(games)
        .map_err(|error| format!("failed to serialize games: {error}"))?;

    fs::write(games_file, json).map_err(|error| format!("failed to write games file: {error}"))
}

fn copy_custom_cover(app: &AppHandle, source: &str) -> StoreResult<String> {
    let source_path = PathBuf::from(source);
    if !source_path.exists() {
        return Err("cover file does not exist".into());
    }

    let covers_dir = covers_dir(app)?;
    let extension = source_path
        .extension()
        .and_then(|value| value.to_str())
        .unwrap_or("jpg");

    let file_name = format!("{}.{}", Uuid::new_v4(), extension);
    let target_path = covers_dir.join(file_name);

    fs::copy(&source_path, &target_path)
        .map_err(|error| format!("failed to copy cover: {error}"))?;

    Ok(normalize_path(target_path))
}

fn write_placeholder_cover(app: &AppHandle, title: &str) -> StoreResult<String> {
    let first_letter = title
        .chars()
        .find(|value| value.is_alphanumeric())
        .unwrap_or('G')
        .to_uppercase()
        .to_string();

    let target_path = covers_dir(app)?.join(format!("{}.svg", Uuid::new_v4()));
    let svg = format!(
        r##"<svg xmlns="http://www.w3.org/2000/svg" width="720" height="960" viewBox="0 0 720 960" fill="none">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#151727"/>
    <stop offset="100%" stop-color="#0B0E17"/>
  </linearGradient>
  <radialGradient id="glowA" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(170 160) rotate(35) scale(360 300)">
    <stop stop-color="#FFB4C8" stop-opacity="0.42"/>
    <stop offset="1" stop-color="#FFB4C8" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="glowB" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(540 210) rotate(120) scale(280 240)">
    <stop stop-color="#C4B5FD" stop-opacity="0.32"/>
    <stop offset="1" stop-color="#C4B5FD" stop-opacity="0"/>
  </radialGradient>
</defs>
<rect width="720" height="960" rx="48" fill="url(#bg)"/>
<rect width="720" height="960" rx="48" fill="url(#glowA)"/>
<rect width="720" height="960" rx="48" fill="url(#glowB)"/>
<text x="50%" y="55%" text-anchor="middle" fill="white" fill-opacity="0.92" font-family="Segoe UI, PingFang SC, sans-serif" font-size="240" font-weight="300">{first_letter}</text>
</svg>"##
    );

    fs::write(&target_path, svg)
        .map_err(|error| format!("failed to write placeholder cover: {error}"))?;

    Ok(normalize_path(target_path))
}

fn extract_exe_icon(app: &AppHandle, exe_path: &str) -> StoreResult<String> {
    let source_path = PathBuf::from(exe_path);
    if !source_path.exists() {
        return Err("executable file does not exist".into());
    }

    let target_path = covers_dir(app)?.join(format!("{}.png", Uuid::new_v4()));
    let script = format!(
        "Add-Type -AssemblyName System.Drawing; \
         $icon = [System.Drawing.Icon]::ExtractAssociatedIcon('{source}'); \
         if ($null -eq $icon) {{ exit 1 }}; \
         $bitmap = $icon.ToBitmap(); \
         try {{ $bitmap.Save('{target}', [System.Drawing.Imaging.ImageFormat]::Png) }} \
         finally {{ $bitmap.Dispose(); $icon.Dispose() }}",
        source = escape_ps_literal(&source_path.to_string_lossy()),
        target = escape_ps_literal(&target_path.to_string_lossy())
    );

    run_powershell(&script)?;
    Ok(normalize_path(target_path))
}

pub fn resolve_cover(
    app: &AppHandle,
    exe_path: &str,
    cover_src: Option<&str>,
    title: &str,
) -> StoreResult<String> {
    match cover_src.map(str::trim).filter(|value| !value.is_empty()) {
        Some(source) => copy_custom_cover(app, source),
        None => extract_exe_icon(app, exe_path).or_else(|_| write_placeholder_cover(app, title)),
    }
}

pub fn remove_cover(path: &str) -> StoreResult<()> {
    let cover_path = Path::new(path);
    if cover_path.exists() {
        fs::remove_file(cover_path).map_err(|error| format!("failed to remove cover: {error}"))?;
    }
    Ok(())
}
