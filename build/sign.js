/**
 * Code Signing Configuration for Windows
 *
 * This script provides code signing capabilities for the application.
 * For production builds, you should set up a proper code signing certificate.
 *
 * Environment variables required for production:
 * - CSC_LINK: Path to certificate file (.p12 or .pfx)
 * - CSC_KEY_PASSWORD: Certificate password
 *
 * Or use Azure Key Vault / Windows Certificate Store
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Sign the application using signtool.exe (Windows only)
 * @param {Object} configuration - electron-builder configuration
 */
exports.default = async function(configuration) {
  // Only sign on Windows
  if (process.platform !== 'win32') {
    console.log('Skipping code signing: Not on Windows platform');
    return;
  }

  // Check if code signing is configured
  const certificateFile = process.env.CSC_LINK;
  const certificatePassword = process.env.CSC_KEY_PASSWORD;

  if (!certificateFile || !fs.existsSync(certificateFile)) {
    console.warn('⚠️  Code signing certificate not found. Skipping signing.');
    console.warn('   For production builds, set CSC_LINK and CSC_KEY_PASSWORD');
    return;
  }

  const appPath = configuration.path;

  if (!appPath || !fs.existsSync(appPath)) {
    console.error('❌ Application path not found:', appPath);
    return;
  }

  console.log('🔐 Signing application:', path.basename(appPath));

  try {
    // Sign using signtool.exe (Windows SDK)
    const signtoolPath = findSignTool();

    if (!signtoolPath) {
      console.warn('⚠️  signtool.exe not found. Install Windows SDK for code signing.');
      return;
    }

    const signCommand = `"${signtoolPath}" sign /f "${certificateFile}" /p "${certificatePassword}" /fd SHA256 /tr http://timestamp.digicert.com /td SHA256 /v "${appPath}"`;

    execSync(signCommand, {
      stdio: 'inherit',
      shell: true
    });

    console.log('✅ Application signed successfully');

  } catch (error) {
    console.error('❌ Code signing failed:', error.message);
    // Don't throw - allow build to continue without signature for development
  }
};

/**
 * Find signtool.exe from Windows SDK
 * @returns {string|null} Path to signtool.exe or null if not found
 */
function findSignTool() {
  const possiblePaths = [
    'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.22621.0\\x64\\signtool.exe',
    'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.22000.0\\x64\\signtool.exe',
    'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.19041.0\\x64\\signtool.exe',
    'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\x64\\signtool.exe',
    'C:\\Program Files (x86)\\Microsoft SDKs\\Windows\\v7.1A\\Bin\\signtool.exe'
  ];

  // Check environment variable first
  if (process.env.SIGNTOOL_PATH && fs.existsSync(process.env.SIGNTOOL_PATH)) {
    return process.env.SIGNTOOL_PATH;
  }

  // Check common paths
  for (const signtoolPath of possiblePaths) {
    if (fs.existsSync(signtoolPath)) {
      return signtoolPath;
    }
  }

  // Try to find via where command
  try {
    const result = execSync('where signtool.exe', { encoding: 'utf8' });
    const paths = result.split('\n').filter(p => p.trim());
    if (paths.length > 0 && fs.existsSync(paths[0].trim())) {
      return paths[0].trim();
    }
  } catch (error) {
    // signtool not in PATH
  }

  return null;
}
