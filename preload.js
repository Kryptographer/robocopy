// ===================================
// ROBOCOPY GUI - Preload Script
// Secure IPC Bridge
// ===================================

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Directory selection
  selectDirectory: (type) => ipcRenderer.invoke('select-directory', type),

  // Robocopy execution
  executeRobocopy: (options) => ipcRenderer.invoke('execute-robocopy', options),
  onRobocopyOutput: (callback) => {
    ipcRenderer.on('robocopy-output', (event, output) => callback(output));
  },

  // Preset management
  savePreset: (preset) => ipcRenderer.invoke('save-preset', preset),
  loadPreset: () => ipcRenderer.invoke('load-preset'),

  // Log export
  exportLog: (logContent) => ipcRenderer.invoke('export-log', logContent),

  // Scheduled tasks
  addScheduledTask: (task) => ipcRenderer.invoke('add-scheduled-task', task),
  getScheduledTasks: () => ipcRenderer.invoke('get-scheduled-tasks'),
  deleteScheduledTask: (taskId) => ipcRenderer.invoke('delete-scheduled-task', taskId),
  toggleTaskStatus: (taskId) => ipcRenderer.invoke('toggle-task-status', taskId),

  // Path validation
  validatePath: (path) => ipcRenderer.invoke('validate-path', path)
});

console.log('⚡ Preload script loaded');
