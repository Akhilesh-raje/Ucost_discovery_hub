/**
 * UC Discovery Hub - Exhibit Intelligence Data
 * Comprehensive exhibit data with AI scoring and metadata
 */

import { ExhibitAI, DifficultyLevel, InteractionType } from '../core/types';

// ============================================================================
// EXHIBIT INTELLIGENCE DATA
// ============================================================================

const exhibitsData: ExhibitAI[] = [
  {
    id: 'dinosaur-fossils',
    name: 'Dinosaur Fossils Exhibit',
    category: 'paleontology',
    description: 'Interactive display of dinosaur fossils with hands-on excavation activities',
    
    // AI Scoring
    popularityScore: 0.95,
    educationalValue: 0.92,
    entertainmentValue: 0.88,
    accessibilityScore: 0.85,
    
    // Target Audience
    ageRange: { min: 5, max: 18, recommended: [8, 12, 15] },
    difficultyLevel: 'beginner',
    groupSize: 'small-group',
    
    // Features
    features: ['hands-on', 'interactive', 'educational', 'excavation'],
    interactionType: 'hands-on',
    duration: 25,
    capacity: 15,
    
    // Location Intelligence
    location: {
      floor: 'ground',
      coordinates: { x: 100, y: 150 },
      accessibility: true,
      crowdLevel: 'medium',
      nearbyFacilities: ['restroom', 'cafe', 'gift-shop']
    },
    
    // Content Tags
    tags: ['dinosaurs', 'fossils', 'paleontology', 'excavation', 'science'],
    themes: ['prehistoric', 'discovery', 'science'],
    learningOutcomes: ['understanding fossils', 'scientific method', 'paleontology basics'],
    
    // AI Metadata
    lastUpdated: new Date('2024-01-15'),
    visitCount: 1250,
    averageRating: 4.7,
    averageDuration: 22
  },
  
  {
    id: 'space-exploration',
    name: 'Space Exploration Center',
    category: 'astronomy',
    description: 'Virtual reality space missions and interactive planetarium',
    
    // AI Scoring
    popularityScore: 0.88,
    educationalValue: 0.95,
    entertainmentValue: 0.92,
    accessibilityScore: 0.78,
    
    // Target Audience
    ageRange: { min: 8, max: 25, recommended: [10, 14, 18] },
    difficultyLevel: 'intermediate',
    groupSize: 'individual',
    
    // Features
    features: ['virtual-reality', 'planetarium', 'interactive', 'educational'],
    interactionType: 'digital',
    duration: 30,
    capacity: 8,
    
    // Location Intelligence
    location: {
      floor: 'first',
      coordinates: { x: 250, y: 100 },
      accessibility: false,
      crowdLevel: 'low',
      nearbyFacilities: ['elevator', 'restroom']
    },
    
    // Content Tags
    tags: ['space', 'astronomy', 'planets', 'virtual-reality', 'technology'],
    themes: ['space exploration', 'technology', 'cosmos'],
    learningOutcomes: ['solar system', 'space missions', 'astronomy basics'],
    
    // AI Metadata
    lastUpdated: new Date('2024-01-20'),
    visitCount: 890,
    averageRating: 4.8,
    averageDuration: 28
  },
  
  {
    id: 'ocean-life',
    name: 'Ocean Life Aquarium',
    category: 'marine-biology',
    description: 'Live marine creatures and underwater ecosystem simulation',
    
    // AI Scoring
    popularityScore: 0.92,
    educationalValue: 0.88,
    entertainmentValue: 0.95,
    accessibilityScore: 0.90,
    
    // Target Audience
    ageRange: { min: 3, max: 20, recommended: [5, 10, 15] },
    difficultyLevel: 'beginner',
    groupSize: 'large-group',
    
    // Features
    features: ['live-animals', 'interactive', 'educational', 'visual'],
    interactionType: 'visual',
    duration: 20,
    capacity: 25,
    
    // Location Intelligence
    location: {
      floor: 'ground',
      coordinates: { x: 150, y: 200 },
      accessibility: true,
      crowdLevel: 'high',
      nearbyFacilities: ['restroom', 'cafe', 'seating']
    },
    
    // Content Tags
    tags: ['ocean', 'marine-life', 'fish', 'ecosystem', 'biology'],
    themes: ['underwater world', 'marine biology', 'ecosystems'],
    learningOutcomes: ['marine ecosystems', 'ocean life', 'conservation'],
    
    // AI Metadata
    lastUpdated: new Date('2024-01-18'),
    visitCount: 2100,
    averageRating: 4.6,
    averageDuration: 18
  },
  
  {
    id: 'chemistry-lab',
    name: 'Chemistry Laboratory',
    category: 'chemistry',
    description: 'Hands-on chemistry experiments and molecular modeling',
    
    // AI Scoring
    popularityScore: 0.78,
    educationalValue: 0.96,
    entertainmentValue: 0.82,
    accessibilityScore: 0.75,
    
    // Target Audience
    ageRange: { min: 12, max: 25, recommended: [14, 16, 20] },
    difficultyLevel: 'advanced',
    groupSize: 'small-group',
    
    // Features
    features: ['experiments', 'hands-on', 'educational', 'safety-gear'],
    interactionType: 'hands-on',
    duration: 35,
    capacity: 12,
    
    // Location Intelligence
    location: {
      floor: 'first',
      coordinates: { x: 300, y: 150 },
      accessibility: true,
      crowdLevel: 'low',
      nearbyFacilities: ['restroom', 'safety-station']
    },
    
    // Content Tags
    tags: ['chemistry', 'experiments', 'molecules', 'reactions', 'science'],
    themes: ['chemical reactions', 'molecular science', 'laboratory'],
    learningOutcomes: ['chemical reactions', 'molecular structure', 'safety procedures'],
    
    // AI Metadata
    lastUpdated: new Date('2024-01-22'),
    visitCount: 650,
    averageRating: 4.5,
    averageDuration: 32
  },
  
  {
    id: 'robotics-workshop',
    name: 'Robotics Workshop',
    category: 'engineering',
    description: 'Build and program robots with coding activities',
    
    // AI Scoring
    popularityScore: 0.85,
    educationalValue: 0.94,
    entertainmentValue: 0.90,
    accessibilityScore: 0.80,
    
    // Target Audience
    ageRange: { min: 10, max: 22, recommended: [12, 15, 18] },
    difficultyLevel: 'intermediate',
    groupSize: 'small-group',
    
    // Features
    features: ['robotics', 'programming', 'hands-on', 'coding'],
    interactionType: 'hands-on',
    duration: 40,
    capacity: 10,
    
    // Location Intelligence
    location: {
      floor: 'first',
      coordinates: { x: 350, y: 200 },
      accessibility: true,
      crowdLevel: 'medium',
      nearbyFacilities: ['restroom', 'computer-station']
    },
    
    // Content Tags
    tags: ['robotics', 'programming', 'engineering', 'technology', 'coding'],
    themes: ['automation', 'technology', 'engineering'],
    learningOutcomes: ['robotics basics', 'programming logic', 'engineering design'],
    
    // AI Metadata
    lastUpdated: new Date('2024-01-25'),
    visitCount: 720,
    averageRating: 4.7,
    averageDuration: 38
  },
  
  {
    id: 'art-gallery',
    name: 'Interactive Art Gallery',
    category: 'art',
    description: 'Digital art creation and interactive installations',
    
    // AI Scoring
    popularityScore: 0.80,
    educationalValue: 0.75,
    entertainmentValue: 0.88,
    accessibilityScore: 0.92,
    
    // Target Audience
    ageRange: { min: 6, max: 30, recommended: [8, 15, 22] },
    difficultyLevel: 'beginner',
    groupSize: 'individual',
    
    // Features
    features: ['digital-art', 'interactive', 'creative', 'visual'],
    interactionType: 'digital',
    duration: 15,
    capacity: 20,
    
    // Location Intelligence
    location: {
      floor: 'second',
      coordinates: { x: 100, y: 100 },
      accessibility: true,
      crowdLevel: 'medium',
      nearbyFacilities: ['restroom', 'seating', 'gift-shop']
    },
    
    // Content Tags
    tags: ['art', 'digital', 'creative', 'interactive', 'design'],
    themes: ['digital creativity', 'artistic expression', 'visual arts'],
    learningOutcomes: ['digital art', 'creative expression', 'artistic techniques'],
    
    // AI Metadata
    lastUpdated: new Date('2024-01-16'),
    visitCount: 980,
    averageRating: 4.4,
    averageDuration: 14
  },
  
  {
    id: 'physics-playground',
    name: 'Physics Playground',
    category: 'physics',
    description: 'Hands-on physics experiments and demonstrations',
    
    // AI Scoring
    popularityScore: 0.87,
    educationalValue: 0.90,
    entertainmentValue: 0.85,
    accessibilityScore: 0.88,
    
    // Target Audience
    ageRange: { min: 8, max: 20, recommended: [10, 14, 17] },
    difficultyLevel: 'intermediate',
    groupSize: 'small-group',
    
    // Features
    features: ['experiments', 'hands-on', 'educational', 'interactive'],
    interactionType: 'hands-on',
    duration: 25,
    capacity: 18,
    
    // Location Intelligence
    location: {
      floor: 'ground',
      coordinates: { x: 200, y: 250 },
      accessibility: true,
      crowdLevel: 'medium',
      nearbyFacilities: ['restroom', 'seating', 'water-fountain']
    },
    
    // Content Tags
    tags: ['physics', 'experiments', 'motion', 'energy', 'science'],
    themes: ['physical laws', 'motion and energy', 'scientific principles'],
    learningOutcomes: ['physics principles', 'scientific method', 'energy conservation'],
    
    // AI Metadata
    lastUpdated: new Date('2024-01-19'),
    visitCount: 1100,
    averageRating: 4.6,
    averageDuration: 23
  },
  
  {
    id: 'history-timeline',
    name: 'Interactive History Timeline',
    category: 'history',
    description: 'Multi-media historical timeline with touch-screen interactions',
    
    // AI Scoring
    popularityScore: 0.75,
    educationalValue: 0.92,
    entertainmentValue: 0.78,
    accessibilityScore: 0.95,
    
    // Target Audience
    ageRange: { min: 10, max: 25, recommended: [12, 16, 20] },
    difficultyLevel: 'intermediate',
    groupSize: 'individual',
    
    // Features
    features: ['touch-screen', 'multimedia', 'educational', 'interactive'],
    interactionType: 'digital',
    duration: 20,
    capacity: 12,
    
    // Location Intelligence
    location: {
      floor: 'second',
      coordinates: { x: 150, y: 150 },
      accessibility: true,
      crowdLevel: 'low',
      nearbyFacilities: ['restroom', 'seating', 'information-desk']
    },
    
    // Content Tags
    tags: ['history', 'timeline', 'multimedia', 'educational', 'interactive'],
    themes: ['historical events', 'cultural heritage', 'timeline'],
    learningOutcomes: ['historical events', 'chronological thinking', 'cultural understanding'],
    
    // AI Metadata
    lastUpdated: new Date('2024-01-17'),
    visitCount: 680,
    averageRating: 4.3,
    averageDuration: 18
  },
  
  {
    id: 'nature-discovery',
    name: 'Nature Discovery Zone',
    category: 'biology',
    description: 'Local ecosystem exploration and wildlife observation',
    
    // AI Scoring
    popularityScore: 0.82,
    educationalValue: 0.88,
    entertainmentValue: 0.80,
    accessibilityScore: 0.90,
    
    // Target Audience
    ageRange: { min: 4, max: 18, recommended: [6, 10, 14] },
    difficultyLevel: 'beginner',
    groupSize: 'large-group',
    
    // Features
    features: ['outdoor', 'nature', 'observation', 'educational'],
    interactionType: 'visual',
    duration: 30,
    capacity: 30,
    
    // Location Intelligence
    location: {
      floor: 'outdoor',
      coordinates: { x: 400, y: 300 },
      accessibility: true,
      crowdLevel: 'medium',
      nearbyFacilities: ['restroom', 'seating', 'water-fountain']
    },
    
    // Content Tags
    tags: ['nature', 'wildlife', 'ecosystem', 'outdoor', 'biology'],
    themes: ['local ecosystem', 'wildlife conservation', 'nature observation'],
    learningOutcomes: ['ecosystem understanding', 'wildlife identification', 'conservation awareness'],
    
    // AI Metadata
    lastUpdated: new Date('2024-01-21'),
    visitCount: 950,
    averageRating: 4.5,
    averageDuration: 28
  },
  
  {
    id: 'math-adventure',
    name: 'Mathematics Adventure',
    category: 'mathematics',
    description: 'Interactive math games and problem-solving activities',
    
    // AI Scoring
    popularityScore: 0.70,
    educationalValue: 0.96,
    entertainmentValue: 0.75,
    accessibilityScore: 0.85,
    
    // Target Audience
    ageRange: { min: 8, max: 18, recommended: [10, 13, 16] },
    difficultyLevel: 'intermediate',
    groupSize: 'individual',
    
    // Features
    features: ['games', 'interactive', 'educational', 'problem-solving'],
    interactionType: 'digital',
    duration: 20,
    capacity: 15,
    
    // Location Intelligence
    location: {
      floor: 'first',
      coordinates: { x: 250, y: 300 },
      accessibility: true,
      crowdLevel: 'low',
      nearbyFacilities: ['restroom', 'computer-station']
    },
    
    // Content Tags
    tags: ['mathematics', 'games', 'problem-solving', 'interactive', 'educational'],
    themes: ['mathematical thinking', 'problem solving', 'logical reasoning'],
    learningOutcomes: ['mathematical concepts', 'problem-solving skills', 'logical thinking'],
    
    // AI Metadata
    lastUpdated: new Date('2024-01-23'),
    visitCount: 520,
    averageRating: 4.2,
    averageDuration: 19
  }
];

// ============================================================================
// EXHIBIT CATEGORIES
// ============================================================================

const exhibitCategories = [
  'paleontology',
  'astronomy',
  'marine-biology',
  'chemistry',
  'engineering',
  'art',
  'physics',
  'history',
  'biology',
  'mathematics'
];

// ============================================================================
// EXHIBIT FEATURES
// ============================================================================

const exhibitFeatures = [
  'hands-on',
  'interactive',
  'educational',
  'visual',
  'audio',
  'digital',
  'experiments',
  'games',
  'multimedia',
  'outdoor',
  'virtual-reality',
  'touch-screen',
  'safety-gear',
  'computer-station',
  'excavation',
  'programming',
  'creative',
  'observation',
  'problem-solving'
];

// ============================================================================
// EXHIBIT THEMES
// ============================================================================

const exhibitThemes = [
  'prehistoric',
  'discovery',
  'science',
  'space exploration',
  'technology',
  'cosmos',
  'underwater world',
  'marine biology',
  'ecosystems',
  'chemical reactions',
  'molecular science',
  'laboratory',
  'automation',
  'engineering',
  'digital creativity',
  'artistic expression',
  'visual arts',
  'physical laws',
  'motion and energy',
  'scientific principles',
  'historical events',
  'cultural heritage',
  'timeline',
  'local ecosystem',
  'wildlife conservation',
  'nature observation',
  'mathematical thinking',
  'problem solving',
  'logical reasoning'
];

// ============================================================================
// EXHIBIT TAGS
// ============================================================================

const exhibitTags = [
  'dinosaurs',
  'fossils',
  'paleontology',
  'excavation',
  'science',
  'space',
  'astronomy',
  'planets',
  'virtual-reality',
  'technology',
  'ocean',
  'marine-life',
  'fish',
  'ecosystem',
  'biology',
  'chemistry',
  'experiments',
  'molecules',
  'reactions',
  'robotics',
  'programming',
  'engineering',
  'coding',
  'art',
  'digital',
  'creative',
  'design',
  'physics',
  'motion',
  'energy',
  'history',
  'timeline',
  'multimedia',
  'nature',
  'wildlife',
  'outdoor',
  'mathematics',
  'games',
  'problem-solving'
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get exhibit by ID
 */
function getExhibitById(id: string): ExhibitAI | undefined {
  return exhibitsData.find(exhibit => exhibit.id === id);
}

/**
 * Get exhibits by category
 */
function getExhibitsByCategory(category: string): ExhibitAI[] {
  return exhibitsData.filter(exhibit => exhibit.category === category);
}

/**
 * Get exhibits by age group
 */
function getExhibitsByAgeGroup(ageGroup: string): ExhibitAI[] {
  return exhibitsData.filter(exhibit => {
    const age = getAgeFromGroup(ageGroup);
    return age >= exhibit.ageRange.min && age <= exhibit.ageRange.max;
  });
}

/**
 * Get exhibits by difficulty level
 */
function getExhibitsByDifficulty(difficulty: DifficultyLevel): ExhibitAI[] {
  return exhibitsData.filter(exhibit => exhibit.difficultyLevel === difficulty);
}

/**
 * Get exhibits by interaction type
 */
function getExhibitsByInteractionType(interactionType: InteractionType): ExhibitAI[] {
  return exhibitsData.filter(exhibit => exhibit.interactionType === interactionType);
}

/**
 * Get exhibits by tags
 */
function getExhibitsByTags(tags: string[]): ExhibitAI[] {
  return exhibitsData.filter(exhibit => 
    tags.some(tag => exhibit.tags.includes(tag))
  );
}

/**
 * Get popular exhibits (top N by popularity score)
 */
function getPopularExhibits(limit: number = 5): ExhibitAI[] {
  return exhibitsData
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, limit);
}

/**
 * Get educational exhibits (top N by educational value)
 */
function getEducationalExhibits(limit: number = 5): ExhibitAI[] {
  return exhibitsData
    .sort((a, b) => b.educationalValue - a.educationalValue)
    .slice(0, limit);
}

/**
 * Get accessible exhibits
 */
function getAccessibleExhibits(): ExhibitAI[] {
  return exhibitsData.filter(exhibit => exhibit.accessibilityScore >= 0.8);
}

/**
 * Get exhibits suitable for families
 */
function getFamilyFriendlyExhibits(): ExhibitAI[] {
  return exhibitsData.filter(exhibit => 
    exhibit.groupSize === 'large-group' && 
    exhibit.difficultyLevel === 'beginner' &&
    exhibit.accessibilityScore >= 0.8
  );
}

/**
 * Get exhibits suitable for schools
 */
function getSchoolFriendlyExhibits(): ExhibitAI[] {
  return exhibitsData.filter(exhibit => 
    exhibit.educationalValue >= 0.8 &&
    exhibit.groupSize === 'large-group'
  );
}

/**
 * Helper function to convert age group to numeric age
 */
function getAgeFromGroup(ageGroup: string): number {
  switch (ageGroup) {
    case 'kids': return 8;
    case 'teens': return 15;
    case 'adults': return 25;
    case 'seniors': return 65;
    default: return 15;
  }
}

// ============================================================================
// EXPORT ALL DATA
// ============================================================================

export {
  exhibitsData,
  exhibitCategories,
  exhibitFeatures,
  exhibitThemes,
  exhibitTags,
  getExhibitById,
  getExhibitsByCategory,
  getExhibitsByAgeGroup,
  getExhibitsByDifficulty,
  getExhibitsByInteractionType,
  getExhibitsByTags,
  getPopularExhibits,
  getEducationalExhibits,
  getAccessibleExhibits,
  getFamilyFriendlyExhibits,
  getSchoolFriendlyExhibits
}; 