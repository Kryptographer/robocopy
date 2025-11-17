@echo off
REM ============================================================================
REM Robocopy GUI - Comprehensive Build and Verification Script
REM ============================================================================
REM This script performs a complete build with extensive verification:
REM 1. Prerequisites check (Node.js, npm, required files)
REM 2. Code quality checks (linting, tests)
REM 3. Clean build process
REM 4. Portable application creation
REM 5. Build verification and validation
REM 6. Detailed reporting
REM ============================================================================

setlocal enabledelayedexpansion

echo.
echo ============================================================================
echo  ROBOCOPY GUI - COMPREHENSIVE BUILD ^& VERIFICATION
echo ============================================================================
echo  This script will build and thoroughly verify the portable application
echo ============================================================================
echo.

REM Set color for better visibility (if available)
color 0A

REM ============================================================================
REM Configuration
REM ============================================================================

set "BUILD_DIR=dist"
set "PORTABLE_DIR=portable"
set "LOG_FILE=build-verification-log.txt"
set "ERROR_LOG=build-errors.txt"
set "BUILD_TIMESTAMP=%date:~-4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "BUILD_TIMESTAMP=%BUILD_TIMESTAMP: =0%"

REM Error tracking
set "ERROR_COUNT=0"
set "WARNING_COUNT=0"

REM Initialize log files
echo Build started at %date% %time% > "%LOG_FILE%"
echo. > "%ERROR_LOG%"

REM ============================================================================
REM Step 1: Check Prerequisites and Required Files
REM ============================================================================

echo [1/8] Checking prerequisites and required files...
echo ============================================================================
echo.

REM Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    echo Required version: Node.js 20.0.0 or higher
    echo Node.js check FAILED >> "%ERROR_LOG%"
    set /a ERROR_COUNT+=1
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo    [OK] Node.js version: %NODE_VERSION%

REM Verify Node.js version is 20 or higher
for /f "tokens=1 delims=v." %%a in ("%NODE_VERSION%") do set NODE_MAJOR=%%a
for /f "tokens=2 delims=v." %%a in ("%NODE_VERSION%") do set NODE_MAJOR=%%a

if %NODE_MAJOR% LSS 20 (
    echo [WARNING] Node.js version should be 20.0.0 or higher
    echo Current version: %NODE_VERSION%
    set /a WARNING_COUNT+=1
)

REM Check for npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed or not in PATH!
    echo npm check FAILED >> "%ERROR_LOG%"
    set /a ERROR_COUNT+=1
    pause
    exit /b 1
)

REM Check npm version
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo    [OK] npm version: v%NPM_VERSION%

REM Check for required files
echo.
echo    Checking required project files...

set "REQUIRED_FILES=package.json main.js renderer.js preload.js index.html styles.css electron-builder.json"
for %%f in (%REQUIRED_FILES%) do (
    if exist "%%f" (
        echo    [OK] Found: %%f
    ) else (
        echo    [ERROR] Missing: %%f
        echo Missing file: %%f >> "%ERROR_LOG%"
        set /a ERROR_COUNT+=1
    )
)

REM Check for build directory and icon
if not exist "build" (
    echo    [WARNING] build directory not found, creating...
    mkdir "build"
    set /a WARNING_COUNT+=1
)

if not exist "build\icon.ico" (
    echo    [WARNING] build\icon.ico not found
    echo    Build will continue but the application icon may be missing
    echo    Please add an icon.ico file to the build directory for production
    echo Missing icon.ico >> "%ERROR_LOG%"
    set /a WARNING_COUNT+=1
)

echo.
echo    Prerequisites check complete!
echo    Errors: %ERROR_COUNT% ^| Warnings: %WARNING_COUNT%
echo.

if %ERROR_COUNT% GTR 0 (
    echo [FATAL] Cannot continue with %ERROR_COUNT% error(s). Please fix and retry.
    pause
    exit /b 1
)

REM ============================================================================
REM Step 2: Clean Previous Builds
REM ============================================================================

echo [2/8] Cleaning previous builds...
echo ============================================================================
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
    echo    Removing old node_modules for clean install...
    rmdir /s /q "node_modules" 2>nul
)

if exist "package-lock.json" (
    echo    Removing package-lock.json for clean install...
    del /q "package-lock.json" 2>nul
)

echo    Clean completed!
echo.

REM ============================================================================
REM Step 3: Install Dependencies
REM ============================================================================

echo [3/8] Installing dependencies...
echo ============================================================================
echo.

echo    Running npm install (this may take a few minutes)...
call npm install >> "%LOG_FILE%" 2>&1

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies!
    echo Check %LOG_FILE% for details.
    echo npm install FAILED >> "%ERROR_LOG%"
    set /a ERROR_COUNT+=1
    pause
    exit /b 1
)

echo    [OK] Dependencies installed successfully!
echo.

REM ============================================================================
REM Step 4: Run Code Linting
REM ============================================================================

echo [4/8] Running code linting...
echo ============================================================================
echo.

call npm run lint >> "%LOG_FILE%" 2>&1

if %errorlevel% neq 0 (
    echo [WARNING] Linting found issues. Check %LOG_FILE% for details.
    echo Linting issues detected >> "%ERROR_LOG%"
    set /a WARNING_COUNT+=1
) else (
    echo    [OK] Linting passed!
)
echo.

REM ============================================================================
REM Step 5: Run Unit Tests
REM ============================================================================

echo [5/8] Running unit tests...
echo ============================================================================
echo.

call npm test >> "%LOG_FILE%" 2>&1

if %errorlevel% neq 0 (
    echo [WARNING] Some tests failed. Check %LOG_FILE% for details.
    echo Unit tests FAILED >> "%ERROR_LOG%"
    set /a WARNING_COUNT+=1
) else (
    echo    [OK] All tests passed!
)
echo.

REM ============================================================================
REM Step 6: Build Portable Application
REM ============================================================================

echo [6/8] Building portable application...
echo ============================================================================
echo    This may take several minutes depending on your system...
echo.

set BUILD_START=%time%
echo    Build started at: %BUILD_START%
echo.

call npm run build:win >> "%LOG_FILE%" 2>&1

if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    echo Check %LOG_FILE% for details.
    echo Build FAILED >> "%ERROR_LOG%"
    set /a ERROR_COUNT+=1
    pause
    exit /b 1
)

set BUILD_END=%time%
echo    Build completed at: %BUILD_END%
echo    [OK] Build completed successfully!
echo.

REM ============================================================================
REM Step 7: Verify Build Output
REM ============================================================================

echo [7/8] Verifying build output...
echo ============================================================================
echo.

REM Check if dist directory was created
if not exist "%BUILD_DIR%" (
    echo [ERROR] Build directory not created!
    echo Build output verification FAILED >> "%ERROR_LOG%"
    set /a ERROR_COUNT+=1
    pause
    exit /b 1
)

echo    [OK] Build directory exists
echo.
echo    Checking for build artifacts...

REM Create portable directory
if not exist "%PORTABLE_DIR%" (
    mkdir "%PORTABLE_DIR%"
)

REM Count and verify artifacts
set "PORTABLE_COUNT=0"
set "NSIS_COUNT=0"
set "ZIP_COUNT=0"

REM Check for portable executables
for %%f in ("%BUILD_DIR%\*portable*.exe") do (
    if exist "%%f" (
        set /a PORTABLE_COUNT+=1
        echo    [OK] Found portable executable: %%~nxf
        copy "%%f" "%PORTABLE_DIR%\" >nul 2>&1

        REM Get file size
        for %%A in ("%%f") do set SIZE=%%~zA
        set /a SIZE_MB=!SIZE! / 1048576
        echo         Size: !SIZE_MB! MB
    )
)

REM Check for NSIS installers
for %%f in ("%BUILD_DIR%\*.exe") do (
    set "FILENAME=%%~nxf"
    echo !FILENAME! | findstr /i "portable" >nul
    if errorlevel 1 (
        if exist "%%f" (
            set /a NSIS_COUNT+=1
            echo    [OK] Found NSIS installer: %%~nxf
            for %%A in ("%%f") do set SIZE=%%~zA
            set /a SIZE_MB=!SIZE! / 1048576
            echo         Size: !SIZE_MB! MB
        )
    )
)

REM Check for ZIP files
for %%f in ("%BUILD_DIR%\*.zip") do (
    if exist "%%f" (
        set /a ZIP_COUNT+=1
        echo    [OK] Found ZIP archive: %%~nxf
        copy "%%f" "%PORTABLE_DIR%\" >nul 2>&1
        for %%A in ("%%f") do set SIZE=%%~zA
        set /a SIZE_MB=!SIZE! / 1048576
        echo         Size: !SIZE_MB! MB
    )
)

echo.
echo    Build artifacts summary:
echo    - Portable executables: %PORTABLE_COUNT%
echo    - NSIS installers: %NSIS_COUNT%
echo    - ZIP archives: %ZIP_COUNT%
echo.

if %PORTABLE_COUNT% EQU 0 (
    echo [ERROR] No portable executable was created!
    echo No portable executable found >> "%ERROR_LOG%"
    set /a ERROR_COUNT+=1
)

REM ============================================================================
REM Step 8: Final Verification and Report
REM ============================================================================

echo [8/8] Final verification and reporting...
echo ============================================================================
echo.

REM Check portable directory
if exist "%PORTABLE_DIR%\" (
    echo    Portable build directory: %PORTABLE_DIR%\
    echo    Contents:
    dir /b "%PORTABLE_DIR%"
    echo.
)

REM Generate verification report
echo    Generating verification report...
echo.

echo ============================================================================ > build-verification-report.txt
echo  ROBOCOPY GUI - BUILD VERIFICATION REPORT >> build-verification-report.txt
echo ============================================================================ >> build-verification-report.txt
echo. >> build-verification-report.txt
echo Build Timestamp: %BUILD_TIMESTAMP% >> build-verification-report.txt
echo Build Date: %date% %time% >> build-verification-report.txt
echo. >> build-verification-report.txt
echo ============================================================================ >> build-verification-report.txt
echo  SYSTEM INFORMATION >> build-verification-report.txt
echo ============================================================================ >> build-verification-report.txt
echo Node.js Version: %NODE_VERSION% >> build-verification-report.txt
echo npm Version: %NPM_VERSION% >> build-verification-report.txt
echo Platform: %OS% >> build-verification-report.txt
echo. >> build-verification-report.txt
echo ============================================================================ >> build-verification-report.txt
echo  BUILD RESULTS >> build-verification-report.txt
echo ============================================================================ >> build-verification-report.txt
echo Portable Executables: %PORTABLE_COUNT% >> build-verification-report.txt
echo NSIS Installers: %NSIS_COUNT% >> build-verification-report.txt
echo ZIP Archives: %ZIP_COUNT% >> build-verification-report.txt
echo. >> build-verification-report.txt
echo Errors: %ERROR_COUNT% >> build-verification-report.txt
echo Warnings: %WARNING_COUNT% >> build-verification-report.txt
echo. >> build-verification-report.txt

if %ERROR_COUNT% GTR 0 (
    echo Status: FAILED >> build-verification-report.txt
) else if %WARNING_COUNT% GTR 0 (
    echo Status: SUCCESS WITH WARNINGS >> build-verification-report.txt
) else (
    echo Status: SUCCESS >> build-verification-report.txt
)

echo. >> build-verification-report.txt
echo ============================================================================ >> build-verification-report.txt
echo  BUILD ARTIFACTS >> build-verification-report.txt
echo ============================================================================ >> build-verification-report.txt
dir "%PORTABLE_DIR%" /b >> build-verification-report.txt 2>&1
echo. >> build-verification-report.txt

echo    [OK] Verification report saved to: build-verification-report.txt
echo.

REM ============================================================================
REM Build Complete - Display Summary
REM ============================================================================

echo.
echo ============================================================================
if %ERROR_COUNT% GTR 0 (
    color 0C
    echo  BUILD COMPLETED WITH ERRORS!
) else if %WARNING_COUNT% GTR 0 (
    color 0E
    echo  BUILD COMPLETED WITH WARNINGS!
) else (
    color 0A
    echo  BUILD SUCCESSFUL!
)
echo ============================================================================
echo.

echo Summary:
echo    - Errors: %ERROR_COUNT%
echo    - Warnings: %WARNING_COUNT%
echo    - Portable executables created: %PORTABLE_COUNT%
echo    - NSIS installers created: %NSIS_COUNT%
echo    - ZIP archives created: %ZIP_COUNT%
echo.

echo Output locations:
echo    - Portable files: %PORTABLE_DIR%\
echo    - All build artifacts: %BUILD_DIR%\
echo    - Build log: %LOG_FILE%
echo    - Verification report: build-verification-report.txt
echo.

if %ERROR_COUNT% GTR 0 (
    echo [!] Please check %ERROR_LOG% for error details
    echo.
)

echo ============================================================================
echo  USAGE INSTRUCTIONS
echo ============================================================================
echo.
echo To run the portable application:
echo    1. Navigate to the '%PORTABLE_DIR%' folder
echo    2. Double-click the .exe file (no installation required)
echo    3. The application will run directly
echo.
echo For distribution:
echo    - Share the .exe file from the portable folder
echo    - Or share the .zip file for easier distribution
echo.

if %WARNING_COUNT% GTR 0 (
    echo NOTE: Build completed with warnings. Application should work but
    echo       please review the warnings in %LOG_FILE%
    echo.
)

echo ============================================================================

REM Open directories
if exist "%PORTABLE_DIR%\" (
    if %ERROR_COUNT% EQU 0 (
        echo Opening portable directory...
        start "" "%PORTABLE_DIR%"
    )
)

echo.
echo Press any key to exit...
pause >nul

endlocal
exit /b %ERROR_COUNT%
