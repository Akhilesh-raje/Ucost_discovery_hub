/**
 * UC Discovery Hub - AI System Type Definitions
 * Core types and interfaces for the AI system
 */

// ============================================================================
// USER PROFILE TYPES
// ============================================================================

export type AgeGroup = 'kids' | 'teens' | 'adults' | 'seniors';
export type GroupType = 'individual' | 'family' | 'school' | 'tourist';
export type TimeSlot = 'morning' | 'afternoon' | 'full-day';
export type LearningStyle = 'visual' | 'hands-on' | 'interactive' | 'passive';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type CrowdTolerance = 'low' | 'medium' | 'high';

export interface UserPreferences {
  preferredPace: 'slow' | 'moderate' | 'fast';
  crowdTolerance: CrowdTolerance;
  energyLevel: EnergyLevel;
  accessibilityNeeds: string[];
  preferredDuration: number; // minutes
  maxWalkingDistance: number; // meters
}

export interface UserInteraction {
  exhibitId: string;
  timestamp: Date;
  duration: number; // seconds
  interactionType: 'viewing' | 'interacting' | 'learning' | 'resting';
  satisfaction: number; // 1-10
  engagement: number; // 1-10
  notes?: string;
}

export interface UserProfile {
  id: string;
  
  // Demographics
  ageGroup: AgeGroup;
  groupType: GroupType;
  children: boolean;
  childrenAge?: number[];
  
  // Interests
  interests: string[];
  preferredCategories: string[];
  timeSlot: TimeSlot;
  
  // Behavior
  interactionHistory: UserInteraction[];
  preferences: UserPreferences;
  learningStyle: LearningStyle;
  
  // AI Learning
  lastUpdated: Date;
  confidenceScore: number; // 0-1
  adaptationRate: number; // 0-1
}

// ============================================================================
// EXHIBIT INTELLIGENCE TYPES
// ============================================================================

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type GroupSize = 'individual' | 'small-group' | 'large-group';
export type InteractionType = 'hands-on' | 'visual' | 'audio' | 'digital';
export type CrowdLevel = 'low' | 'medium' | 'high';

export interface AgeRange {
  min: number;
  max: number;
  recommended: number[];
}

export interface Location {
  floor: string;
  coordinates: { x: number; y: number };
  accessibility: boolean;
  crowdLevel: CrowdLevel;
  nearbyFacilities: string[];
}

export interface ExhibitAI {
  id: string;
  name: string;
  category: string;
  description: string;
  
  // AI Scoring
  popularityScore: number; // 0-1
  educationalValue: number; // 0-1
  entertainmentValue: number; // 0-1
  accessibilityScore: number; // 0-1
  
  // Target Audience
  ageRange: AgeRange;
  difficultyLevel: DifficultyLevel;
  groupSize: GroupSize;
  
  // Features
  features: string[];
  interactionType: InteractionType;
  duration: number; // minutes
  capacity: number; // max visitors
  
  // Location Intelligence
  location: Location;
  
  // Content Tags
  tags: string[];
  themes: string[];
  learningOutcomes: string[];
  
  // AI Metadata
  lastUpdated: Date;
  visitCount: number;
  averageRating: number;
  averageDuration: number;
}

// ============================================================================
// TOUR OPTIMIZATION TYPES
// ============================================================================

export interface TourStop {
  exhibitId: string;
  order: number;
  estimatedDuration: number; // minutes
  estimatedArrival: Date;
  estimatedDeparture: Date;
  walkingDistance: number; // meters
  crowdPrediction: CrowdLevel;
}

export interface OptimizedTour {
  id: string;
  stops: TourStop[];
  totalDuration: number; // minutes
  totalDistance: number; // meters
  efficiency: number; // 0-1
  satisfaction: number; // 0-1
  crowdAvoidance: number; // 0-1
  restStops: number;
  accessibilityScore: number; // 0-1
}

export interface TourConstraints {
  maxDuration: number; // minutes
  maxDistance: number; // meters
  mustInclude: string[]; // exhibit IDs
  mustExclude: string[]; // exhibit IDs
  preferredCategories: string[];
  accessibilityRequired: boolean;
}

// ============================================================================
// RECOMMENDATION TYPES
// ============================================================================

export interface ExhibitRecommendation {
  exhibit: ExhibitAI;
  relevanceScore: number; // 0-1
  matchReasons: string[];
  confidence: number; // 0-1
  alternativeTo?: string; // exhibit ID
}

export interface TourRecommendation {
  tour: OptimizedTour;
  confidence: number; // 0-1
  alternatives: OptimizedTour[];
  reasoning: string[];
}

export interface AdaptiveRecommendation {
  currentRecommendations: ExhibitRecommendation[];
  alternatives: ExhibitRecommendation[];
  reasoning: string[];
  confidenceScore: number; // 0-1
  context: RecommendationContext;
}

export interface RecommendationContext {
  currentLocation?: Location;
  remainingTime: number; // minutes
  energyLevel: EnergyLevel;
  currentExhibit?: string;
  recentInteractions: UserInteraction[];
  weatherConditions?: string;
  specialEvents?: string[];
}

// ============================================================================
// AI SYSTEM TYPES
// ============================================================================

export interface AIConfig {
  // Learning parameters
  learningRate: number; // 0-1
  adaptationSpeed: number; // 0-1
  
  // Scoring weights
  interestWeight: number; // 0-1
  ageWeight: number; // 0-1
  timeWeight: number; // 0-1
  crowdWeight: number; // 0-1
  
  // Tour optimization
  populationSize: number;
  generations: number;
  mutationRate: number; // 0-1
  
  // Real-time adaptation
  behaviorTracking: boolean;
  contextAwareness: boolean;
  dynamicRouting: boolean;
}

export interface AIAnalysisResult {
  userProfile: UserProfile;
  recommendations: ExhibitRecommendation[];
  tourRecommendation: TourRecommendation;
  adaptiveRecommendations: AdaptiveRecommendation;
  confidence: number; // 0-1
  reasoning: string[];
}

export interface AIReport {
  id: string;
  type: 'user-analysis' | 'exhibit-analysis' | 'tour-analysis' | 'learning-insights';
  data: any;
  createdAt: Date;
  peerId?: string;
}

export interface UserAnalysisReport {
  profile: UserProfile;
  behaviorPatterns: string[];
  learningInsights: string[];
  recommendations: string[];
  predictedSatisfaction: number; // 1-10
  returnProbability: number; // 0-1
}

export interface ExhibitAnalysisReport {
  exhibit: ExhibitAI;
  popularityTrends: number[];
  userSatisfaction: number; // 1-10
  improvementSuggestions: string[];
  targetAudience: AgeGroup[];
}

export interface TourAnalysisReport {
  tour: OptimizedTour;
  efficiency: number; // 0-1
  userSatisfaction: number; // 1-10
  optimizationSuggestions: string[];
  alternativeRoutes: OptimizedTour[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface Point {
  x: number;
  y: number;
}

export interface Distance {
  from: string;
  to: string;
  distance: number; // meters
  time: number; // minutes
}

export interface TimeWindow {
  start: Date;
  end: Date;
  duration: number; // minutes
}

export interface PerformanceMetrics {
  responseTime: number; // milliseconds
  accuracy: number; // 0-1
  precision: number; // 0-1
  recall: number; // 0-1
  f1Score: number; // 0-1
}

export interface AILearningData {
  userId: string;
  interactions: UserInteraction[];
  recommendations: ExhibitRecommendation[];
  actualSatisfaction: number; // 1-10
  feedback: string;
  timestamp: Date;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface AIEvent {
  type: 'user-interaction' | 'recommendation-generated' | 'tour-optimized' | 'learning-updated';
  data: any;
  timestamp: Date;
  userId?: string;
}

export interface AIError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
} 