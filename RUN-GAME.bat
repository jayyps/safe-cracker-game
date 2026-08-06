@echo off
setlocal
cd /d "%~dp0"

if not exist node_modules (
  echo Dependencies are not installed yet.
  echo Run SETUP-AND-RUN.bat first.
  pause
  exit /b 1
)

call npm run dev -- --open
