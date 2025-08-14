/**
 * UC Discovery Hub - AI System Debug Runner
 * Executes comprehensive debugging and testing
 */

import { DebugSession } from './src/debug/DebugSession';
import { TestSuite } from './src/tests/TestSuite';

async function main() {
  console.log('🚀 Starting UC Discovery Hub AI System Debug Session\n');

  try {
    // Run debug session
    console.log('='.repeat(60));
    console.log('🔍 DEBUG SESSION');
    console.log('='.repeat(60));
    
    const debugSession = new DebugSession();
    const debugReport = await debugSession.runDebugSession();

    // Run test suite
    console.log('='.repeat(60));
    console.log('🧪 TEST SUITE');
    console.log('='.repeat(60));
    
    const testSuite = new TestSuite();
    const testReport = await testSuite.runAllTests();

    // Generate final report
    console.log('='.repeat(60));
    console.log('📊 FINAL REPORT');
    console.log('='.repeat(60));

    console.log('\n🎯 System Status:');
    console.log(`  Debug Issues: ${debugReport.totalIssues}`);
    console.log(`  Test Success Rate: ${testReport.successRate.toFixed(1)}%`);
    
    const overallStatus = debugReport.criticalIssues === 0 && testReport.successRate >= 90;
    console.log(`  Overall Status: ${overallStatus ? '✅ PASSED' : '❌ FAILED'}`);

    if (overallStatus) {
      console.log('\n🎉 AI System is ready for production!');
    } else {
      console.log('\n⚠️ Issues found - please review and fix before deployment.');
    }

    // Summary
    console.log('\n📋 Summary:');
    console.log(`  - Critical Issues: ${debugReport.criticalIssues}`);
    console.log(`  - Errors: ${debugReport.errors}`);
    console.log(`  - Warnings: ${debugReport.warnings}`);
    console.log(`  - Test Passed: ${testReport.passedTests}/${testReport.totalTests}`);
    console.log(`  - Recommendations: ${debugReport.recommendations}`);

  } catch (error) {
    console.error('❌ Debug session failed:', error);
    process.exit(1);
  }
}

// Run the debug session
main().catch(console.error); 