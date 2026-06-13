use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Game {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub default_name: String,
    pub exe_path: String,
    pub cover_path: String,
    pub added_date: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunningGameInfo {
    pub id: String,
    pub pid: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameProcessEvent {
    pub id: String,
    pub running: bool,
    pub pid: Option<u32>,
}
