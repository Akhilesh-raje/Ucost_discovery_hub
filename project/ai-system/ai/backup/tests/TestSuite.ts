/**
 * UC Discovery Hub - AI System Test Suite
 * Comprehensive testing for all AI components
 */

import { UC_AISystem } from '../core/UC_AISystem';
import { UserProfileAnalyzer } from '../analyzers/UserProfileAnalyzer';
import { ExhibitMatchingEngine } from '../analyzers/ExhibitMatchingEngine';
import { TourOptimizationEngine } from '../analyzers/TourOptimizationEngine';
import { SmartRecommendationEngine } from '../analyzers/SmartRecommendationEngine';
import { exhibitsData } from '../data/exhibits';

// ============================================================================
// TEST SUITE CLASS
// ============================================================================

export class TestSuite {
  private aiSystem: UC_AISystem;
  private testResults: TestResult[] = [];

  constructor() {
    this.aiSystem = new UC_AISystem();
    this.aiSystem.initialize(exhibitsData);
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<TestReport> {
    console.log('🧪 Starting AI System Test Suite...\n');

    // Core System Tests
    await this.testCoreSystem();
    await this.testUserProfileAnalyzer();
    await this.testExhibitMatchingEngine();
    await this.testTourOptimizationEngine();
    await this.testSmartRecommendationEngine();
    await this.testDataIntegrity();
    await this.testPerformance();
    await this.testErrorHandling();

    return this.generateTestReport();
  }

  /**
   * Test core AI system functionality
   */
  private async testCoreSystem(): Promise<void> {
    console.log('🔧 Testing Core AI System...');

    try {
      // Test system initialization
      const status = this.aiSystem.getSystemStatus();
      this.assertTest('System Initialization', status.initialized === true);
      this.assertTest('Exhibit Count', status.exhibitCount > 0);

      // Test user selections analysis
      const selections = {
        ageGroup: 'kids' as const,
        groupType: 'family' as const,
        children: true,
        interests: ['science', 'animals'],
        timeSlot: 'afternoon' as const
      };

      const result = this.aiSystem.analyzeUserSelections(selections);
      this.assertTest('User Analysis', result.userProfile !== undefined);
      this.assertTest('Recommendations Generated', result.recommendations.length > 0);
      this.assertTest('Tour Created', result.tourRecommendation !== undefined);
      this.assertTest('Confidence Score', result.confidence >= 0 && result.confidence <= 1);

      console.log('✅ Core System Tests Passed\n');
    } catch (error) {
      this.assertTest('Core System Error', false, error.message);
    }
  }

  /**
   * Test user profile analyzer
   */
  private async testUserProfileAnalyzer(): Promise<void> {
    console.log('👤 Testing User Profile Analyzer...');

    try {
      const analyzer = new UserProfileAnalyzer();

      // Test profile creation
      const selections = {
        ageGroup: 'teens' as const,
        groupType: 'individual' as const,
        interests: ['technology', 'art'],
        timeSlot: 'morning' as const,
        energyLevel: 'high' as const,
        crowdTolerance: 'medium' as const
      };

      const analysis = analyzer.analyzeUserSelections(selections);
      this.assertTest('Profile Creation', analysis.userProfile !== undefined);
      this.assertTest('Profile ID', analysis.userProfile.id.length > 0);
      this.assertTest('Age Group', analysis.userProfile.ageGroup === 'teens');
      this.assertTest('Interests', analysis.userProfile.interests.length > 0);
      this.assertTest('Confidence Score', analysis.confidence >= 0 && analysis.confidence <= 1);
      this.assertTest('Reasoning', analysis.reasoning.length > 0);

      // Test profile update
      const interaction = {
        exhibitId: 'dinosaur-fossils',
        timestamp: new Date(),
        duration: 120,
        interactionType: 'interacting' as const,
        satisfaction: 9,
        engagement: 8,
        notes: 'Great experience!'
      };

      const updatedProfile = analyzer.updateProfileWithInteraction(analysis.userProfile, interaction);
      this.assertTest('Profile Update', updatedProfile.interactionHistory.length > 0);
      this.assertTest('Last Updated', updatedProfile.lastUpdated > analysis.userProfile.lastUpdated);

      console.log('✅ User Profile Analyzer Tests Passed\n');
    } catch (error) {
      this.assertTest('User Profile Analyzer Error', false, error.message);
    }
  }

  /**
   * Test exhibit matching engine
   */
  private async testExhibitMatchingEngine(): Promise<void> {
    console.log('🎯 Testing Exhibit Matching Engine...');

    try {
      const engine = new ExhibitMatchingEngine();

      // Create test user profile
      const userProfile = {
        id: 'test-user',
        ageGroup: 'adults' as const,
        groupType: 'individual' as const,
        children: false,
        interests: ['science', 'technology'],
        preferredCategories: ['STEM'],
        timeSlot: 'afternoon' as const,
        interactionHistory: [],
        preferences: {
          preferredPace: 'moderate' as const,
          crowdTolerance: 'medium' as const,
          energyLevel: 'medium' as const,
          accessibilityNeeds: [],
          preferredDuration: 120,
          maxWalkingDistance: 500
        },
        learningStyle: 'interactive' as const,
        lastUpdated: new Date(),
        confidenceScore: 0.8,
        adaptationRate: 0.05
      };

      // Test exhibit matching
      const matchingResult = engine.matchExhibitsToUser(userProfile, exhibitsData);
      this.assertTest('Matching Result', matchingResult.recommendations.length > 0);
      this.assertTest('Total Exhibits', matchingResult.totalExhibits > 0);
      this.assertTest('Average Relevance', matchingResult.averageRelevance >= 0 && matchingResult.averageRelevance <= 1);
      this.assertTest('Confidence', matchingResult.confidence >= 0 && matchingResult.confidence <= 1);
      this.assertTest('Reasoning', matchingResult.reasoning.length > 0);

      // Test individual recommendation structure
      const firstRecommendation = matchingResult.recommendations[0];
      this.assertTest('Recommendation Structure', firstRecommendation.exhibit !== undefined);
      this.assertTest('Relevance Score', firstRecommendation.relevanceScore >= 0 && firstRecommendation.relevanceScore <= 1);
      this.assertTest('Match Reasons', firstRecommendation.matchReasons.length > 0);
      this.assertTest('Confidence', firstRecommendation.confidence >= 0 && firstRecommendation.confidence <= 1);

      console.log('✅ Exhibit Matching Engine Tests Passed\n');
    } catch (error) {
      this.assertTest('Exhibit Matching Engine Error', false, error.message);
    }
  }

  /**
   * Test tour optimization engine
   */
  private async testTourOptimizationEngine(): Promise<void> {
    console.log('🗺️ Testing Tour Optimization Engine...');

    try {
      const engine = new TourOptimizationEngine();

      // Create test user profile
      const userProfile = {
        id: 'test-user',
        ageGroup: 'family' as const,
        groupType: 'family' as const,
        children: true,
        interests: ['science', 'animals'],
        preferredCategories: ['science', 'nature'],
        timeSlot: 'afternoon' as const,
        interactionHistory: [],
        preferences: {
          preferredPace: 'slow' as const,
          crowdTolerance: 'low' as const,
          energyLevel: 'medium' as const,
          accessibilityNeeds: [],
          preferredDuration: 180,
          maxWalkingDistance: 300
        },
        learningStyle: 'hands-on' as const,
        lastUpdated: new Date(),
        confidenceScore: 0.7,
        adaptationRate: 0.05
      };

      // Test tour optimization
      const selectedExhibits = exhibitsData.slice(0, 5); // First 5 exhibits
      const tourResult = engine.createOptimalTour(userProfile, selectedExhibits, 180);

      this.assertTest('Tour Creation', tourResult.tour !== undefined);
      this.assertTest('Tour ID', tourResult.tour.id.length > 0);
      this.assertTest('Tour Stops', tourResult.tour.stops.length > 0);
      this.assertTest('Total Duration', tourResult.tour.totalDuration > 0);
      this.assertTest('Total Distance', tourResult.tour.totalDistance >= 0);
      this.assertTest('Efficiency', tourResult.efficiency >= 0 && tourResult.efficiency <= 1);
      this.assertTest('Alternatives', tourResult.alternatives.length >= 0);
      this.assertTest('Reasoning', tourResult.reasoning.length > 0);
      this.assertTest('Optimization Time', tourResult.optimizationTime > 0);

      // Test tour stop structure
      const firstStop = tourResult.tour.stops[0];
      this.assertTest('Stop Structure', firstStop.exhibitId !== undefined);
      this.assertTest('Stop Order', firstStop.order > 0);
      this.assertTest('Estimated Duration', firstStop.estimatedDuration > 0);
      this.assertTest('Walking Distance', firstStop.walkingDistance >= 0);

      console.log('✅ Tour Optimization Engine Tests Passed\n');
    } catch (error) {
      this.assertTest('Tour Optimization Engine Error', false, error.message);
    }
  }

  /**
   * Test smart recommendation engine
   */
  private async testSmartRecommendationEngine(): Promise<void> {
    console.log('🧠 Testing Smart Recommendation Engine...');

    try {
      const engine = new SmartRecommendationEngine();

      // Create test user profile
      const userProfile = {
        id: 'test-user',
        ageGroup: 'adults' as const,
        groupType: 'individual' as const,
        children: false,
        interests: ['technology', 'art'],
        preferredCategories: ['technology', 'arts'],
        timeSlot: 'morning' as const,
        interactionHistory: [],
        preferences: {
          preferredPace: 'fast' as const,
          crowdTolerance: 'high' as const,
          energyLevel: 'high' as const,
          accessibilityNeeds: [],
          preferredDuration: 90,
          maxWalkingDistance: 600
        },
        learningStyle: 'interactive' as const,
        lastUpdated: new Date(),
        confidenceScore: 0.8,
        adaptationRate: 0.05
      };

      // Create test context
      const context = {
        remainingTime: 90,
        energyLevel: 'high' as const,
        currentExhibit: null,
        recentInteractions: [],
        weatherConditions: null,
        specialEvents: []
      };

      // Create test current recommendations
      const currentRecommendations = exhibitsData.slice(0, 3).map(exhibit => ({
        exhibit,
        relevanceScore: 0.8,
        matchReasons: ['Matches your interests'],
        confidence: 0.7
      }));

      // Test adaptive recommendations
      const adaptiveResult = engine.generateAdaptiveRecommendations(
        userProfile,
        exhibitsData,
        context,
        currentRecommendations
      );

      this.assertTest('Adaptive Result', adaptiveResult !== undefined);
      this.assertTest('Current Recommendations', adaptiveResult.currentRecommendations.length > 0);
      this.assertTest('Alternatives', adaptiveResult.alternatives.length >= 0);
      this.assertTest('Reasoning', adaptiveResult.reasoning.length > 0);
      this.assertTest('Confidence Score', adaptiveResult.confidenceScore >= 0 && adaptiveResult.confidenceScore <= 1);
      this.assertTest('Context', adaptiveResult.context !== undefined);

      console.log('✅ Smart Recommendation Engine Tests Passed\n');
    } catch (error) {
      this.assertTest('Smart Recommendation Engine Error', false, error.message);
    }
  }

  /**
   * Test data integrity
   */
  private async testDataIntegrity(): Promise<void> {
    console.log('📊 Testing Data Integrity...');

    try {
      // Test exhibit data
      this.assertTest('Exhibit Data Exists', exhibitsData.length > 0);
      
      for (const exhibit of exhibitsData) {
        this.assertTest(`Exhibit ${exhibit.id} - ID`, exhibit.id.length > 0);
        this.assertTest(`Exhibit ${exhibit.id} - Name`, exhibit.name.length > 0);
        this.assertTest(`Exhibit ${exhibit.id} - Category`, exhibit.category.length > 0);
        this.assertTest(`Exhibit ${exhibit.id} - Popularity Score`, exhibit.popularityScore >= 0 && exhibit.popularityScore <= 1);
        this.assertTest(`Exhibit ${exhibit.id} - Educational Value`, exhibit.educationalValue >= 0 && exhibit.educationalValue <= 1);
        this.assertTest(`Exhibit ${exhibit.id} - Entertainment Value`, exhibit.entertainmentValue >= 0 && exhibit.entertainmentValue <= 1);
        this.assertTest(`Exhibit ${exhibit.id} - Accessibility Score`, exhibit.accessibilityScore >= 0 && exhibit.accessibilityScore <= 1);
        this.assertTest(`Exhibit ${exhibit.id} - Duration`, exhibit.duration > 0);
        this.assertTest(`Exhibit ${exhibit.id} - Capacity`, exhibit.capacity > 0);
        this.assertTest(`Exhibit ${exhibit.id} - Tags`, exhibit.tags.length > 0);
        this.assertTest(`Exhibit ${exhibit.id} - Themes`, exhibit.themes.length > 0);
        this.assertTest(`Exhibit ${exhibit.id} - Features`, exhibit.features.length > 0);
        this.assertTest(`Exhibit ${exhibit.id} - Age Range`, exhibit.ageRange.min <= exhibit.ageRange.max);
        this.assertTest(`Exhibit ${exhibit.id} - Location`, exhibit.location.coordinates.x >= 0 && exhibit.location.coordinates.y >= 0);
      }

      // Test data consistency
      const categories = new Set(exhibitsData.map(e => e.category));
      this.assertTest('Unique Categories', categories.size > 0);

      const interactionTypes = new Set(exhibitsData.map(e => e.interactionType));
      this.assertTest('Valid Interaction Types', interactionTypes.size > 0);

      const difficultyLevels = new Set(exhibitsData.map(e => e.difficultyLevel));
      this.assertTest('Valid Difficulty Levels', difficultyLevels.size > 0);

      console.log('✅ Data Integrity Tests Passed\n');
    } catch (error) {
      this.assertTest('Data Integrity Error', false, error.message);
    }
  }

  /**
   * Test performance
   */
  private async testPerformance(): Promise<void> {
    console.log('⚡ Testing Performance...');

    try {
      const startTime = performance.now();

      // Test system initialization performance
      const initStart = performance.now();
      const aiSystem = new UC_AISystem();
      aiSystem.initialize(exhibitsData);
      const initTime = performance.now() - initStart;
      this.assertTest('Initialization Time < 100ms', initTime < 100);

      // Test user analysis performance
      const analysisStart = performance.now();
      const selections = {
        ageGroup: 'kids' as const,
        groupType: 'family' as const,
        interests: ['science', 'animals'],
        timeSlot: 'afternoon' as const
      };
      const result = aiSystem.analyzeUserSelections(selections);
      const analysisTime = performance.now() - analysisStart;
      this.assertTest('Analysis Time < 200ms', analysisTime < 200);

      // Test recommendation generation performance
      const recStart = performance.now();
      const recommendations = aiSystem.getPersonalizedRecommendations(result.userProfile);
      const recTime = performance.now() - recStart;
      this.assertTest('Recommendation Time < 50ms', recTime < 50);

      // Test tour optimization performance
      const tourStart = performance.now();
      const tour = aiSystem.createOptimalTour(result.userProfile, exhibitsData.slice(0, 5), 120);
      const tourTime = performance.now() - tourStart;
      this.assertTest('Tour Optimization Time < 500ms', tourTime < 500);

      const totalTime = performance.now() - startTime;
      this.assertTest('Total Performance Test < 1s', totalTime < 1000);

      console.log(`⏱️ Performance Results:
        - Initialization: ${initTime.toFixed(2)}ms
        - Analysis: ${analysisTime.toFixed(2)}ms
        - Recommendations: ${recTime.toFixed(2)}ms
        - Tour Optimization: ${tourTime.toFixed(2)}ms
        - Total: ${totalTime.toFixed(2)}ms`);

      console.log('✅ Performance Tests Passed\n');
    } catch (error) {
      this.assertTest('Performance Error', false, error.message);
    }
  }

  /**
   * Test error handling
   */
  private async testErrorHandling(): Promise<void> {
    console.log('🚨 Testing Error Handling...');

    try {
      const aiSystem = new UC_AISystem();

      // Test invalid user selections
      try {
        const invalidSelections = {
          ageGroup: 'invalid' as any,
          groupType: 'family' as const,
          interests: [],
          timeSlot: 'afternoon' as const
        };
        aiSystem.analyzeUserSelections(invalidSelections);
        this.assertTest('Invalid Selections Error', false, 'Should have thrown error');
      } catch (error) {
        this.assertTest('Invalid Selections Caught', true);
      }

      // Test empty exhibits
      try {
        aiSystem.initialize([]);
        const result = aiSystem.analyzeUserSelections({
          ageGroup: 'kids' as const,
          groupType: 'family' as const,
          interests: ['science'],
          timeSlot: 'afternoon' as const
        });
        this.assertTest('Empty Exhibits Handling', result.recommendations.length === 0);
      } catch (error) {
        this.assertTest('Empty Exhibits Error Caught', true);
      }

      // Test null/undefined inputs
      try {
        aiSystem.analyzeUserSelections(null as any);
        this.assertTest('Null Input Error', false, 'Should have thrown error');
      } catch (error) {
        this.assertTest('Null Input Caught', true);
      }

      console.log('✅ Error Handling Tests Passed\n');
    } catch (error) {
      this.assertTest('Error Handling Test Error', false, error.message);
    }
  }

  /**
   * Assert test condition
   */
  private assertTest(testName: string, condition: boolean, errorMessage?: string): void {
    const result: TestResult = {
      testName,
      passed: condition,
      errorMessage: condition ? undefined : errorMessage,
      timestamp: new Date()
    };

    this.testResults.push(result);

    if (condition) {
      console.log(`  ✅ ${testName}`);
    } else {
      console.log(`  ❌ ${testName}${errorMessage ? `: ${errorMessage}` : ''}`);
    }
  }

  /**
   * Generate test report
   */
  private generateTestReport(): TestReport {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = (passedTests / totalTests) * 100;

    const report: TestReport = {
      totalTests,
      passedTests,
      failedTests,
      successRate,
      results: this.testResults,
      timestamp: new Date()
    };

    console.log('\n📊 Test Report:');
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${passedTests}`);
    console.log(`  Failed: ${failedTests}`);
    console.log(`  Success Rate: ${successRate.toFixed(1)}%`);

    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => console.log(`  - ${r.testName}: ${r.errorMessage}`));
    }

    return report;
  }
}

// ============================================================================
// TEST TYPES
// ============================================================================

export interface TestResult {
  testName: string;
  passed: boolean;
  errorMessage?: string;
  timestamp: Date;
}

export interface TestReport {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  successRate: number;
  results: TestResult[];
  timestamp: Date;
}

// ============================================================================
// EXPORT
// ============================================================================

export { TestSuite }; 