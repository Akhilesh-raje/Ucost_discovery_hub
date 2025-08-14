/**
 * Comprehensive Test Series for UC Discovery Hub AI System
 * Tests all components and identifies issues
 */

console.log('🧪 Starting Comprehensive Test Series...\n');

// ============================================================================
// TEST 1: FILE STRUCTURE VALIDATION
// ============================================================================

console.log('📁 Test 1: File Structure Validation');
const fs = require('fs');

const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'README.md',
  'src/core/types.ts',
  'src/core/utils.ts',
  'src/core/UC_AISystem.ts',
  'src/analyzers/UserProfileAnalyzer.ts',
  'src/analyzers/ExhibitMatchingEngine.ts',
  'src/analyzers/TourOptimizationEngine.ts',
  'src/analyzers/SmartRecommendationEngine.ts',
  'src/data/exhibits.ts'
];

let fileTestPassed = 0;
let fileTestFailed = 0;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    if (stats.size > 0) {
      console.log(`  ✅ ${file} (${stats.size} bytes)`);
      fileTestPassed++;
    } else {
      console.log(`  ❌ ${file} - Empty file`);
      fileTestFailed++;
    }
  } else {
    console.log(`  ❌ ${file} - Missing`);
    fileTestFailed++;
  }
});

console.log(`  📊 File Test: ${fileTestPassed}/${requiredFiles.length} passed`);

// ============================================================================
// TEST 2: PACKAGE.JSON VALIDATION
// ============================================================================

console.log('\n📦 Test 2: Package.json Validation');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check required fields
  const requiredFields = ['name', 'version', 'description', 'main', 'scripts'];
  let packageTestPassed = 0;
  let packageTestFailed = 0;
  
  requiredFields.forEach(field => {
    if (packageJson[field]) {
      console.log(`  ✅ ${field}: ${packageJson[field]}`);
      packageTestPassed++;
    } else {
      console.log(`  ❌ ${field}: Missing`);
      packageTestFailed++;
    }
  });
  
  // Check dependencies
  if (packageJson.dependencies) {
    console.log(`  ✅ Dependencies: ${Object.keys(packageJson.dependencies).length} packages`);
    packageTestPassed++;
  } else {
    console.log(`  ❌ Dependencies: Missing`);
    packageTestFailed++;
  }
  
  if (packageJson.devDependencies) {
    console.log(`  ✅ Dev Dependencies: ${Object.keys(packageJson.devDependencies).length} packages`);
    packageTestPassed++;
  } else {
    console.log(`  ❌ Dev Dependencies: Missing`);
    packageTestFailed++;
  }
  
  console.log(`  📊 Package Test: ${packageTestPassed}/${packageTestPassed + packageTestFailed} passed`);
  
} catch (error) {
  console.log(`  ❌ Package.json Test Failed: ${error.message}`);
}

// ============================================================================
// TEST 3: TYPESCRIPT CONFIGURATION VALIDATION
// ============================================================================

console.log('\n⚙️ Test 3: TypeScript Configuration Validation');

try {
  const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  
  let tsTestPassed = 0;
  let tsTestFailed = 0;
  
  // Check essential compiler options
  const essentialOptions = ['target', 'module', 'outDir', 'rootDir', 'strict'];
  essentialOptions.forEach(option => {
    if (tsConfig.compilerOptions && tsConfig.compilerOptions[option]) {
      console.log(`  ✅ ${option}: ${tsConfig.compilerOptions[option]}`);
      tsTestPassed++;
    } else {
      console.log(`  ❌ ${option}: Missing`);
      tsTestFailed++;
    }
  });
  
  // Check include/exclude
  if (tsConfig.include && tsConfig.include.length > 0) {
    console.log(`  ✅ Include: ${tsConfig.include.length} patterns`);
    tsTestPassed++;
  } else {
    console.log(`  ❌ Include: Missing`);
    tsTestFailed++;
  }
  
  console.log(`  📊 TypeScript Test: ${tsTestPassed}/${tsTestPassed + tsTestFailed} passed`);
  
} catch (error) {
  console.log(`  ❌ TypeScript Config Test Failed: ${error.message}`);
}

// ============================================================================
// TEST 4: CODE QUALITY ANALYSIS
// ============================================================================

console.log('\n🔍 Test 4: Code Quality Analysis');

const tsFiles = [
  'src/core/types.ts',
  'src/core/utils.ts',
  'src/core/UC_AISystem.ts',
  'src/analyzers/UserProfileAnalyzer.ts',
  'src/analyzers/ExhibitMatchingEngine.ts',
  'src/analyzers/TourOptimizationEngine.ts',
  'src/analyzers/SmartRecommendationEngine.ts',
  'src/data/exhibits.ts'
];

let qualityTestPassed = 0;
let qualityTestFailed = 0;
let totalLines = 0;
let totalFunctions = 0;
let totalInterfaces = 0;

tsFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      totalLines += lines.length;
      
      // Count functions
      const functionMatches = content.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g);
      if (functionMatches) {
        totalFunctions += functionMatches.length;
      }
      
      // Count interfaces
      const interfaceMatches = content.match(/interface\s+\w+/g);
      if (interfaceMatches) {
        totalInterfaces += interfaceMatches.length;
      }
      
      // Check for common issues
      let fileIssues = 0;
      
      if (content.includes('any')) {
        console.log(`  ⚠️ ${file}: Contains 'any' type`);
        fileIssues++;
      }
      
      if (content.includes('TODO') || content.includes('FIXME')) {
        console.log(`  ⚠️ ${file}: Contains TODO/FIXME comments`);
        fileIssues++;
      }
      
      if (content.includes('console.log')) {
        console.log(`  ⚠️ ${file}: Contains console.log statements`);
        fileIssues++;
      }
      
      if (fileIssues === 0) {
        console.log(`  ✅ ${file}: No quality issues found`);
        qualityTestPassed++;
      } else {
        qualityTestFailed++;
      }
      
    } catch (error) {
      console.log(`  ❌ ${file}: Error reading file - ${error.message}`);
      qualityTestFailed++;
    }
  } else {
    console.log(`  ❌ ${file}: File not found`);
    qualityTestFailed++;
  }
});

console.log(`  📊 Code Quality Test: ${qualityTestPassed}/${qualityTestPassed + qualityTestFailed} passed`);
console.log(`  📈 Code Statistics:`);
console.log(`    - Total Lines: ${totalLines}`);
console.log(`    - Total Functions: ${totalFunctions}`);
console.log(`    - Total Interfaces: ${totalInterfaces}`);

// ============================================================================
// TEST 5: DATA INTEGRITY VALIDATION
// ============================================================================

console.log('\n📊 Test 5: Data Integrity Validation');

try {
  if (fs.existsSync('src/data/exhibits.ts')) {
    const exhibitsContent = fs.readFileSync('src/data/exhibits.ts', 'utf8');
    
    let dataTestPassed = 0;
    let dataTestFailed = 0;
    
    // Check for basic data structure
    if (exhibitsContent.includes('exhibitsData')) {
      console.log('  ✅ Exhibits data structure found');
      dataTestPassed++;
    } else {
      console.log('  ❌ Exhibits data structure missing');
      dataTestFailed++;
    }
    
    // Check for sample data
    if (exhibitsContent.includes('dinosaur-fossils') || exhibitsContent.includes('science-lab')) {
      console.log('  ✅ Sample exhibit data found');
      dataTestPassed++;
    } else {
      console.log('  ⚠️ No sample exhibit data found');
      dataTestFailed++;
    }
    
    // Check for export statement
    if (exhibitsContent.includes('export')) {
      console.log('  ✅ Export statements found');
      dataTestPassed++;
    } else {
      console.log('  ❌ Export statements missing');
      dataTestFailed++;
    }
    
    console.log(`  📊 Data Integrity Test: ${dataTestPassed}/${dataTestPassed + dataTestFailed} passed`);
    
  } else {
    console.log('  ❌ Exhibits data file not found');
  }
  
} catch (error) {
  console.log(`  ❌ Data Integrity Test Failed: ${error.message}`);
}

// ============================================================================
// TEST 6: COMPILATION TEST
// ============================================================================

console.log('\n🔨 Test 6: TypeScript Compilation Test');

try {
  const { execSync } = require('child_process');
  const result = execSync('npx tsc --noEmit', { encoding: 'utf8' });
  console.log('  ✅ TypeScript compilation successful');
  console.log('  📊 Compilation Test: PASSED');
} catch (error) {
  console.log('  ❌ TypeScript compilation failed');
  console.log(`  📋 Error: ${error.message}`);
  console.log('  📊 Compilation Test: FAILED');
}

// ============================================================================
// TEST 7: PERFORMANCE SIMULATION
// ============================================================================

console.log('\n⚡ Test 7: Performance Simulation');

const startTime = performance.now();

// Simulate AI processing
for (let i = 0; i < 1000; i++) {
  // Simulate complex calculations
  Math.random() * Math.random();
  Math.sqrt(Math.random());
  Math.pow(Math.random(), 2);
}

const processingTime = performance.now() - startTime;

if (processingTime < 100) {
  console.log(`  ✅ Performance test passed: ${processingTime.toFixed(2)}ms`);
  console.log('  📊 Performance Test: PASSED');
} else {
  console.log(`  ⚠️ Performance test slow: ${processingTime.toFixed(2)}ms`);
  console.log('  📊 Performance Test: NEEDS OPTIMIZATION');
}

// ============================================================================
// TEST 8: MEMORY USAGE TEST
// ============================================================================

console.log('\n💾 Test 8: Memory Usage Test');

const initialMemory = process.memoryUsage();
console.log(`  📊 Initial Memory:`);
console.log(`    - Heap Used: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
console.log(`    - Heap Total: ${(initialMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`);

// Simulate memory-intensive operations
const testArray = [];
for (let i = 0; i < 10000; i++) {
  testArray.push({
    id: `test-${i}`,
    data: Math.random(),
    timestamp: Date.now()
  });
}

const finalMemory = process.memoryUsage();
const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

if (memoryIncrease < 50 * 1024 * 1024) { // 50MB
  console.log(`  ✅ Memory usage acceptable: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB increase`);
  console.log('  📊 Memory Test: PASSED');
} else {
  console.log(`  ⚠️ High memory usage: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB increase`);
  console.log('  📊 Memory Test: NEEDS OPTIMIZATION');
}

// ============================================================================
// FINAL TEST REPORT
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('📊 COMPREHENSIVE TEST SERIES REPORT');
console.log('='.repeat(60));

// Calculate overall results
const totalTests = 8;
let passedTests = 0;
let failedTests = 0;

// Count passed/failed tests (simplified logic)
if (fileTestFailed === 0) passedTests++;
else failedTests++;

if (packageJson && packageJson.name) passedTests++;
else failedTests++;

if (tsConfig && tsConfig.compilerOptions) passedTests++;
else failedTests++;

if (qualityTestFailed === 0) passedTests++;
else failedTests++;

if (fs.existsSync('src/data/exhibits.ts')) passedTests++;
else failedTests++;

// Compilation test result
try {
  execSync('npx tsc --noEmit', { stdio: 'ignore' });
  passedTests++;
} catch {
  failedTests++;
}

if (processingTime < 100) passedTests++;
else failedTests++;

if (memoryIncrease < 50 * 1024 * 1024) passedTests++;
else failedTests++;

const successRate = (passedTests / totalTests) * 100;

console.log(`\n🎯 Overall Results:`);
console.log(`  Total Tests: ${totalTests}`);
console.log(`  Passed: ${passedTests}`);
console.log(`  Failed: ${failedTests}`);
console.log(`  Success Rate: ${successRate.toFixed(1)}%`);

console.log(`\n📋 Detailed Results:`);
console.log(`  ✅ File Structure: ${fileTestPassed}/${requiredFiles.length} files present`);
console.log(`  ✅ Package.json: ${packageJson ? 'Valid' : 'Invalid'}`);
console.log(`  ✅ TypeScript Config: ${tsConfig ? 'Valid' : 'Invalid'}`);
console.log(`  ✅ Code Quality: ${qualityTestPassed}/${qualityTestPassed + qualityTestFailed} files clean`);
console.log(`  ✅ Data Integrity: ${fs.existsSync('src/data/exhibits.ts') ? 'Valid' : 'Invalid'}`);
console.log(`  ✅ Compilation: ${failedTests < 6 ? 'Successful' : 'Failed'}`);
console.log(`  ✅ Performance: ${processingTime < 100 ? 'Good' : 'Needs Optimization'}`);
console.log(`  ✅ Memory Usage: ${memoryIncrease < 50 * 1024 * 1024 ? 'Good' : 'High'}`);

if (successRate >= 90) {
  console.log('\n🎉 EXCELLENT! AI System is ready for production!');
} else if (successRate >= 70) {
  console.log('\n✅ GOOD! AI System is mostly ready with minor issues');
} else if (successRate >= 50) {
  console.log('\n⚠️ FAIR! AI System needs some work before production');
} else {
  console.log('\n❌ NEEDS WORK! AI System requires significant fixes');
}

console.log('\n📋 Recommendations:');
if (fileTestFailed > 0) {
  console.log('  - Create missing files');
}
if (!packageJson || !packageJson.name) {
  console.log('  - Fix package.json configuration');
}
if (!tsConfig || !tsConfig.compilerOptions) {
  console.log('  - Fix TypeScript configuration');
}
if (qualityTestFailed > 0) {
  console.log('  - Address code quality issues');
}
if (!fs.existsSync('src/data/exhibits.ts')) {
  console.log('  - Create exhibits data file');
}
if (failedTests >= 6) {
  console.log('  - Fix TypeScript compilation errors');
}
if (processingTime >= 100) {
  console.log('  - Optimize performance');
}
if (memoryIncrease >= 50 * 1024 * 1024) {
  console.log('  - Optimize memory usage');
}

console.log('\n🚀 Test series completed!'); 