# ⚡ Robocopy GUI

> **Ultimate Robocopy GUI built with Electron**
> *Modern Dark Mode Design*

A modern, dark-mode GUI for Windows Robocopy with a sleek, minimalist interface and futuristic aesthetic.

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-blue)
![Electron](https://img.shields.io/badge/electron-27.0.0-47848F)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### Core Functionality
- **🎨 Beautiful Dark/Light UI** - Toggle between dark and light themes with modern minimalist design
- **📁 Easy File Selection** - Browse or drag-and-drop folders for source/destination
- **⚙️ Full Robocopy Options** - Access all major robocopy switches and parameters
- **📊 Real-time Output** - Live progress monitoring with styled terminal output
- **🎯 Smart Validation** - Input validation to prevent common mistakes including network path detection
- **⚡ Multi-threaded Copying** - Leverage robocopy's `/MT` for faster transfers
- **📈 Statistics Dashboard** - Track status, exit codes, progress percentage, and elapsed time
- **🔒 Secure** - Built with Electron security best practices (context isolation)

### Advanced Features
- **💾 Save/Load Presets** - Save your configurations as JSON presets and load them anytime
- **⏰ Scheduled Backups** - Create scheduled tasks with cron-style scheduling
- **📄 Log Export** - Export terminal output to text files for record-keeping
- **🖱️ Drag & Drop** - Drag folders directly onto source/destination fields
- **🌓 Theme Toggle** - Switch between dark and light modes with saved preference
- **🌐 Network Path Support** - Full support for UNC network paths (\\server\share)
- **📊 Progress Estimation** - Visual progress bar with percentage tracking

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Windows** (for actual robocopy functionality) or **Linux/macOS** (for UI testing)

### Installation

```bash
# Install dependencies
npm install

# Start the application
npm start
```

### Building

#### Quick Build (Manual)

```bash
# Build the application
npm run build
```

#### Automated Build Script (Windows)

For Windows users, use the automated build script:

```batch
build.bat
```

This script will:
- Check prerequisites (Node.js, npm)
- Clean previous builds
- Install all dependencies
- Build the portable executable
- Organize files in the `portable` folder
- Automatically open the portable folder when complete

Simply double-click `build.bat` and wait for the build to complete!

## 📖 Usage

### Basic Workflow

1. **Select Source** - Click "BROWSE" or drag a folder to the SOURCE field
2. **Select Destination** - Click "BROWSE" or drag a folder to the DESTINATION field
3. **Configure Options** - Choose copy options, exclusions, and advanced settings
4. **Start Copy** - Click "START COPY" to execute the robocopy operation
5. **Monitor Progress** - Watch real-time output, progress bar, and statistics

### Using Advanced Features

#### Presets
- Click **SAVE** to save current configuration as a JSON preset
- Click **LOAD** to load a previously saved preset
- Presets include all paths, options, and advanced settings

#### Scheduled Tasks
1. Fill in **TASK NAME** (e.g., "Daily Backup")
2. Enter **CRON SCHEDULE** (e.g., `0 2 * * *` for 2 AM daily)
3. Click **ADD TASK** to create the scheduled task
4. Use **VIEW TASKS** to see, pause, resume, or delete scheduled tasks

**Cron Format Examples:**
- `0 2 * * *` - Every day at 2:00 AM
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Every Sunday at midnight
- `30 14 1 * *` - First day of month at 2:30 PM

#### Log Export
- Click **EXPORT** button in the output panel
- Choose location and filename for the log file
- All terminal output will be saved as plain text

#### Theme Toggle
- Click the sun/moon icon (☀️/🌙) in the title bar
- Theme preference is automatically saved
- Choose between dark mode and light mode

#### Drag & Drop
- Simply drag folders from your file explorer
- Drop onto the source or destination input fields
- Works with local folders and network paths

### Common Robocopy Options

| Option | Switch | Description |
|--------|--------|-------------|
| **Subdirectories** | `/S` | Copy subdirectories (excluding empty ones) |
| **Empty Subdirs** | `/E` | Copy subdirectories including empty ones |
| **Mirror Mode** | `/MIR` | Mirror directory tree (deletes files in dest not in source) |
| **Copy All** | `/COPYALL` | Copy all file info (timestamps, attributes, security, etc.) |
| **Restart Mode** | `/Z` | Copy files in restartable mode |
| **Backup Mode** | `/B` | Copy in backup mode (bypass security) |
| **Move Files** | `/MOVE` | Move files (delete from source after copy) |
| **Verbose** | `/V` | Produce verbose output |

### Advanced Options

- **Levels** - Limit directory tree depth (`/LEV:n`)
- **Retries** - Number of retries on failed copies (default: 1000000)
- **Wait Time** - Wait time between retries in seconds (default: 30)
- **Exclude Files** - Comma-separated patterns (e.g., `*.tmp, *.log`)
- **Exclude Directories** - Comma-separated folder names (e.g., `temp, cache`)
- **Threads** - Number of threads for multi-threaded copying (default: 8)

## 🎨 Design Philosophy

This application features a modern, minimalist design aesthetic:

- **Minimalist** - Clean, functional interface with no unnecessary elements
- **Typography** - Monospace fonts for technical precision
- **Color Palette** - Muted colors with strategic orange accent usage
- **Layout** - Grid-based, organized sections with clear hierarchy
- **Dark Mode** - Deep black backgrounds with subtle gradients
- **Modern Controls** - Smooth animations and transitions
- **Information Density** - Maximum utility in minimal space
- **Status Indicators** - Clear visual feedback with glowing elements

## 🏗️ Architecture

```
robocopy-gui/
├── main.js           # Main process (Electron backend)
├── preload.js        # Secure IPC bridge
├── renderer.js       # Renderer process (UI logic)
├── index.html        # Application structure
├── styles.css        # Modern dark/light theme styles
└── package.json      # Project configuration
```

### Security Features

- **Context Isolation** - Renderer process is isolated from Node.js
- **No Node Integration** - Renderer cannot directly access Node APIs
- **Preload Script** - Secure IPC bridge for controlled communication
- **Content Security Policy** - Restricts resource loading

## 🔧 Robocopy Exit Codes

| Code | Meaning |
|------|---------|
| 0 | No files copied, no errors |
| 1 | All files copied successfully |
| 2 | Extra files/directories detected |
| 3 | Files copied + extra files detected |
| 4 | Mismatched files/directories detected |
| 5 | Files copied + mismatched files |
| 6 | Additional + mismatched files |
| 7 | Files copied + additional + mismatched |
| 8+ | Errors occurred (failures/access denied) |

## 🛠️ Development

### Project Structure

- **Main Process** (`main.js`) - Handles window creation, IPC, and robocopy execution
- **Renderer Process** (`renderer.js`) - UI logic, form handling, and display updates
- **Preload Script** (`preload.js`) - Secure communication bridge
- **Styles** (`styles.css`) - Complete design system with CSS variables

### Key Technologies

- **Electron** - Cross-platform desktop framework
- **Node.js** - Backend runtime
- **IPC** - Inter-process communication
- **Child Process** - Robocopy command execution

## ⚠️ Important Notes

### Windows-Specific
- Robocopy is a Windows utility and only works fully on Windows
- On Linux/macOS, the app will simulate robocopy for UI testing

### Permissions
- Some options (like Backup Mode `/B`) require administrator privileges
- Ensure proper file system permissions for source and destination

### Mirror Mode Warning
- Mirror Mode (`/MIR`) will delete files in the destination that don't exist in the source
- Always verify paths before using mirror mode

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 💡 Tips

1. **Test First** - Try with non-critical data before production use
2. **Use Presets** - Save your common configurations as presets for quick reuse
3. **Schedule Backups** - Set up scheduled tasks for automated backups
4. **Use Verbose** - Enable verbose output to see detailed operation logs
5. **Monitor Progress** - Watch the progress bar and statistics panel
6. **Export Logs** - Keep records of important operations by exporting logs
7. **Network Paths** - Use UNC paths (\\server\share) for network locations
8. **Drag & Drop** - Quickly set paths by dragging folders from file explorer
9. **Theme Preference** - Choose your preferred theme for comfortable viewing
10. **Read Exit Codes** - Understand what different exit codes mean

---

**Made with ⚡ **
