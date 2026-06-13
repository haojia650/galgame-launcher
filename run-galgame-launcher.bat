@echo off
setlocal EnableExtensions

cd /d "%~dp0"
title Galgame Launcher Runner

set "CARGO_BIN=%USERPROFILE%\.cargo\bin"
if exist "%CARGO_BIN%\cargo.exe" (
  set "PATH=%CARGO_BIN%;%PATH%"
)

set "NODE_BIN=C:\Program Files\nodejs"
if exist "%NODE_BIN%\node.exe" (
  set "PATH=%NODE_BIN%;%PATH%"
)

set "APP_EXE=%~dp0src-tauri\target\release\Galgame Launcher.exe"
if exist "%APP_EXE%" (
  start "" "%APP_EXE%"
  exit /b 0
)

where pnpm >nul 2>nul
if errorlevel 1 (
  echo [Error] pnpm not found in PATH.
  echo Install Node.js and pnpm first, then try again.
  pause
  exit /b 1
)

where cargo >nul 2>nul
if errorlevel 1 (
  echo [Error] cargo not found in PATH.
  echo Rust was not found. Expected location:
  echo   %CARGO_BIN%
  pause
  exit /b 1
)

if not exist "%~dp0node_modules" (
  echo [Setup] Installing frontend dependencies...
  call pnpm install
  if errorlevel 1 (
    echo [Error] pnpm install failed.
    pause
    exit /b 1
  )
)

echo [Run] Starting Galgame Launcher...
call pnpm tauri dev
if errorlevel 1 (
  echo.
  echo [Error] Failed to start Galgame Launcher.
  pause
  exit /b 1
)

exit /b 0
