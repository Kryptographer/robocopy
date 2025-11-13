// ===================================
// ROBOCOPY GUI - Renderer Process
// UI Logic and Event Handlers
// ===================================

let startTime = null;
let timerInterval = null;

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

  // Output
  outputTerminal: document.getElementById('outputTerminal'),
  statusIndicator: document.getElementById('statusIndicator'),
  statStatus: document.getElementById('statStatus'),
  statExitCode: document.getElementById('statExitCode'),
  statElapsed: document.getElementById('statElapsed'),
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
});

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
}

function appendOutput(text, type = 'normal') {
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
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimer() {
  if (!startTime) return;

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
// INITIALIZATION
// ===================================

console.log('🚀 Robocopy GUI initialized');
console.log('💾 Teenage Engineering × Tesla Design');
