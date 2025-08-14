/**
 * UC Discovery Hub - Smart Recommendation Engine
 * Provides real-time adaptive recommendations based on user behavior
 */

import {
  UserProfile,
  ExhibitRecommendation,
  RecommendationContext
} from '../core/types';
import { 
  clamp,
  logAIEvent 
} from '../core/utils';

// ============================================================================
// SMART RECOMMENDATION ENGINE CLASS
// ============================================================================

export interface AdaptiveConfig {
  learningRate: number;
  adaptationSpeed: number;
  contextWeight: number;
  historyWeight: number;
  energyWeight: number;
  timeWeight: number;
}

export interface AdaptiveResult {
  currentRecommendations: ExhibitRecommendation[];
  alternatives: ExhibitRecommendation[];
  reasoning: string[];
  confidenceScore: number;
  context: RecommendationContext;
}

class SmartRecommendationEngine {
  private config: AdaptiveConfig;

  constructor(config?: Partial<AdaptiveConfig>) {
    this.config = {
      learningRate: 0.1,
      adaptationSpeed: 0.05,
      contextWeight: 0.3,
      historyWeight: 0.4,
      energyWeight: 0.2,
      timeWeight: 0.1,
      ...config
    };

    logAIEvent('SmartRecommendationEngine initialized', { config: this.config });
  }

  /**
   * Generate adaptive recommendations
   */
  generateAdaptiveRecommendations(
    userProfile: UserProfile,
    _currentRecommendations: ExhibitRecommendation[],
    context: RecommendationContext
  ): AdaptiveResult {
    logAIEvent('Generating adaptive recommendations', {
      userId: userProfile.id,
      context
    });

    try {
      // Analyze current context
      const energyTrend = this.analyzeEnergyTrend(userProfile, context);
      const timeUtilization = this.analyzeTimeUtilization(userProfile, context);
      const satisfactionTrend = this.analyzeSatisfactionTrend(userProfile, context);
      const engagementTrend = this.analyzeEngagementTrend(userProfile, context);

      // Generate alternatives based on context
      const timeBasedAlternatives = this.generateTimeBasedAlternatives(userProfile, context);
      const energyBasedAlternatives = this.generateEnergyBasedAlternatives(userProfile, context);

      // Combine alternatives
      const alternatives = [...timeBasedAlternatives, ...energyBasedAlternatives];

      // Calculate confidence score
      const confidenceScore = this.calculateAdaptiveConfidence(
        energyTrend,
        timeUtilization,
        satisfactionTrend,
        engagementTrend
      );

      // Generate reasoning
      const reasoning = this.generateAdaptiveReasoning(
        energyTrend,
        timeUtilization,
        satisfactionTrend,
        engagementTrend
      );

      const result: AdaptiveResult = {
        currentRecommendations: [],
        alternatives,
        reasoning,
        confidenceScore,
        context
      };

      logAIEvent('Adaptive recommendations generated', {
        userId: userProfile.id,
        alternativesCount: alternatives.length,
        confidenceScore
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logAIEvent('Error generating adaptive recommendations', { error: errorMessage });
      
      return {
        currentRecommendations: [],
        alternatives: [],
        reasoning: ['Error occurred during adaptive recommendation generation'],
        confidenceScore: 0,
        context
      };
    }
  }

  /**
   * Update recommendations based on user interaction
   */
  updateRecommendationsWithInteraction(
    userProfile: UserProfile,
    recommendations: ExhibitRecommendation[],
    interaction: {
      exhibitId: string;
      satisfaction: number;
      duration: number;
      engagement: number;
    }
  ): void {
    logAIEvent('Updating recommendations with interaction', {
      userId: userProfile.id,
      exhibitId: interaction.exhibitId,
      satisfaction: interaction.satisfaction
    });

    // Find the interacted exhibit
    const recommendation = recommendations.find(rec => rec.exhibit.id === interaction.exhibitId);
    
    if (recommendation) {
      // Update recommendation confidence based on interaction
      const satisfactionWeight = interaction.satisfaction / 10;
      const engagementWeight = interaction.engagement / 10;
      const durationWeight = Math.min(interaction.duration / 30, 1); // Normalize to 30 minutes max
      
      const newConfidence = (recommendation.confidence + satisfactionWeight + engagementWeight + durationWeight) / 4;
      recommendation.confidence = clamp(newConfidence, 0, 1);

      // Adjust weights based on interaction quality
      if (interaction.satisfaction >= 7) {
        this.adjustWeightsForPositiveInteraction(recommendation);
      } else if (interaction.satisfaction <= 4) {
        this.adjustWeightsForNegativeInteraction(recommendation);
      }

      logAIEvent('Recommendations updated with interaction', {
        userId: userProfile.id,
        exhibitId: interaction.exhibitId,
        newConfidence: recommendation.confidence
      });
    }
  }

  /**
   * Analyze energy trend from user interactions
   */
  private analyzeEnergyTrend(_userProfile: UserProfile, _context: RecommendationContext): 'increasing' | 'decreasing' | 'stable' {
    // Simulate energy trend analysis based on recent interactions
    const energyScores = [0.7, 0.8, 0.6, 0.9, 0.7]; // Mock data
    
    if (energyScores.length < 2) return 'stable';
    
    const lastScore = energyScores[energyScores.length - 1];
    const firstScore = energyScores[0];
    
    if (lastScore === undefined || firstScore === undefined) {
      return 'stable';
    }
    
    const trend = lastScore - firstScore;
    
    if (trend > 0.1) return 'increasing';
    if (trend < -0.1) return 'decreasing';
    return 'stable';
  }

  /**
   * Analyze time utilization patterns
   */
  private analyzeTimeUtilization(_userProfile: UserProfile, context: RecommendationContext): number {
    // Simulate time utilization analysis
    const timeUtilization = context.remainingTime / 180; // Normalize to 3 hours max
    return clamp(timeUtilization, 0, 1);
  }

  /**
   * Analyze satisfaction trend from user interactions
   */
  private analyzeSatisfactionTrend(_userProfile: UserProfile, _context: RecommendationContext): 'improving' | 'declining' | 'stable' {
    // Simulate satisfaction trend analysis
    const satisfactionScores = [7, 8, 6, 9, 8]; // Mock data
    
    if (satisfactionScores.length < 2) return 'stable';
    
    const lastScore = satisfactionScores[satisfactionScores.length - 1];
    const firstScore = satisfactionScores[0];
    
    if (lastScore === undefined || firstScore === undefined) {
      return 'stable';
    }
    
    const trend = lastScore - firstScore;
    
    if (trend > 1) return 'improving';
    if (trend < -1) return 'declining';
    return 'stable';
  }

  /**
   * Analyze engagement trend from user interactions
   */
  private analyzeEngagementTrend(_userProfile: UserProfile, _context: RecommendationContext): 'high' | 'medium' | 'low' {
    // Simulate engagement trend analysis
    const engagementScores = [0.8, 0.9, 0.7, 0.8, 0.9]; // Mock data
    
    if (engagementScores.length === 0) return 'medium';
    
    const lastScore = engagementScores[engagementScores.length - 1];
    const firstScore = engagementScores[0];
    
    if (lastScore === undefined || firstScore === undefined) {
      return 'medium';
    }
    
    const averageEngagement = engagementScores.reduce((sum, score) => sum + (score || 0), 0) / engagementScores.length;
    
    if (averageEngagement >= 0.8) return 'high';
    if (averageEngagement >= 0.6) return 'medium';
    return 'low';
  }

  /**
   * Generate time-based alternatives
   */
  private generateTimeBasedAlternatives(_userProfile: UserProfile, _context: RecommendationContext): ExhibitRecommendation[] {
    // Simulate time-based alternative generation
    return [];
  }

  /**
   * Generate energy-based alternatives
   */
  private generateEnergyBasedAlternatives(_userProfile: UserProfile, _context: RecommendationContext): ExhibitRecommendation[] {
    // Simulate energy-based alternative generation
    return [];
  }

  /**
   * Calculate adaptive confidence score
   */
  private calculateAdaptiveConfidence(
    energyTrend: 'increasing' | 'decreasing' | 'stable',
    timeUtilization: number,
    satisfactionTrend: 'improving' | 'declining' | 'stable',
    engagementTrend: 'high' | 'medium' | 'low'
  ): number {
    // Calculate confidence based on multiple factors
    const baseConfidence = 0.5; // Placeholder, actual calculation would involve currentRecommendations
    
    const energyFactor = energyTrend === 'increasing' ? 1.1 : energyTrend === 'decreasing' ? 0.9 : 1.0;
    const timeFactor = timeUtilization > 0.5 ? 1.0 : 0.8;
    const satisfactionFactor = satisfactionTrend === 'improving' ? 1.1 : satisfactionTrend === 'declining' ? 0.9 : 1.0;
    const engagementFactor = engagementTrend === 'high' ? 1.1 : engagementTrend === 'medium' ? 1.0 : 0.9;
    
    const adaptiveConfidence = baseConfidence * energyFactor * timeFactor * satisfactionFactor * engagementFactor;
    
    return clamp(adaptiveConfidence, 0, 1);
  }

  /**
   * Generate adaptive reasoning
   */
  private generateAdaptiveReasoning(
    energyTrend: 'increasing' | 'decreasing' | 'stable',
    timeUtilization: number,
    satisfactionTrend: 'improving' | 'declining' | 'stable',
    engagementTrend: 'high' | 'medium' | 'low'
  ): string[] {
    const reasoning: string[] = [];

    // Add energy-based reasoning
    if (energyTrend === 'increasing') {
      reasoning.push('Your energy levels are increasing - great time for interactive exhibits');
    } else if (energyTrend === 'decreasing') {
      reasoning.push('Energy levels are decreasing - consider more passive exhibits');
    }

    // Add time-based reasoning
    if (timeUtilization > 0.7) {
      reasoning.push('You\'re making excellent use of your time');
    } else if (timeUtilization < 0.3) {
      reasoning.push('Consider spending more time at each exhibit');
    }

    // Add satisfaction-based reasoning
    if (satisfactionTrend === 'improving') {
      reasoning.push('Your satisfaction is improving - recommendations are working well');
    } else if (satisfactionTrend === 'declining') {
      reasoning.push('Satisfaction is declining - we\'ll adjust recommendations');
    }

    // Add engagement-based reasoning
    if (engagementTrend === 'high') {
      reasoning.push('High engagement detected - you\'re very involved');
    } else if (engagementTrend === 'low') {
      reasoning.push('Low engagement - we\'ll suggest more interactive options');
    }

    return reasoning;
  }

  /**
   * Adjust weights for positive interaction
   */
  private adjustWeightsForPositiveInteraction(_recommendation: ExhibitRecommendation): void {
    // Simulate weight adjustment for positive feedback
  }

  /**
   * Adjust weights for negative interaction
   */
  private adjustWeightsForNegativeInteraction(_recommendation: ExhibitRecommendation): void {
    // Simulate weight adjustment for negative feedback
  }

  /**
   * Get current configuration
   */
  getConfig(): AdaptiveConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AdaptiveConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logAIEvent('SmartRecommendationEngine config updated', { newConfig });
  }
}

export { SmartRecommendationEngine }; 