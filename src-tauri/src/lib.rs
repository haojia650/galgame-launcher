mod commands;
mod models;
mod store;

use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

#[derive(Debug, Clone)]
pub struct RunningGameProcess {
    pub pid: u32,
}

#[derive(Clone, Default)]
pub struct RunningGamesState {
    pub processes: Arc<Mutex<HashMap<String, RunningGameProcess>>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(RunningGamesState::default())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::add_game,
            commands::get_games,
            commands::get_running_games,
            commands::update_game_name,
            commands::update_game_status,
            commands::launch_game,
            commands::terminate_game,
            commands::delete_game
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
