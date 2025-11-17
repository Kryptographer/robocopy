# Build Instructions

This document explains how to build the Robocopy GUI as a portable application.

## Prerequisites

Before building, ensure you have:

- **Node.js** version 20.0.0 or higher ([Download](https://nodejs.org/))
- **npm** version 10.0.0 or higher (included with Node.js)
- **Windows Operating System** (for portable .exe builds)
- **Application Icon** - Place `icon.ico` in the `build/` directory (see [build/README-ICON.md](build/README-ICON.md))

## Build Scripts Overview

This project provides three build scripts with different levels of detail and verification:

### 1. Comprehensive Build with Verification (Recommended)

**Script:** `build-and-verify.bat`

The most thorough build option with complete verification and reporting.

```batch
build-and-verify.bat
```

**This script performs:**
1. ✓ Prerequisites and file existence checks
2. ✓ Clean previous builds (complete fresh install)
3. ✓ Install all dependencies
4. ✓ Run code linting
5. ✓ Run unit tests
6. ✓ Build portable application
7. ✓ Verify build output and artifacts
8. ✓ Generate comprehensive verification report

**Output:**
- Portable executables in `portable/` folder
- All build artifacts in `dist/` folder
- Build log in `build-verification-log.txt`
- Error log in `build-errors.txt`
- Verification report in `build-verification-report.txt`

**Use this when:**
- Building for production/release
- Need to verify everything is working 100%
- Want detailed reports and error tracking
- Need to ensure code quality (tests + linting)

### 2. Detailed Build with Logging

**Script:** `build-portable.bat`

Standard build with detailed logging and checks.

```batch
build-portable.bat
```

**This script performs:**
1. ✓ Prerequisites check (Node.js, npm versions)
2. ✓ Clean previous builds
3. ✓ Install all dependencies
4. ✓ Run code linting
5. ✓ Build portable application
6. ✓ Organize output files

**Output:**
- Portable executables in `portable/` folder
- All build artifacts in `dist/` folder
- Build log in `build-log.txt`

**Use this when:**
- Need detailed build information
- Want to see the build process step-by-step
- Building for testing or development

### 3. Quick Build

**Script:** `build-quick.bat`

For a quick build with minimal console output.

```batch
build-quick.bat
```

**This script will:**
- Clean previous builds
- Install dependencies
- Build the portable application
- Place the result in the `portable` folder

**Use this when:**
- Need fast iteration during development
- Already verified prerequisites
- Don't need detailed logs

## Manual Build

If you prefer manual control:

### 1. Install Dependencies

```batch
npm install
```

### 2. Build Portable App

```batch
npm run build:win
```

This creates:
- `dist/Robocopy GUI-2.0.0-portable.exe` - Portable x64 executable
- `dist/Robocopy GUI-2.0.0-x64.exe` - NSIS installer (x64)
- `dist/Robocopy GUI-2.0.0-ia32.exe` - NSIS installer (32-bit)
- `dist/Robocopy GUI-2.0.0-x64.zip` - Portable zip (x64)
- `dist/Robocopy GUI-2.0.0-ia32.zip` - Portable zip (32-bit)

### 3. Build Specific Target

For portable only:

```batch
npx electron-builder --win portable --x64
```

For specific architecture:

```batch
npm run build:win -- --x64    # 64-bit only
npm run build:win -- --ia32   # 32-bit only
```

## Build Targets

The project supports multiple build targets:

| Target | Description | Output |
|--------|-------------|--------|
| **portable** | Single .exe file (no installation) | `.exe` |
| **nsis** | Full installer with shortcuts | `.exe` installer |
| **zip** | Compressed archive | `.zip` |

## Build Configuration

Build settings are configured in:
- `electron-builder.json` - Main build configuration
- `package.json` - Build scripts and metadata

### Portable Build Settings

```json
{
  "portable": {
    "artifactName": "${productName}-${version}-portable.${ext}",
    "requestExecutionLevel": "user"
  }
}
```

## Troubleshooting

### Build Fails - Missing Dependencies

**Solution:** Delete `node_modules` and reinstall:

```batch
rmdir /s /q node_modules
npm install
```

### Build Fails - Insufficient Permissions

**Solution:** Run the build script as Administrator or check antivirus settings.

### Node.js Version Error

**Solution:** Update Node.js to version 20.0.0 or higher:

```batch
node --version
```

If outdated, download from: https://nodejs.org/

### Electron Builder Errors

**Solution:** Clear electron-builder cache:

```batch
rmdir /s /q %LOCALAPPDATA%\electron-builder\cache
npm run build:win
```

### Build Works but .exe Won't Run

**Possible causes:**
1. Antivirus blocking the executable
2. Missing Visual C++ Redistributables
3. Corrupted build - try rebuilding

**Solution:** Add exception to antivirus or rebuild.

## Build Output Explained

### Portable .exe
- **Size:** ~150-200 MB
- **Installation:** None required
- **Settings:** Stored in app directory
- **Updates:** Manual download

### NSIS Installer .exe
- **Size:** ~150-200 MB
- **Installation:** Yes (configurable location)
- **Settings:** Stored in AppData
- **Updates:** Auto-update supported
- **Shortcuts:** Desktop & Start Menu

### ZIP Archive
- **Size:** ~150-200 MB (compressed)
- **Installation:** Extract and run
- **Settings:** Stored in extracted directory

## Development Builds

For development testing (faster builds):

```batch
npm run build:dir
```

This creates an unpacked directory in `dist/win-unpacked/` without compression.

## CI/CD Integration

For automated builds:

```batch
REM Set environment
set CI=true

REM Install dependencies
npm ci

REM Run tests
npm test

REM Build
npm run build:win
```

## Publishing

To publish a release:

```batch
npm run build:win
npx electron-builder --win --publish always
```

Requires:
- GitHub token in environment (`GH_TOKEN`)
- Valid `publish` configuration in `electron-builder.json`

## Additional Resources

- [Electron Builder Documentation](https://www.electron.build/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Project README](./README.md)

## License

MIT License - See LICENSE file for details
