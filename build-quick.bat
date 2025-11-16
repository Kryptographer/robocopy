@echo off
REM ============================================================================
REM Robocopy GUI - Quick Build Script (Minimal Output)
REM ============================================================================

echo Building Robocopy GUI Portable...
echo.

REM Clean and install
if exist dist rmdir /s /q dist 2>nul
if exist portable rmdir /s /q portable 2>nul
call npm install >nul 2>&1

REM Build
call npm run build:win >nul 2>&1

if %errorlevel% neq 0 (
    echo Build failed! Run build-portable.bat for detailed output.
    pause
    exit /b 1
)

REM Organize portable builds
mkdir portable 2>nul
copy dist\*portable*.exe portable\ >nul 2>&1
copy dist\*.zip portable\ >nul 2>&1

echo.
echo Build complete! Check the 'portable' folder.
start "" portable
pause
