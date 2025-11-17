# Build Instructions

This document explains how to build the Robocopy GUI as a portable application.

## Prerequisites

Before building, ensure you have:

- **Node.js** version 20.0.0 or higher ([Download](https://nodejs.org/))
- **npm** version 10.0.0 or higher (included with Node.js)
- **Windows Operating System** (for portable .exe builds)
- **Application Icon** - Place `icon.ico` in the `build/` directory (see [build/README-ICON.md](build/README-ICON.md))

## Automated Build Script (Windows)

This project provides a simple, automated build script for Windows:

### Build Script

**Script:** `build.bat`

A streamlined build script that handles everything from dependency installation to portable executable creation.

```batch
build.bat
```

**This script performs:**
1. ✓ Prerequisites check (Node.js, npm versions)
2. ✓ Clean previous builds (dist and portable folders)
3. ✓ Install all dependencies
4. ✓ Build portable application
5. ✓ Organize portable files in `portable/` folder
6. ✓ Automatically open the portable folder when complete

**Output:**
- Portable executables in `portable/` folder
- All build artifacts in `dist/` folder

**How to use:**
- Simply double-click `build.bat` and wait for the build to complete
- The script will show clear progress messages for each step
- When finished, the `portable` folder will open automatically

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
