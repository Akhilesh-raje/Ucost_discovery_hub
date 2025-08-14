/**
 * Comprehensive Debug Session for UC Discovery Hub AI System
 * Checks for missing components, excess code, and potential issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Comprehensive Debug Session...\n');

// ============================================================================
// FILE STRUCTURE ANALYSIS
// ============================================================================

console.log('📁 Analyzing File Structure...');

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

const missingFiles = [];
const existingFiles = [];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    existingFiles.push(file);
    console.log(`  ✅ ${file}`);
  } else {
    missingFiles.push(file);
    console.log(`  ❌ ${file} - MISSING`);
  }
});

console.log(`\n📊 File Analysis: ${existingFiles.length}/${requiredFiles.length} files present`);

// ============================================================================
// PACKAGE.JSON ANALYSIS
// ============================================================================

console.log('\n📦 Analyzing package.json...');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check required dependencies
  const requiredDeps = ['lodash', 'uuid', 'moment', 'mathjs', 'seedrandom'];
  const requiredDevDeps = ['typescript', 'jest', '@types/node', '@types/lodash', '@types/uuid'];
  
  const missingDeps = [];
  const missingDevDeps = [];
  
  requiredDeps.forEach(dep => {
    if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
      missingDeps.push(dep);
    }
  });
  
  requiredDevDeps.forEach(dep => {
    if (!packageJson.devDependencies || !packageJson.devDependencies[dep]) {
      missingDevDeps.push(dep);
    }
  });
  
  if (missingDeps.length === 0) {
    console.log('  ✅ All required dependencies present');
  } else {
    console.log(`  ❌ Missing dependencies: ${missingDeps.join(', ')}`);
  }
  
  if (missingDevDeps.length === 0) {
    console.log('  ✅ All required dev dependencies present');
  } else {
    console.log(`  ❌ Missing dev dependencies: ${missingDevDeps.join(', ')}`);
  }
  
  // Check scripts
  const requiredScripts = ['build', 'dev', 'test', 'lint'];
  const missingScripts = [];
  
  requiredScripts.forEach(script => {
    if (!packageJson.scripts || !packageJson.scripts[script]) {
      missingScripts.push(script);
    }
  });
  
  if (missingScripts.length === 0) {
    console.log('  ✅ All required scripts present');
  } else {
    console.log(`  ❌ Missing scripts: ${missingScripts.join(', ')}`);
  }
  
} catch (error) {
  console.log(`  ❌ Error reading package.json: ${error.message}`);
}

// ============================================================================
// TYPESCRIPT CONFIGURATION ANALYSIS
// ============================================================================

console.log('\n⚙️ Analyzing TypeScript Configuration...');

try {
  const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  
  // Check essential compiler options
  const essentialOptions = ['target', 'module', 'outDir', 'rootDir', 'strict'];
  const missingOptions = [];
  
  essentialOptions.forEach(option => {
    if (!tsConfig.compilerOptions || !tsConfig.compilerOptions[option]) {
      missingOptions.push(option);
    }
  });
  
  if (missingOptions.length === 0) {
    console.log('  ✅ All essential compiler options present');
  } else {
    console.log(`  ❌ Missing compiler options: ${missingOptions.join(', ')}`);
  }
  
  // Check include/exclude
  if (tsConfig.include && tsConfig.include.length > 0) {
    console.log('  ✅ Include paths configured');
  } else {
    console.log('  ❌ No include paths configured');
  }
  
} catch (error) {
  console.log(`  ❌ Error reading tsconfig.json: ${error.message}`);
}

// ============================================================================
// CODE QUALITY ANALYSIS
// ============================================================================

console.log('\n🔍 Analyzing Code Quality...');

// Check for common issues in TypeScript files
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

let totalLines = 0;
let totalFunctions = 0;
let totalInterfaces = 0;
let issuesFound = 0;

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
      if (content.includes('any')) {
        console.log(`  ⚠️ ${file}: Contains 'any' type`);
        issuesFound++;
      }
      
      if (content.includes('TODO') || content.includes('FIXME')) {
        console.log(`  ⚠️ ${file}: Contains TODO/FIXME comments`);
        issuesFound++;
      }
      
      if (content.includes('console.log')) {
        console.log(`  ⚠️ ${file}: Contains console.log statements`);
        issuesFound++;
      }
      
    } catch (error) {
      console.log(`  ❌ Error reading ${file}: ${error.message}`);
      issuesFound++;
    }
  }
});

console.log(`  📊 Code Statistics:`);
console.log(`    - Total Lines: ${totalLines}`);
console.log(`    - Total Functions: ${totalFunctions}`);
console.log(`    - Total Interfaces: ${totalInterfaces}`);
console.log(`    - Issues Found: ${issuesFound}`);

// ============================================================================
// DATA INTEGRITY CHECK
// ============================================================================

console.log('\n📊 Checking Data Integrity...');

try {
  // Check if exhibits data file exists and has content
  if (fs.existsSync('src/data/exhibits.ts')) {
    const exhibitsContent = fs.readFileSync('src/data/exhibits.ts', 'utf8');
    
    // Check for basic data structure
    if (exhibitsContent.includes('exhibitsData')) {
      console.log('  ✅ Exhibits data structure found');
    } else {
      console.log('  ❌ Exhibits data structure missing');
      issuesFound++;
    }
    
    // Check for sample data
    if (exhibitsContent.includes('dinosaur-fossils') || exhibitsContent.includes('science-lab')) {
      console.log('  ✅ Sample exhibit data found');
    } else {
      console.log('  ⚠️ No sample exhibit data found');
    }
    
  } else {
    console.log('  ❌ Exhibits data file missing');
    issuesFound++;
  }
  
} catch (error) {
  console.log(`  ❌ Error checking data integrity: ${error.message}`);
  issuesFound++;
}

// ============================================================================
// MISSING COMPONENTS ANALYSIS
// ============================================================================

console.log('\n🔍 Analyzing Missing Components...');

const missingComponents = [];

// Check for test files
if (!fs.existsSync('src/tests/')) {
  missingComponents.push('Test directory');
}

if (!fs.existsSync('src/debug/')) {
  missingComponents.push('Debug directory');
}

// Check for documentation
if (!fs.existsSync('docs/')) {
  missingComponents.push('Documentation directory');
}

// Check for configuration files
if (!fs.existsSync('.env.example')) {
  missingComponents.push('.env.example');
}

if (!fs.existsSync('jest.config.js')) {
  missingComponents.push('jest.config.js');
}

if (!fs.existsSync('eslint.config.js')) {
  missingComponents.push('eslint.config.js');
}

if (missingComponents.length === 0) {
  console.log('  ✅ All essential components present');
} else {
  console.log(`  ⚠️ Missing components: ${missingComponents.join(', ')}`);
}

// ============================================================================
// EXCESS CODE ANALYSIS
// ============================================================================

console.log('\n🧹 Analyzing Excess Code...');

let excessCodeFound = 0;

tsFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for unused imports (basic check)
      const importLines = content.match(/import.*from.*['"]/g);
      if (importLines) {
        importLines.forEach(importLine => {
          const module = importLine.match(/from\s+['"]([^'"]+)['"]/);
          if (module && !content.includes(module[1].split('/').pop())) {
            console.log(`  ⚠️ ${file}: Potentially unused import: ${module[1]}`);
            excessCodeFound++;
          }
        });
      }
      
      // Check for duplicate code patterns
      const functions = content.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g);
      if (functions) {
        const functionNames = functions.map(f => f.replace(/function\s+|const\s+|\s*=.*/, ''));
        const duplicates = functionNames.filter((name, index) => functionNames.indexOf(name) !== index);
        if (duplicates.length > 0) {
          console.log(`  ⚠️ ${file}: Potential duplicate functions: ${duplicates.join(', ')}`);
          excessCodeFound++;
        }
      }
      
    } catch (error) {
      console.log(`  ❌ Error analyzing ${file}: ${error.message}`);
    }
  }
});

if (excessCodeFound === 0) {
  console.log('  ✅ No obvious excess code found');
} else {
  console.log(`  ⚠️ Excess code issues found: ${excessCodeFound}`);
}

// ============================================================================
// PERFORMANCE ANALYSIS
// ============================================================================

console.log('\n⚡ Analyzing Performance Considerations...');

let performanceIssues = 0;

tsFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for potential performance issues
      if (content.includes('for (let i = 0; i < 10000; i++)')) {
        console.log(`  ⚠️ ${file}: Large loop detected`);
        performanceIssues++;
      }
      
      if (content.includes('JSON.parse(') && content.includes('JSON.stringify(')) {
        console.log(`  ⚠️ ${file}: JSON parsing in loops detected`);
        performanceIssues++;
      }
      
      if (content.includes('setTimeout(') || content.includes('setInterval(')) {
        console.log(`  ⚠️ ${file}: Timer functions detected`);
        performanceIssues++;
      }
      
    } catch (error) {
      console.log(`  ❌ Error analyzing ${file}: ${error.message}`);
    }
  }
});

if (performanceIssues === 0) {
  console.log('  ✅ No obvious performance issues found');
} else {
  console.log(`  ⚠️ Performance considerations: ${performanceIssues}`);
}

// ============================================================================
// SECURITY ANALYSIS
// ============================================================================

console.log('\n🔒 Analyzing Security Considerations...');

let securityIssues = 0;

tsFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for potential security issues
      if (content.includes('eval(')) {
        console.log(`  🚨 ${file}: eval() function detected - SECURITY RISK`);
        securityIssues++;
      }
      
      if (content.includes('innerHTML')) {
        console.log(`  ⚠️ ${file}: innerHTML usage detected`);
        securityIssues++;
      }
      
      if (content.includes('localStorage') || content.includes('sessionStorage')) {
        console.log(`  ⚠️ ${file}: Browser storage usage detected`);
        securityIssues++;
      }
      
    } catch (error) {
      console.log(`  ❌ Error analyzing ${file}: ${error.message}`);
    }
  }
});

if (securityIssues === 0) {
  console.log('  ✅ No obvious security issues found');
} else {
  console.log(`  ⚠️ Security considerations: ${securityIssues}`);
}

// ============================================================================
// FINAL REPORT
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('📊 COMPREHENSIVE DEBUG REPORT');
console.log('='.repeat(60));

const totalIssues = missingFiles.length + missingComponents.length + issuesFound + excessCodeFound + performanceIssues + securityIssues;

console.log(`\n🎯 Overall Status:`);
console.log(`  Files Present: ${existingFiles.length}/${requiredFiles.length}`);
console.log(`  Missing Files: ${missingFiles.length}`);
console.log(`  Missing Components: ${missingComponents.length}`);
console.log(`  Code Issues: ${issuesFound}`);
console.log(`  Excess Code: ${excessCodeFound}`);
console.log(`  Performance Issues: ${performanceIssues}`);
console.log(`  Security Issues: ${securityIssues}`);
console.log(`  Total Issues: ${totalIssues}`);

if (totalIssues === 0) {
  console.log('\n🎉 EXCELLENT! No issues found - AI System is ready!');
} else if (totalIssues <= 5) {
  console.log('\n✅ GOOD! Minor issues found - AI System is mostly ready');
} else if (totalIssues <= 10) {
  console.log('\n⚠️ FAIR! Some issues found - Review recommended');
} else {
  console.log('\n❌ NEEDS WORK! Multiple issues found - Significant review needed');
}

console.log('\n📋 Recommendations:');
if (missingFiles.length > 0) {
  console.log(`  - Create missing files: ${missingFiles.join(', ')}`);
}
if (missingComponents.length > 0) {
  console.log(`  - Add missing components: ${missingComponents.join(', ')}`);
}
if (issuesFound > 0) {
  console.log('  - Review code quality issues');
}
if (excessCodeFound > 0) {
  console.log('  - Clean up excess code');
}
if (performanceIssues > 0) {
  console.log('  - Optimize performance');
}
if (securityIssues > 0) {
  console.log('  - Address security concerns');
}

console.log('\n🚀 Debug session completed!'); 