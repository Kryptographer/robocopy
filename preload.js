// ===================================
// ROBOCOPY GUI - Preload Script
// Secure IPC Bridge
// ===================================

const { contextBridge, ipcRenderer } = require('electron');

// Performance: Store listener references for cleanup
const listeners = new Map();

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Directory selection
  selectDirectory: (type) => ipcRenderer.invoke('select-directory', type),

  // Robocopy execution
  executeRobocopy: (options) => ipcRenderer.invoke('execute-robocopy', options),

  // Performance: Properly manage event listeners to prevent memory leaks
  onRobocopyOutput: (callback) => {
    const listener = (event, output) => callback(output);
    ipcRenderer.on('robocopy-output', listener);
    listeners.set('robocopy-output', listener);
  },

  // Performance: Allow cleanup of event listeners
  removeRobocopyOutputListener: () => {
    const listener = listeners.get('robocopy-output');
    if (listener) {
      ipcRenderer.removeListener('robocopy-output', listener);
      listeners.delete('robocopy-output');
    }
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
  validatePath: (path) => ipcRenderer.invoke('validate-path', path),

  // Auto-updater (New in v2.0)
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),

  onUpdateAvailable: (callback) => {
    const listener = (event, info) => callback(info);
    ipcRenderer.on('update-available', listener);
    listeners.set('update-available', listener);
  },

  onDownloadProgress: (callback) => {
    const listener = (event, progress) => callback(progress);
    ipcRenderer.on('download-progress', listener);
    listeners.set('download-progress', listener);
  },

  onUpdateDownloaded: (callback) => {
    const listener = (event, info) => callback(info);
    ipcRenderer.on('update-downloaded', listener);
    listeners.set('update-downloaded', listener);
  },

  // Performance monitoring (New in v2.0)
  getPerformanceMetrics: () => ipcRenderer.invoke('get-performance-metrics'),
  forceGarbageCollection: () => ipcRenderer.invoke('force-gc')
});

console.log('⚡ Preload script loaded - Robocopy GUI v2.0');
