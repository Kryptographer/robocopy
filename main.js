const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

let mainWindow;
let scheduledTasks = new Map(); // Store scheduled tasks

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0a0a0a',
    frame: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0a0a0a',
      symbolColor: '#ffffff',
      height: 40
    },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

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

// IPC Handlers
ipcMain.handle('select-directory', async (event, type) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: type === 'source' ? 'Select Source Directory' : 'Select Destination Directory'
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('execute-robocopy', async (event, options) => {
  return new Promise((resolve, reject) => {
    const args = buildRobocopyArgs(options);

    // For non-Windows systems, simulate robocopy for testing
    const isWindows = process.platform === 'win32';
    const command = isWindows ? 'robocopy' : 'echo';
    const finalArgs = isWindows ? args : [`Simulating: robocopy ${args.join(' ')}`];

    const robocopy = spawn(command, finalArgs, {
      shell: true,
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
  });
});

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
      const preset = JSON.parse(data);
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

// Load tasks from storage
async function loadScheduledTasks() {
  const tasksPath = path.join(app.getPath('userData'), 'scheduled-tasks.json');
  try {
    if (fsSync.existsSync(tasksPath)) {
      const data = await fs.readFile(tasksPath, 'utf8');
      const tasks = JSON.parse(data);
      return tasks;
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
