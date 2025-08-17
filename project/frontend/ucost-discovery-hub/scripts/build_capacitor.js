#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CAPACITOR_CONFIG = 'capacitor.config.ts';
const WEB_BUILD_DIR = 'dist';
const PACKAGE_JSON = 'package.json';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function checkPrerequisites() {
  logInfo('Checking prerequisites...');
  
  // Check if Capacitor CLI is installed
  try {
    execSync('npx cap --version', { stdio: 'pipe' });
    logSuccess('Capacitor CLI found');
  } catch (error) {
    logError('Capacitor CLI not found. Please install it first:');
    log('npm install -g @capacitor/cli', 'cyan');
    process.exit(1);
  }

  // Check if package.json exists
  if (!fs.existsSync(PACKAGE_JSON)) {
    logError('package.json not found. Please run this script from the project root.');
    process.exit(1);
  }

  // Check if capacitor.config.ts exists
  if (!fs.existsSync(CAPACITOR_CONFIG)) {
    logError('capacitor.config.ts not found. Please run cap:add first.');
    process.exit(1);
  }

  logSuccess('All prerequisites met');
}

function runCommand(command, description) {
  logInfo(description);
  try {
    execSync(command, { stdio: 'inherit' });
    logSuccess(`${description} completed`);
    return true;
  } catch (error) {
    logError(`${description} failed: ${error.message}`);
    return false;
  }
}

function buildWeb() {
  logInfo('Building web application...');
  
  // Clean previous build
  if (fs.existsSync(WEB_BUILD_DIR)) {
    fs.rmSync(WEB_BUILD_DIR, { recursive: true, force: true });
    logInfo('Cleaned previous build');
  }

  // Install dependencies if needed
  if (!fs.existsSync('node_modules')) {
    logInfo('Installing dependencies...');
    if (!runCommand('npm install', 'Installing dependencies')) {
      return false;
    }
  }

  // Build the web app
  if (!runCommand('npm run build', 'Building web application')) {
    return false;
  }

  // Verify build output
  if (!fs.existsSync(WEB_BUILD_DIR)) {
    logError('Build failed: dist directory not found');
    return false;
  }

  logSuccess('Web application built successfully');
  return true;
}

function addPlatforms() {
  logInfo('Adding native platforms...');
  
  const platforms = ['android', 'ios'];
  
  for (const platform of platforms) {
    try {
      logInfo(`Adding ${platform} platform...`);
      execSync(`npx cap add ${platform}`, { stdio: 'inherit' });
      logSuccess(`${platform} platform added`);
    } catch (error) {
      logWarning(`Failed to add ${platform} platform: ${error.message}`);
      logInfo('This is normal if the platform is already added');
    }
  }
}

function syncPlatforms() {
  logInfo('Syncing with native platforms...');
  
  try {
    execSync('npx cap sync', { stdio: 'inherit' });
    logSuccess('Platforms synced successfully');
    return true;
  } catch (error) {
    logError(`Failed to sync platforms: ${error.message}`);
    return false;
  }
}

function openPlatform(platform) {
  logInfo(`Opening ${platform} in native IDE...`);
  
  try {
    execSync(`npx cap open ${platform}`, { stdio: 'inherit' });
    logSuccess(`${platform} opened successfully`);
  } catch (error) {
    logError(`Failed to open ${platform}: ${error.message}`);
    logInfo(`Make sure you have ${platform === 'ios' ? 'Xcode' : 'Android Studio'} installed`);
  }
}

function runPlatform(platform) {
  logInfo(`Running on ${platform}...`);
  
  try {
    execSync(`npx cap run ${platform}`, { stdio: 'inherit' });
  } catch (error) {
    logError(`Failed to run on ${platform}: ${error.message}`);
    logInfo(`Make sure you have a ${platform} device or emulator running`);
  }
}

function buildForPlatform(platform) {
  logInfo(`Building for ${platform}...`);
  
  if (!buildWeb()) {
    return false;
  }
  
  if (!syncPlatforms()) {
    return false;
  }
  
  logSuccess(`${platform} build completed`);
  return true;
}

function showHelp() {
  log('UCOST Discovery Hub - Capacitor Build Script', 'bright');
  log('');
  log('Available commands:', 'cyan');
  log('');
  log('  build                    Build web application', 'green');
  log('  sync                     Sync with native platforms', 'green');
  log('  add                      Add native platforms', 'green');
  log('  open <platform>          Open platform in native IDE', 'green');
  log('  run <platform>           Run on platform device/emulator', 'green');
  log('  build:<platform>         Build and sync for specific platform', 'green');
  log('  help                     Show this help message', 'green');
  log('');
  log('Platforms: android, ios', 'yellow');
  log('');
  log('Examples:', 'cyan');
  log('  node scripts/build_capacitor.js build', 'green');
  log('  node scripts/build_capacitor.js sync', 'green');
  log('  node scripts/build_capacitor.js open android', 'green');
  log('  node scripts/build_capacitor.js run ios', 'green');
  log('  node scripts/build_capacitor.js build:android', 'green');
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const platform = args[1];

  if (!command || command === 'help') {
    showHelp();
    return;
  }

  // Check prerequisites for all commands
  checkPrerequisites();

  switch (command) {
    case 'build':
      buildWeb();
      break;
      
    case 'sync':
      syncPlatforms();
      break;
      
    case 'add':
      addPlatforms();
      break;
      
    case 'open':
      if (!platform) {
        logError('Please specify a platform (android or ios)');
        log('Usage: node scripts/build_capacitor.js open <platform>', 'cyan');
        return;
      }
      openPlatform(platform);
      break;
      
    case 'run':
      if (!platform) {
        logError('Please specify a platform (android or ios)');
        log('Usage: node scripts/build_capacitor.js run <platform>', 'cyan');
        return;
      }
      runPlatform(platform);
      break;
      
    case 'build:android':
      buildForPlatform('android');
      break;
      
    case 'build:ios':
      buildForPlatform('ios');
      break;
      
    default:
      logError(`Unknown command: ${command}`);
      log('Run "node scripts/build_capacitor.js help" for available commands', 'cyan');
      process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('\nBuild process interrupted', 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\nBuild process terminated', 'yellow');
  process.exit(0);
});

// Run the main function
if (require.main === module) {
  main();
}

module.exports = {
  buildWeb,
  syncPlatforms,
  addPlatforms,
  openPlatform,
  runPlatform,
  buildForPlatform
}; 