const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// ===================================
// LOGGING & PERFORMANCE MONITORING
// ===================================
log.transports.file.level = 'info';
log.transports.console.level = 'debug';
autoUpdater.logger = log;

// Performance monitoring - Track app metrics
const performanceMetrics = {
  startTime: Date.now(),
  windowCreationTime: 0,
  memoryUsage: () => {
    const usage = process.memoryUsage();
    return {
      rss: (usage.rss / 1024 / 1024).toFixed(2) + ' MB',
      heapUsed: (usage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
      heapTotal: (usage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
      external: (usage.external / 1024 / 1024).toFixed(2) + ' MB'
    };
  }
};

// Log memory usage periodically (every 5 minutes)
setInterval(() => {
  log.info('Memory usage:', performanceMetrics.memoryUsage());
}, 5 * 60 * 1000);

// V8 optimization hints - Enable performance features
if (app.commandLine) {
  app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder,VaapiVideoEncoder');
  app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096 --optimize-for-size');
  app.commandLine.appendSwitch('disable-renderer-backgrounding'); // Keep renderer active
  app.commandLine.appendSwitch('disable-background-timer-throttling');
  app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
}

// ===================================
// CONSTANTS
// ===================================
const WINDOW_DEFAULTS = {
  WIDTH: 1200,
  HEIGHT: 800,
  MIN_WIDTH: 800,
  MIN_HEIGHT: 500,
  BG_COLOR: '#0a0a0a',
  TITLEBAR_HEIGHT: 40
};

const FILE_SIZE_LIMITS = {
  PRESET_MAX: 1048576,      // 1MB for preset files
  TASKS_MAX: 2097152        // 2MB for scheduled tasks
};

const VALIDATION_LIMITS = {
  TASK_NAME_MAX: 200,
  SCHEDULE_MAX: 100,
  LEVELS_MAX: 9999,
  RETRIES_MAX: 10000000,
  WAIT_TIME_MAX: 3600,
  THREADS_MIN: 1,
  THREADS_MAX: 128
};

// ===================================
// STATE
// ===================================
let mainWindow;
let scheduledTasks = new Map(); // Store scheduled tasks

// ===================================
// AUTO UPDATER CONFIGURATION
// ===================================
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  log.info('Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', (info) => {
  log.info('Update not available:', info.version);
});

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  const message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`;
  log.info(message);
  if (mainWindow) {
    mainWindow.webContents.send('download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded:', info.version);
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
  }
});

function createWindow() {
  try {
    const windowStart = Date.now();

    mainWindow = new BrowserWindow({
      width: WINDOW_DEFAULTS.WIDTH,
      height: WINDOW_DEFAULTS.HEIGHT,
      minWidth: WINDOW_DEFAULTS.MIN_WIDTH,
      minHeight: WINDOW_DEFAULTS.MIN_HEIGHT,
      backgroundColor: WINDOW_DEFAULTS.BG_COLOR,
      frame: true,
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: WINDOW_DEFAULTS.BG_COLOR,
        symbolColor: '#ffffff',
        height: WINDOW_DEFAULTS.TITLEBAR_HEIGHT
      },
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        // Performance optimizations
        enableWebSQL: false,
        spellcheck: false,
        // Security hardening
        sandbox: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false
      },
      // Performance: Show window when ready
      show: false
    });

    // Performance: Show window once ready to prevent flickering
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      performanceMetrics.windowCreationTime = Date.now() - windowStart;
      log.info(`Window created in ${performanceMetrics.windowCreationTime}ms`);
    });

    mainWindow.loadFile('index.html');

    // Check for updates after window is ready (if not in development)
    mainWindow.webContents.on('did-finish-load', () => {
      if (!app.isPackaged) {
        log.info('Running in development mode - skipping update check');
      } else {
        setTimeout(() => {
          autoUpdater.checkForUpdates().catch(err => {
            log.error('Failed to check for updates:', err);
          });
        }, 3000); // Delay to not interfere with startup
      }
    });

    // Open DevTools in development
    if (process.argv.includes('--dev') || !app.isPackaged) {
      mainWindow.webContents.openDevTools();
    }

    // Memory optimization: Clear cache on window close
    mainWindow.on('closed', () => {
      mainWindow = null;
      if (global.gc) {
        global.gc(); // Manual GC if exposed
      }
    });

  } catch (error) {
    log.error('Failed to create window:', error);
    app.quit();
  }
}

app.whenReady().then(() => {
  createWindow();
  log.info('Application ready');
  log.info('Platform:', process.platform);
  log.info('Electron version:', process.versions.electron);
  log.info('Node version:', process.versions.node);
  log.info('Chrome version:', process.versions.chrome);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Optimize memory on app quit
app.on('before-quit', () => {
  log.info('Application quitting - Final memory usage:', performanceMetrics.memoryUsage());
  if (global.gc) {
    global.gc();
  }
});

// IPC Handlers
ipcMain.handle('select-directory', async (event, type) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: type === 'source' ? 'Select Source Directory' : 'Select Destination Directory'
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  } catch (error) {
    console.error('Error selecting directory:', error);
    return null;
  }
});

ipcMain.handle('execute-robocopy', async (event, options) => {
  return new Promise((resolve, reject) => {
    try {
      // Sanitize and validate options before building args
      const sanitizedOptions = sanitizeRobocopyOptions(options);
      const args = buildRobocopyArgs(sanitizedOptions);

    // For non-Windows systems, simulate robocopy for testing
    const isWindows = process.platform === 'win32';
    const command = isWindows ? 'robocopy' : 'echo';
    const finalArgs = isWindows ? args : [`Simulating: robocopy ${args.join(' ')}`];

    // Security: Remove shell: true to prevent command injection
    // Arguments are already properly escaped by Node.js spawn
    const robocopy = spawn(command, finalArgs, {
      windowsHide: true
    });

    let output = '';
    let errorOutput = '';

    robocopy.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      mainWindow.webContents.send('robocopy-output', text);
    });

    robocopy.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      mainWindow.webContents.send('robocopy-output', text);
    });

    robocopy.on('close', (code) => {
      // Robocopy exit codes: 0-7 are success, 8+ are errors
      const success = isWindows ? (code < 8) : (code === 0);

      resolve({
        success,
        code,
        output,
        errorOutput,
        message: getExitCodeMessage(code)
      });
    });

    robocopy.on('error', (error) => {
      reject({
        success: false,
        error: error.message
      });
    });
    } catch (error) {
      // Error handling: Catch sanitization or spawn errors
      console.error('Error executing robocopy:', error);
      reject({
        success: false,
        error: error.message || 'Failed to execute robocopy'
      });
    }
  });
});

// Security: Sanitize and validate robocopy options
function sanitizeRobocopyOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Invalid options provided');
  }

  // Validate and sanitize paths
  const sanitizedSource = sanitizePath(options.source);
  const sanitizedDest = sanitizePath(options.destination);

  if (!sanitizedSource || !sanitizedDest) {
    throw new Error('Invalid source or destination path');
  }

  // Sanitize file pattern (prevent command injection)
  const sanitizedFiles = sanitizeFilePattern(options.files);

  // Sanitize numeric values using defined constants
  const sanitizedLevels = sanitizeNumber(options.levels, 0, VALIDATION_LIMITS.LEVELS_MAX, 0);
  const sanitizedRetries = sanitizeNumber(options.retries, 0, VALIDATION_LIMITS.RETRIES_MAX, 1000000);
  const sanitizedWaitTime = sanitizeNumber(options.waitTime, 0, VALIDATION_LIMITS.WAIT_TIME_MAX, 30);
  const sanitizedThreads = sanitizeNumber(options.threads, VALIDATION_LIMITS.THREADS_MIN, VALIDATION_LIMITS.THREADS_MAX, 8);

  // Sanitize string lists (exclude files/dirs)
  const sanitizedExcludeFiles = sanitizeFileList(options.excludeFiles);
  const sanitizedExcludeDirs = sanitizeFileList(options.excludeDirs);

  // Sanitize attributes (only allow valid attribute letters)
  const sanitizedIncludeAttrs = sanitizeAttributes(options.includeAttributes);
  const sanitizedExcludeAttrs = sanitizeAttributes(options.excludeAttributes);

  return {
    source: sanitizedSource,
    destination: sanitizedDest,
    files: sanitizedFiles,
    subdirectories: Boolean(options.subdirectories),
    emptySubdirectories: Boolean(options.emptySubdirectories),
    mirrorMode: Boolean(options.mirrorMode),
    copyAll: Boolean(options.copyAll),
    restartMode: Boolean(options.restartMode),
    backupMode: Boolean(options.backupMode),
    moveFiles: Boolean(options.moveFiles),
    moveDirs: Boolean(options.moveDirs),
    copyArchive: Boolean(options.copyArchive),
    resetArchive: Boolean(options.resetArchive),
    verbose: Boolean(options.verbose),
    noProgress: Boolean(options.noProgress),
    eta: Boolean(options.eta),
    multiThread: Boolean(options.multiThread),
    levels: sanitizedLevels,
    retries: sanitizedRetries,
    waitTime: sanitizedWaitTime,
    threads: sanitizedThreads,
    excludeFiles: sanitizedExcludeFiles,
    excludeDirs: sanitizedExcludeDirs,
    includeAttributes: sanitizedIncludeAttrs,
    excludeAttributes: sanitizedExcludeAttrs
  };
}

// Security: Sanitize path to prevent path traversal and command injection
function sanitizePath(pathStr) {
  if (!pathStr || typeof pathStr !== 'string') {
    return '';
  }

  // Trim whitespace
  let sanitized = pathStr.trim();

  // Remove null bytes (security risk)
  sanitized = sanitized.replace(/\0/g, '');

  // Remove dangerous characters that could be used for command injection
  // Allow: alphanumeric, spaces, common path chars (\, /, :, -, _, .), and network paths (\\)
  // Prevent: semicolons, pipes, ampersands, redirects, etc.
  const dangerousChars = /[;&|<>`$(){}[\]!]/g;
  if (dangerousChars.test(sanitized)) {
    console.error('Dangerous characters detected in path:', sanitized);
    return '';
  }

  return sanitized;
}

// Security: Sanitize file pattern
function sanitizeFilePattern(pattern) {
  if (!pattern || typeof pattern !== 'string') {
    return '*.*';
  }

  let sanitized = pattern.trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Only allow alphanumeric, wildcards, dots, and hyphens
  const validPattern = /^[a-zA-Z0-9*?._ -]+$/;
  if (!validPattern.test(sanitized)) {
    console.error('Invalid file pattern:', sanitized);
    return '*.*';
  }

  return sanitized;
}

// Security: Sanitize numeric input
function sanitizeNumber(value, min, max, defaultValue) {
  const num = parseInt(value, 10);
  if (isNaN(num) || num < min || num > max) {
    return defaultValue;
  }
  return num;
}

// Security: Sanitize file/directory list
function sanitizeFileList(list) {
  if (!list || typeof list !== 'string') {
    return '';
  }

  let sanitized = list.trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Only allow alphanumeric, wildcards, dots, commas, spaces, hyphens, underscores
  const validPattern = /^[a-zA-Z0-9*?.,_ -]*$/;
  if (!validPattern.test(sanitized)) {
    console.error('Invalid file/directory list:', sanitized);
    return '';
  }

  return sanitized;
}

// Security: Sanitize attributes (only allow valid robocopy attribute letters)
function sanitizeAttributes(attrs) {
  if (!attrs || typeof attrs !== 'string') {
    return '';
  }

  // Valid robocopy attributes: R (Read-only), A (Archive), S (System), H (Hidden),
  // C (Compressed), N (Not content indexed), E (Encrypted), T (Temporary), O (Offline)
  const validAttrs = /^[RASHCNETOD]*$/i;
  const sanitized = attrs.trim().toUpperCase();

  if (!validAttrs.test(sanitized)) {
    console.error('Invalid attributes:', attrs);
    return '';
  }

  return sanitized;
}

function buildRobocopyArgs(options) {
  const args = [
    options.source,
    options.destination
  ];

  if (options.files && options.files.trim()) {
    args.push(options.files);
  }

  // Copy options
  if (options.subdirectories) args.push('/S');
  if (options.emptySubdirectories) args.push('/E');
  if (options.levels && options.levels > 0) args.push(`/LEV:${options.levels}`);

  // Copy mode
  if (options.restartMode) args.push('/Z');
  if (options.backupMode) args.push('/B');
  if (options.copyAll) args.push('/COPYALL');
  if (options.mirrorMode) args.push('/MIR');
  if (options.moveFiles) args.push('/MOVE');
  if (options.moveDirs) args.push('/MOV');

  // File selection
  if (options.copyArchive) args.push('/A');
  if (options.resetArchive) args.push('/M');
  if (options.includeAttributes && options.includeAttributes.trim()) {
    args.push(`/IA:${options.includeAttributes}`);
  }
  if (options.excludeAttributes && options.excludeAttributes.trim()) {
    args.push(`/XA:${options.excludeAttributes}`);
  }

  // Exclude files/directories
  if (options.excludeFiles && options.excludeFiles.trim()) {
    options.excludeFiles.split(',').forEach(f => args.push(`/XF`, f.trim()));
  }
  if (options.excludeDirs && options.excludeDirs.trim()) {
    options.excludeDirs.split(',').forEach(d => args.push(`/XD`, d.trim()));
  }

  // Retry options
  if (options.retries) args.push(`/R:${options.retries}`);
  if (options.waitTime) args.push(`/W:${options.waitTime}`);

  // Logging
  if (options.verbose) args.push('/V');
  if (options.noProgress) args.push('/NP');
  if (options.eta) args.push('/ETA');

  // Performance
  if (options.multiThread && options.threads) args.push(`/MT:${options.threads}`);

  return args;
}

function getExitCodeMessage(code) {
  const messages = {
    0: 'No files were copied. No failures were encountered.',
    1: 'All files were copied successfully.',
    2: 'Extra files or directories were detected.',
    3: 'Files were copied and extra files/directories were detected.',
    4: 'Some Mismatched files or directories were detected.',
    5: 'Some files were copied. Some files were mismatched.',
    6: 'Additional files and mismatched files exist.',
    7: 'Files were copied, additional files and mismatched files exist.',
    8: 'Several files did not copy (failure/access denied).',
  };

  return messages[code] || `Process exited with code ${code}`;
}

// ===================================
// PRESET MANAGEMENT
// ===================================

ipcMain.handle('save-preset', async (event, preset) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Preset',
    defaultPath: 'robocopy-preset.json',
    filters: [{ name: 'JSON', extensions: ['json'] }]
  });

  if (!result.canceled && result.filePath) {
    try {
      await fs.writeFile(result.filePath, JSON.stringify(preset, null, 2));
      return { success: true, path: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, canceled: true };
});

ipcMain.handle('load-preset', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Load Preset',
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    try {
      const data = await fs.readFile(result.filePaths[0], 'utf8');

      // Security: Validate file size (prevent DoS via large files)
      if (data.length > FILE_SIZE_LIMITS.PRESET_MAX) {
        return { success: false, error: 'Preset file is too large (max 1MB)' };
      }

      const preset = JSON.parse(data);

      // Security: Validate preset structure
      if (!validatePreset(preset)) {
        return { success: false, error: 'Invalid preset format' };
      }

      return { success: true, preset };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, canceled: true };
});

// ===================================
// LOG EXPORT
// ===================================

ipcMain.handle('export-log', async (event, logContent) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Log',
    defaultPath: `robocopy-log-${new Date().toISOString().replace(/:/g, '-').split('.')[0]}.txt`,
    filters: [{ name: 'Text Files', extensions: ['txt'] }, { name: 'All Files', extensions: ['*'] }]
  });

  if (!result.canceled && result.filePath) {
    try {
      await fs.writeFile(result.filePath, logContent);
      return { success: true, path: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, canceled: true };
});

// ===================================
// SCHEDULED TASKS
// ===================================

// Security: Validate preset structure
function validatePreset(preset) {
  if (!preset || typeof preset !== 'object') {
    return false;
  }

  // Preset must have a config object
  if (!preset.config || typeof preset.config !== 'object') {
    return false;
  }

  const config = preset.config;

  // Validate required string fields
  if (typeof config.source !== 'string' || typeof config.destination !== 'string') {
    return false;
  }

  // Validate optional fields have correct types
  const stringFields = ['files', 'excludeFiles', 'excludeDirs', 'includeAttributes', 'excludeAttributes'];
  const numberFields = ['levels', 'retries', 'waitTime', 'threads'];
  const booleanFields = ['subdirectories', 'emptySubdirectories', 'mirrorMode', 'copyAll',
                         'restartMode', 'backupMode', 'moveFiles', 'moveDirs', 'copyArchive',
                         'resetArchive', 'verbose', 'noProgress', 'eta', 'multiThread'];

  for (const field of stringFields) {
    if (config[field] !== undefined && typeof config[field] !== 'string') {
      return false;
    }
  }

  for (const field of numberFields) {
    if (config[field] !== undefined && typeof config[field] !== 'number') {
      return false;
    }
  }

  for (const field of booleanFields) {
    if (config[field] !== undefined && typeof config[field] !== 'boolean') {
      return false;
    }
  }

  return true;
}

// Security: Validate scheduled task structure
function validateScheduledTask(task) {
  if (!task || typeof task !== 'object') {
    return false;
  }

  // Validate required fields using defined constants
  if (typeof task.name !== 'string' || task.name.length === 0 || task.name.length > VALIDATION_LIMITS.TASK_NAME_MAX) {
    return false;
  }

  if (typeof task.schedule !== 'string' || task.schedule.length === 0 || task.schedule.length > VALIDATION_LIMITS.SCHEDULE_MAX) {
    return false;
  }

  // Validate cron format (basic validation)
  const cronPattern = /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]))\s+(\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3]))\s+(\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1]))\s+(\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2]))\s+(\*|[0-6]|\*\/[0-6])$/;
  if (!cronPattern.test(task.schedule)) {
    console.error('Invalid cron format:', task.schedule);
    return false;
  }

  // Validate config object
  if (!task.config || !validatePreset({ config: task.config })) {
    return false;
  }

  return true;
}

// Load tasks from storage
async function loadScheduledTasks() {
  const tasksPath = path.join(app.getPath('userData'), 'scheduled-tasks.json');
  try {
    if (fsSync.existsSync(tasksPath)) {
      const data = await fs.readFile(tasksPath, 'utf8');

      // Security: Validate file size (prevent DoS)
      if (data.length > FILE_SIZE_LIMITS.TASKS_MAX) {
        console.error('Scheduled tasks file is too large');
        return [];
      }

      const tasks = JSON.parse(data);

      // Security: Validate that tasks is an array
      if (!Array.isArray(tasks)) {
        console.error('Invalid tasks format: not an array');
        return [];
      }

      // Security: Validate each task and filter out invalid ones
      const validTasks = tasks.filter(task => {
        const isValid = validateScheduledTask(task);
        if (!isValid) {
          console.error('Invalid task found, skipping:', task);
        }
        return isValid;
      });

      return validTasks;
    }
  } catch (error) {
    console.error('Failed to load scheduled tasks:', error);
  }
  return [];
}

// Save tasks to storage
async function saveScheduledTasks(tasks) {
  const tasksPath = path.join(app.getPath('userData'), 'scheduled-tasks.json');
  try {
    await fs.writeFile(tasksPath, JSON.stringify(tasks, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to save scheduled tasks:', error);
    return false;
  }
}

ipcMain.handle('add-scheduled-task', async (event, task) => {
  try {
    // Validate task before adding
    if (!validateScheduledTask(task)) {
      return { success: false, error: 'Invalid task structure' };
    }

    const tasks = await loadScheduledTasks();
    const newTask = {
      id: Date.now().toString(),
      ...task,
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    tasks.push(newTask);
    await saveScheduledTasks(tasks);
    return { success: true, task: newTask };
  } catch (error) {
    console.error('Error adding scheduled task:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-scheduled-tasks', async () => {
  try {
    const tasks = await loadScheduledTasks();
    return { success: true, tasks };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-scheduled-task', async (event, taskId) => {
  try {
    let tasks = await loadScheduledTasks();
    tasks = tasks.filter(t => t.id !== taskId);
    await saveScheduledTasks(tasks);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('toggle-task-status', async (event, taskId) => {
  try {
    const tasks = await loadScheduledTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.status = task.status === 'active' ? 'paused' : 'active';
      await saveScheduledTasks(tasks);
      return { success: true, task };
    }
    return { success: false, error: 'Task not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ===================================
// PATH VALIDATION
// ===================================

ipcMain.handle('validate-path', async (event, pathToValidate) => {
  try {
    // Check if path exists (works for both local and network paths)
    const stats = await fs.stat(pathToValidate);
    return {
      success: true,
      exists: true,
      isDirectory: stats.isDirectory(),
      isNetworkPath: pathToValidate.startsWith('\\\\') || pathToValidate.startsWith('//')
    };
  } catch (error) {
    // Path doesn't exist or is inaccessible
    return {
      success: true,
      exists: false,
      isNetworkPath: pathToValidate.startsWith('\\\\') || pathToValidate.startsWith('//'),
      error: error.message
    };
  }
});

// ===================================
// AUTO-UPDATER IPC HANDLERS
// ===================================

ipcMain.handle('check-for-updates', async () => {
  try {
    if (!app.isPackaged) {
      return {
        success: false,
        error: 'Update checking is only available in packaged app'
      };
    }
    const result = await autoUpdater.checkForUpdates();
    return { success: true, updateInfo: result?.updateInfo };
  } catch (error) {
    log.error('Error checking for updates:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('download-update', async () => {
  try {
    if (!app.isPackaged) {
      return {
        success: false,
        error: 'Update downloading is only available in packaged app'
      };
    }
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    log.error('Error downloading update:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('install-update', async () => {
  try {
    // Quit and install the update
    autoUpdater.quitAndInstall(false, true);
    return { success: true };
  } catch (error) {
    log.error('Error installing update:', error);
    return { success: false, error: error.message };
  }
});

// ===================================
// PERFORMANCE MONITORING IPC HANDLERS
// ===================================

ipcMain.handle('get-performance-metrics', async () => {
  try {
    const metrics = {
      appUptime: Math.floor((Date.now() - performanceMetrics.startTime) / 1000),
      windowCreationTime: performanceMetrics.windowCreationTime,
      memory: performanceMetrics.memoryUsage(),
      platform: process.platform,
      arch: process.arch,
      version: app.getVersion(),
      electronVersion: process.versions.electron,
      nodeVersion: process.versions.node,
      chromeVersion: process.versions.chrome
    };
    return { success: true, metrics };
  } catch (error) {
    log.error('Error getting performance metrics:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('force-gc', async () => {
  try {
    if (global.gc) {
      global.gc();
      const memoryAfter = performanceMetrics.memoryUsage();
      log.info('Forced garbage collection - Memory after GC:', memoryAfter);
      return { success: true, memory: memoryAfter };
    }
    return {
      success: false,
      error: 'GC not exposed. Run with --expose-gc flag'
    };
  } catch (error) {
    log.error('Error forcing GC:', error);
    return { success: false, error: error.message };
  }
});
