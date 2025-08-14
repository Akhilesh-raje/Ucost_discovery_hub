/**
 * UC Discovery Hub - Smart Recommendation Engine
 * Provides real-time, adaptive recommendations based on user behavior
 */

import { UserProfile } from './UserProfileAnalyzer';
import { ExhibitAI, ExhibitMatch } from './ExhibitMatchingEngine';
import { TourRoute } from './TourOptimizationEngine';

export interface UserBehavior {
  currentExhibit?: string;
  timeSpent: number;
  interactionType: 'viewing' | 'interacting' | 'skipping' | 'returning';
  satisfaction: number; // 1-10
  energyLevel: 'low' | 'medium' | 'high';
  crowdTolerance: 'low' | 'medium' | 'high';
}

export interface AdaptiveRecommendation {
  currentRecommendations: ExhibitAI[];
  alternativeOptions: ExhibitAI[];
  dynamicRouting: TourRoute;
  timeOptimization: TimeOptimization;
  reasoning: string[];
  confidenceScore: number;
  nextBestActions: string[];
}

export interface TimeOptimization {
  currentTime: number;
  remainingTime: number;
  suggestedPace: 'slow' | 'moderate' | 'fast';
  timeAllocation: { [exhibitId: string]: number };
  efficiencyTips: string[];
}

export interface RecommendationContext {
  userProfile: UserProfile;
  currentBehavior: UserBehavior;
  availableTime: number;
  visitedExhibits: string[];
  currentLocation: { floor: string; coordinates: { x: number; y: number } };
  weatherConditions?: 'indoor' | 'outdoor' | 'mixed';
  specialEvents?: string[];
}

export class SmartRecommendationEngine {
  
  /**
   * Generate adaptive recommendations based on current context
   */
  static generateAdaptiveRecommendations(
    context: RecommendationContext,
    allExhibits: ExhibitAI[]
  ): AdaptiveRecommendation {
    
    // Analyze current behavior
    const behaviorAnalysis = this.analyzeCurrentBehavior(context.currentBehavior);
    
    // Update user profile based on behavior
    const updatedProfile = this.updateProfileWithBehavior(context.userProfile, context.currentBehavior);
    
    // Generate current recommendations
    const currentRecommendations = this.generateCurrentRecommendations(
      updatedProfile,
      allExhibits,
      context
    );
    
    // Generate alternative options
    const alternativeOptions = this.generateAlternativeOptions(
      updatedProfile,
      allExhibits,
      context
    );
    
    // Create dynamic routing
    const dynamicRouting = this.createDynamicRouting(
      updatedProfile,
      currentRecommendations,
      context
    );
    
    // Optimize time usage
    const timeOptimization = this.optimizeTimeUsage(
      context.availableTime,
      currentRecommendations,
      context
    );
    
    // Generate reasoning
    const reasoning = this.generateReasoning(
      updatedProfile,
      currentRecommendations,
      context
    );
    
    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(
      updatedProfile,
      currentRecommendations,
      context
    );
    
    // Suggest next best actions
    const nextBestActions = this.suggestNextBestActions(
      context,
      currentRecommendations
    );
    
    return {
      currentRecommendations,
      alternativeOptions,
      dynamicRouting,
      timeOptimization,
      reasoning,
      confidenceScore,
      nextBestActions
    };
  }

  /**
   * Analyze current user behavior
   */
  private static analyzeCurrentBehavior(behavior: UserBehavior): any {
    const analysis = {
      engagementLevel: 'low',
      satisfactionLevel: 'medium',
      energyTrend: 'stable',
      crowdTolerance: 'medium'
    };
    
    // Analyze engagement level
    if (behavior.interactionType === 'interacting' && behavior.timeSpent > 10) {
      analysis.engagementLevel = 'high';
    } else if (behavior.interactionType === 'skipping' || behavior.timeSpent < 2) {
      analysis.engagementLevel = 'low';
    } else {
      analysis.engagementLevel = 'medium';
    }
    
    // Analyze satisfaction
    if (behavior.satisfaction >= 8) {
      analysis.satisfactionLevel = 'high';
    } else if (behavior.satisfaction <= 4) {
      analysis.satisfactionLevel = 'low';
    } else {
      analysis.satisfactionLevel = 'medium';
    }
    
    // Analyze energy trend
    if (behavior.energyLevel === 'high' && behavior.timeSpent > 15) {
      analysis.energyTrend = 'increasing';
    } else if (behavior.energyLevel === 'low' && behavior.timeSpent < 5) {
      analysis.energyTrend = 'decreasing';
    } else {
      analysis.energyTrend = 'stable';
    }
    
    analysis.crowdTolerance = behavior.crowdTolerance;
    
    return analysis;
  }

  /**
   * Update user profile based on current behavior
   */
  private static updateProfileWithBehavior(
    userProfile: UserProfile,
    behavior: UserBehavior
  ): UserProfile {
    const updatedProfile = { ...userProfile };
    
    // Update energy level based on behavior
    if (behavior.energyLevel !== userProfile.energyLevel) {
      updatedProfile.energyLevel = behavior.energyLevel;
    }
    
    // Update preferences based on satisfaction
    if (behavior.satisfaction < 5) {
      // User is not satisfied, adjust preferences
      updatedProfile.preferences.preferredCrowdLevel = 'low';
      updatedProfile.preferredPace = 'slow';
    } else if (behavior.satisfaction > 8) {
      // User is very satisfied, maintain or increase engagement
      updatedProfile.preferences.preferredCrowdLevel = 'medium';
      updatedProfile.preferredPace = 'moderate';
    }
    
    return updatedProfile;
  }

  /**
   * Generate current recommendations based on updated profile
   */
  private static generateCurrentRecommendations(
    userProfile: UserProfile,
    allExhibits: ExhibitAI[],
    context: RecommendationContext
  ): ExhibitAI[] {
    // Filter out visited exhibits
    const unvisitedExhibits = allExhibits.filter(exhibit => 
      !context.visitedExhibits.includes(exhibit.id)
    );
    
    // Apply location-based filtering
    const nearbyExhibits = this.filterByProximity(
      unvisitedExhibits,
      context.currentLocation
    );
    
    // Apply time-based filtering
    const timeCompatibleExhibits = this.filterByTimeCompatibility(
      nearbyExhibits,
      context.availableTime,
      userProfile
    );
    
    // Apply energy-based filtering
    const energyCompatibleExhibits = this.filterByEnergyLevel(
      timeCompatibleExhibits,
      userProfile.energyLevel
    );
    
    // Sort by relevance and return top recommendations
    return energyCompatibleExhibits
      .sort((a, b) => {
        const relevanceA = this.calculateExhibitRelevance(a, userProfile, context);
        const relevanceB = this.calculateExhibitRelevance(b, userProfile, context);
        return relevanceB - relevanceA;
      })
      .slice(0, 5); // Return top 5 recommendations
  }

  /**
   * Generate alternative options
   */
  private static generateAlternativeOptions(
    userProfile: UserProfile,
    allExhibits: ExhibitAI[],
    context: RecommendationContext
  ): ExhibitAI[] {
    // Get exhibits from different categories
    const categoryDiversification = this.getExhibitsFromDifferentCategories(
      allExhibits,
      context.visitedExhibits
    );
    
    // Get exhibits with different interaction types
    const interactionDiversification = this.getExhibitsWithDifferentInteractions(
      allExhibits,
      context.visitedExhibits,
      userProfile.learningStyle
    );
    
    // Combine and sort alternatives
    const alternatives = [...categoryDiversification, ...interactionDiversification];
    const uniqueAlternatives = this.removeDuplicates(alternatives);
    
    return uniqueAlternatives
      .sort((a, b) => {
        const relevanceA = this.calculateExhibitRelevance(a, userProfile, context);
        const relevanceB = this.calculateExhibitRelevance(b, userProfile, context);
        return relevanceB - relevanceA;
      })
      .slice(0, 3); // Return top 3 alternatives
  }

  /**
   * Create dynamic routing based on current context
   */
  private static createDynamicRouting(
    userProfile: UserProfile,
    recommendations: ExhibitAI[],
    context: RecommendationContext
  ): TourRoute {
    // Import TourOptimizationEngine to use its methods
    const { TourOptimizationEngine } = require('./TourOptimizationEngine');
    
    return TourOptimizationEngine.createOptimalTour({
      userProfile,
      selectedExhibits: recommendations,
      timeConstraint: context.availableTime,
      preferences: {
        includeRestStops: userProfile.ageGroup === 'seniors' || userProfile.ageGroup === 'kids',
        optimizeForCrowds: userProfile.preferences.preferredCrowdLevel === 'low',
        preferPopularExhibits: false,
        balanceCategories: true
      }
    });
  }

  /**
   * Optimize time usage for remaining time
   */
  private static optimizeTimeUsage(
    availableTime: number,
    recommendations: ExhibitAI[],
    context: RecommendationContext
  ): TimeOptimization {
    const currentTime = new Date().getHours();
    const remainingTime = availableTime;
    
    // Calculate total time needed for recommendations
    const totalRecommendedTime = recommendations.reduce((sum, exhibit) => 
      sum + exhibit.duration, 0
    );
    
    // Determine suggested pace
    let suggestedPace: 'slow' | 'moderate' | 'fast';
    if (totalRecommendedTime > remainingTime * 1.5) {
      suggestedPace = 'fast';
    } else if (totalRecommendedTime < remainingTime * 0.7) {
      suggestedPace = 'slow';
    } else {
      suggestedPace = 'moderate';
    }
    
    // Allocate time to each exhibit
    const timeAllocation: { [exhibitId: string]: number } = {};
    recommendations.forEach(exhibit => {
      let allocatedTime = exhibit.duration;
      
      // Adjust based on suggested pace
      switch (suggestedPace) {
        case 'fast':
          allocatedTime *= 0.8;
          break;
        case 'slow':
          allocatedTime *= 1.3;
          break;
      }
      
      timeAllocation[exhibit.id] = Math.round(allocatedTime);
    });
    
    // Generate efficiency tips
    const efficiencyTips = this.generateEfficiencyTips(
      suggestedPace,
      remainingTime,
      totalRecommendedTime,
      context
    );
    
    return {
      currentTime,
      remainingTime,
      suggestedPace,
      timeAllocation,
      efficiencyTips
    };
  }

  /**
   * Generate reasoning for recommendations
   */
  private static generateReasoning(
    userProfile: UserProfile,
    recommendations: ExhibitAI[],
    context: RecommendationContext
  ): string[] {
    const reasoning: string[] = [];
    
    // Add reasoning based on user profile
    if (userProfile.ageGroup === 'kids') {
      reasoning.push('Selected exhibits are perfect for children with interactive elements');
    } else if (userProfile.ageGroup === 'seniors') {
      reasoning.push('Chosen exhibits are senior-friendly with easy navigation');
    }
    
    // Add reasoning based on interests
    const interestMatches = recommendations.filter(exhibit => 
      userProfile.interests.some(interest => exhibit.tags.includes(interest))
    ).length;
    
    if (interestMatches > 0) {
      reasoning.push(`${interestMatches} exhibits match your specific interests`);
    }
    
    // Add reasoning based on time
    if (context.availableTime < 60) {
      reasoning.push('Optimized for your limited time with quick-visit exhibits');
    } else if (context.availableTime > 180) {
      reasoning.push('Selected in-depth experiences for your extended visit');
    }
    
    // Add reasoning based on location
    reasoning.push('Exhibits are strategically located near your current position');
    
    // Add reasoning based on crowd levels
    const lowCrowdExhibits = recommendations.filter(exhibit => 
      exhibit.location.crowdLevel === 'low'
    ).length;
    
    if (lowCrowdExhibits > 0) {
      reasoning.push(`${lowCrowdExhibits} exhibits have low crowd levels for comfortable viewing`);
    }
    
    return reasoning;
  }

  /**
   * Calculate confidence score for recommendations
   */
  private static calculateConfidenceScore(
    userProfile: UserProfile,
    recommendations: ExhibitAI[],
    context: RecommendationContext
  ): number {
    let score = 0.5; // Base score
    
    // Interest matching bonus
    const interestMatches = recommendations.filter(exhibit => 
      userProfile.interests.some(interest => exhibit.tags.includes(interest))
    ).length;
    score += (interestMatches / recommendations.length) * 0.2;
    
    // Time compatibility bonus
    const totalTime = recommendations.reduce((sum, exhibit) => sum + exhibit.duration, 0);
    const timeCompatibility = Math.min(1, context.availableTime / totalTime);
    score += timeCompatibility * 0.15;
    
    // Age appropriateness bonus
    const ageAppropriateExhibits = recommendations.filter(exhibit => {
      const userAge = this.getUserAge(userProfile.ageGroup);
      return userAge >= exhibit.ageRange.min && userAge <= exhibit.ageRange.max;
    }).length;
    score += (ageAppropriateExhibits / recommendations.length) * 0.15;
    
    // Energy level compatibility bonus
    const energyCompatibleExhibits = recommendations.filter(exhibit => {
      if (userProfile.energyLevel === 'high') {
        return exhibit.interactionType === 'hands-on' || exhibit.interactionType === 'interactive';
      } else if (userProfile.energyLevel === 'low') {
        return exhibit.interactionType === 'visual' || exhibit.interactionType === 'passive';
      }
      return true;
    }).length;
    score += (energyCompatibleExhibits / recommendations.length) * 0.1;
    
    return Math.min(1, score);
  }

  /**
   * Suggest next best actions
   */
  private static suggestNextBestActions(
    context: RecommendationContext,
    recommendations: ExhibitAI[]
  ): string[] {
    const actions: string[] = [];
    
    if (recommendations.length > 0) {
      actions.push(`Visit ${recommendations[0].name} next - it's the best match for your interests`);
      
      if (context.availableTime < 60) {
        actions.push('Consider quick visits to maximize your time');
      }
      
      if (context.currentBehavior?.energyLevel === 'low') {
        actions.push('Take a short rest before continuing your tour');
      }
      
      if (recommendations.some(exhibit => exhibit.location.crowdLevel === 'high')) {
        actions.push('Visit popular exhibits early to avoid crowds');
      }
    }
    
    return actions;
  }

  /**
   * Filter exhibits by proximity to current location
   */
  private static filterByProximity(
    exhibits: ExhibitAI[],
    currentLocation: { floor: string; coordinates: { x: number; y: number } }
  ): ExhibitAI[] {
    return exhibits.filter(exhibit => {
      // Same floor priority
      if (exhibit.location.floor === currentLocation.floor) {
        return true;
      }
      
      // Different floor but within reasonable distance
      const distance = this.calculateDistance(
        currentLocation.coordinates,
        exhibit.location.coordinates
      );
      
      return distance < 100; // Within 100 units
    });
  }

  /**
   * Filter exhibits by time compatibility
   */
  private static filterByTimeCompatibility(
    exhibits: ExhibitAI[],
    availableTime: number,
    userProfile: UserProfile
  ): ExhibitAI[] {
    return exhibits.filter(exhibit => {
      const adjustedDuration = this.adjustDurationForUser(exhibit.duration, userProfile);
      return adjustedDuration <= availableTime * 0.3; // No single exhibit should take more than 30% of available time
    });
  }

  /**
   * Filter exhibits by energy level
   */
  private static filterByEnergyLevel(
    exhibits: ExhibitAI[],
    energyLevel: string
  ): ExhibitAI[] {
    return exhibits.filter(exhibit => {
      if (energyLevel === 'high') {
        return exhibit.interactionType === 'hands-on' || exhibit.interactionType === 'interactive';
      } else if (energyLevel === 'low') {
        return exhibit.interactionType === 'visual' || exhibit.interactionType === 'passive';
      }
      return true; // Medium energy level accepts all types
    });
  }

  /**
   * Get exhibits from different categories
   */
  private static getExhibitsFromDifferentCategories(
    allExhibits: ExhibitAI[],
    visitedExhibits: string[]
  ): ExhibitAI[] {
    const visitedCategories = new Set(
      allExhibits
        .filter(exhibit => visitedExhibits.includes(exhibit.id))
        .map(exhibit => exhibit.category)
    );
    
    return allExhibits
      .filter(exhibit => !visitedExhibits.includes(exhibit.id))
      .filter(exhibit => !visitedCategories.has(exhibit.category))
      .slice(0, 2);
  }

  /**
   * Get exhibits with different interaction types
   */
  private static getExhibitsWithDifferentInteractions(
    allExhibits: ExhibitAI[],
    visitedExhibits: string[],
    currentLearningStyle: string
  ): ExhibitAI[] {
    const visitedInteractionTypes = new Set(
      allExhibits
        .filter(exhibit => visitedExhibits.includes(exhibit.id))
        .map(exhibit => exhibit.interactionType)
    );
    
    return allExhibits
      .filter(exhibit => !visitedExhibits.includes(exhibit.id))
      .filter(exhibit => !visitedInteractionTypes.has(exhibit.interactionType))
      .slice(0, 2);
  }

  /**
   * Calculate exhibit relevance to user profile and context
   */
  private static calculateExhibitRelevance(
    exhibit: ExhibitAI,
    userProfile: UserProfile,
    context: RecommendationContext
  ): number {
    let relevance = 0;
    
    // Interest matching
    const interestMatches = userProfile.interests.filter(interest => 
      exhibit.tags.includes(interest)
    ).length;
    relevance += interestMatches * 0.3;
    
    // Age appropriateness
    const userAge = this.getUserAge(userProfile.ageGroup);
    if (userAge >= exhibit.ageRange.min && userAge <= exhibit.ageRange.max) {
      relevance += 0.25;
    }
    
    // Learning style compatibility
    if (userProfile.learningStyle === exhibit.interactionType) {
      relevance += 0.2;
    }
    
    // Time compatibility
    const adjustedDuration = this.adjustDurationForUser(exhibit.duration, userProfile);
    if (adjustedDuration <= context.availableTime * 0.3) {
      relevance += 0.15;
    }
    
    // Location proximity
    const distance = this.calculateDistance(
      context.currentLocation.coordinates,
      exhibit.location.coordinates
    );
    if (distance < 50) {
      relevance += 0.1;
    }
    
    return relevance;
  }

  /**
   * Generate efficiency tips
   */
  private static generateEfficiencyTips(
    suggestedPace: string,
    remainingTime: number,
    totalRecommendedTime: number,
    context: RecommendationContext
  ): string[] {
    const tips: string[] = [];
    
    if (suggestedPace === 'fast') {
      tips.push('Consider quick visits to maximize your time');
      tips.push('Skip detailed reading and focus on interactive elements');
    } else if (suggestedPace === 'slow') {
      tips.push('Take your time to fully experience each exhibit');
      tips.push('Consider reading detailed descriptions for deeper understanding');
    }
    
    if (totalRecommendedTime > remainingTime) {
      tips.push('Prioritize exhibits that interest you most');
      tips.push('Consider skipping some exhibits to avoid rushing');
    }
    
    if (context.currentBehavior?.energyLevel === 'low') {
      tips.push('Take short breaks between exhibits');
      tips.push('Choose exhibits with seating areas');
    }
    
    return tips;
  }

  /**
   * Helper methods
   */
  private static calculateDistance(
    point1: { x: number; y: number },
    point2: { x: number; y: number }
  ): number {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private static adjustDurationForUser(duration: number, userProfile: UserProfile): number {
    let adjustedDuration = duration;
    
    switch (userProfile.ageGroup) {
      case 'kids':
        adjustedDuration *= 1.2;
        break;
      case 'teens':
        adjustedDuration *= 0.9;
        break;
      case 'seniors':
        adjustedDuration *= 1.3;
        break;
    }
    
    switch (userProfile.groupType) {
      case 'family':
        adjustedDuration *= 1.3;
        break;
      case 'school':
        adjustedDuration *= 1.5;
        break;
      case 'individual':
        adjustedDuration *= 0.9;
        break;
    }
    
    return Math.round(adjustedDuration);
  }

  private static getUserAge(ageGroup: string): number {
    const ageMap: { [key: string]: number } = {
      'kids': 8,
      'teens': 15,
      'adults': 35,
      'seniors': 65
    };
    return ageMap[ageGroup] || 35;
  }

  private static removeDuplicates(exhibits: ExhibitAI[]): ExhibitAI[] {
    const seen = new Set();
    return exhibits.filter(exhibit => {
      if (seen.has(exhibit.id)) {
        return false;
      }
      seen.add(exhibit.id);
      return true;
    });
  }
} 