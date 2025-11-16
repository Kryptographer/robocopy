@echo off
REM ============================================================================
REM Robocopy GUI - Portable Build Script
REM ============================================================================
REM This script compiles the Electron app and creates a portable executable
REM ============================================================================

setlocal enabledelayedexpansion

echo.
echo ============================================================================
echo  Robocopy GUI - Portable Build Script
echo ============================================================================
echo.

REM Set color for better visibility (if available)
color 0A

REM ============================================================================
REM Configuration
REM ============================================================================

set "BUILD_DIR=dist"
set "PORTABLE_DIR=portable"
set "LOG_FILE=build-log.txt"

REM ============================================================================
REM Step 1: Check Prerequisites
REM ============================================================================

echo [1/6] Checking prerequisites...
echo.

REM Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    echo Required version: Node.js 20.0.0 or higher
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo    Node.js version: %NODE_VERSION%

REM Check for npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed or not in PATH!
    pause
    exit /b 1
)

REM Check npm version
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo    npm version: v%NPM_VERSION%
echo.

REM ============================================================================
REM Step 2: Clean Previous Builds
REM ============================================================================

echo [2/6] Cleaning previous builds...
echo.

if exist "%BUILD_DIR%" (
    echo    Removing old dist folder...
    rmdir /s /q "%BUILD_DIR%" 2>nul
)

if exist "%PORTABLE_DIR%" (
    echo    Removing old portable folder...
    rmdir /s /q "%PORTABLE_DIR%" 2>nul
)

if exist "node_modules" (
    echo    Removing old node_modules...
    rmdir /s /q "node_modules" 2>nul
)

if exist "%LOG_FILE%" (
    del /q "%LOG_FILE%" 2>nul
)

echo    Clean completed!
echo.

REM ============================================================================
REM Step 3: Install Dependencies
REM ============================================================================

echo [3/6] Installing dependencies...
echo.

echo    Running npm install...
call npm install >> "%LOG_FILE%" 2>&1

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies!
    echo Check %LOG_FILE% for details.
    pause
    exit /b 1
)

echo    Dependencies installed successfully!
echo.

REM ============================================================================
REM Step 4: Run Linting (Optional - will continue on error)
REM ============================================================================

echo [4/6] Running code linting...
echo.

call npm run lint >> "%LOG_FILE%" 2>&1

if %errorlevel% neq 0 (
    echo [WARNING] Linting found issues. Check %LOG_FILE% for details.
    echo Continuing with build...
) else (
    echo    Linting passed!
)
echo.

REM ============================================================================
REM Step 5: Build Portable Application
REM ============================================================================

echo [5/6] Building portable application...
echo    This may take several minutes...
echo.

echo    Building for Windows x64 (portable)...
call npm run build:win >> "%LOG_FILE%" 2>&1

if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    echo Check %LOG_FILE% for details.
    pause
    exit /b 1
)

echo    Build completed successfully!
echo.

REM ============================================================================
REM Step 6: Organize Portable Build
REM ============================================================================

echo [6/6] Organizing portable build...
echo.

REM Create portable directory
if not exist "%PORTABLE_DIR%" (
    mkdir "%PORTABLE_DIR%"
)

REM Find and copy portable executable
if exist "%BUILD_DIR%\*.exe" (
    echo    Copying portable executables...

    REM Copy all built files to portable directory
    for %%f in ("%BUILD_DIR%\*portable*.exe") do (
        copy "%%f" "%PORTABLE_DIR%\" >nul
        echo    - %%~nxf
    )

    REM Also copy zip files if they exist
    for %%f in ("%BUILD_DIR%\*.zip") do (
        copy "%%f" "%PORTABLE_DIR%\" >nul
        echo    - %%~nxf
    )
)

echo.

REM ============================================================================
REM Build Complete
REM ============================================================================

echo ============================================================================
echo  BUILD SUCCESSFUL!
echo ============================================================================
echo.
echo Portable application created in: %PORTABLE_DIR%\
echo All build artifacts available in: %BUILD_DIR%\
echo.
echo Build log saved to: %LOG_FILE%
echo.

REM List the portable files
if exist "%PORTABLE_DIR%\" (
    echo Portable files created:
    dir /b "%PORTABLE_DIR%"
    echo.
)

echo ============================================================================
echo  Usage Instructions:
echo ============================================================================
echo.
echo 1. Navigate to the '%PORTABLE_DIR%' folder
echo 2. Run the .exe file directly (no installation needed)
echo 3. The portable app will store settings in its own directory
echo.
echo For distribution, you can:
echo  - Share the .exe file directly
echo  - Or share the .zip file for easier distribution
echo.
echo ============================================================================

REM Open the portable directory
if exist "%PORTABLE_DIR%\" (
    echo Opening portable directory...
    start "" "%PORTABLE_DIR%"
)

echo.
echo Press any key to exit...
pause >nul

endlocal
exit /b 0
