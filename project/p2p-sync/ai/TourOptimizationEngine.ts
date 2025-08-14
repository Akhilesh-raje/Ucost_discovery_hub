/**
 * UC Discovery Hub - Tour Optimization Engine
 * Creates optimal tour routes and manages time efficiently
 */

import { UserProfile } from './UserProfileAnalyzer';
import { ExhibitAI, ExhibitMatch } from './ExhibitMatchingEngine';

export interface TourRoute {
  route: ExhibitAI[];
  timeEstimates: TimeEstimate[];
  restStops: RestStop[];
  alternatives: ExhibitAI[];
  totalDuration: number;
  efficiency: number;
  crowdOptimization: number;
}

export interface TimeEstimate {
  exhibitId: string;
  exhibitName: string;
  estimatedTime: number;
  actualTime?: number;
  crowdLevel: 'low' | 'medium' | 'high';
}

export interface RestStop {
  location: string;
  duration: number;
  reason: string;
}

export interface TourOptimizationParams {
  userProfile: UserProfile;
  selectedExhibits: ExhibitAI[];
  timeConstraint: number; // minutes
  preferences: {
    includeRestStops: boolean;
    optimizeForCrowds: boolean;
    preferPopularExhibits: boolean;
    balanceCategories: boolean;
  };
}

export class TourOptimizationEngine {
  
  /**
   * Create optimal tour route based on user preferences
   */
  static createOptimalTour(params: TourOptimizationParams): TourRoute {
    const { userProfile, selectedExhibits, timeConstraint, preferences } = params;
    
    // Calculate distance matrix between exhibits
    const distanceMatrix = this.calculateDistanceMatrix(selectedExhibits);
    
    // Calculate time matrix based on user profile
    const timeMatrix = this.calculateTimeMatrix(selectedExhibits, userProfile);
    
    // Apply genetic algorithm for route optimization
    const optimizedRoute = this.geneticAlgorithmOptimization(
      selectedExhibits,
      distanceMatrix,
      timeMatrix,
      userProfile,
      timeConstraint,
      preferences
    );
    
    // Calculate time estimates
    const timeEstimates = this.calculateTimeEstimates(optimizedRoute, userProfile);
    
    // Add rest stops if needed
    const restStops = preferences.includeRestStops ? 
      this.suggestRestStops(optimizedRoute, userProfile, timeConstraint) : [];
    
    // Generate alternatives
    const alternatives = this.generateAlternatives(selectedExhibits, optimizedRoute, userProfile);
    
    // Calculate efficiency metrics
    const totalDuration = timeEstimates.reduce((sum, estimate) => sum + estimate.estimatedTime, 0);
    const efficiency = this.calculateEfficiency(optimizedRoute, totalDuration, timeConstraint);
    const crowdOptimization = this.calculateCrowdOptimization(timeEstimates);
    
    return {
      route: optimizedRoute,
      timeEstimates,
      restStops,
      alternatives,
      totalDuration,
      efficiency,
      crowdOptimization
    };
  }

  /**
   * Calculate distance matrix between exhibits
   */
  private static calculateDistanceMatrix(exhibits: ExhibitAI[]): number[][] {
    const matrix: number[][] = [];
    
    for (let i = 0; i < exhibits.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < exhibits.length; j++) {
        if (i === j) {
          matrix[i][j] = 0;
        } else {
          matrix[i][j] = this.calculateDistance(exhibits[i], exhibits[j]);
        }
      }
    }
    
    return matrix;
  }

  /**
   * Calculate distance between two exhibits
   */
  private static calculateDistance(exhibit1: ExhibitAI, exhibit2: ExhibitAI): number {
    const dx = exhibit1.location.coordinates.x - exhibit2.location.coordinates.x;
    const dy = exhibit1.location.coordinates.y - exhibit2.location.coordinates.y;
    
    // Add penalty for different floors
    const floorPenalty = exhibit1.location.floor !== exhibit2.location.floor ? 50 : 0;
    
    return Math.sqrt(dx * dx + dy * dy) + floorPenalty;
  }

  /**
   * Calculate time matrix based on user profile
   */
  private static calculateTimeMatrix(exhibits: ExhibitAI[], userProfile: UserProfile): number[][] {
    const matrix: number[][] = [];
    
    for (let i = 0; i < exhibits.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < exhibits.length; j++) {
        if (i === j) {
          matrix[i][j] = exhibits[i].duration;
        } else {
          // Travel time + exhibit duration
          const travelTime = this.calculateTravelTime(exhibits[i], exhibits[j], userProfile);
          matrix[i][j] = travelTime + exhibits[j].duration;
        }
      }
    }
    
    return matrix;
  }

  /**
   * Calculate travel time between exhibits
   */
  private static calculateTravelTime(exhibit1: ExhibitAI, exhibit2: ExhibitAI, userProfile: UserProfile): number {
    const distance = this.calculateDistance(exhibit1, exhibit2);
    const baseSpeed = 100; // units per minute
    
    // Adjust speed based on user profile
    let speedMultiplier = 1.0;
    
    switch (userProfile.ageGroup) {
      case 'kids':
        speedMultiplier = 0.7; // Kids move slower
        break;
      case 'teens':
        speedMultiplier = 1.2; // Teens move faster
        break;
      case 'adults':
        speedMultiplier = 1.0; // Standard speed
        break;
      case 'seniors':
        speedMultiplier = 0.6; // Seniors move slower
        break;
    }
    
    // Adjust for group type
    switch (userProfile.groupType) {
      case 'family':
        speedMultiplier *= 0.8; // Families move slower
        break;
      case 'school':
        speedMultiplier *= 0.9; // School groups move slower
        break;
      case 'individual':
        speedMultiplier *= 1.1; // Individuals move faster
        break;
    }
    
    return Math.round(distance / (baseSpeed * speedMultiplier));
  }

  /**
   * Genetic algorithm for route optimization
   */
  private static geneticAlgorithmOptimization(
    exhibits: ExhibitAI[],
    distanceMatrix: number[][],
    timeMatrix: number[][],
    userProfile: UserProfile,
    timeConstraint: number,
    preferences: any
  ): ExhibitAI[] {
    const populationSize = 50;
    const generations = 100;
    const mutationRate = 0.1;
    
    // Initialize population
    let population = this.initializePopulation(exhibits, populationSize);
    
    // Evolve population
    for (let generation = 0; generation < generations; generation++) {
      population = this.evolvePopulation(
        population,
        distanceMatrix,
        timeMatrix,
        userProfile,
        timeConstraint,
        preferences,
        mutationRate
      );
    }
    
    // Return best route
    return this.getBestRoute(population, distanceMatrix, timeMatrix, userProfile, timeConstraint, preferences);
  }

  /**
   * Initialize population for genetic algorithm
   */
  private static initializePopulation(exhibits: ExhibitAI[], size: number): ExhibitAI[][] {
    const population: ExhibitAI[][] = [];
    
    for (let i = 0; i < size; i++) {
      // Create random route
      const route = [...exhibits].sort(() => Math.random() - 0.5);
      population.push(route);
    }
    
    return population;
  }

  /**
   * Evolve population using genetic algorithm
   */
  private static evolvePopulation(
    population: ExhibitAI[][],
    distanceMatrix: number[][],
    timeMatrix: number[][],
    userProfile: UserProfile,
    timeConstraint: number,
    preferences: any,
    mutationRate: number
  ): ExhibitAI[][] {
    const newPopulation: ExhibitAI[][] = [];
    
    // Keep best 10% of population
    const sortedPopulation = this.sortPopulationByFitness(
      population,
      distanceMatrix,
      timeMatrix,
      userProfile,
      timeConstraint,
      preferences
    );
    
    const eliteCount = Math.floor(population.length * 0.1);
    for (let i = 0; i < eliteCount; i++) {
      newPopulation.push(sortedPopulation[i]);
    }
    
    // Generate rest of population through crossover and mutation
    while (newPopulation.length < population.length) {
      const parent1 = this.selectParent(sortedPopulation);
      const parent2 = this.selectParent(sortedPopulation);
      
      let child = this.crossover(parent1, parent2);
      
      if (Math.random() < mutationRate) {
        child = this.mutate(child);
      }
      
      newPopulation.push(child);
    }
    
    return newPopulation;
  }

  /**
   * Sort population by fitness
   */
  private static sortPopulationByFitness(
    population: ExhibitAI[][],
    distanceMatrix: number[][],
    timeMatrix: number[][],
    userProfile: UserProfile,
    timeConstraint: number,
    preferences: any
  ): ExhibitAI[][] {
    return population.sort((a, b) => {
      const fitnessA = this.calculateFitness(a, distanceMatrix, timeMatrix, userProfile, timeConstraint, preferences);
      const fitnessB = this.calculateFitness(b, distanceMatrix, timeMatrix, userProfile, timeConstraint, preferences);
      return fitnessB - fitnessA; // Higher fitness first
    });
  }

  /**
   * Calculate fitness of a route
   */
  private static calculateFitness(
    route: ExhibitAI[],
    distanceMatrix: number[][],
    timeMatrix: number[][],
    userProfile: UserProfile,
    timeConstraint: number,
    preferences: any
  ): number {
    let totalDistance = 0;
    let totalTime = 0;
    let categoryBalance = 0;
    let crowdOptimization = 0;
    
    // Calculate total distance and time
    for (let i = 0; i < route.length - 1; i++) {
      const currentIndex = route.findIndex(exhibit => exhibit.id === route[i].id);
      const nextIndex = route.findIndex(exhibit => exhibit.id === route[i + 1].id);
      
      totalDistance += distanceMatrix[currentIndex][nextIndex];
      totalTime += timeMatrix[currentIndex][nextIndex];
    }
    
    // Add time for last exhibit
    if (route.length > 0) {
      totalTime += route[route.length - 1].duration;
    }
    
    // Calculate category balance
    if (preferences.balanceCategories) {
      const categories = route.map(exhibit => exhibit.category);
      const uniqueCategories = new Set(categories).size;
      categoryBalance = uniqueCategories / route.length;
    }
    
    // Calculate crowd optimization
    if (preferences.optimizeForCrowds) {
      const crowdLevels = route.map(exhibit => exhibit.location.crowdLevel);
      const lowCrowdCount = crowdLevels.filter(level => level === 'low').length;
      crowdOptimization = lowCrowdCount / route.length;
    }
    
    // Time constraint penalty
    const timePenalty = totalTime > timeConstraint ? (totalTime - timeConstraint) * 2 : 0;
    
    // Calculate fitness (higher is better)
    const fitness = (
      (1 / (totalDistance + 1)) * 0.4 + // Distance optimization
      (1 / (totalTime + 1)) * 0.3 + // Time optimization
      categoryBalance * 0.2 + // Category balance
      crowdOptimization * 0.1 - // Crowd optimization
      timePenalty * 0.01 // Time constraint penalty
    );
    
    return Math.max(0, fitness);
  }

  /**
   * Select parent for crossover
   */
  private static selectParent(population: ExhibitAI[][]): ExhibitAI[] {
    // Tournament selection
    const tournamentSize = 5;
    let best: ExhibitAI[] = population[0];
    
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      if (Math.random() < 0.7) { // 70% chance to select better individual
        best = population[randomIndex];
      }
    }
    
    return best;
  }

  /**
   * Crossover two parent routes
   */
  private static crossover(parent1: ExhibitAI[], parent2: ExhibitAI[]): ExhibitAI[] {
    const child: ExhibitAI[] = [];
    const start = Math.floor(Math.random() * parent1.length);
    const end = Math.floor(Math.random() * parent1.length);
    
    // Copy segment from parent1
    const segment = parent1.slice(Math.min(start, end), Math.max(start, end));
    child.push(...segment);
    
    // Add remaining exhibits from parent2
    for (const exhibit of parent2) {
      if (!child.find(e => e.id === exhibit.id)) {
        child.push(exhibit);
      }
    }
    
    return child;
  }

  /**
   * Mutate a route
   */
  private static mutate(route: ExhibitAI[]): ExhibitAI[] {
    const mutated = [...route];
    
    // Swap two random exhibits
    const index1 = Math.floor(Math.random() * mutated.length);
    const index2 = Math.floor(Math.random() * mutated.length);
    
    [mutated[index1], mutated[index2]] = [mutated[index2], mutated[index1]];
    
    return mutated;
  }

  /**
   * Get best route from population
   */
  private static getBestRoute(
    population: ExhibitAI[][],
    distanceMatrix: number[][],
    timeMatrix: number[][],
    userProfile: UserProfile,
    timeConstraint: number,
    preferences: any
  ): ExhibitAI[] {
    const sortedPopulation = this.sortPopulationByFitness(
      population,
      distanceMatrix,
      timeMatrix,
      userProfile,
      timeConstraint,
      preferences
    );
    
    return sortedPopulation[0];
  }

  /**
   * Calculate time estimates for route
   */
  private static calculateTimeEstimates(route: ExhibitAI[], userProfile: UserProfile): TimeEstimate[] {
    return route.map((exhibit, index) => {
      const baseTime = exhibit.duration;
      
      // Adjust time based on user profile
      let adjustedTime = baseTime;
      
      switch (userProfile.ageGroup) {
        case 'kids':
          adjustedTime *= 1.2;
          break;
        case 'teens':
          adjustedTime *= 0.9;
          break;
        case 'seniors':
          adjustedTime *= 1.3;
          break;
      }
      
      // Adjust for group type
      switch (userProfile.groupType) {
        case 'family':
          adjustedTime *= 1.3;
          break;
        case 'school':
          adjustedTime *= 1.5;
          break;
        case 'individual':
          adjustedTime *= 0.9;
          break;
      }
      
      return {
        exhibitId: exhibit.id,
        exhibitName: exhibit.name,
        estimatedTime: Math.round(adjustedTime),
        crowdLevel: exhibit.location.crowdLevel
      };
    });
  }

  /**
   * Suggest rest stops for the route
   */
  private static suggestRestStops(
    route: ExhibitAI[],
    userProfile: UserProfile,
    timeConstraint: number
  ): RestStop[] {
    const restStops: RestStop[] = [];
    
    // Add rest stops based on user profile
    if (userProfile.ageGroup === 'seniors' || userProfile.ageGroup === 'kids') {
      // More rest stops for seniors and kids
      const restInterval = userProfile.ageGroup === 'seniors' ? 45 : 60; // minutes
      
      let accumulatedTime = 0;
      for (let i = 0; i < route.length; i++) {
        accumulatedTime += route[i].duration;
        
        if (accumulatedTime >= restInterval) {
          restStops.push({
            location: `Near ${route[i].name}`,
            duration: 15,
            reason: `Rest break for ${userProfile.ageGroup}`
          });
          accumulatedTime = 0;
        }
      }
    }
    
    return restStops;
  }

  /**
   * Generate alternative exhibits
   */
  private static generateAlternatives(
    allExhibits: ExhibitAI[],
    currentRoute: ExhibitAI[],
    userProfile: UserProfile
  ): ExhibitAI[] {
    const currentExhibitIds = new Set(currentRoute.map(exhibit => exhibit.id));
    const alternatives = allExhibits.filter(exhibit => !currentExhibitIds.has(exhibit.id));
    
    // Sort alternatives by relevance to user profile
    return alternatives.sort((a, b) => {
      const relevanceA = this.calculateExhibitRelevance(a, userProfile);
      const relevanceB = this.calculateExhibitRelevance(b, userProfile);
      return relevanceB - relevanceA;
    }).slice(0, 5); // Return top 5 alternatives
  }

  /**
   * Calculate exhibit relevance to user profile
   */
  private static calculateExhibitRelevance(exhibit: ExhibitAI, userProfile: UserProfile): number {
    let relevance = 0;
    
    // Interest matching
    const interestMatches = userProfile.interests.filter(interest => 
      exhibit.tags.includes(interest)
    ).length;
    relevance += interestMatches * 0.3;
    
    // Age appropriateness
    const ageGroupMap: { [key: string]: number } = {
      'kids': 8,
      'teens': 15,
      'adults': 35,
      'seniors': 65
    };
    const userAge = ageGroupMap[userProfile.ageGroup];
    if (userAge >= exhibit.ageRange.min && userAge <= exhibit.ageRange.max) {
      relevance += 0.4;
    }
    
    // Learning style compatibility
    if (userProfile.learningStyle === exhibit.interactionType) {
      relevance += 0.3;
    }
    
    return relevance;
  }

  /**
   * Calculate route efficiency
   */
  private static calculateEfficiency(route: ExhibitAI[], totalDuration: number, timeConstraint: number): number {
    const timeEfficiency = Math.min(1, totalDuration / timeConstraint);
    const distanceEfficiency = 1 / (route.length + 1); // More exhibits = higher efficiency
    
    return (timeEfficiency * 0.7 + distanceEfficiency * 0.3);
  }

  /**
   * Calculate crowd optimization score
   */
  private static calculateCrowdOptimization(timeEstimates: TimeEstimate[]): number {
    const crowdLevels = timeEstimates.map(estimate => estimate.crowdLevel);
    const lowCrowdCount = crowdLevels.filter(level => level === 'low').length;
    
    return lowCrowdCount / crowdLevels.length;
  }
} 