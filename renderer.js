// ===================================
// ROBOCOPY GUI - Renderer Process
// UI Logic and Event Handlers
// ===================================

// Performance: State management
let startTime = null;
let timerInterval = null;
let outputLog = ''; // Store full output for export
let currentProgress = 0;
let lastProgressUpdate = 0; // Throttle progress updates
let scheduledTasksCache = null; // Cache scheduled tasks
let scheduledTasksCacheTime = 0; // Cache timestamp
const CACHE_DURATION = 5000; // 5 seconds cache

// ===================================
// DOM ELEMENTS
// ===================================

const elements = {
  // Path inputs
  sourcePath: document.getElementById('sourcePath'),
  destPath: document.getElementById('destPath'),
  browseSource: document.getElementById('browseSource'),
  browseDest: document.getElementById('browseDest'),
  files: document.getElementById('files'),

  // Copy options
  subdirectories: document.getElementById('subdirectories'),
  emptySubdirs: document.getElementById('emptySubdirs'),
  mirrorMode: document.getElementById('mirrorMode'),
  copyAll: document.getElementById('copyAll'),
  restartMode: document.getElementById('restartMode'),
  backupMode: document.getElementById('backupMode'),
  moveFiles: document.getElementById('moveFiles'),
  verbose: document.getElementById('verbose'),

  // Advanced options
  levels: document.getElementById('levels'),
  retries: document.getElementById('retries'),
  waitTime: document.getElementById('waitTime'),
  excludeFiles: document.getElementById('excludeFiles'),
  excludeDirs: document.getElementById('excludeDirs'),
  multiThread: document.getElementById('multiThread'),
  threads: document.getElementById('threads'),

  // Buttons
  startBtn: document.getElementById('startBtn'),
  clearBtn: document.getElementById('clearBtn'),
  clearOutput: document.getElementById('clearOutput'),
  savePreset: document.getElementById('savePreset'),
  loadPreset: document.getElementById('loadPreset'),
  exportLog: document.getElementById('exportLog'),
  themeToggle: document.getElementById('themeToggle'),
  themeIcon: document.getElementById('themeIcon'),

  // Scheduling
  taskName: document.getElementById('taskName'),
  cronSchedule: document.getElementById('cronSchedule'),
  addSchedule: document.getElementById('addSchedule'),
  viewSchedules: document.getElementById('viewSchedules'),
  scheduledTasksList: document.getElementById('scheduledTasksList'),

  // Drop zones
  sourceDropZone: document.getElementById('sourceDropZone'),
  destDropZone: document.getElementById('destDropZone'),

  // Output
  outputTerminal: document.getElementById('outputTerminal'),
  statusIndicator: document.getElementById('statusIndicator'),
  statStatus: document.getElementById('statStatus'),
  statExitCode: document.getElementById('statExitCode'),
  statProgress: document.getElementById('statProgress'),
  statElapsed: document.getElementById('statElapsed'),
  progressFill: document.getElementById('progressFill'),
  progressText: document.getElementById('progressText'),
};

// ===================================
// EVENT LISTENERS
// ===================================

// Browse buttons
elements.browseSource.addEventListener('click', async () => {
  const path = await window.electronAPI.selectDirectory('source');
  if (path) {
    elements.sourcePath.value = path;
  }
});

elements.browseDest.addEventListener('click', async () => {
  const path = await window.electronAPI.selectDirectory('destination');
  if (path) {
    elements.destPath.value = path;
  }
});

// Start button
elements.startBtn.addEventListener('click', async () => {
  if (!validateInputs()) {
    return;
  }

  const options = buildOptions();
  await executeRobocopy(options);
});

// Clear button
elements.clearBtn.addEventListener('click', () => {
  clearForm();
});

// Clear output button
elements.clearOutput.addEventListener('click', () => {
  clearOutput();
});

// Listen for robocopy output
window.electronAPI.onRobocopyOutput((output) => {
  appendOutput(output);
  parseProgress(output);
});

// Theme toggle
elements.themeToggle.addEventListener('click', () => {
  toggleTheme();
});

// Preset buttons
elements.savePreset.addEventListener('click', async () => {
  await savePreset();
});

elements.loadPreset.addEventListener('click', async () => {
  await loadPreset();
});

// Export log
elements.exportLog.addEventListener('click', async () => {
  await exportLog();
});

// Scheduling buttons
elements.addSchedule.addEventListener('click', async () => {
  await addScheduledTask();
});

elements.viewSchedules.addEventListener('click', async () => {
  await loadScheduledTasks();
});

// Drag and drop setup
setupDragAndDrop();

// Load theme preference
loadThemePreference();

// Load scheduled tasks on startup
loadScheduledTasks();

// ===================================
// VALIDATION
// ===================================

function validateInputs() {
  const source = elements.sourcePath.value.trim();
  const dest = elements.destPath.value.trim();

  if (!source) {
    showError('Please select a source directory');
    return false;
  }

  if (!dest) {
    showError('Please select a destination directory');
    return false;
  }

  if (source === dest) {
    showError('Source and destination cannot be the same');
    return false;
  }

  return true;
}

// ===================================
// BUILD OPTIONS
// ===================================

function buildOptions() {
  return {
    source: elements.sourcePath.value.trim(),
    destination: elements.destPath.value.trim(),
    files: elements.files.value.trim() || '*.*',

    // Copy options
    subdirectories: elements.subdirectories.checked,
    emptySubdirectories: elements.emptySubdirs.checked,
    mirrorMode: elements.mirrorMode.checked,
    copyAll: elements.copyAll.checked,
    restartMode: elements.restartMode.checked,
    backupMode: elements.backupMode.checked,
    moveFiles: elements.moveFiles.checked,
    verbose: elements.verbose.checked,

    // Advanced options
    levels: parseInt(elements.levels.value) || 0,
    retries: parseInt(elements.retries.value) || 1000000,
    waitTime: parseInt(elements.waitTime.value) || 30,
    excludeFiles: elements.excludeFiles.value.trim(),
    excludeDirs: elements.excludeDirs.value.trim(),
    multiThread: elements.multiThread.checked,
    threads: parseInt(elements.threads.value) || 8,
  };
}

// ===================================
// ROBOCOPY EXECUTION
// ===================================

async function executeRobocopy(options) {
  // Clear previous output
  clearOutput();

  // Update UI state
  setUIState('running');
  updateStatus('RUNNING', 'running');
  elements.startBtn.disabled = true;

  // Start timer
  startTimer();

  // Show command being executed
  appendOutput('╔═══════════════════════════════════════════════════════════╗\n', 'info');
  appendOutput('  ROBOCOPY OPERATION STARTED\n', 'info');
  appendOutput('╚═══════════════════════════════════════════════════════════╝\n\n', 'info');
  appendOutput(`Source:      ${options.source}\n`, 'info');
  appendOutput(`Destination: ${options.destination}\n`, 'info');
  appendOutput(`Files:       ${options.files}\n\n`, 'info');

  try {
    const result = await window.electronAPI.executeRobocopy(options);

    // Stop timer
    stopTimer();

    // Update UI with results
    if (result.success) {
      appendOutput('\n╔═══════════════════════════════════════════════════════════╗\n', 'success');
      appendOutput('  OPERATION COMPLETED SUCCESSFULLY\n', 'success');
      appendOutput('╚═══════════════════════════════════════════════════════════╝\n', 'success');
      updateStatus('SUCCESS', 'success');
      elements.statExitCode.textContent = result.code;
      elements.statExitCode.className = 'stat-value success';
    } else {
      appendOutput('\n╔═══════════════════════════════════════════════════════════╗\n', 'error');
      appendOutput('  OPERATION COMPLETED WITH ERRORS\n', 'error');
      appendOutput('╚═══════════════════════════════════════════════════════════╝\n', 'error');
      updateStatus('ERROR', 'error');
      elements.statExitCode.textContent = result.code;
      elements.statExitCode.className = 'stat-value error';
    }

    appendOutput(`\nExit Code: ${result.code}\n`, result.success ? 'success' : 'error');
    appendOutput(`Message: ${result.message}\n`, result.success ? 'success' : 'error');

  } catch (error) {
    stopTimer();
    appendOutput('\n╔═══════════════════════════════════════════════════════════╗\n', 'error');
    appendOutput('  OPERATION FAILED\n', 'error');
    appendOutput('╚═══════════════════════════════════════════════════════════╝\n', 'error');
    appendOutput(`\nError: ${error.error || error.message || 'Unknown error'}\n`, 'error');
    updateStatus('ERROR', 'error');
    elements.statExitCode.textContent = 'ERR';
    elements.statExitCode.className = 'stat-value error';
  } finally {
    setUIState('ready');
    elements.startBtn.disabled = false;
  }
}

// ===================================
// UI STATE MANAGEMENT
// ===================================

function setUIState(state) {
  if (state === 'running') {
    elements.statusIndicator.classList.add('running');
    elements.statusIndicator.querySelector('span').textContent = 'RUNNING';
  } else {
    elements.statusIndicator.classList.remove('running', 'error');
    elements.statusIndicator.querySelector('span').textContent = 'READY';
  }
}

function updateStatus(text, className) {
  elements.statStatus.textContent = text;
  elements.statStatus.className = `stat-value ${className}`;
}

// ===================================
// OUTPUT MANAGEMENT
// ===================================

function clearOutput() {
  elements.outputTerminal.innerHTML = '';
  elements.statExitCode.textContent = '-';
  elements.statExitCode.className = 'stat-value';
  updateStatus('IDLE', '');
  elements.statElapsed.textContent = '00:00:00';
  elements.statProgress.textContent = '0%';
  elements.progressFill.style.width = '0%';
  elements.progressText.textContent = 'Ready to start...';
  outputLog = '';
  currentProgress = 0;
}

function appendOutput(text, type = 'normal') {
  // Store in log for export
  outputLog += text;

  // Remove welcome message if it exists
  const welcome = elements.outputTerminal.querySelector('.terminal-welcome');
  if (welcome) {
    welcome.remove();
  }

  const line = document.createElement('div');
  line.className = `output-line ${type}`;
  line.textContent = text;
  elements.outputTerminal.appendChild(line);

  // Auto-scroll to bottom
  elements.outputTerminal.scrollTop = elements.outputTerminal.scrollHeight;
}

function showError(message) {
  appendOutput(`ERROR: ${message}\n`, 'error');
  updateStatus('ERROR', 'error');
}

// ===================================
// TIMER
// ===================================

function startTimer() {
  // Performance: Clear any existing timer first to prevent leaks
  stopTimer();

  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  // Performance: Reset start time when stopping
  startTime = null;
}

function updateTimer() {
  if (!startTime) {
    stopTimer(); // Safety: stop if no start time
    return;
  }

  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
  const seconds = (elapsed % 60).toString().padStart(2, '0');

  elements.statElapsed.textContent = `${hours}:${minutes}:${seconds}`;
}

// ===================================
// FORM MANAGEMENT
// ===================================

function clearForm() {
  // Clear paths
  elements.sourcePath.value = '';
  elements.destPath.value = '';
  elements.files.value = '';

  // Reset checkboxes
  elements.subdirectories.checked = false;
  elements.emptySubdirs.checked = false;
  elements.mirrorMode.checked = false;
  elements.copyAll.checked = false;
  elements.restartMode.checked = false;
  elements.backupMode.checked = false;
  elements.moveFiles.checked = false;
  elements.verbose.checked = false;

  // Reset advanced options
  elements.levels.value = '';
  elements.retries.value = '1000000';
  elements.waitTime.value = '30';
  elements.excludeFiles.value = '';
  elements.excludeDirs.value = '';
  elements.multiThread.checked = true;
  elements.threads.value = '8';

  // Clear output
  clearOutput();
}

// ===================================
// THEME MANAGEMENT
// ===================================

function toggleTheme() {
  const body = document.body;
  const isLight = body.classList.toggle('light-theme');
  elements.themeIcon.textContent = isLight ? '🌙' : '☀️';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

function loadThemePreference() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    elements.themeIcon.textContent = '🌙';
  }
}

// ===================================
// PRESET MANAGEMENT
// ===================================

async function savePreset() {
  const preset = {
    name: 'Robocopy Preset',
    timestamp: new Date().toISOString(),
    config: buildOptions()
  };

  const result = await window.electronAPI.savePreset(preset);
  if (result.success) {
    appendOutput(`\n✓ Preset saved to: ${result.path}\n`, 'success');
  } else if (!result.canceled) {
    appendOutput(`\n✗ Failed to save preset: ${result.error}\n`, 'error');
  }
}

async function loadPreset() {
  const result = await window.electronAPI.loadPreset();
  if (result.success) {
    applyPreset(result.preset.config);
    appendOutput(`\n✓ Preset loaded successfully\n`, 'success');
  } else if (!result.canceled) {
    appendOutput(`\n✗ Failed to load preset: ${result.error}\n`, 'error');
  }
}

function applyPreset(config) {
  // Apply paths
  elements.sourcePath.value = config.source || '';
  elements.destPath.value = config.destination || '';
  elements.files.value = config.files || '';

  // Apply checkboxes
  elements.subdirectories.checked = config.subdirectories || false;
  elements.emptySubdirs.checked = config.emptySubdirectories || false;
  elements.mirrorMode.checked = config.mirrorMode || false;
  elements.copyAll.checked = config.copyAll || false;
  elements.restartMode.checked = config.restartMode || false;
  elements.backupMode.checked = config.backupMode || false;
  elements.moveFiles.checked = config.moveFiles || false;
  elements.verbose.checked = config.verbose || false;

  // Apply advanced options
  elements.levels.value = config.levels || '';
  elements.retries.value = config.retries || 1000000;
  elements.waitTime.value = config.waitTime || 30;
  elements.excludeFiles.value = config.excludeFiles || '';
  elements.excludeDirs.value = config.excludeDirs || '';
  elements.multiThread.checked = config.multiThread !== false;
  elements.threads.value = config.threads || 8;
}

// ===================================
// LOG EXPORT
// ===================================

async function exportLog() {
  if (!outputLog || outputLog.trim().length === 0) {
    appendOutput('\n✗ No log data to export\n', 'error');
    return;
  }

  const result = await window.electronAPI.exportLog(outputLog);
  if (result.success) {
    appendOutput(`\n✓ Log exported to: ${result.path}\n`, 'success');
  } else if (!result.canceled) {
    appendOutput(`\n✗ Failed to export log: ${result.error}\n`, 'error');
  }
}

// ===================================
// DRAG AND DROP
// ===================================

function setupDragAndDrop() {
  [elements.sourceDropZone, elements.destDropZone].forEach(dropZone => {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-over');

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        const pathInput = dropZone.querySelector('.path-input');

        // Use the file path (Electron provides full paths)
        if (file.path) {
          pathInput.value = file.path;

          // Validate if it's a network path
          const validation = await window.electronAPI.validatePath(file.path);
          if (validation.isNetworkPath) {
            appendOutput(`\n✓ Network path detected: ${file.path}\n`, 'info');
          }
        }
      }
    });
  });
}

// ===================================
// SCHEDULED TASKS
// ===================================

async function addScheduledTask() {
  const taskName = elements.taskName.value.trim();
  const cronSchedule = elements.cronSchedule.value.trim();

  if (!taskName) {
    appendOutput('\n✗ Please enter a task name\n', 'error');
    return;
  }

  if (!cronSchedule) {
    appendOutput('\n✗ Please enter a schedule (cron format)\n', 'error');
    return;
  }

  if (!validateInputs()) {
    appendOutput('\n✗ Please configure valid source and destination paths\n', 'error');
    return;
  }

  const task = {
    name: taskName,
    schedule: cronSchedule,
    config: buildOptions()
  };

  const result = await window.electronAPI.addScheduledTask(task);
  if (result.success) {
    appendOutput(`\n✓ Scheduled task "${taskName}" added successfully\n`, 'success');
    elements.taskName.value = '';
    elements.cronSchedule.value = '';

    // Performance: Force refresh to invalidate cache
    await loadScheduledTasks(true);
  } else {
    appendOutput(`\n✗ Failed to add task: ${result.error}\n`, 'error');
  }
}

// Performance: Cache scheduled tasks to reduce IPC calls
async function loadScheduledTasks(forceRefresh = false) {
  const now = Date.now();

  // Use cache if it's still valid and not forcing refresh
  if (!forceRefresh && scheduledTasksCache && (now - scheduledTasksCacheTime) < CACHE_DURATION) {
    displayScheduledTasks(scheduledTasksCache);
    return;
  }

  // Fetch from main process
  const result = await window.electronAPI.getScheduledTasks();
  if (result.success) {
    // Update cache
    scheduledTasksCache = result.tasks;
    scheduledTasksCacheTime = now;
    displayScheduledTasks(result.tasks);
  }
}

// Security: Escape HTML to prevent XSS
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function displayScheduledTasks(tasks) {
  // Clear existing tasks
  while (elements.scheduledTasksList.firstChild) {
    elements.scheduledTasksList.removeChild(elements.scheduledTasksList.firstChild);
  }

  if (tasks.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.style.padding = '12px';
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.color = 'var(--text-tertiary)';
    emptyMsg.style.fontSize = '11px';
    emptyMsg.textContent = 'No scheduled tasks';
    elements.scheduledTasksList.appendChild(emptyMsg);
    return;
  }

  tasks.forEach(task => {
    const taskEl = document.createElement('div');
    taskEl.className = 'scheduled-task-item';

    // Security: Use DOM manipulation instead of innerHTML to prevent XSS
    const taskInfo = document.createElement('div');
    taskInfo.className = 'task-info';

    const taskName = document.createElement('div');
    taskName.className = 'task-name';
    taskName.textContent = task.name; // Safe - uses textContent

    const taskSchedule = document.createElement('div');
    taskSchedule.className = 'task-schedule';
    taskSchedule.textContent = `Schedule: ${task.schedule}`; // Safe - uses textContent

    const taskStatus = document.createElement('span');
    taskStatus.className = `task-status ${task.status}`;
    taskStatus.textContent = task.status.toUpperCase(); // Safe - uses textContent

    taskInfo.appendChild(taskName);
    taskInfo.appendChild(taskSchedule);
    taskInfo.appendChild(taskStatus);

    // Create action buttons
    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn btn-small';
    toggleBtn.textContent = task.status === 'active' ? 'PAUSE' : 'RESUME';
    toggleBtn.addEventListener('click', () => toggleTaskStatus(task.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-small';
    deleteBtn.textContent = 'DELETE';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    taskActions.appendChild(toggleBtn);
    taskActions.appendChild(deleteBtn);

    taskEl.appendChild(taskInfo);
    taskEl.appendChild(taskActions);
    elements.scheduledTasksList.appendChild(taskEl);
  });
}

async function toggleTaskStatus(taskId) {
  const result = await window.electronAPI.toggleTaskStatus(taskId);
  if (result.success) {
    // Performance: Force refresh to invalidate cache
    await loadScheduledTasks(true);
  }
}

async function deleteTask(taskId) {
  if (confirm('Are you sure you want to delete this scheduled task?')) {
    const result = await window.electronAPI.deleteScheduledTask(taskId);
    if (result.success) {
      appendOutput('\n✓ Task deleted successfully\n', 'success');

      // Performance: Force refresh to invalidate cache
      await loadScheduledTasks(true);
    }
  }
}

// Security: Removed global window function assignments
// Functions are now attached directly via addEventListener to prevent XSS

// ===================================
// PROGRESS ESTIMATION
// ===================================

// Performance: Throttle progress updates to avoid excessive DOM manipulation
function parseProgress(output) {
  // Try to extract percentage from robocopy output
  // Robocopy shows progress like: "  10.0%"
  const percentMatch = output.match(/(\d+\.?\d*)%/);
  if (percentMatch) {
    const percent = parseFloat(percentMatch[1]);
    updateProgress(percent);
    return; // Early return to avoid redundant processing
  }

  // Look for file counts: "Files : 123" or "Copied: 45"
  const filesMatch = output.match(/Files\s*:\s*(\d+)/i);
  const copiedMatch = output.match(/Copied\s*:\s*(\d+)/i);

  if (filesMatch && copiedMatch) {
    const total = parseInt(filesMatch[1], 10);
    const copied = parseInt(copiedMatch[1], 10);
    if (total > 0) {
      const percent = (copied / total) * 100;
      updateProgress(percent);
    }
  }
}

// Performance: Throttle updates to max 10 updates per second (100ms)
function updateProgress(percent) {
  const now = Date.now();

  // Throttle: Only update if 100ms has passed since last update
  if (now - lastProgressUpdate < 100 && percent < 100) {
    return;
  }

  lastProgressUpdate = now;
  currentProgress = Math.min(100, Math.max(0, percent));

  // Performance: Batch DOM updates
  const roundedProgress = Math.round(currentProgress);
  elements.progressFill.style.width = `${currentProgress}%`;
  elements.statProgress.textContent = `${roundedProgress}%`;
  elements.progressText.textContent = `Progress: ${roundedProgress}% complete`;
}

// ===================================
// INITIALIZATION
// ===================================

console.log('🚀 Robocopy GUI initialized');
console.log('💾 Modern Design System');
