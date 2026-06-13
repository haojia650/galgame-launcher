export type GameStatus = "unplayed" | "playing" | "finished";

export interface Game {
  id: string;
  name: string;
  default_name: string;
  exe_path: string;
  cover_path: string;
  added_date: string;
  status: GameStatus;
}

export type FilterKey = "all" | GameStatus;

export interface ToastItem {
  id: string;
  message: string;
  kind?: "success" | "info" | "error";
}

export interface AddGamePayload {
  exePath: string;
  name?: string | null;
  coverSrc?: string | null;
}

export interface RunningGameInfo {
  id: string;
  pid: number;
}

export interface GameProcessEvent {
  id: string;
  running: boolean;
  pid?: number | null;
}
