/**
 * UC Discovery Hub - User Profile Analyzer
 * Analyzes user selections and creates intelligent user profiles
 */

import {
  UserProfile,
  UserPreferences,
  UserInteraction,
  AgeGroup,
  GroupType,
  TimeSlot,
  LearningStyle,
  EnergyLevel,
  CrowdTolerance
} from '../core/types';
import { generateId, normalize, logAIEvent } from '../core/utils';

// ============================================================================
// USER PROFILE ANALYZER CLASS
// ============================================================================

export interface UserSelections {
  ageGroup: AgeGroup;
  groupType: GroupType;
  children?: boolean;
  childrenAge?: number[];
  interests: string[];
  timeSlot: TimeSlot;
  accessibilityNeeds?: string[];
  preferredDuration?: number;
  energyLevel?: EnergyLevel;
  crowdTolerance?: CrowdTolerance;
}

export interface AnalysisResult {
  userProfile: UserProfile;
  confidence: number;
  reasoning: string[];
  suggestedImprovements: string[];
}

export class UserProfileAnalyzer {
  private learningRate: number = 0.1;

  constructor() {
    logAIEvent('UserProfileAnalyzer initialized');
  }

  /**
   * Analyze user selections and create a comprehensive user profile
   */
  analyzeUserSelections(selections: UserSelections): AnalysisResult {
    logAIEvent('Starting user profile analysis', { selections });

    try {
      // Create base user profile
      const userProfile = this.createBaseProfile(selections);
      
      // Analyze demographics
      const demographicAnalysis = this.analyzeDemographics(selections);
      
      // Analyze interests
      const interestAnalysis = this.analyzeInterests(selections.interests);
      
      // Analyze behavior patterns
      const behaviorAnalysis = this.analyzeBehaviorPatterns(selections);
      
      // Merge analysis results
      const enhancedProfile = this.enhanceProfile(userProfile, {
        ...demographicAnalysis,
        ...interestAnalysis,
        ...behaviorAnalysis
      });

      // Calculate confidence score
      const confidence = this.calculateConfidence(selections, enhancedProfile);
      
      // Generate reasoning
      const reasoning = this.generateReasoning(selections, enhancedProfile);
      
      // Suggest improvements
      const suggestedImprovements = this.suggestImprovements(enhancedProfile);

      const result: AnalysisResult = {
        userProfile: enhancedProfile,
        confidence,
        reasoning,
        suggestedImprovements
      };

      logAIEvent('User profile analysis completed', { confidence, reasoningCount: reasoning.length });
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logAIEvent('Error in user profile analysis', { error: errorMessage });
      throw error;
    }
  }

  /**
   * Create base user profile
   */
  private createBaseProfile(selections: UserSelections): UserProfile {
    return {
      id: generateId(),
      ageGroup: selections.ageGroup,
      groupType: selections.groupType,
      children: selections.children || false,
      childrenAge: selections.childrenAge || [],
      interests: selections.interests,
      preferredCategories: [],
      timeSlot: selections.timeSlot,
      interactionHistory: [],
      preferences: {
        preferredPace: this.determinePreferredPace(selections),
        crowdTolerance: selections.crowdTolerance || 'medium',
        energyLevel: selections.energyLevel || 'medium',
        accessibilityNeeds: selections.accessibilityNeeds || [],
        preferredDuration: selections.preferredDuration || 180,
        maxWalkingDistance: this.calculateMaxWalkingDistance(selections)
      },
      learningStyle: this.determineLearningStyle(selections),
      lastUpdated: new Date(),
      confidenceScore: 0.8,
      adaptationRate: 0.1
    };
  }

  /**
   * Analyze demographic information
   */
  private analyzeDemographics(selections: UserSelections): any {
    const analysis = {
      ageGroupInsights: this.getAgeGroupInsights(selections.ageGroup),
      groupTypeInsights: this.getGroupTypeInsights(selections.groupType),
      familyConsiderations: this.getFamilyConsiderations(selections),
      accessibilityConsiderations: this.getAccessibilityConsiderations(selections)
    };

    return analysis;
  }

  /**
   * Analyze user interests
   */
  private analyzeInterests(interests: string[]): any {
    const analysis = {
      primaryInterests: this.identifyPrimaryInterests(interests),
      interestCategories: this.categorizeInterests(interests),
      learningPath: this.suggestLearningPath(interests),
      crossConnections: this.findCrossConnections(interests)
    };

    return analysis;
  }

  /**
   * Analyze behavior patterns
   */
  private analyzeBehaviorPatterns(selections: UserSelections): any {
    const analysis = {
      energyPattern: this.analyzeEnergyPattern(selections),
      timePattern: this.analyzeTimePattern(selections),
      socialPattern: this.analyzeSocialPattern(selections),
      learningPattern: this.analyzeLearningPattern(selections)
    };

    return analysis;
  }

  /**
   * Enhance profile with analysis results
   */
  private enhanceProfile(profile: UserProfile, analysis: any): UserProfile {
    // Enhance interests based on analysis
    const enhancedInterests = this.enhanceInterests(profile.interests, analysis.interestCategories);
    
    // Enhance preferences based on analysis
    const enhancedPreferences = this.enhancePreferences(profile.preferences, analysis);
    
    // Update learning style based on analysis
    const enhancedLearningStyle = this.enhanceLearningStyle(profile.learningStyle, analysis);

    return {
      ...profile,
      interests: enhancedInterests,
      preferences: enhancedPreferences,
      learningStyle: enhancedLearningStyle,
      lastUpdated: new Date()
    };
  }

  /**
   * Determine preferred pace based on selections
   */
  private determinePreferredPace(selections: UserSelections): 'slow' | 'moderate' | 'fast' {
    if (selections.groupType === 'family' && selections.children) {
      return 'slow';
    }
    
    if (selections.energyLevel === 'high') {
      return 'fast';
    }
    
    if (selections.energyLevel === 'low') {
      return 'slow';
    }
    
    return 'moderate';
  }

  /**
   * Calculate maximum walking distance
   */
  private calculateMaxWalkingDistance(selections: UserSelections): number {
    let baseDistance = 500; // meters
    
    // Adjust for age group
    switch (selections.ageGroup) {
      case 'kids':
        baseDistance = 300;
        break;
      case 'seniors':
        baseDistance = 400;
        break;
      case 'adults':
        baseDistance = 600;
        break;
      default:
        baseDistance = 500;
    }
    
    // Adjust for energy level
    switch (selections.energyLevel) {
      case 'high':
        baseDistance *= 1.5;
        break;
      case 'low':
        baseDistance *= 0.7;
        break;
    }
    
    // Adjust for group type
    if (selections.groupType === 'family') {
      baseDistance *= 0.8;
    }
    
    return Math.round(baseDistance);
  }

  /**
   * Determine learning style based on selections
   */
  private determineLearningStyle(selections: UserSelections): LearningStyle {
    // Analyze interests to determine learning style
    const interactiveKeywords = ['hands-on', 'experiments', 'building', 'creating'];
    const visualKeywords = ['art', 'design', 'visual', 'observation'];
    const digitalKeywords = ['technology', 'programming', 'digital', 'virtual'];
    
    const interests = selections.interests.join(' ').toLowerCase();
    
    if (interactiveKeywords.some(keyword => interests.includes(keyword))) {
      return 'hands-on';
    }
    
    if (visualKeywords.some(keyword => interests.includes(keyword))) {
      return 'visual';
    }
    
    if (digitalKeywords.some(keyword => interests.includes(keyword))) {
      return 'interactive';
    }
    
    return 'passive';
  }

  /**
   * Get age group insights
   */
  private getAgeGroupInsights(ageGroup: AgeGroup): string[] {
    const insights: { [key in AgeGroup]: string[] } = {
      kids: [
        'High energy and curiosity',
        'Short attention spans',
        'Hands-on learning preferred',
        'Visual and interactive content'
      ],
      teens: [
        'Technology-savvy',
        'Social learning important',
        'Challenging content preferred',
        'Peer interaction valuable'
      ],
      adults: [
        'Deeper learning focus',
        'Time-efficient experiences',
        'Educational value important',
        'Flexible scheduling'
      ],
      seniors: [
        'Accessibility important',
        'Comfortable pace preferred',
        'Educational value valued',
        'Social interaction important'
      ]
    };

    return insights[ageGroup] || [];
  }

  /**
   * Get group type insights
   */
  private getGroupTypeInsights(groupType: GroupType): string[] {
    const insights: { [key in GroupType]: string[] } = {
      individual: [
        'Self-paced learning',
        'Flexible scheduling',
        'Personalized experience',
        'Deep engagement possible'
      ],
      family: [
        'Multi-age considerations',
        'Group activities preferred',
        'Safety and accessibility',
        'Shared learning experiences'
      ],
      school: [
        'Educational focus',
        'Group coordination',
        'Structured learning',
        'Assessment opportunities'
      ],
      tourist: [
        'Time-limited experience',
        'Highlights and must-sees',
        'Cultural context',
        'Memorable experiences'
      ]
    };

    return insights[groupType] || [];
  }

  /**
   * Get family considerations
   */
  private getFamilyConsiderations(selections: UserSelections): string[] {
    if (selections.groupType !== 'family') return [];

    const considerations = [
      'Multi-age exhibit selection',
      'Safety considerations',
      'Rest areas needed',
      'Bathroom accessibility'
    ];

    if (selections.childrenAge) {
      considerations.push('Age-appropriate content selection');
      considerations.push('Engagement for all ages');
    }

    return considerations;
  }

  /**
   * Get accessibility considerations
   */
  private getAccessibilityConsiderations(selections: UserSelections): string[] {
    if (!selections.accessibilityNeeds || selections.accessibilityNeeds.length === 0) {
      return [];
    }

    return [
      'Wheelchair accessible routes',
      'Audio descriptions available',
      'Visual aids provided',
      'Assistance available'
    ];
  }

  /**
   * Categorize interests
   */
  private categorizeInterests(interests: string[]): { [category: string]: string[] } {
    const categories: { [category: string]: string[] } = {};
    
    interests.forEach(interest => {
      const category = this.getInterestCategory(interest);
      if (!categories[category]) {
        categories[category] = [];
      }
      if (categories[category]) {
        categories[category]!.push(interest);
      }
    });
    
    return categories;
  }

  /**
   * Identify primary interests
   */
  private identifyPrimaryInterests(interests: string[]): string[] {
    if (interests.length === 0) return [];
    
    const firstInterest = interests[0];
    if (!firstInterest) return [];
    
    const primaryCategory = this.getInterestCategory(firstInterest);
    return interests.filter(interest => 
      interest && this.getInterestCategory(interest) === primaryCategory
    ).filter((interest): interest is string => Boolean(interest));
  }

  /**
   * Get interest category
   */
  private getInterestCategory(interest: string): string {
    const categories = {
      'science': ['science', 'physics', 'chemistry', 'biology', 'astronomy', 'technology'],
      'art': ['art', 'painting', 'sculpture', 'music', 'dance', 'theater'],
      'history': ['history', 'archaeology', 'culture', 'heritage', 'ancient'],
      'nature': ['nature', 'animals', 'plants', 'environment', 'wildlife'],
      'space': ['space', 'astronomy', 'planets', 'stars', 'galaxy'],
      'interactive': ['interactive', 'hands-on', 'experiments', 'games'],
      'educational': ['educational', 'learning', 'knowledge', 'discovery']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => interest.toLowerCase().includes(keyword))) {
        return category;
      }
    }
    
    return 'general';
  }

  /**
   * Suggest learning path based on interests
   */
  private suggestLearningPath(interests: string[]): string[] {
    if (interests.length === 0) return ['Explore general interests'];
    
    const paths: { [category: string]: string[] } = {
      'science': ['Start with basic concepts', 'Build foundational knowledge', 'Apply to real-world problems'],
      'art': ['Explore creative expression', 'Develop artistic skills', 'Connect with cultural heritage'],
      'history': ['Discover historical timelines', 'Understand cultural context', 'Learn from past events'],
      'nature': ['Observe natural phenomena', 'Understand ecosystems', 'Connect with environment'],
      'space': ['Learn about astronomy', 'Explore cosmic phenomena', 'Understand space exploration'],
      'interactive': ['Engage with hands-on activities', 'Experiment with concepts', 'Apply learning through play'],
      'educational': ['Build knowledge systematically', 'Connect concepts across subjects', 'Apply learning in context']
    };

    const firstInterest = interests[0];
    if (!firstInterest) return ['Explore general interests'];
    
    const primaryCategory = this.getInterestCategory(firstInterest);
    return paths[primaryCategory] || ['Explore interests', 'Build knowledge', 'Apply learning'];
  }

  /**
   * Find cross connections between interests
   */
  private findCrossConnections(interests: string[]): string[] {
    const connections: string[] = [];
    
    // Simple cross-connection logic
    if (interests.some(i => i.includes('art')) && interests.some(i => i.includes('science'))) {
      connections.push('Art and science integration');
    }
    
    if (interests.some(i => i.includes('technology')) && interests.some(i => i.includes('nature'))) {
      connections.push('Technology in nature observation');
    }
    
    return connections;
  }

  /**
   * Analyze energy pattern
   */
  private analyzeEnergyPattern(selections: UserSelections): any {
    return {
      energyLevel: selections.energyLevel || 'medium',
      stamina: this.calculateStamina(selections),
      restNeeds: this.calculateRestNeeds(selections)
    };
  }

  /**
   * Analyze time pattern
   */
  private analyzeTimePattern(selections: UserSelections): any {
    return {
      timeSlot: selections.timeSlot,
      duration: selections.preferredDuration || 120,
      efficiency: this.calculateTimeEfficiency(selections)
    };
  }

  /**
   * Analyze social pattern
   */
  private analyzeSocialPattern(selections: UserSelections): any {
    return {
      groupType: selections.groupType,
      socialInteraction: this.determineSocialInteraction(selections),
      collaboration: this.determineCollaboration(selections)
    };
  }

  /**
   * Analyze learning pattern
   */
  private analyzeLearningPattern(selections: UserSelections): any {
    return {
      learningStyle: this.determineLearningStyle(selections),
      engagement: this.calculateEngagement(selections),
      retention: this.calculateRetention(selections)
    };
  }

  /**
   * Calculate stamina based on selections
   */
  private calculateStamina(selections: UserSelections): number {
    let stamina = 0.7; // Base stamina
    
    // Adjust for age group
    switch (selections.ageGroup) {
      case 'kids':
        stamina = 0.8;
        break;
      case 'teens':
        stamina = 0.9;
        break;
      case 'adults':
        stamina = 0.7;
        break;
      case 'seniors':
        stamina = 0.5;
        break;
    }
    
    // Adjust for energy level
    switch (selections.energyLevel) {
      case 'high':
        stamina *= 1.2;
        break;
      case 'low':
        stamina *= 0.8;
        break;
    }
    
    return normalize(stamina, 0, 1);
  }

  /**
   * Calculate rest needs
   */
  private calculateRestNeeds(selections: UserSelections): number {
    let restNeeds = 0.3; // Base rest needs
    
    // Adjust for age group
    switch (selections.ageGroup) {
      case 'kids':
        restNeeds = 0.4;
        break;
      case 'seniors':
        restNeeds = 0.6;
        break;
    }
    
    // Adjust for energy level
    switch (selections.energyLevel) {
      case 'low':
        restNeeds *= 1.3;
        break;
      case 'high':
        restNeeds *= 0.7;
        break;
    }
    
    return normalize(restNeeds, 0, 1);
  }

  /**
   * Calculate time efficiency
   */
  private calculateTimeEfficiency(selections: UserSelections): number {
    let efficiency = 0.7; // Base efficiency
    
    // Adjust for group type
    switch (selections.groupType) {
      case 'individual':
        efficiency = 0.9;
        break;
      case 'family':
        efficiency = 0.6;
        break;
      case 'school':
        efficiency = 0.8;
        break;
      case 'tourist':
        efficiency = 0.7;
        break;
    }
    
    return normalize(efficiency, 0, 1);
  }

  /**
   * Determine social interaction level
   */
  private determineSocialInteraction(selections: UserSelections): 'low' | 'medium' | 'high' {
    switch (selections.groupType) {
      case 'individual':
        return 'low';
      case 'family':
        return 'medium';
      case 'school':
        return 'high';
      case 'tourist':
        return 'medium';
      default:
        return 'medium';
    }
  }

  /**
   * Determine collaboration level
   */
  private determineCollaboration(selections: UserSelections): 'low' | 'medium' | 'high' {
    switch (selections.groupType) {
      case 'individual':
        return 'low';
      case 'family':
        return 'medium';
      case 'school':
        return 'high';
      case 'tourist':
        return 'low';
      default:
        return 'medium';
    }
  }

  /**
   * Calculate engagement level
   */
  private calculateEngagement(selections: UserSelections): number {
    let engagement = 0.7; // Base engagement
    
    // Adjust for interests count
    engagement += selections.interests.length * 0.05;
    
    // Adjust for learning style
    const learningStyle = this.determineLearningStyle(selections);
    switch (learningStyle) {
      case 'hands-on':
        engagement *= 1.2;
        break;
      case 'interactive':
        engagement *= 1.1;
        break;
      case 'visual':
        engagement *= 1.0;
        break;
      case 'passive':
        engagement *= 0.8;
        break;
    }
    
    return normalize(engagement, 0, 1);
  }

  /**
   * Calculate retention level
   */
  private calculateRetention(selections: UserSelections): number {
    let retention = 0.6; // Base retention
    
    // Adjust for age group
    switch (selections.ageGroup) {
      case 'kids':
        retention = 0.5;
        break;
      case 'teens':
        retention = 0.7;
        break;
      case 'adults':
        retention = 0.8;
        break;
      case 'seniors':
        retention = 0.6;
        break;
    }
    
    return normalize(retention, 0, 1);
  }

  /**
   * Enhance interests based on analysis
   */
  private enhanceInterests(interests: string[], analysis: any): string[] {
    const enhanced = [...interests];
    
    // Add cross-connections as interests
    if (analysis.crossConnections) {
      enhanced.push(...analysis.crossConnections);
    }
    
    return enhanced;
  }

  /**
   * Enhance preferences based on analysis
   */
  private enhancePreferences(preferences: UserPreferences, analysis: any): UserPreferences {
    return {
      ...preferences,
      preferredDuration: analysis.timePattern?.duration || preferences.preferredDuration,
      energyLevel: analysis.energyPattern?.energyLevel || preferences.energyLevel
    };
  }

  /**
   * Enhance learning style based on analysis
   */
  private enhanceLearningStyle(learningStyle: LearningStyle, analysis: any): LearningStyle {
    // Simple enhancement based on learning pattern
    if (analysis.learningPattern?.engagement > 0.8) {
      return 'interactive';
    }
    
    return learningStyle;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(_selections: UserSelections, _profile: UserProfile): number {
    // Simple confidence calculation based on profile completeness
    return 0.8;
  }

  /**
   * Generate reasoning for analysis
   */
  private generateReasoning(selections: UserSelections, profile: UserProfile): string[] {
    const reasoning: string[] = [];
    
    // Age group reasoning
    reasoning.push(`Analyzed ${selections.ageGroup} preferences and learning patterns`);
    
    // Group type reasoning
    reasoning.push(`Considered ${selections.groupType} dynamics and coordination needs`);
    
    // Interest reasoning
    reasoning.push(`Identified ${selections.interests.length} primary interests and their categories`);
    
    // Learning style reasoning
    reasoning.push(`Determined optimal learning style: ${profile.learningStyle}`);
    
    // Time reasoning
    reasoning.push(`Optimized for ${selections.timeSlot} time slot and ${profile.preferences.preferredDuration} minutes duration`);
    
    return reasoning;
  }

  /**
   * Suggest improvements for the profile
   */
  private suggestImprovements(profile: UserProfile): string[] {
    const suggestions: string[] = [];
    
    // Suggest based on confidence
    if (profile.confidenceScore < 0.8) {
      suggestions.push('Consider providing more specific interests for better recommendations');
    }
    
    // Suggest based on learning style
    if (profile.learningStyle === 'passive') {
      suggestions.push('Consider more interactive exhibits to increase engagement');
    }
    
    // Suggest based on group type
    if (profile.groupType === 'family' && !profile.children) {
      suggestions.push('Consider family-friendly exhibits for group enjoyment');
    }
    
    return suggestions;
  }

  /**
   * Update profile based on user interaction
   */
  updateProfileWithInteraction(profile: UserProfile, interaction: UserInteraction): UserProfile {
    const updatedProfile = { ...profile };
    
    // Add interaction to history
    updatedProfile.interactionHistory.push(interaction);
    
    // Update preferences based on interaction
    if (interaction.satisfaction > 7) {
      // Positive interaction - reinforce preferences
      updatedProfile.confidenceScore = Math.min(1, updatedProfile.confidenceScore + this.learningRate);
    } else if (interaction.satisfaction < 4) {
      // Negative interaction - adjust preferences
      updatedProfile.confidenceScore = Math.max(0, updatedProfile.confidenceScore - this.learningRate);
    }
    
    // Update last updated timestamp
    updatedProfile.lastUpdated = new Date();
    
    logAIEvent('Profile updated with interaction', { 
      exhibitId: interaction.exhibitId, 
      satisfaction: interaction.satisfaction,
      newConfidence: updatedProfile.confidenceScore 
    });
    
    return updatedProfile;
  }
} 