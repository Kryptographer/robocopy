/**
 * Web Worker for Robocopy Output Parsing
 * Offloads heavy text parsing from the main renderer thread for better performance
 *
 * This worker handles:
 * - Line-by-line output parsing
 * - Statistics extraction
 * - Progress calculation
 * - File/directory counting
 */

'use strict';

// Performance optimization: Pre-compile regex patterns
const PATTERNS = {
  directories: /Dirs\s*:\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/,
  files: /Files\s*:\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/,
  bytes: /Bytes\s*:\s*([\d.]+\s*[kmgt]?)\s+([\d.]+\s*[kmgt]?)\s+([\d.]+\s*[kmgt]?)\s+([\d.]+\s*[kmgt]?)/i,
  times: /Times\s*:\s*([\d:]+)\s+([\d:]+)\s+([\d:]+)\s+([\d:]+)/,
  percentage: /(\d+(?:\.\d+)?)\s*%/,
  speed: /([\d.]+)\s*(bytes?|kb?|mb?|gb?|tb?)\/s/i,
  newFile: /^\s*New File\s+(\d+)\s+(.*)/i,
  copyFile: /^\s*\*EXTRA File\s+(.*)/i,
  error: /ERROR\s+(\d+)\s+\((0x[0-9A-F]+)\)\s+(.*)/i
};

// Statistics structure
let stats = {
  totalDirs: 0,
  copiedDirs: 0,
  totalFiles: 0,
  copiedFiles: 0,
  failedFiles: 0,
  skippedFiles: 0,
  totalBytes: 0,
  copiedBytes: 0,
  errors: [],
  warnings: [],
  currentFile: '',
  progress: 0,
  speed: '',
  timeElapsed: '',
  timeRemaining: ''
};

/**
 * Parse a single line of robocopy output
 * @param {string} line - Output line to parse
 * @returns {Object} Parsed data
 */
function parseLine(line) {
  const result = {
    type: 'log',
    line,
    stats: null,
    update: false
  };

  // Check for statistics
  let match;

  // Directory statistics
  if ((match = PATTERNS.directories.exec(line))) {
    stats.totalDirs = parseInt(match[1], 10);
    stats.copiedDirs = parseInt(match[2], 10);
    result.type = 'dirs';
    result.stats = { ...stats };
    result.update = true;
  }

  // File statistics
  if ((match = PATTERNS.files.exec(line))) {
    stats.totalFiles = parseInt(match[1], 10);
    stats.copiedFiles = parseInt(match[2], 10);
    stats.skippedFiles = parseInt(match[3], 10) || 0;
    stats.failedFiles = parseInt(match[5], 10) || 0;
    result.type = 'files';
    result.stats = { ...stats };
    result.update = true;
  }

  // Bytes statistics
  if ((match = PATTERNS.bytes.exec(line))) {
    stats.totalBytes = parseSize(match[1]);
    stats.copiedBytes = parseSize(match[2]);
    result.type = 'bytes';
    result.stats = { ...stats };
    result.update = true;

    // Calculate progress
    if (stats.totalBytes > 0) {
      stats.progress = Math.round((stats.copiedBytes / stats.totalBytes) * 100);
    }
  }

  // Time statistics
  if ((match = PATTERNS.times.exec(line))) {
    stats.timeElapsed = match[1] || '0:00:00';
    result.type = 'time';
    result.stats = { ...stats };
    result.update = true;
  }

  // Progress percentage
  if ((match = PATTERNS.percentage.exec(line))) {
    const percentage = parseFloat(match[1]);
    if (percentage >= 0 && percentage <= 100) {
      stats.progress = Math.round(percentage);
      result.type = 'progress';
      result.stats = { ...stats };
      result.update = true;
    }
  }

  // Transfer speed
  if ((match = PATTERNS.speed.exec(line))) {
    stats.speed = `${match[1]} ${match[2]}/s`;
    result.type = 'speed';
    result.stats = { ...stats };
    result.update = true;
  }

  // Current file being copied
  if ((match = PATTERNS.newFile.exec(line)) || (match = PATTERNS.copyFile.exec(line))) {
    stats.currentFile = match[match.length - 1].trim();
    result.type = 'file';
    result.stats = { ...stats };
    result.update = true;
  }

  // Error detection
  if ((match = PATTERNS.error.exec(line)) || line.toLowerCase().includes('error')) {
    const error = {
      code: match ? match[1] : 'unknown',
      hex: match ? match[2] : '',
      message: match ? match[3] : line,
      timestamp: Date.now()
    };
    stats.errors.push(error);
    result.type = 'error';
    result.error = error;
    result.stats = { ...stats };
    result.update = true;
  }

  // Warning detection
  if (line.toLowerCase().includes('warning') || line.toLowerCase().includes('access denied')) {
    const warning = {
      message: line,
      timestamp: Date.now()
    };
    stats.warnings.push(warning);
    result.type = 'warning';
    result.warning = warning;
    result.stats = { ...stats };
    result.update = true;
  }

  return result;
}

/**
 * Parse size string to bytes
 * @param {string} sizeStr - Size string (e.g., "1.5 gb", "500 mb")
 * @returns {number} Size in bytes
 */
function parseSize(sizeStr) {
  if (!sizeStr || typeof sizeStr !== 'string') {
    return 0;
  }

  const cleaned = sizeStr.trim().toLowerCase();
  const match = /^([\d.]+)\s*([kmgt])?b?$/i.exec(cleaned);

  if (!match) {
    // Try parsing as plain number
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  const value = parseFloat(match[1]);
  const unit = match[2] || '';

  const multipliers = {
    '': 1,
    'k': 1024,
    'm': 1024 * 1024,
    'g': 1024 * 1024 * 1024,
    't': 1024 * 1024 * 1024 * 1024
  };

  return Math.round(value * (multipliers[unit] || 1));
}

/**
 * Reset statistics
 */
function resetStats() {
  stats = {
    totalDirs: 0,
    copiedDirs: 0,
    totalFiles: 0,
    copiedFiles: 0,
    failedFiles: 0,
    skippedFiles: 0,
    totalBytes: 0,
    copiedBytes: 0,
    errors: [],
    warnings: [],
    currentFile: '',
    progress: 0,
    speed: '',
    timeElapsed: '',
    timeRemaining: ''
  };
}

/**
 * Process batch of output lines
 * @param {string[]} lines - Array of output lines
 * @returns {Object[]} Parsed results
 */
function processBatch(lines) {
  if (!Array.isArray(lines)) {
    return [];
  }

  return lines.map(line => parseLine(line)).filter(result => result.update);
}

// Worker message handler
self.onmessage = function(event) {
  const { type, data } = event.data;

  try {
    switch (type) {
      case 'parse-line':
        {
          const result = parseLine(data);
          self.postMessage({ type: 'parse-result', data: result });
        }
        break;

      case 'parse-batch':
        {
          const results = processBatch(data);
          self.postMessage({ type: 'batch-result', data: results });
        }
        break;

      case 'reset':
        {
          resetStats();
          self.postMessage({ type: 'reset-complete', data: stats });
        }
        break;

      case 'get-stats':
        {
          self.postMessage({ type: 'stats', data: stats });
        }
        break;

      default:
        self.postMessage({
          type: 'error',
          data: { message: `Unknown message type: ${type}` }
        });
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: {
        message: error.message,
        stack: error.stack
      }
    });
  }
};

// Signal worker is ready
self.postMessage({ type: 'ready' });
