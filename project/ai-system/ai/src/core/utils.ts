/**
 * UC Discovery Hub - AI System Utilities
 * Common utility functions for the AI system
 */

import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

// ============================================================================
// ID GENERATION
// ============================================================================

/**
 * Generate a unique ID for AI system entities
 */
function generateId(): string {
  return uuidv4();
}

/**
 * Generate a timestamp-based ID
 */
function generateTimestampId(): string {
  return `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// MATHEMATICAL UTILITIES
// ============================================================================

/**
 * Calculate distance between two points
 */
function calculateDistance(point1: { x: number; y: number }, point2: { x: number; y: number }): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate weighted average
 */
function calculateWeightedAverage(values: number[], weights: number[]): number {
  if (values.length !== weights.length) {
    throw new Error('Values and weights arrays must have the same length');
  }
  
  const sum = values.reduce((acc, value, index) => {
    const weight = weights[index];
    if (weight === undefined) {
      throw new Error(`Weight at index ${index} is undefined`);
    }
    return acc + value * weight;
  }, 0);
  const weightSum = weights.reduce((acc, weight) => acc + weight, 0);
  
  return weightSum > 0 ? sum / weightSum : 0;
}

/**
 * Normalize a value to a 0-1 range
 */
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate similarity between two arrays using cosine similarity
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Arrays must have the same length');
  }
  
  const dotProduct = a.reduce((sum, val, i) => {
    const bVal = b[i];
    if (bVal === undefined) {
      throw new Error(`Value at index ${i} in second array is undefined`);
    }
    return sum + val * bVal;
  }, 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  
  return dotProduct / (magnitudeA * magnitudeB);
}

// ============================================================================
// TIME UTILITIES
// ============================================================================

/**
 * Calculate time difference in minutes
 */
function timeDifferenceInMinutes(date1: Date, date2: Date): number {
  return moment(date2).diff(moment(date1), 'minutes');
}

/**
 * Add minutes to a date
 */
function addMinutes(date: Date, minutes: number): Date {
  return moment(date).add(minutes, 'minutes').toDate();
}

/**
 * Check if a time is within a time window
 */
function isWithinTimeWindow(time: Date, start: Date, end: Date): boolean {
  return moment(time).isBetween(moment(start), moment(end), null, '[]');
}

/**
 * Get current time slot
 */
function getCurrentTimeSlot(): 'morning' | 'afternoon' | 'evening' {
  const hour = moment().hour();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    if (temp === undefined) {
      throw new Error(`Element at index ${i} is undefined`);
    }
    const temp2 = shuffled[j];
    if (temp2 === undefined) {
      throw new Error(`Element at index ${j} is undefined`);
    }
    shuffled[i] = temp2;
    shuffled[j] = temp;
  }
  return shuffled;
}

/**
 * Get a random element from an array
 */
function getRandomElement<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot get random element from empty array');
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  const element = array[randomIndex];
  if (element === undefined) {
    throw new Error(`Element at index ${randomIndex} is undefined`);
  }
  return element;
}

/**
 * Get top N elements from array based on key function
 */
function getTopN<T>(array: T[], n: number, keyFn: (item: T) => number): T[] {
  return array
    .map(item => ({ item, score: keyFn(item) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(({ item }) => item);
}

/**
 * Group array elements by key function
 */
function groupBy<T, K>(array: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  
  for (const item of array) {
    const key = keyFn(item);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }
  
  return groups;
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function stringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;
  if (str1.length === 0) return str2.length === 0 ? 1 : 0;
  if (str2.length === 0) return 0;
  
  // Simple similarity calculation
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1;
  
  // Calculate similarity based on common characters
  let commonChars = 0;
  for (let i = 0; i < shorter.length; i++) {
    const char = shorter[i];
    if (char && longer.includes(char)) {
      commonChars++;
    }
  }
  
  return commonChars / longer.length;
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  
  return words
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 10);
}

// ============================================================================
// RANDOM UTILITIES
// ============================================================================

/**
 * Generate random number between min and max
 */
function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate random integer between min and max
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Make a weighted random choice from an array
 */
function weightedChoice<T>(items: T[], weights: number[]): T {
  if (items.length === 0) {
    throw new Error('Cannot make weighted choice from empty array');
  }
  
  if (items.length !== weights.length) {
    throw new Error('Items and weights arrays must have the same length');
  }
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight <= 0) {
    throw new Error('Total weight must be greater than 0');
  }
  
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    const weight = weights[i];
    if (weight === undefined) {
      throw new Error(`Weight at index ${i} is undefined`);
    }
    random -= weight;
    if (random <= 0) {
      const item = items[i];
      if (item === undefined) {
        throw new Error(`Item at index ${i} is undefined`);
      }
      return item;
    }
  }
  
  // Fallback to last item
  const lastItem = items[items.length - 1];
  if (lastItem === undefined) {
    throw new Error('Last item is undefined');
  }
  return lastItem;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate age group
 */
function isValidAgeGroup(ageGroup: string): boolean {
  const validGroups = ['kids', 'teens', 'adults', 'seniors'];
  return validGroups.includes(ageGroup);
}

/**
 * Validate time slot
 */
function isValidTimeSlot(timeSlot: string): boolean {
  const validSlots = ['morning', 'afternoon', 'full-day'];
  return validSlots.includes(timeSlot);
}

/**
 * Validate score is between 0 and 1
 */
function isValidScore(score: number): boolean {
  return score >= 0 && score <= 1;
}

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

/**
 * Log AI event (disabled in production)
 */
function logAIEvent(_event: string, _data?: unknown): void {
  // Disabled in production for performance
}

/**
 * Log AI error (disabled in production)
 */
function logAIError(_error: string, _details?: unknown): void {
  // Disabled in production for performance
}

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

/**
 * Measure execution time of async function
 */
async function measureExecutionTime<T>(fn: () => Promise<T>): Promise<{ result: T; executionTime: number }> {
  const startTime = performance.now();
  const result = await fn();
  const executionTime = performance.now() - startTime;
  
  return { result, executionTime };
}

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Deep merge objects
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
  return { ...target, ...source };
}

/**
 * Get nested property with default value
 */
function getNestedProperty(obj: unknown, path: string, defaultValue?: unknown): unknown {
  const keys = path.split('.');
  let current = obj as any;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }
  
  return current;
}

/**
 * Set nested property
 */
function setNestedProperty(obj: unknown, path: string, value: unknown): void {
  const keys = path.split('.');
  let current = obj as any;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (key === undefined) {
      throw new Error('Key is undefined');
    }
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  const lastKey = keys[keys.length - 1];
  if (lastKey === undefined) {
    throw new Error('Last key is undefined');
  }
  current[lastKey] = value;
}

// ============================================================================
// FUNCTIONAL UTILITIES
// ============================================================================

/**
 * Debounce function calls
 */
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function calls
 */
function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

export {
  // ID Generation
  generateId,
  generateTimestampId,
  
  // Mathematical
  calculateDistance,
  calculateWeightedAverage,
  normalize,
  clamp,
  cosineSimilarity,
  
  // Time
  timeDifferenceInMinutes,
  addMinutes,
  isWithinTimeWindow,
  getCurrentTimeSlot,
  
  // Array
  shuffleArray,
  getRandomElement,
  getTopN,
  groupBy,
  stringSimilarity,
  extractKeywords,
  
  // Random
  random,
  randomInt,
  weightedChoice,
  
  // Validation
  isValidEmail,
  isValidAgeGroup,
  isValidTimeSlot,
  isValidScore,
  
  // Logging
  logAIEvent,
  logAIError,
  
  // Performance
  measureExecutionTime,
  
  // Object
  deepMerge,
  getNestedProperty,
  setNestedProperty,
  
  // Functional
  debounce,
  throttle
}; 