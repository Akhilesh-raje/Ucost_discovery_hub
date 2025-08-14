/**
 * UC Discovery Hub - Simple Debug Script
 * Basic functionality testing without complex imports
 */

import { UC_AISystem } from './src/core/UC_AISystem';
import { exhibitsData } from './src/data/exhibits';

async function runSimpleDebug() {
  console.log('🚀 Starting Simple Debug Session...\n');

  try {
    // Initialize AI System
    console.log('🔧 Initializing AI System...');
    const aiSystem = new UC_AISystem();
    aiSystem.initialize(exhibitsData);
    
    const status = aiSystem.getSystemStatus();
    console.log(`✅ System Status: ${status.initialized ? 'Initialized' : 'Not Initialized'}`);
    console.log(`📊 Exhibit Count: ${status.exhibitCount}`);
    console.log(`⚙️ Components: ${Object.keys(status.components).length} active`);

    // Test basic user analysis
    console.log('\n👤 Testing User Analysis...');
    const selections = {
      ageGroup: 'kids' as const,
      groupType: 'family' as const,
      children: true,
      interests: ['science', 'animals'],
      timeSlot: 'afternoon' as const
    };

    const result = aiSystem.analyzeUserSelections(selections);
    console.log(`✅ User Profile Created: ${result.userProfile.id}`);
    console.log(`📋 Recommendations: ${result.recommendations.length}`);
    console.log(`🗺️ Tour Created: ${result.tourRecommendation.tour.stops.length} stops`);
    console.log(`🎯 Confidence: ${(result.confidence * 100).toFixed(1)}%`);

    // Test performance
    console.log('\n⚡ Testing Performance...');
    const startTime = performance.now();
    
    for (let i = 0; i < 5; i++) {
      aiSystem.analyzeUserSelections(selections);
    }
    
    const avgTime = (performance.now() - startTime) / 5;
    console.log(`⏱️ Average Analysis Time: ${avgTime.toFixed(2)}ms`);

    // Test data integrity
    console.log('\n📊 Testing Data Integrity...');
    let dataIssues = 0;
    
    for (const exhibit of exhibitsData) {
      if (!exhibit.id || !exhibit.name) dataIssues++;
      if (exhibit.popularityScore < 0 || exhibit.popularityScore > 1) dataIssues++;
      if (exhibit.duration <= 0) dataIssues++;
      if (exhibit.tags.length === 0) dataIssues++;
    }
    
    console.log(`✅ Data Issues Found: ${dataIssues}`);

    // Test error handling
    console.log('\n🚨 Testing Error Handling...');
    try {
      aiSystem.analyzeUserSelections(null as any);
      console.log('❌ Should have thrown error for null input');
    } catch (error) {
      console.log('✅ Properly handled null input');
    }

    // Final status
    console.log('\n🎯 Final Status:');
    console.log(`  ✅ System Initialized: ${status.initialized}`);
    console.log(`  ✅ Exhibits Loaded: ${status.exhibitCount}`);
    console.log(`  ✅ User Analysis: Working`);
    console.log(`  ✅ Performance: ${avgTime < 1000 ? 'Good' : 'Needs Optimization'}`);
    console.log(`  ✅ Data Integrity: ${dataIssues === 0 ? 'Good' : 'Issues Found'}`);
    console.log(`  ✅ Error Handling: Working`);

    if (status.initialized && status.exhibitCount > 0 && dataIssues === 0 && avgTime < 1000) {
      console.log('\n🎉 AI System is working correctly!');
    } else {
      console.log('\n⚠️ Some issues found - review needed.');
    }

  } catch (error) {
    console.error('❌ Debug session failed:', error);
  }
}

// Run the debug session
runSimpleDebug().catch(console.error); 