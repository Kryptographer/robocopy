# Build Assets

## Icon File Required

The build process requires an `icon.ico` file in this directory for the Windows application icon.

### Creating an Icon

1. **Use an online converter:**
   - Go to https://convertio.co/png-ico/ or https://cloudconvert.com/png-to-ico
   - Upload a PNG image (at least 256x256 pixels recommended)
   - Convert to ICO format with multiple sizes: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
   - Download and save as `icon.ico` in this directory

2. **Use GIMP (Free):**
   - Open your image in GIMP
   - Export as `.ico`
   - Select multiple sizes when exporting

3. **Use ImageMagick:**
   ```bash
   convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
   ```

### Icon Specifications

- **Format:** ICO (Windows Icon)
- **Sizes:** Multiple resolutions embedded (16x16 to 256x256)
- **Color Depth:** 32-bit with alpha channel (transparency)
- **Recommended base size:** 512x512 or 1024x1024 PNG before conversion

### Temporary Workaround

If you don't have an icon ready:
- The build will still work but will use the default Electron icon
- You'll see a warning during the build process
- You can add the icon later and rebuild

### File Location

Place the icon file here:
```
build/icon.ico
```

The build scripts will automatically use this file when creating the Windows executable.
