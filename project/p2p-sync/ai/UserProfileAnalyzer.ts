/**
 * UC Discovery Hub - User Profile Analyzer
 * Analyzes user selections and creates intelligent user profiles
 */

export interface UserSelections {
  ageGroup: string;
  groupType: string;
  children: boolean;
  childrenAge?: number[];
  interests: string[];
  timeSlot: string;
  learningStyle?: string;
}

export interface UserProfile {
  // Demographics
  ageGroup: 'kids' | 'teens' | 'adults' | 'seniors';
  groupType: 'individual' | 'family' | 'school' | 'tourist';
  children: boolean;
  childrenAge?: number[];
  
  // Interests
  interests: string[];
  preferredCategories: string[];
  timeSlot: 'morning' | 'afternoon' | 'full-day';
  
  // Behavior
  interactionHistory: UserInteraction[];
  preferences: UserPreferences;
  learningStyle: 'visual' | 'hands-on' | 'interactive' | 'passive';
  
  // AI Analysis
  energyLevel: 'low' | 'medium' | 'high';
  preferredPace: 'slow' | 'moderate' | 'fast';
  socialPreference: 'individual' | 'group' | 'mixed';
}

export interface UserInteraction {
  exhibitId: string;
  timeSpent: number;
  interactionType: string;
  satisfaction: number;
  timestamp: Date;
}

export interface UserPreferences {
  preferredDuration: number;
  preferredCrowdLevel: 'low' | 'medium' | 'high';
  accessibilityNeeds: string[];
  specialInterests: string[];
}

export class UserProfileAnalyzer {
  
  /**
   * Analyze user selections and create intelligent user profile
   */
  static analyzeUserSelections(selections: UserSelections): UserProfile {
    return {
      // Demographics
      ageGroup: this.determineAgeGroup(selections.ageGroup),
      groupType: this.determineGroupType(selections.groupType),
      children: selections.children,
      childrenAge: selections.childrenAge,
      
      // Interests
      interests: this.processInterests(selections.interests),
      preferredCategories: this.extractCategories(selections.interests),
      timeSlot: this.determineTimeSlot(selections.timeSlot),
      
      // Behavior
      interactionHistory: [],
      preferences: this.generatePreferences(selections),
      learningStyle: this.determineLearningStyle(selections.learningStyle),
      
      // AI Analysis
      energyLevel: this.analyzeEnergyLevel(selections),
      preferredPace: this.analyzePreferredPace(selections),
      socialPreference: this.analyzeSocialPreference(selections)
    };
  }

  /**
   * Determine age group with intelligence
   */
  private static determineAgeGroup(ageGroup: string): 'kids' | 'teens' | 'adults' | 'seniors' {
    switch (ageGroup.toLowerCase()) {
      case 'kids':
      case 'children':
      case 'child':
        return 'kids';
      case 'teens':
      case 'teenagers':
      case 'adolescent':
        return 'teens';
      case 'adults':
      case 'adult':
        return 'adults';
      case 'seniors':
      case 'elderly':
      case 'senior':
        return 'seniors';
      default:
        return 'adults';
    }
  }

  /**
   * Determine group type with context
   */
  private static determineGroupType(groupType: string): 'individual' | 'family' | 'school' | 'tourist' {
    switch (groupType.toLowerCase()) {
      case 'individual':
      case 'alone':
      case 'solo':
        return 'individual';
      case 'family':
      case 'with-family':
        return 'family';
      case 'school':
      case 'educational':
      case 'class':
        return 'school';
      case 'tourist':
      case 'visitor':
      case 'traveler':
        return 'tourist';
      default:
        return 'individual';
    }
  }

  /**
   * Process and enhance interests
   */
  private static processInterests(interests: string[]): string[] {
    const processedInterests = interests.map(interest => interest.toLowerCase());
    
    // Add related interests based on primary interests
    const relatedInterests = this.findRelatedInterests(processedInterests);
    
    return [...new Set([...processedInterests, ...relatedInterests])];
  }

  /**
   * Find related interests for better matching
   */
  private static findRelatedInterests(interests: string[]): string[] {
    const relatedMap: { [key: string]: string[] } = {
      'science': ['technology', 'experiments', 'discovery'],
      'history': ['culture', 'heritage', 'archaeology'],
      'art': ['creativity', 'design', 'culture'],
      'nature': ['environment', 'animals', 'conservation'],
      'technology': ['innovation', 'future', 'digital'],
      'space': ['astronomy', 'planets', 'exploration'],
      'animals': ['wildlife', 'conservation', 'nature'],
      'music': ['culture', 'performance', 'arts'],
      'sports': ['fitness', 'competition', 'health'],
      'food': ['culture', 'nutrition', 'cooking']
    };

    const related: string[] = [];
    interests.forEach(interest => {
      if (relatedMap[interest]) {
        related.push(...relatedMap[interest]);
      }
    });

    return related;
  }

  /**
   * Extract categories from interests
   */
  private static extractCategories(interests: string[]): string[] {
    const categoryMap: { [key: string]: string } = {
      'science': 'Science & Technology',
      'technology': 'Science & Technology',
      'history': 'History & Culture',
      'culture': 'History & Culture',
      'art': 'Arts & Creativity',
      'nature': 'Nature & Environment',
      'animals': 'Nature & Environment',
      'space': 'Science & Technology',
      'music': 'Arts & Creativity',
      'sports': 'Health & Fitness',
      'food': 'Culture & Lifestyle'
    };

    return interests
      .map(interest => categoryMap[interest.toLowerCase()])
      .filter(category => category)
      .filter((category, index, arr) => arr.indexOf(category) === index);
  }

  /**
   * Determine time slot with intelligence
   */
  private static determineTimeSlot(timeSlot: string): 'morning' | 'afternoon' | 'full-day' {
    switch (timeSlot.toLowerCase()) {
      case 'morning':
      case 'am':
        return 'morning';
      case 'afternoon':
      case 'pm':
        return 'afternoon';
      case 'full-day':
      case 'all-day':
      case 'full':
        return 'full-day';
      default:
        return 'afternoon';
    }
  }

  /**
   * Generate user preferences based on selections
   */
  private static generatePreferences(selections: UserSelections): UserPreferences {
    return {
      preferredDuration: this.calculatePreferredDuration(selections),
      preferredCrowdLevel: this.determinePreferredCrowdLevel(selections),
      accessibilityNeeds: this.determineAccessibilityNeeds(selections),
      specialInterests: this.extractSpecialInterests(selections)
    };
  }

  /**
   * Calculate preferred duration based on selections
   */
  private static calculatePreferredDuration(selections: UserSelections): number {
    let baseDuration = 120; // 2 hours default

    // Adjust based on age group
    switch (selections.ageGroup.toLowerCase()) {
      case 'kids':
        baseDuration = 90; // 1.5 hours for kids
        break;
      case 'teens':
        baseDuration = 150; // 2.5 hours for teens
        break;
      case 'adults':
        baseDuration = 180; // 3 hours for adults
        break;
      case 'seniors':
        baseDuration = 120; // 2 hours for seniors
        break;
    }

    // Adjust based on time slot
    switch (selections.timeSlot.toLowerCase()) {
      case 'morning':
        baseDuration *= 0.8; // Shorter for morning
        break;
      case 'afternoon':
        baseDuration *= 1.0; // Standard duration
        break;
      case 'full-day':
        baseDuration *= 1.5; // Longer for full day
        break;
    }

    // Adjust based on group type
    switch (selections.groupType.toLowerCase()) {
      case 'family':
        baseDuration *= 1.2; // Longer for families
        break;
      case 'school':
        baseDuration *= 1.3; // Longer for educational groups
        break;
      case 'individual':
        baseDuration *= 0.9; // Shorter for individuals
        break;
    }

    return Math.round(baseDuration);
  }

  /**
   * Determine preferred crowd level
   */
  private static determinePreferredCrowdLevel(selections: UserSelections): 'low' | 'medium' | 'high' {
    // Seniors and individuals prefer lower crowds
    if (selections.ageGroup.toLowerCase() === 'seniors' || 
        selections.groupType.toLowerCase() === 'individual') {
      return 'low';
    }

    // Families and schools can handle medium crowds
    if (selections.groupType.toLowerCase() === 'family' || 
        selections.groupType.toLowerCase() === 'school') {
      return 'medium';
    }

    // Teens and adults can handle higher crowds
    if (selections.ageGroup.toLowerCase() === 'teens' || 
        selections.ageGroup.toLowerCase() === 'adults') {
      return 'high';
    }

    return 'medium';
  }

  /**
   * Determine accessibility needs
   */
  private static determineAccessibilityNeeds(selections: UserSelections): string[] {
    const needs: string[] = [];

    // Age-based accessibility needs
    if (selections.ageGroup.toLowerCase() === 'seniors') {
      needs.push('wheelchair-accessible', 'rest-areas', 'easy-navigation');
    }

    if (selections.ageGroup.toLowerCase() === 'kids') {
      needs.push('child-friendly', 'safe-environment', 'easy-reach');
    }

    // Group-based accessibility needs
    if (selections.groupType.toLowerCase() === 'family') {
      needs.push('family-friendly', 'stroller-accessible');
    }

    return needs;
  }

  /**
   * Extract special interests
   */
  private static extractSpecialInterests(selections: UserSelections): string[] {
    const specialInterests: string[] = [];

    // Add special interests based on age group
    if (selections.ageGroup.toLowerCase() === 'kids') {
      specialInterests.push('interactive-exhibits', 'hands-on-activities');
    }

    if (selections.ageGroup.toLowerCase() === 'teens') {
      specialInterests.push('technology', 'social-media-friendly');
    }

    if (selections.ageGroup.toLowerCase() === 'seniors') {
      specialInterests.push('quiet-spaces', 'cultural-heritage');
    }

    return specialInterests;
  }

  /**
   * Determine learning style
   */
  private static determineLearningStyle(learningStyle?: string): 'visual' | 'hands-on' | 'interactive' | 'passive' {
    if (!learningStyle) {
      return 'interactive'; // Default to interactive
    }

    switch (learningStyle.toLowerCase()) {
      case 'visual':
        return 'visual';
      case 'hands-on':
      case 'kinesthetic':
        return 'hands-on';
      case 'interactive':
        return 'interactive';
      case 'passive':
      case 'reading':
        return 'passive';
      default:
        return 'interactive';
    }
  }

  /**
   * Analyze energy level based on selections
   */
  private static analyzeEnergyLevel(selections: UserSelections): 'low' | 'medium' | 'high' {
    // Seniors typically have lower energy
    if (selections.ageGroup.toLowerCase() === 'seniors') {
      return 'low';
    }

    // Kids and teens have high energy
    if (selections.ageGroup.toLowerCase() === 'kids' || 
        selections.ageGroup.toLowerCase() === 'teens') {
      return 'high';
    }

    // Adults vary based on time and group
    if (selections.timeSlot.toLowerCase() === 'morning') {
      return 'high';
    }

    if (selections.groupType.toLowerCase() === 'individual') {
      return 'medium';
    }

    return 'medium';
  }

  /**
   * Analyze preferred pace
   */
  private static analyzePreferredPace(selections: UserSelections): 'slow' | 'moderate' | 'fast' {
    // Seniors prefer slower pace
    if (selections.ageGroup.toLowerCase() === 'seniors') {
      return 'slow';
    }

    // Kids and teens prefer faster pace
    if (selections.ageGroup.toLowerCase() === 'kids' || 
        selections.ageGroup.toLowerCase() === 'teens') {
      return 'fast';
    }

    // Adults vary based on group type
    if (selections.groupType.toLowerCase() === 'individual') {
      return 'moderate';
    }

    if (selections.groupType.toLowerCase() === 'family') {
      return 'slow';
    }

    return 'moderate';
  }

  /**
   * Analyze social preference
   */
  private static analyzeSocialPreference(selections: UserSelections): 'individual' | 'group' | 'mixed' {
    if (selections.groupType.toLowerCase() === 'individual') {
      return 'individual';
    }

    if (selections.groupType.toLowerCase() === 'family' || 
        selections.groupType.toLowerCase() === 'school') {
      return 'group';
    }

    return 'mixed';
  }

  /**
   * Update user profile based on new interactions
   */
  static updateProfileWithInteraction(
    profile: UserProfile, 
    interaction: UserInteraction
  ): UserProfile {
    return {
      ...profile,
      interactionHistory: [...profile.interactionHistory, interaction],
      preferences: this.updatePreferences(profile.preferences, interaction)
    };
  }

  /**
   * Update preferences based on interaction
   */
  private static updatePreferences(
    preferences: UserPreferences, 
    interaction: UserInteraction
  ): UserPreferences {
    // Adjust preferred duration based on actual time spent
    const newPreferredDuration = Math.round(
      (preferences.preferredDuration + interaction.timeSpent) / 2
    );

    return {
      ...preferences,
      preferredDuration: newPreferredDuration
    };
  }
} 