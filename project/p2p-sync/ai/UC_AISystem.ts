/**
 * UC Discovery Hub - Main AI System
 * Integrates all AI components for complete intelligent museum experience
 */

import { UserProfileAnalyzer, UserSelections, UserProfile } from './UserProfileAnalyzer';
import { ExhibitMatchingEngine, ExhibitAI, ExhibitMatch } from './ExhibitMatchingEngine';
import { TourOptimizationEngine, TourRoute } from './TourOptimizationEngine';
import { SmartRecommendationEngine, RecommendationContext, AdaptiveRecommendation } from './SmartRecommendationEngine';

export interface UC_AISystem {
  // Core AI functionality
  analyzeUserSelections(selections: UserSelections): UserProfile;
  matchExhibitsToUser(userProfile: UserProfile, exhibits: ExhibitAI[]): ExhibitMatch[];
  createOptimalTour(userProfile: UserProfile, selectedExhibits: ExhibitAI[], timeConstraint: number): TourRoute;
  generateAdaptiveRecommendations(context: RecommendationContext, allExhibits: ExhibitAI[]): AdaptiveRecommendation;
  
  // Advanced features
  learnFromUserBehavior(userProfile: UserProfile, behavior: any): UserProfile;
  predictUserPreferences(userProfile: UserProfile): string[];
  optimizeForSpecialEvents(userProfile: UserProfile, events: string[]): UserProfile;
  
  // Utility functions
  getExhibitIntelligence(exhibit: ExhibitAI): any;
  calculateUserSatisfaction(userProfile: UserProfile, visitedExhibits: string[]): number;
  generatePersonalizedSummary(userProfile: UserProfile, tourRoute: TourRoute): string;
}

export class UC_AISystem implements UC_AISystem {
  
  /**
   * Analyze user selections and create intelligent profile
   */
  analyzeUserSelections(selections: UserSelections): UserProfile {
    return UserProfileAnalyzer.analyzeUserSelections(selections);
  }

  /**
   * Match exhibits to user profile with intelligent scoring
   */
  matchExhibitsToUser(userProfile: UserProfile, exhibits: ExhibitAI[]): ExhibitMatch[] {
    return ExhibitMatchingEngine.matchExhibitsToUser(userProfile, exhibits);
  }

  /**
   * Create optimal tour route
   */
  createOptimalTour(
    userProfile: UserProfile, 
    selectedExhibits: ExhibitAI[], 
    timeConstraint: number
  ): TourRoute {
    return TourOptimizationEngine.createOptimalTour({
      userProfile,
      selectedExhibits,
      timeConstraint,
      preferences: {
        includeRestStops: userProfile.ageGroup === 'seniors' || userProfile.ageGroup === 'kids',
        optimizeForCrowds: userProfile.preferences.preferredCrowdLevel === 'low',
        preferPopularExhibits: false,
        balanceCategories: true
      }
    });
  }

  /**
   * Generate adaptive recommendations
   */
  generateAdaptiveRecommendations(
    context: RecommendationContext, 
    allExhibits: ExhibitAI[]
  ): AdaptiveRecommendation {
    return SmartRecommendationEngine.generateAdaptiveRecommendations(context, allExhibits);
  }

  /**
   * Learn from user behavior and update profile
   */
  learnFromUserBehavior(userProfile: UserProfile, behavior: any): UserProfile {
    // Update profile based on behavior patterns
    const updatedProfile = { ...userProfile };
    
    // Update energy level based on behavior
    if (behavior.energyLevel) {
      updatedProfile.energyLevel = behavior.energyLevel;
    }
    
    // Update preferences based on satisfaction
    if (behavior.satisfaction !== undefined) {
      if (behavior.satisfaction < 5) {
        updatedProfile.preferences.preferredCrowdLevel = 'low';
        updatedProfile.preferredPace = 'slow';
      } else if (behavior.satisfaction > 8) {
        updatedProfile.preferences.preferredCrowdLevel = 'medium';
        updatedProfile.preferredPace = 'moderate';
      }
    }
    
    // Update learning style based on interaction patterns
    if (behavior.interactionType) {
      const interactionStyleMap: { [key: string]: string } = {
        'interacting': 'hands-on',
        'viewing': 'visual',
        'skipping': 'passive'
      };
      
      if (interactionStyleMap[behavior.interactionType]) {
        updatedProfile.learningStyle = interactionStyleMap[behavior.interactionType] as any;
      }
    }
    
    return updatedProfile;
  }

  /**
   * Predict user preferences based on profile
   */
  predictUserPreferences(userProfile: UserProfile): string[] {
    const predictions: string[] = [];
    
    // Predict based on age group
    switch (userProfile.ageGroup) {
      case 'kids':
        predictions.push('interactive-exhibits', 'hands-on-activities', 'colorful-displays');
        break;
      case 'teens':
        predictions.push('technology-exhibits', 'social-media-friendly', 'trendy-topics');
        break;
      case 'adults':
        predictions.push('educational-content', 'cultural-exhibits', 'historical-displays');
        break;
      case 'seniors':
        predictions.push('quiet-spaces', 'cultural-heritage', 'comfortable-seating');
        break;
    }
    
    // Predict based on interests
    userProfile.interests.forEach(interest => {
      const relatedInterests = this.getRelatedInterests(interest);
      predictions.push(...relatedInterests);
    });
    
    // Predict based on learning style
    switch (userProfile.learningStyle) {
      case 'visual':
        predictions.push('visual-displays', 'art-exhibits', 'photography');
        break;
      case 'hands-on':
        predictions.push('interactive-exhibits', 'science-labs', 'experiments');
        break;
      case 'interactive':
        predictions.push('digital-exhibits', 'touch-screens', 'virtual-reality');
        break;
      case 'passive':
        predictions.push('reading-materials', 'quiet-spaces', 'documentary-style');
        break;
    }
    
    return [...new Set(predictions)]; // Remove duplicates
  }

  /**
   * Optimize profile for special events
   */
  optimizeForSpecialEvents(userProfile: UserProfile, events: string[]): UserProfile {
    const optimizedProfile = { ...userProfile };
    
    events.forEach(event => {
      switch (event.toLowerCase()) {
        case 'school-trip':
          optimizedProfile.groupType = 'school';
          optimizedProfile.preferences.preferredDuration = 180; // 3 hours for school trips
          break;
        case 'family-day':
          optimizedProfile.groupType = 'family';
          optimizedProfile.preferences.preferredCrowdLevel = 'medium';
          break;
        case 'senior-tour':
          optimizedProfile.ageGroup = 'seniors';
          optimizedProfile.preferences.accessibilityNeeds.push('wheelchair-accessible', 'rest-areas');
          break;
        case 'kids-workshop':
          optimizedProfile.ageGroup = 'kids';
          optimizedProfile.learningStyle = 'hands-on';
          break;
        case 'quiet-hours':
          optimizedProfile.preferences.preferredCrowdLevel = 'low';
          optimizedProfile.preferences.accessibilityNeeds.push('quiet-spaces');
          break;
      }
    });
    
    return optimizedProfile;
  }

  /**
   * Get exhibit intelligence data
   */
  getExhibitIntelligence(exhibit: ExhibitAI): any {
    return {
      popularity: exhibit.popularityScore,
      educationalValue: exhibit.educationalValue,
      entertainmentValue: exhibit.entertainmentValue,
      accessibility: exhibit.accessibilityScore,
      targetAudience: {
        ageRange: exhibit.ageRange,
        difficultyLevel: exhibit.difficultyLevel,
        groupSize: exhibit.groupSize
      },
      features: exhibit.features,
      interactionType: exhibit.interactionType,
      duration: exhibit.duration,
      location: exhibit.location,
      tags: exhibit.tags,
      themes: exhibit.themes,
      learningOutcomes: exhibit.learningOutcomes
    };
  }

  /**
   * Calculate user satisfaction based on visited exhibits
   */
  calculateUserSatisfaction(userProfile: UserProfile, visitedExhibits: string[]): number {
    let satisfaction = 7; // Base satisfaction
    
    // Adjust based on number of exhibits visited
    if (visitedExhibits.length >= 5) {
      satisfaction += 1; // Bonus for visiting many exhibits
    } else if (visitedExhibits.length < 2) {
      satisfaction -= 1; // Penalty for visiting few exhibits
    }
    
    // Adjust based on user profile
    switch (userProfile.ageGroup) {
      case 'kids':
        if (visitedExhibits.length >= 3) satisfaction += 1;
        break;
      case 'teens':
        if (visitedExhibits.length >= 4) satisfaction += 1;
        break;
      case 'adults':
        if (visitedExhibits.length >= 5) satisfaction += 1;
        break;
      case 'seniors':
        if (visitedExhibits.length >= 3) satisfaction += 1;
        break;
    }
    
    // Adjust based on energy level
    if (userProfile.energyLevel === 'high' && visitedExhibits.length >= 6) {
      satisfaction += 1;
    } else if (userProfile.energyLevel === 'low' && visitedExhibits.length <= 3) {
      satisfaction += 1; // Seniors satisfied with fewer, quality visits
    }
    
    return Math.min(10, Math.max(1, satisfaction));
  }

  /**
   * Generate personalized summary of tour
   */
  generatePersonalizedSummary(userProfile: UserProfile, tourRoute: TourRoute): string {
    const totalExhibits = tourRoute.route.length;
    const totalTime = tourRoute.totalDuration;
    const efficiency = tourRoute.efficiency;
    
    let summary = `Your personalized tour includes ${totalExhibits} exhibits and will take approximately ${Math.round(totalTime / 60)} minutes. `;
    
    // Add age-specific summary
    switch (userProfile.ageGroup) {
      case 'kids':
        summary += `Perfect for children with interactive and engaging exhibits. `;
        break;
      case 'teens':
        summary += `Great for teenagers with modern and technology-focused exhibits. `;
        break;
      case 'adults':
        summary += `Ideal for adults with educational and cultural exhibits. `;
        break;
      case 'seniors':
        summary += `Senior-friendly tour with comfortable pacing and accessible exhibits. `;
        break;
    }
    
    // Add efficiency comment
    if (efficiency > 0.8) {
      summary += `Your tour is highly optimized for maximum enjoyment. `;
    } else if (efficiency > 0.6) {
      summary += `Your tour is well-balanced for a great experience. `;
    } else {
      summary += `Your tour is designed for a relaxed, enjoyable visit. `;
    }
    
    // Add crowd optimization comment
    if (tourRoute.crowdOptimization > 0.7) {
      summary += `Most exhibits have low crowd levels for comfortable viewing. `;
    }
    
    // Add rest stop information
    if (tourRoute.restStops.length > 0) {
      summary += `The tour includes ${tourRoute.restStops.length} rest stops for your comfort. `;
    }
    
    return summary;
  }

  /**
   * Get related interests for prediction
   */
  private getRelatedInterests(interest: string): string[] {
    const relatedMap: { [key: string]: string[] } = {
      'science': ['technology', 'experiments', 'discovery', 'innovation'],
      'history': ['culture', 'heritage', 'archaeology', 'civilization'],
      'art': ['creativity', 'design', 'culture', 'aesthetics'],
      'nature': ['environment', 'animals', 'conservation', 'ecology'],
      'technology': ['innovation', 'future', 'digital', 'automation'],
      'space': ['astronomy', 'planets', 'exploration', 'cosmos'],
      'animals': ['wildlife', 'conservation', 'nature', 'zoology'],
      'music': ['culture', 'performance', 'arts', 'entertainment'],
      'sports': ['fitness', 'competition', 'health', 'athletics'],
      'food': ['culture', 'nutrition', 'cooking', 'gastronomy']
    };
    
    return relatedMap[interest.toLowerCase()] || [];
  }

  /**
   * Complete AI workflow for user experience
   */
  static createCompleteAIExperience(
    userSelections: UserSelections,
    allExhibits: ExhibitAI[],
    timeConstraint: number
  ): {
    userProfile: UserProfile;
    recommendations: ExhibitMatch[];
    optimalTour: TourRoute;
    summary: string;
  } {
    const aiSystem = new UC_AISystem();
    
    // 1. Analyze user selections
    const userProfile = aiSystem.analyzeUserSelections(userSelections);
    
    // 2. Match exhibits to user
    const recommendations = aiSystem.matchExhibitsToUser(userProfile, allExhibits);
    
    // 3. Create optimal tour
    const selectedExhibits = recommendations.slice(0, 8).map(match => match.exhibit); // Top 8 recommendations
    const optimalTour = aiSystem.createOptimalTour(userProfile, selectedExhibits, timeConstraint);
    
    // 4. Generate summary
    const summary = aiSystem.generatePersonalizedSummary(userProfile, optimalTour);
    
    return {
      userProfile,
      recommendations,
      optimalTour,
      summary
    };
  }

  /**
   * Real-time AI adaptation
   */
  static adaptToRealTimeBehavior(
    userProfile: UserProfile,
    currentBehavior: any,
    allExhibits: ExhibitAI[],
    availableTime: number
  ): AdaptiveRecommendation {
    const aiSystem = new UC_AISystem();
    
    // Learn from behavior
    const updatedProfile = aiSystem.learnFromUserBehavior(userProfile, currentBehavior);
    
    // Create recommendation context
    const context: RecommendationContext = {
      userProfile: updatedProfile,
      currentBehavior: currentBehavior,
      availableTime,
      visitedExhibits: currentBehavior.visitedExhibits || [],
      currentLocation: currentBehavior.currentLocation || { floor: 'ground', coordinates: { x: 0, y: 0 } },
      weatherConditions: currentBehavior.weatherConditions,
      specialEvents: currentBehavior.specialEvents
    };
    
    // Generate adaptive recommendations
    return aiSystem.generateAdaptiveRecommendations(context, allExhibits);
  }
}

// Export the main AI system
export default UC_AISystem; 