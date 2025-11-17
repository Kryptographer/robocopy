# Robocopy GUI - Verification Checklist

This checklist ensures that everything is working 100% correctly before distribution.

## Pre-Build Verification

### System Requirements
- [ ] Node.js version 20.0.0 or higher installed
- [ ] npm version 10.0.0 or higher installed
- [ ] Windows Operating System (for full functionality)
- [ ] At least 2GB of free disk space for build

### Required Files
- [ ] `package.json` exists and is valid
- [ ] `main.js` exists (Electron main process)
- [ ] `renderer.js` exists (UI logic)
- [ ] `preload.js` exists (IPC bridge)
- [ ] `index.html` exists (UI structure)
- [ ] `styles.css` exists (styling)
- [ ] `electron-builder.json` exists (build configuration)
- [ ] `build/icon.ico` exists (application icon) - See build/README-ICON.md if missing

### Configuration Files
- [ ] `jest.config.js` exists (testing configuration)
- [ ] `eslint.config.js` exists (linting configuration)
- [ ] `playwright.config.js` exists (E2E testing)

### Test Files
- [ ] `__tests__/sanitization.test.js` exists (unit tests)
- [ ] `e2e/app.spec.js` exists (E2E tests)

## Build Process Verification

### Dependency Installation
- [ ] Run `npm install` without errors
- [ ] `node_modules` folder created
- [ ] `package-lock.json` generated
- [ ] All dependencies installed (check no missing peer dependencies)

### Code Quality Checks
- [ ] Run `npm run lint` - All linting passes or acceptable warnings only
- [ ] Run `npm test` - All unit tests pass
- [ ] No critical security vulnerabilities (`npm audit`)

### Build Execution
- [ ] Run build script (use `build-and-verify.bat` for comprehensive check)
- [ ] Build completes without fatal errors
- [ ] `dist` folder created
- [ ] `portable` folder created

## Post-Build Verification

### Build Artifacts
- [ ] Portable executable exists (`portable/*.exe`)
- [ ] NSIS installer exists (`dist/*-x64.exe`, `dist/*-ia32.exe`)
- [ ] ZIP archives exist (`dist/*.zip`)
- [ ] File sizes are reasonable (150-250 MB range)

### Build Logs
- [ ] Review `build-verification-log.txt` for warnings
- [ ] Check `build-errors.txt` for any errors
- [ ] Review `build-verification-report.txt` for summary

### Portable Application Testing
- [ ] Portable .exe file launches without errors
- [ ] Application window opens correctly
- [ ] UI elements render properly
- [ ] Theme toggle works (dark/light mode)
- [ ] All sections visible (paths, options, output, etc.)

## Functional Testing

### Basic Functionality
- [ ] Browse button works for source directory
- [ ] Browse button works for destination directory
- [ ] Drag and drop works for source
- [ ] Drag and drop works for destination
- [ ] Start button is enabled when paths are set
- [ ] Clear button resets the form

### Copy Operations (Windows Only)
- [ ] Create test source folder with files
- [ ] Select source and destination
- [ ] Click "START COPY" - robocopy executes
- [ ] Real-time output appears in terminal
- [ ] Progress updates during operation
- [ ] Exit code displayed correctly
- [ ] Timer shows elapsed time

### Advanced Features
- [ ] Save preset - creates JSON file
- [ ] Load preset - restores configuration
- [ ] Export log - saves output to text file
- [ ] Scheduled task creation works
- [ ] View scheduled tasks displays list
- [ ] Delete scheduled task works

### Option Validation
- [ ] Subdirectories option toggles correctly
- [ ] Mirror mode option works
- [ ] Multi-threading option works
- [ ] Thread count input accepts valid values
- [ ] Retries input validates range
- [ ] Exclude files/directories work

## Security Verification

### Input Sanitization
- [ ] Path input rejects dangerous characters (`;`, `|`, `&`, etc.)
- [ ] File pattern input validates correctly
- [ ] Number inputs validate ranges
- [ ] No command injection vulnerabilities
- [ ] No XSS vulnerabilities in UI

### Process Security
- [ ] Application runs with user-level permissions
- [ ] No elevated privileges required (unless backup mode)
- [ ] Preset files validated before loading
- [ ] File size limits enforced (presets, tasks)

## Performance Verification

### Application Performance
- [ ] Application starts in under 3 seconds
- [ ] UI is responsive (no lag when typing)
- [ ] Memory usage is reasonable (<150 MB idle)
- [ ] No memory leaks during extended use

### Build Performance
- [ ] Build completes in under 10 minutes
- [ ] No excessive warnings during build
- [ ] Output files are properly compressed

## Cross-Platform Testing (If Applicable)

### Windows
- [ ] Application installs correctly (NSIS installer)
- [ ] Portable version runs without installation
- [ ] Desktop shortcut created (installer)
- [ ] Start menu entry created (installer)
- [ ] Robocopy commands execute properly

### Linux/macOS (UI Testing Only)
- [ ] Application launches
- [ ] UI renders correctly
- [ ] Simulated robocopy mode works
- [ ] All UI features accessible

## Distribution Verification

### Installer Testing
- [ ] NSIS installer runs
- [ ] Installation directory can be changed
- [ ] Desktop shortcut option works
- [ ] Uninstaller created
- [ ] Application launches after install

### Portable Testing
- [ ] Portable .exe runs from any location
- [ ] No installation required
- [ ] Settings saved in app directory
- [ ] Can run from USB drive

### File Integrity
- [ ] Verify file hashes match
- [ ] No corrupted builds
- [ ] All required DLLs included
- [ ] ASAR archive intact

## Documentation Verification

### User Documentation
- [ ] README.md is complete and accurate
- [ ] BUILD.md has correct build instructions
- [ ] VERIFICATION-CHECKLIST.md (this file) is complete
- [ ] build/README-ICON.md explains icon requirements

### Code Documentation
- [ ] Code has adequate comments
- [ ] Functions are documented
- [ ] Security considerations noted
- [ ] Performance optimizations explained

## Final Checklist

### Before Release
- [ ] All tests pass (unit + E2E)
- [ ] No linting errors
- [ ] Build artifacts verified
- [ ] Functional testing complete
- [ ] Security audit passed
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Version number updated in package.json
- [ ] CHANGELOG.md updated with changes

### Release Process
- [ ] Tag release in Git
- [ ] Create GitHub release
- [ ] Upload build artifacts
- [ ] Include release notes
- [ ] Update download links

## Known Issues / Limitations

Document any known issues or limitations here:

- **Icon File**: Application icon (build/icon.ico) must be added manually
- **Windows Only**: Full robocopy functionality requires Windows OS
- **Admin Rights**: Backup mode (/B) requires administrator privileges
- **Network Paths**: UNC paths (\\server\share) require network access
- **Code Signing**: Certificate required for signed builds (optional for development)

## Verification Results

**Date:** _____________

**Performed By:** _____________

**Build Version:** _____________

**Overall Status:** [ ] PASS [ ] PASS WITH WARNINGS [ ] FAIL

**Notes:**
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

**Approved for Distribution:** [ ] YES [ ] NO

**Signature:** _____________

---

**Legend:**
- ✓ = Passed
- ⚠ = Warning (acceptable)
- ✗ = Failed (must fix)
- N/A = Not applicable

Use this checklist with the `build-and-verify.bat` script for comprehensive verification.
