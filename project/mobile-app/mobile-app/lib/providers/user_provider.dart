import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_profile.dart';
import '../utils/constants.dart';

class UserProvider extends ChangeNotifier {
  UserProfile? _userProfile;
  bool _isAuthenticated = false;
  bool _isLoading = false;
  String? _error;
  bool _onboardingComplete = false;

  // Getters
  UserProfile? get userProfile => _userProfile;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get onboardingComplete => _onboardingComplete;

  UserProvider() {
    _loadUserProfile();
  }

  // Load user profile from local storage
  Future<void> _loadUserProfile() async {
    try {
      _isLoading = true;
      notifyListeners();

      final prefs = await SharedPreferences.getInstance();
      final profileData = prefs.getString('user_profile');
      final onboardingStatus = prefs.getBool('onboarding_complete') ?? false;

      if (profileData != null) {
        _userProfile = UserProfile.fromJson(profileData);
        _isAuthenticated = true;
      }
      
      _onboardingComplete = onboardingStatus;
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('👤 User profile loaded: ${_userProfile?.name ?? 'None'}');
      }
    } catch (e) {
      _error = 'Failed to load user profile: $e';
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Failed to load user profile: $e');
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Complete onboarding and create user profile
  Future<void> completeOnboarding(UserProfile profile) async {
    try {
      _isLoading = true;
      notifyListeners();

      _userProfile = profile;
      _isAuthenticated = true;
      _onboardingComplete = true;

      // Save to local storage
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_profile', profile.toJson());
      await prefs.setBool('onboarding_complete', true);

      if (AppConstants.enableDebugLogs) {
        debugPrint('✅ Onboarding completed for: ${profile.name}');
      }
    } catch (e) {
      _error = 'Failed to complete onboarding: $e';
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Failed to complete onboarding: $e');
      }
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Admin login
  Future<bool> adminLogin(String username, String password) async {
    try {
      _isLoading = true;
      notifyListeners();

      // Simulate API call delay
      await Future.delayed(const Duration(seconds: 1));

      // Simple admin validation (in real app, this would be API call)
      if (username == 'admin' && password == 'admin123') {
        _isAuthenticated = true;
        _userProfile = UserProfile(
          id: 'admin_001',
          name: 'Administrator',
          email: 'admin@ucost.gov.in',
          role: 'admin',
          interests: ['science', 'technology', 'education'],
          age: 30,
          experience: 'expert',
        );
        
        // Save admin profile
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_profile', _userProfile!.toJson());
        await prefs.setBool('onboarding_complete', true);

        if (AppConstants.enableDebugLogs) {
          debugPrint('🔐 Admin login successful: ${_userProfile!.name}');
        }
        
        return true;
      } else {
        _error = 'Invalid credentials';
        return false;
      }
    } catch (e) {
      _error = 'Login failed: $e';
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Admin login failed: $e');
      }
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update user profile
  Future<void> updateProfile(UserProfile updatedProfile) async {
    try {
      _isLoading = true;
      notifyListeners();

      _userProfile = updatedProfile;

      // Save to local storage
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_profile', updatedProfile.toJson());

      if (AppConstants.enableDebugLogs) {
        debugPrint('📝 Profile updated: ${updatedProfile.name}');
      }
    } catch (e) {
      _error = 'Failed to update profile: $e';
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Failed to update profile: $e');
      }
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Logout
  Future<void> logout() async {
    try {
      _isLoading = true;
      notifyListeners();

      _userProfile = null;
      _isAuthenticated = false;

      // Clear local storage
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('user_profile');

      if (AppConstants.enableDebugLogs) {
        debugPrint('🚪 User logged out');
      }
    } catch (e) {
      _error = 'Logout failed: $e';
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Logout failed: $e');
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Reset onboarding
  Future<void> resetOnboarding() async {
    try {
      _onboardingComplete = false;
      _userProfile = null;
      _isAuthenticated = false;

      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('user_profile');
      await prefs.setBool('onboarding_complete', false);

      if (AppConstants.enableDebugLogs) {
        debugPrint('🔄 Onboarding reset');
      }
    } catch (e) {
      _error = 'Failed to reset onboarding: $e';
    } finally {
      notifyListeners();
    }
  }
} 