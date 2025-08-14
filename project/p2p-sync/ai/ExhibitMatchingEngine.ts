/**
 * UC Discovery Hub - Exhibit Matching Engine
 * Matches exhibits to user preferences with intelligent scoring
 */

import { UserProfile } from './UserProfileAnalyzer';

export interface ExhibitAI {
  // Core Data
  id: string;
  name: string;
  category: string;
  
  // AI Scoring
  popularityScore: number;
  educationalValue: number;
  entertainmentValue: number;
  accessibilityScore: number;
  
  // Target Audience
  ageRange: AgeRange;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  groupSize: 'individual' | 'small-group' | 'large-group';
  
  // Features
  features: string[];
  interactionType: 'hands-on' | 'visual' | 'audio' | 'digital';
  duration: number; // minutes
  
  // Location Intelligence
  location: {
    floor: string;
    coordinates: { x: number; y: number };
    accessibility: boolean;
    crowdLevel: 'low' | 'medium' | 'high';
  };
  
  // Content Tags
  tags: string[];
  themes: string[];
  learningOutcomes: string[];
}

export interface AgeRange {
  min: number;
  max: number;
  recommended: number[];
}

export interface ExhibitMatch {
  exhibit: ExhibitAI;
  relevanceScore: number;
  matchReasons: string[];
  timeEstimate: number;
  crowdPrediction: 'low' | 'medium' | 'high';
  priority: 'high' | 'medium' | 'low';
}

export class ExhibitMatchingEngine {
  
  /**
   * Match exhibits to user profile with intelligent scoring
   */
  static matchExhibitsToUser(
    userProfile: UserProfile, 
    exhibits: ExhibitAI[]
  ): ExhibitMatch[] {
    return exhibits
      .map(exhibit => ({
        exhibit,
        relevanceScore: this.calculateRelevanceScore(userProfile, exhibit),
        matchReasons: this.findMatchReasons(userProfile, exhibit),
        timeEstimate: this.estimateVisitTime(userProfile, exhibit),
        crowdPrediction: this.predictCrowdLevel(exhibit, userProfile.timeSlot),
        priority: this.determinePriority(userProfile, exhibit)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Calculate relevance score between user and exhibit
   */
  private static calculateRelevanceScore(userProfile: UserProfile, exhibit: ExhibitAI): number {
    let score = 0;
    
    // Interest matching (35% weight)
    const interestMatch = this.calculateInterestMatch(userProfile.interests, exhibit.tags);
    score += interestMatch * 0.35;
    
    // Age appropriateness (25% weight)
    const ageAppropriateness = this.calculateAgeAppropriateness(userProfile.ageGroup, exhibit.ageRange);
    score += ageAppropriateness * 0.25;
    
    // Learning style compatibility (20% weight)
    const learningCompatibility = this.calculateLearningCompatibility(userProfile.learningStyle, exhibit.interactionType);
    score += learningCompatibility * 0.20;
    
    // Time compatibility (15% weight)
    const timeCompatibility = this.calculateTimeCompatibility(userProfile.timeSlot, exhibit.duration);
    score += timeCompatibility * 0.15;
    
    // Accessibility compatibility (5% weight)
    const accessibilityCompatibility = this.calculateAccessibilityCompatibility(userProfile.preferences.accessibilityNeeds, exhibit);
    score += accessibilityCompatibility * 0.05;
    
    return Math.min(score, 1.0); // Normalize to 0-1
  }

  /**
   * Calculate interest match between user interests and exhibit tags
   */
  private static calculateInterestMatch(userInterests: string[], exhibitTags: string[]): number {
    if (userInterests.length === 0 || exhibitTags.length === 0) {
      return 0.5; // Neutral score if no interests/tags
    }

    const userInterestSet = new Set(userInterests.map(interest => interest.toLowerCase()));
    const exhibitTagSet = new Set(exhibitTags.map(tag => tag.toLowerCase()));
    
    // Calculate intersection
    const intersection = new Set([...userInterestSet].filter(x => exhibitTagSet.has(x)));
    
    // Calculate union
    const union = new Set([...userInterestSet, ...exhibitTagSet]);
    
    // Jaccard similarity
    return intersection.size / union.size;
  }

  /**
   * Calculate age appropriateness
   */
  private static calculateAgeAppropriateness(userAgeGroup: string, exhibitAgeRange: AgeRange): number {
    const ageGroupMap: { [key: string]: number } = {
      'kids': 8,
      'teens': 15,
      'adults': 35,
      'seniors': 65
    };

    const userAge = ageGroupMap[userAgeGroup] || 35;
    
    // Check if user age falls within exhibit age range
    if (userAge >= exhibitAgeRange.min && userAge <= exhibitAgeRange.max) {
      return 1.0; // Perfect match
    }
    
    // Calculate distance from recommended age
    const distance = Math.min(
      Math.abs(userAge - exhibitAgeRange.min),
      Math.abs(userAge - exhibitAgeRange.max)
    );
    
    // Score decreases with distance
    return Math.max(0, 1 - (distance / 20));
  }

  /**
   * Calculate learning style compatibility
   */
  private static calculateLearningCompatibility(
    userLearningStyle: string, 
    exhibitInteractionType: string
  ): number {
    const compatibilityMap: { [key: string]: { [key: string]: number } } = {
      'visual': {
        'visual': 1.0,
        'hands-on': 0.7,
        'audio': 0.8,
        'digital': 0.9
      },
      'hands-on': {
        'hands-on': 1.0,
        'visual': 0.6,
        'audio': 0.4,
        'digital': 0.8
      },
      'interactive': {
        'hands-on': 1.0,
        'digital': 1.0,
        'visual': 0.8,
        'audio': 0.6
      },
      'passive': {
        'visual': 1.0,
        'audio': 1.0,
        'digital': 0.7,
        'hands-on': 0.4
      }
    };

    return compatibilityMap[userLearningStyle]?.[exhibitInteractionType] || 0.5;
  }

  /**
   * Calculate time compatibility
   */
  private static calculateTimeCompatibility(userTimeSlot: string, exhibitDuration: number): number {
    const timeSlotMap: { [key: string]: { maxDuration: number; optimalDuration: number } } = {
      'morning': { maxDuration: 120, optimalDuration: 60 },
      'afternoon': { maxDuration: 180, optimalDuration: 90 },
      'full-day': { maxDuration: 300, optimalDuration: 150 }
    };

    const timeSlot = timeSlotMap[userTimeSlot];
    if (!timeSlot) return 0.5;

    // Perfect score if duration is optimal
    if (exhibitDuration <= timeSlot.optimalDuration) {
      return 1.0;
    }

    // Score decreases as duration exceeds optimal
    if (exhibitDuration <= timeSlot.maxDuration) {
      return 1.0 - ((exhibitDuration - timeSlot.optimalDuration) / (timeSlot.maxDuration - timeSlot.optimalDuration)) * 0.3;
    }

    // Low score if duration exceeds maximum
    return 0.3;
  }

  /**
   * Calculate accessibility compatibility
   */
  private static calculateAccessibilityCompatibility(
    userAccessibilityNeeds: string[], 
    exhibit: ExhibitAI
  ): number {
    if (userAccessibilityNeeds.length === 0) {
      return 1.0; // No accessibility needs = perfect compatibility
    }

    const accessibilityFeatures = [
      exhibit.location.accessibility ? 'wheelchair-accessible' : '',
      exhibit.features.includes('rest-areas') ? 'rest-areas' : '',
      exhibit.features.includes('easy-navigation') ? 'easy-navigation' : '',
      exhibit.features.includes('child-friendly') ? 'child-friendly' : '',
      exhibit.features.includes('stroller-accessible') ? 'stroller-accessible' : ''
    ].filter(feature => feature);

    const needsMet = userAccessibilityNeeds.filter(need => 
      accessibilityFeatures.includes(need)
    ).length;

    return needsMet / userAccessibilityNeeds.length;
  }

  /**
   * Find specific reasons why exhibit matches user
   */
  private static findMatchReasons(userProfile: UserProfile, exhibit: ExhibitAI): string[] {
    const reasons: string[] = [];

    // Interest-based reasons
    const interestMatches = userProfile.interests.filter(interest => 
      exhibit.tags.includes(interest)
    );
    if (interestMatches.length > 0) {
      reasons.push(`Matches your interests: ${interestMatches.join(', ')}`);
    }

    // Age-based reasons
    const ageGroupMap: { [key: string]: string } = {
      'kids': 'Perfect for children',
      'teens': 'Great for teenagers',
      'adults': 'Ideal for adults',
      'seniors': 'Senior-friendly'
    };
    if (ageGroupMap[userProfile.ageGroup]) {
      reasons.push(ageGroupMap[userProfile.ageGroup]);
    }

    // Learning style reasons
    const learningStyleMap: { [key: string]: string } = {
      'visual': 'Visual learning experience',
      'hands-on': 'Interactive hands-on activities',
      'interactive': 'Engaging interactive elements',
      'passive': 'Relaxed viewing experience'
    };
    if (learningStyleMap[userProfile.learningStyle]) {
      reasons.push(learningStyleMap[userProfile.learningStyle]);
    }

    // Time-based reasons
    if (exhibit.duration <= 30) {
      reasons.push('Quick visit option');
    } else if (exhibit.duration >= 60) {
      reasons.push('In-depth experience');
    }

    // Accessibility reasons
    if (exhibit.location.accessibility) {
      reasons.push('Wheelchair accessible');
    }

    return reasons;
  }

  /**
   * Estimate visit time based on user profile and exhibit
   */
  private static estimateVisitTime(userProfile: UserProfile, exhibit: ExhibitAI): number {
    let baseTime = exhibit.duration;

    // Adjust based on age group
    switch (userProfile.ageGroup) {
      case 'kids':
        baseTime *= 1.2; // Kids take more time
        break;
      case 'teens':
        baseTime *= 0.9; // Teens are faster
        break;
      case 'adults':
        baseTime *= 1.0; // Standard time
        break;
      case 'seniors':
        baseTime *= 1.3; // Seniors take more time
        break;
    }

    // Adjust based on learning style
    switch (userProfile.learningStyle) {
      case 'hands-on':
        baseTime *= 1.4; // Hands-on takes more time
        break;
      case 'interactive':
        baseTime *= 1.2; // Interactive takes more time
        break;
      case 'passive':
        baseTime *= 0.8; // Passive viewing is faster
        break;
      case 'visual':
        baseTime *= 1.0; // Standard time
        break;
    }

    // Adjust based on group type
    switch (userProfile.groupType) {
      case 'family':
        baseTime *= 1.3; // Families take more time
        break;
      case 'school':
        baseTime *= 1.5; // Educational groups take more time
        break;
      case 'individual':
        baseTime *= 0.9; // Individuals are faster
        break;
      case 'tourist':
        baseTime *= 1.1; // Tourists take slightly more time
        break;
    }

    return Math.round(baseTime);
  }

  /**
   * Predict crowd level for exhibit
   */
  private static predictCrowdLevel(exhibit: ExhibitAI, timeSlot: string): 'low' | 'medium' | 'high' {
    const basePopularity = exhibit.popularityScore;
    const timeMultiplier = this.getTimeSlotMultiplier(timeSlot);
    const dayOfWeekMultiplier = this.getDayOfWeekMultiplier();
    
    const predictedCrowd = basePopularity * timeMultiplier * dayOfWeekMultiplier;
    
    if (predictedCrowd < 0.3) return 'low';
    if (predictedCrowd < 0.7) return 'medium';
    return 'high';
  }

  /**
   * Get time slot multiplier for crowd prediction
   */
  private static getTimeSlotMultiplier(timeSlot: string): number {
    switch (timeSlot) {
      case 'morning':
        return 0.7; // Less crowded in morning
      case 'afternoon':
        return 1.0; // Standard crowd level
      case 'full-day':
        return 1.2; // More crowded for full day
      default:
        return 1.0;
    }
  }

  /**
   * Get day of week multiplier for crowd prediction
   */
  private static getDayOfWeekMultiplier(): number {
    const dayOfWeek = new Date().getDay();
    
    // Weekend multiplier
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 1.3; // More crowded on weekends
    }
    
    return 1.0; // Standard for weekdays
  }

  /**
   * Determine priority level for exhibit
   */
  private static determinePriority(userProfile: UserProfile, exhibit: ExhibitAI): 'high' | 'medium' | 'low' {
    const relevanceScore = this.calculateRelevanceScore(userProfile, exhibit);
    
    if (relevanceScore >= 0.8) return 'high';
    if (relevanceScore >= 0.6) return 'medium';
    return 'low';
  }

  /**
   * Get top recommendations for user
   */
  static getTopRecommendations(
    userProfile: UserProfile, 
    exhibits: ExhibitAI[], 
    count: number = 5
  ): ExhibitMatch[] {
    const matches = this.matchExhibitsToUser(userProfile, exhibits);
    return matches.slice(0, count);
  }

  /**
   * Get recommendations by category
   */
  static getRecommendationsByCategory(
    userProfile: UserProfile,
    exhibits: ExhibitAI[],
    category: string
  ): ExhibitMatch[] {
    const categoryExhibits = exhibits.filter(exhibit => 
      exhibit.category.toLowerCase() === category.toLowerCase()
    );
    
    return this.matchExhibitsToUser(userProfile, categoryExhibits);
  }

  /**
   * Get recommendations for specific time slot
   */
  static getRecommendationsForTimeSlot(
    userProfile: UserProfile,
    exhibits: ExhibitAI[],
    timeSlot: string
  ): ExhibitMatch[] {
    const timeSlotExhibits = exhibits.filter(exhibit => {
      const timeCompatibility = this.calculateTimeCompatibility(timeSlot, exhibit.duration);
      return timeCompatibility >= 0.7; // Only highly compatible exhibits
    });
    
    return this.matchExhibitsToUser(userProfile, timeSlotExhibits);
  }
} 