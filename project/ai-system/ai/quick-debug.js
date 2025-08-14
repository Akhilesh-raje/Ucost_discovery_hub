/**
 * Quick Debug Script for AI System
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Quick Debug Session...\n');

// Check current directory structure
console.log('📁 Current Directory Structure:');
const items = fs.readdirSync('.');
items.forEach(item => {
  const stats = fs.statSync(item);
  if (stats.isDirectory()) {
    console.log(`  📁 ${item}/`);
  } else {
    console.log(`  📄 ${item}`);
  }
});

// Check src directory
console.log('\n📁 Src Directory:');
if (fs.existsSync('src')) {
  const srcItems = fs.readdirSync('src');
  srcItems.forEach(item => {
    const stats = fs.statSync(path.join('src', item));
    if (stats.isDirectory()) {
      console.log(`  📁 src/${item}/`);
    } else {
      console.log(`  📄 src/${item}`);
    }
  });
} else {
  console.log('  ❌ src directory not found');
}

// Check core files
console.log('\n🔧 Core Files:');
const coreFiles = [
  'src/core/types.ts',
  'src/core/utils.ts',
  'src/core/UC_AISystem.ts'
];

coreFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    console.log(`  ✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
  }
});

// Check analyzer files
console.log('\n🧠 Analyzer Files:');
const analyzerFiles = [
  'src/analyzers/UserProfileAnalyzer.ts',
  'src/analyzers/ExhibitMatchingEngine.ts',
  'src/analyzers/TourOptimizationEngine.ts',
  'src/analyzers/SmartRecommendationEngine.ts'
];

analyzerFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    console.log(`  ✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
  }
});

// Check data files
console.log('\n📊 Data Files:');
const dataFiles = [
  'src/data/exhibits.ts'
];

dataFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    console.log(`  ✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
  }
});

// Check package.json
console.log('\n📦 Package.json:');
if (fs.existsSync('package.json')) {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`  ✅ package.json found`);
    console.log(`  📋 Name: ${packageJson.name}`);
    console.log(`  📋 Version: ${packageJson.version}`);
    console.log(`  📋 Dependencies: ${Object.keys(packageJson.dependencies || {}).length}`);
    console.log(`  📋 Dev Dependencies: ${Object.keys(packageJson.devDependencies || {}).length}`);
  } catch (error) {
    console.log(`  ❌ Error reading package.json: ${error.message}`);
  }
} else {
  console.log('  ❌ package.json not found');
}

// Check tsconfig.json
console.log('\n⚙️ TypeScript Config:');
if (fs.existsSync('tsconfig.json')) {
  try {
    const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    console.log(`  ✅ tsconfig.json found`);
    console.log(`  📋 Target: ${tsConfig.compilerOptions?.target || 'Not set'}`);
    console.log(`  📋 OutDir: ${tsConfig.compilerOptions?.outDir || 'Not set'}`);
  } catch (error) {
    console.log(`  ❌ Error reading tsconfig.json: ${error.message}`);
  }
} else {
  console.log('  ❌ tsconfig.json not found');
}

// Try to compile
console.log('\n🔨 Testing Compilation:');
try {
  const { execSync } = require('child_process');
  const result = execSync('npx tsc --noEmit', { encoding: 'utf8' });
  console.log('  ✅ TypeScript compilation successful');
} catch (error) {
  console.log('  ❌ TypeScript compilation failed:');
  console.log(`     ${error.message}`);
}

console.log('\n🎯 Quick Debug Complete!'); 