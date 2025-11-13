# ⚡ Robocopy GUI

> **Ultimate Robocopy GUI built with Electron**
> *Teenage Engineering × Tesla Design Aesthetic*

A modern, dark-mode GUI for Windows Robocopy with a sleek interface inspired by Teenage Engineering's minimalist design and Tesla's futuristic aesthetic.

![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-blue)
![Electron](https://img.shields.io/badge/electron-27.0.0-47848F)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **🎨 Beautiful Dark UI** - Inspired by Teenage Engineering and Tesla design language
- **📁 Easy File Selection** - Browse and select source/destination directories
- **⚙️ Full Robocopy Options** - Access all major robocopy switches and parameters
- **📊 Real-time Output** - Live progress monitoring with styled terminal output
- **🎯 Smart Validation** - Input validation to prevent common mistakes
- **⚡ Multi-threaded Copying** - Leverage robocopy's `/MT` for faster transfers
- **📈 Statistics Dashboard** - Track status, exit codes, and elapsed time
- **🔒 Secure** - Built with Electron security best practices (context isolation)

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

```bash
# Build the application
npm run build
```

## 📖 Usage

### Basic Workflow

1. **Select Source** - Click "BROWSE" next to the SOURCE field
2. **Select Destination** - Click "BROWSE" next to the DESTINATION field
3. **Configure Options** - Choose copy options, exclusions, and advanced settings
4. **Start Copy** - Click "START COPY" to execute the robocopy operation
5. **Monitor Progress** - Watch real-time output in the terminal panel

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

This application combines two iconic design aesthetics:

### Teenage Engineering Influence
- **Minimalist** - Clean, functional interface with no unnecessary elements
- **Typography** - Monospace fonts for technical precision
- **Color Palette** - Muted colors with strategic accent usage
- **Layout** - Grid-based, organized sections with clear hierarchy

### Tesla Influence
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
├── styles.css        # Teenage Engineering × Tesla theme
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
2. **Use Verbose** - Enable verbose output to see detailed operation logs
3. **Monitor Stats** - Watch the statistics panel for operation status
4. **Save Settings** - Note your commonly used configurations
5. **Read Exit Codes** - Understand what different exit codes mean

## 🎯 Roadmap

- [ ] Save/load configuration presets
- [ ] Scheduled backup tasks
- [ ] Log file export
- [ ] Drag-and-drop folder selection
- [ ] Dark/light theme toggle
- [ ] Network path support
- [ ] Progress percentage estimation

---

**Made with **
