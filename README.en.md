# Game Launcher

A Windows desktop launcher for Galgames, built with Tauri v2, Rust, React, TypeScript, Vite, Tailwind CSS, and framer-motion.

## Overview

This project is a local game launcher focused on:

- Managing Galgame executables
- Displaying custom or auto-generated covers
- Launching and terminating games from the launcher
- Tracking game status
- Supporting multilingual UI
- Providing a PCL-inspired animated desktop interface

## Features

- Add local `.exe` games
- Use executable file name as the default game name
- Override the displayed game name with a custom name
- Restore a game name back to its default name
- Auto-extract the executable icon as the cover when no custom cover is provided
- Fall back to a generated placeholder cover if icon extraction fails
- Launch games from the UI
- Show running state in the launcher
- Terminate running games directly from the launcher
- Track game status:
  - `unplayed`
  - `playing`
  - `finished`
- Filter by category
- Search by game name
- Multilingual UI:
  - Simplified Chinese
  - English
  - Japanese

## Tech Stack

- Desktop: Tauri v2
- Backend: Rust
- Frontend: React 18 + TypeScript
- Build tool: Vite
- Styling: Tailwind CSS + custom CSS
- Animation: framer-motion
- Package manager: pnpm

## Project Structure

```text
game-launcher/
├── src/                     # React frontend
├── src-tauri/               # Tauri + Rust backend
├── release/                 # Built executable outputs
├── run-galgame-launcher.bat # Double-click launcher script
├── package.json
└── README files
```

## Important Frontend Files

- `src/App.tsx`
  - Main layout, filters, search, language switching, dynamic background
- `src/hooks/useGames.ts`
  - Tauri command integration, running-state sync, toast management
- `src/hooks/useLocale.ts`
  - Locale selection and persistence
- `src/i18n.ts`
  - UI messages for Chinese, English, and Japanese
- `src/components/GameCard.tsx`
  - Card animation, running state, rename/reset/default-name logic, management menu
- `src/components/AddGameModal.tsx`
  - Add game flow, executable selection, optional cover selection

## Important Backend Files

- `src-tauri/src/lib.rs`
  - Tauri app entry and state registration
- `src-tauri/src/commands.rs`
  - Tauri commands for add/load/update/launch/terminate/delete
- `src-tauri/src/store.rs`
  - JSON storage, cover copying, icon extraction, placeholder cover generation
- `src-tauri/src/models.rs`
  - Shared Rust data structures

## Data Model

Each game entry contains fields like:

- `id`
- `name`
- `default_name`
- `exe_path`
- `cover_path`
- `added_date`
- `status`

Game data is stored in the app data directory as `games.json`.
Cover files are stored in the app data directory under `covers/`.

## Development

### Prerequisites

- Node.js
- pnpm
- Rust toolchain
- Tauri Windows prerequisites

### Install dependencies

```powershell
pnpm install
```

### Run in development mode

```powershell
pnpm tauri dev
```

### Build frontend

```powershell
pnpm build
```

### Check Rust backend

```powershell
cd src-tauri
cargo check
```

## Double-click Startup

You can also start the app by double-clicking:

```text
run-galgame-launcher.bat
```

The script tries to:

- Add common Rust and Node paths into `PATH`
- Start a built executable if it exists
- Otherwise run `pnpm tauri dev`

## UI Notes

- Dark glassmorphism style
- Dynamic cover-based background
- PCL-inspired card layout and motion
- Hover jelly animation
- Press-and-bounce launch animation
- Toast notifications

## Current Status

The project currently supports:

- Game import
- Default/custom naming
- Default/custom cover handling
- Running process tracking
- In-launcher termination
- Status management
- Multilingual UI

## License

No license file is currently included in this repository.
