#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting UCOST Mobile App Capacitor Build...\n');

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

function runCommand(command, description) {
  try {
    log(`📋 ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed successfully!`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    return false;
  }
}

function checkPrerequisites() {
  log('🔍 Checking prerequisites...', 'cyan');
  
  // Check if Flutter is installed
  try {
    execSync('flutter --version', { stdio: 'pipe' });
    log('✅ Flutter is installed', 'green');
  } catch (error) {
    log('❌ Flutter is not installed. Please install Flutter first.', 'red');
    return false;
  }
  
  // Check if Node.js is installed
  try {
    execSync('node --version', { stdio: 'pipe' });
    log('✅ Node.js is installed', 'green');
  } catch (error) {
    log('❌ Node.js is not installed. Please install Node.js first.', 'red');
    return false;
  }
  
  // Check if Capacitor CLI is installed
  try {
    execSync('npx cap --version', { stdio: 'pipe' });
    log('✅ Capacitor CLI is available', 'green');
  } catch (error) {
    log('⚠️ Capacitor CLI not found. Installing...', 'yellow');
    runCommand('npm install -g @capacitor/cli', 'Installing Capacitor CLI');
  }
  
  return true;
}

function buildFlutter() {
  log('🏗️ Building Flutter app...', 'cyan');
  
  // Clean previous builds
  if (!runCommand('flutter clean', 'Cleaning Flutter build')) {
    return false;
  }
  
  // Get dependencies
  if (!runCommand('flutter pub get', 'Getting Flutter dependencies')) {
    return false;
  }
  
  // Build for web (required for Capacitor)
  if (!runCommand('flutter build web', 'Building Flutter web app')) {
    return false;
  }
  
  return true;
}

function setupCapacitor() {
  log('⚡ Setting up Capacitor...', 'cyan');
  
  // Initialize Capacitor if not already done
  if (!fs.existsSync('capacitor.config.ts')) {
    log('📱 Initializing Capacitor project...', 'blue');
    runCommand('npx cap init "UCOST Mobile Admin" "com.ucost.mobileapp"', 'Initializing Capacitor');
  }
  
  // Add platforms
  if (!fs.existsSync('android')) {
    log('🤖 Adding Android platform...', 'blue');
    runCommand('npx cap add android', 'Adding Android platform');
  }
  
  if (!fs.existsSync('ios')) {
    log('🍎 Adding iOS platform...', 'blue');
    runCommand('npx cap add ios', 'Adding iOS platform');
  }
  
  return true;
}

function syncCapacitor() {
  log('🔄 Syncing Capacitor...', 'cyan');
  
  // Copy web assets to native platforms
  if (!runCommand('npx cap sync', 'Syncing Capacitor assets')) {
    return false;
  }
  
  return true;
}

function openPlatforms() {
  log('🚪 Opening platforms for development...', 'cyan');
  
  const platform = process.argv[2] || 'android';
  
  if (platform === 'android' || platform === 'both') {
    log('🤖 Opening Android Studio...', 'blue');
    runCommand('npx cap open android', 'Opening Android Studio');
  }
  
  if (platform === 'ios' || platform === 'both') {
    log('🍎 Opening Xcode...', 'blue');
    runCommand('npx cap open ios', 'Opening Xcode');
  }
  
  return true;
}

function runOnDevice() {
  log('📱 Running on device...', 'cyan');
  
  const platform = process.argv[2] || 'android';
  
  if (platform === 'android') {
    log('🤖 Running on Android device/emulator...', 'blue');
    runCommand('npx cap run android', 'Running Android app');
  } else if (platform === 'ios') {
    log('🍎 Running on iOS device/simulator...', 'blue');
    runCommand('npx cap run ios', 'Running iOS app');
  }
  
  return true;
}

function buildForProduction() {
  log('🏭 Building for production...', 'cyan');
  
  const platform = process.argv[2] || 'android';
  
  if (platform === 'android') {
    log('🤖 Building Android APK...', 'blue');
    runCommand('cd android && ./gradlew assembleRelease', 'Building Android APK');
  } else if (platform === 'ios') {
    log('🍎 Building iOS app...', 'blue');
    log('⚠️ iOS builds require Xcode and should be done manually', 'yellow');
  }
  
  return true;
}

function showHelp() {
  log('\n📚 UCOST Mobile App Capacitor Build Script', 'bright');
  log('Usage: node scripts/build_capacitor.js [command] [platform]', 'cyan');
  log('\nCommands:', 'bright');
  log('  build     - Build Flutter app and setup Capacitor', 'green');
  log('  sync      - Sync Capacitor assets', 'green');
  log('  open      - Open native platforms in IDEs', 'green');
  log('  run       - Run app on device/emulator', 'green');
  log('  release   - Build production APK', 'green');
  log('  help      - Show this help message', 'green');
  log('\nPlatforms:', 'bright');
  log('  android   - Android only', 'yellow');
  log('  ios       - iOS only', 'yellow');
  log('  both      - Both platforms', 'yellow');
  log('\nExamples:', 'bright');
  log('  node scripts/build_capacitor.js build', 'cyan');
  log('  node scripts/build_capacitor.js open android', 'cyan');
  log('  node scripts/build_capacitor.js run android', 'cyan');
  log('  node scripts/build_capacitor.js release android', 'cyan');
}

// Main execution
function main() {
  const command = process.argv[2] || 'build';
  const platform = process.argv[3] || 'android';
  
  log(`🎯 Command: ${command}`, 'bright');
  log(`🎮 Platform: ${platform}`, 'bright');
  log('');
  
  switch (command) {
    case 'build':
      if (!checkPrerequisites()) process.exit(1);
      if (!buildFlutter()) process.exit(1);
      if (!setupCapacitor()) process.exit(1);
      if (!syncCapacitor()) process.exit(1);
      log('\n🎉 Build completed successfully!', 'green');
      break;
      
    case 'sync':
      if (!syncCapacitor()) process.exit(1);
      log('\n🎉 Sync completed successfully!', 'green');
      break;
      
    case 'open':
      if (!openPlatforms()) process.exit(1);
      log('\n🎉 Platforms opened successfully!', 'green');
      break;
      
    case 'run':
      if (!runOnDevice()) process.exit(1);
      log('\n🎉 App launched successfully!', 'green');
      break;
      
    case 'release':
      if (!buildForProduction()) process.exit(1);
      log('\n🎉 Production build completed!', 'green');
      break;
      
    case 'help':
      showHelp();
      break;
      
    default:
      log(`❌ Unknown command: ${command}`, 'red');
      showHelp();
      process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  checkPrerequisites,
  buildFlutter,
  setupCapacitor,
  syncCapacitor,
  openPlatforms,
  runOnDevice,
  buildForProduction
}; 