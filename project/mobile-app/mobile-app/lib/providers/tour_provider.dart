import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/exhibit.dart';
import '../utils/constants.dart';

class TourProvider extends ChangeNotifier {
  List<String> _selectedExhibits = [];
  List<Exhibit> _tourExhibits = [];
  bool _isTourActive = false;
  int _currentExhibitIndex = 0;
  bool _isLoading = false;
  String? _error;

  // Getters
  List<String> get selectedExhibitIds => _selectedExhibits;
  List<Exhibit> get tourExhibits => _tourExhibits;
  bool get isTourActive => _isTourActive;
  int get currentExhibitIndex => _currentExhibitIndex;
  bool get isLoading => _isLoading;
  String? get error => _error;
  int get tourLength => _selectedExhibits.length;
  bool get hasExhibits => _selectedExhibits.isNotEmpty;

  TourProvider() {
    _loadTourData();
  }

  // Load tour data from local storage
  Future<void> _loadTourData() async {
    try {
      _isLoading = true;
      notifyListeners();

      final prefs = await SharedPreferences.getInstance();
      final exhibitIds = prefs.getStringList('selected_exhibits') ?? [];
      _selectedExhibits = exhibitIds;

      if (AppConstants.enableDebugLogs) {
        debugPrint('🎯 Tour data loaded: ${_selectedExhibits.length} exhibits');
      }
    } catch (e) {
      _error = 'Failed to load tour data: $e';
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Failed to load tour data: $e');
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Add exhibit to tour
  Future<void> addToTour(String exhibitId) async {
    try {
      if (!_selectedExhibits.contains(exhibitId)) {
        _selectedExhibits.add(exhibitId);
        
        // Save to local storage
        final prefs = await SharedPreferences.getInstance();
        await prefs.setStringList('selected_exhibits', _selectedExhibits);

        if (AppConstants.enableDebugLogs) {
          debugPrint('➕ Added exhibit to tour: $exhibitId');
        }
        
        notifyListeners();
      }
    } catch (e) {
      _error = 'Failed to add exhibit to tour: $e';
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Failed to add exhibit to tour: $e');
      }
    }
  }

  // Remove exhibit from tour
  Future<void> removeFromTour(String exhibitId) async {
    try {
      _selectedExhibits.remove(exhibitId);
      
      // Save to local storage
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList('selected_exhibits', _selectedExhibits);

      if (AppConstants.enableDebugLogs) {
        debugPrint('➖ Removed exhibit from tour: $exhibitId');
      }
      
      notifyListeners();
    } catch (e) {
      _error = 'Failed to remove exhibit from tour: $e';
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Failed to remove exhibit from tour: $e');
      }
    }
  }

  // Start tour
  Future<void> startTour() async {
    try {
      _isLoading = true;
      notifyListeners();

      if (_selectedExhibits.isEmpty) {
        _error = 'No exhibits selected for tour';
        return;
      }

      _isTourActive = true;
      _currentExhibitIndex = 0;

      if (AppConstants.enableDebugLogs) {
        debugPrint('🚀 Tour started with ${_selectedExhibits.length} exhibits');
      }
    } catch (e) {
      _error = 'Failed to start tour: $e';
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Failed to start tour: $e');
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Stop tour
  Future<void> stopTour() async {
    try {
      _isTourActive = false;
      _currentExhibitIndex = 0;

      if (AppConstants.enableDebugLogs) {
        debugPrint('⏹️ Tour stopped');
      }
    } catch (e) {
      _error = 'Failed to stop tour: $e';
    } finally {
      notifyListeners();
    }
  }

  // Navigate to next exhibit
  void nextExhibit() {
    if (_currentExhibitIndex < _selectedExhibits.length - 1) {
      _currentExhibitIndex++;
      notifyListeners();
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('➡️ Next exhibit: ${_currentExhibitIndex + 1}/${_selectedExhibits.length}');
      }
    }
  }

  // Navigate to previous exhibit
  void previousExhibit() {
    if (_currentExhibitIndex > 0) {
      _currentExhibitIndex--;
      notifyListeners();
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('⬅️ Previous exhibit: ${_currentExhibitIndex + 1}/${_selectedExhibits.length}');
      }
    }
  }

  // Jump to specific exhibit
  void goToExhibit(int index) {
    if (index >= 0 && index < _selectedExhibits.length) {
      _currentExhibitIndex = index;
      notifyListeners();
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('🎯 Jumped to exhibit: ${index + 1}/${_selectedExhibits.length}');
      }
    }
  }

  // Get current exhibit ID
  String? get currentExhibitId {
    if (_selectedExhibits.isNotEmpty && _currentExhibitIndex < _selectedExhibits.length) {
      return _selectedExhibits[_currentExhibitIndex];
    }
    return null;
  }

  // Check if at first exhibit
  bool get isFirstExhibit => _currentExhibitIndex == 0;

  // Check if at last exhibit
  bool get isLastExhibit => _currentExhibitIndex == _selectedExhibits.length - 1;

  // Clear tour
  Future<void> clearTour() async {
    try {
      _selectedExhibits.clear();
      _tourExhibits.clear();
      _isTourActive = false;
      _currentExhibitIndex = 0;

      // Clear local storage
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('selected_exhibits');

      if (AppConstants.enableDebugLogs) {
        debugPrint('🗑️ Tour cleared');
      }
    } catch (e) {
      _error = 'Failed to clear tour: $e';
    } finally {
      notifyListeners();
    }
  }

  // Get tour progress percentage
  double get tourProgress {
    if (_selectedExhibits.isEmpty) return 0.0;
    return (_currentExhibitIndex + 1) / _selectedExhibits.length;
  }

  // Get tour duration estimate (assuming 5 minutes per exhibit)
  int get estimatedTourDuration {
    return _selectedExhibits.length * 5; // minutes
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Check if exhibit is in tour
  bool isExhibitInTour(String exhibitId) {
    return _selectedExhibits.contains(exhibitId);
  }

  // Get tour summary
  Map<String, dynamic> getTourSummary() {
    return {
      'totalExhibits': _selectedExhibits.length,
      'isActive': _isTourActive,
      'currentIndex': _currentExhibitIndex,
      'progress': tourProgress,
      'estimatedDuration': estimatedTourDuration,
      'exhibitIds': _selectedExhibits,
    };
  }
} 