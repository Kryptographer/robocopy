@echo off
REM ============================================================================
REM Robocopy GUI - Portable Build Script
REM ============================================================================
REM Simple script to install dependencies and build the portable executable
REM ============================================================================

setlocal enabledelayedexpansion

REM Change to the directory where this script is located
cd /d "%~dp0"

echo.
echo ============================================================================
echo  Robocopy GUI - Portable Build Script
echo ============================================================================
echo.

REM ============================================================================
REM Check Prerequisites
REM ============================================================================

echo [1/4] Checking prerequisites...
echo.

REM Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo    Node.js: %NODE_VERSION%

REM Check for npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed or not in PATH!
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo    npm: v%NPM_VERSION%
echo.

REM ============================================================================
REM Clean Previous Builds
REM ============================================================================

echo [2/4] Cleaning previous builds...
echo.

if exist "dist" (
    echo    Removing old dist folder...
    rmdir /s /q "dist" 2>nul
)

if exist "portable" (
    echo    Removing old portable folder...
    rmdir /s /q "portable" 2>nul
)

echo    Clean completed!
echo.

REM ============================================================================
REM Install Dependencies
REM ============================================================================

echo [3/4] Installing dependencies...
echo    This may take a few minutes...
echo.

call npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo    Dependencies installed successfully!
echo.

REM ============================================================================
REM Build Portable Application
REM ============================================================================

echo [4/4] Building portable application...
echo    This may take several minutes...
echo.

call npm run build:win
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo    Build completed successfully!
echo.

REM ============================================================================
REM Organize Portable Files
REM ============================================================================

echo Organizing portable files...
echo.

if not exist "portable" mkdir "portable"

REM Copy portable executable and ZIP files
if exist "dist\*portable*.exe" (
    copy "dist\*portable*.exe" "portable\" >nul 2>&1
    echo    Copied portable executable(s)
)

if exist "dist\*.zip" (
    copy "dist\*.zip" "portable\" >nul 2>&1
    echo    Copied ZIP archive(s)
)

echo.

REM ============================================================================
REM Build Complete
REM ============================================================================

echo ============================================================================
echo  BUILD SUCCESSFUL!
echo ============================================================================
echo.
echo Portable application created in the 'portable' folder:
echo.

if exist "portable\" (
    dir /b "portable"
    echo.
)

echo ============================================================================
echo  USAGE:
echo ============================================================================
echo  1. Navigate to the 'portable' folder
echo  2. Run the .exe file (no installation needed)
echo  3. The portable app runs directly from any location
echo ============================================================================
echo.

REM Open portable folder
if exist "portable\" (
    echo Opening portable folder...
    start "" "portable"
)

echo.
pause

endlocal
exit /b 0
