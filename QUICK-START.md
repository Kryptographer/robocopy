# Quick Start Guide - Robocopy GUI Build & Verify

Get up and running in 5 minutes!

## For Users Who Just Want to Build

### Step 1: Prerequisites Check
Make sure you have:
- Windows OS
- Node.js 20+ installed ([Download](https://nodejs.org/))
- npm 10+ (comes with Node.js)

Quick check:
```batch
node --version
npm --version
```

### Step 2: (Optional) Add Application Icon
If you want a custom icon:
1. Create or obtain an `.ico` file
2. Place it at `build/icon.ico`
3. See `build/README-ICON.md` for details

If you skip this, the default Electron icon will be used (build will still work).

### Step 3: Run the Build Script
Open Command Prompt in the project folder and run:

```batch
build-and-verify.bat
```

This script will:
- ✓ Check your system
- ✓ Install dependencies
- ✓ Run tests
- ✓ Build the app
- ✓ Verify everything works
- ✓ Generate reports

**Wait 5-10 minutes** for the build to complete.

### Step 4: Get Your Application
After the build completes:

1. Open the `portable` folder (it opens automatically)
2. You'll find files like:
   - `Robocopy GUI-2.0.0-portable.exe` - **This is your app!**
   - `Robocopy GUI-2.0.0-x64.zip` - Zipped version

3. **Run the .exe file** - No installation needed!

### Step 5: Verify Everything Works
1. Double-click the portable .exe
2. The app should launch
3. Try selecting source and destination folders
4. Click "START COPY" to test

## Troubleshooting

### Build Failed?
Check these files for details:
- `build-verification-log.txt` - Full build log
- `build-errors.txt` - Specific errors
- `build-verification-report.txt` - Summary report

### Common Issues

**"Node.js not found"**
- Install Node.js from https://nodejs.org/
- Restart Command Prompt after installing

**"Build failed during npm install"**
- Check your internet connection
- Try again (sometimes packages fail to download)
- Delete `node_modules` folder and retry

**"No portable executable created"**
- Check the build logs
- Ensure you have enough disk space (2GB+)
- Try running as Administrator

**"Icon missing" warning**
- This is just a warning - build will still work
- Add `build/icon.ico` if you want a custom icon
- See `build/README-ICON.md` for instructions

## Alternative Build Scripts

### Need Faster Builds?
Use the quick script (less verification):
```batch
build-quick.bat
```

### Want Detailed Logging?
Use the standard script:
```batch
build-portable.bat
```

### Manual Build?
```batch
npm install
npm run build:win
```

## What You Get

After a successful build:

**In `portable/` folder:**
- Portable executable (run anywhere, no install)
- ZIP archive (for distribution)

**In `dist/` folder:**
- NSIS installers (x64, ia32, ARM64)
- All build artifacts
- Latest.yml (for auto-updates)

## Next Steps

### For Distribution
1. Share the portable `.exe` file from the `portable/` folder
2. Or share the `.zip` file for easier download
3. Users can run it directly - no installation needed

### For Installation
1. Use the NSIS installer from the `dist/` folder
2. Installer creates desktop shortcuts
3. Supports auto-updates

### For Development
1. Make code changes
2. Run `build-quick.bat` for fast iteration
3. Run `build-and-verify.bat` before release

## Documentation

For more details, see:
- **README.md** - Feature overview and usage guide
- **BUILD.md** - Detailed build instructions
- **VERIFICATION-CHECKLIST.md** - Complete testing checklist
- **build/README-ICON.md** - Icon creation guide

## Need Help?

1. Check the documentation files listed above
2. Review build logs in the project folder
3. Ensure prerequisites are met
4. Try a clean build (delete `node_modules` and `dist`)

---

**That's it! You should now have a working portable Robocopy GUI application.**

🎉 Happy copying!
