// ===================================
// ROBOCOPY GUI - Preload Script
// Secure IPC Bridge
// ===================================

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Select directory dialog
  selectDirectory: (type) => ipcRenderer.invoke('select-directory', type),

  // Execute robocopy command
  executeRobocopy: (options) => ipcRenderer.invoke('execute-robocopy', options),

  // Listen for robocopy output
  onRobocopyOutput: (callback) => {
    ipcRenderer.on('robocopy-output', (event, output) => callback(output));
  }
});

console.log('⚡ Preload script loaded');
