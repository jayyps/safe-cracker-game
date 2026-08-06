@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo   Vault Rush - Clean Project Setup
echo ============================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js was not found.
  echo Install Node.js 22.12 or newer, then run this file again.
  pause
  exit /b 1
)

echo Installing project dependencies...
call npm install
if errorlevel 1 goto :failure

echo.
echo Running lint, automated tests, and production build...
call npm run check
if errorlevel 1 goto :failure

echo.
echo All checks passed. Starting Vault Rush...
call npm run dev -- --open
exit /b 0

:failure
echo.
echo SETUP FAILED. Read the error above before changing any files.
pause
exit /b 1
