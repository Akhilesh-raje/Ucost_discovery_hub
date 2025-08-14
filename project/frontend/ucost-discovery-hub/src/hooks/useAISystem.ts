/**
 * React Hook for AI System Integration
 * Provides easy access to AI functionality in React components
 */

import { useState, useCallback } from 'react';
import apiClient, { 
  UserSelections, 
  UserProfile, 
  ExhibitRecommendation, 
  Tour, 
  AIAnalysisResult 
} from '../lib/api';

// ============================================================================
// HOOK INTERFACE
// ============================================================================

interface UseAISystemReturn {
  // State
  userProfile: UserProfile | null;
  recommendations: ExhibitRecommendation[];
  currentTour: Tour | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  analyzeUserSelections: (selections: UserSelections) => Promise<void>;
  getPersonalizedRecommendations: (userProfile: UserProfile) => Promise<void>;
  createOptimalTour: (selectedExhibits: string[], maxDuration: number) => Promise<void>;
  performCompleteAnalysis: (userProfile: UserProfile) => Promise<AIAnalysisResult | null>;
  updateProfileWithInteraction: (interaction: any) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useAISystem(): UseAISystemReturn {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recommendations, setRecommendations] = useState<ExhibitRecommendation[]>([]);
  const [currentTour, setCurrentTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const analyzeUserSelections = useCallback(async (selections: UserSelections) => {
    setIsLoading(true);
    setError(null);

    try {
      const profile = await apiClient.analyzeUserSelections(selections);
      setUserProfile(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze user selections');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPersonalizedRecommendations = useCallback(async (profile: UserProfile) => {
    setIsLoading(true);
    setError(null);

    try {
      const recs = await apiClient.getPersonalizedRecommendations(profile);
      setRecommendations(recs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get recommendations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createOptimalTour = useCallback(async (selectedExhibits: string[], maxDuration: number) => {
    if (!userProfile) {
      setError('User profile not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tour = await apiClient.createOptimalTour(userProfile, selectedExhibits, maxDuration);
      setCurrentTour(tour);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create optimal tour');
    } finally {
      setIsLoading(false);
    }
  }, [userProfile]);

  const performCompleteAnalysis = useCallback(async (profile: UserProfile): Promise<AIAnalysisResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient.performCompleteAnalysis(profile);
      setUserProfile(result.userProfile);
      setRecommendations(result.recommendations);
      setCurrentTour(result.tourRecommendation.tour);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform complete analysis');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfileWithInteraction = useCallback(async (interaction: any) => {
    if (!userProfile) {
      setError('User profile not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedProfile = await apiClient.updateUserProfileWithInteraction(userProfile, interaction);
      setUserProfile(updatedProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile with interaction');
    } finally {
      setIsLoading(false);
    }
  }, [userProfile]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setUserProfile(null);
    setRecommendations([]);
    setCurrentTour(null);
    setError(null);
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    userProfile,
    recommendations,
    currentTour,
    isLoading,
    error,

    // Actions
    analyzeUserSelections,
    getPersonalizedRecommendations,
    createOptimalTour,
    performCompleteAnalysis,
    updateProfileWithInteraction,
    clearError,
    reset,
  };
} 