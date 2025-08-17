import 'package:flutter/material.dart';
import '../models/exhibit.dart';
import '../services/mock_data_service.dart';
import '../utils/constants.dart';

class ExhibitProvider extends ChangeNotifier {
  List<Exhibit> _exhibits = [];
  bool _isLoading = false;
  String? _error;
  Map<String, dynamic> _stats = {};

  // Getters
  List<Exhibit> get exhibits => _exhibits;
  bool get isLoading => _isLoading;
  String? get error => _error;
  Map<String, dynamic> get stats => _stats;

  ExhibitProvider() {
    _loadExhibits();
  }

  // Load exhibits from mock data service
  Future<void> loadExhibits() async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 800));

      // Load mock data
      _exhibits = MockDataService.getMockExhibits();
      
      // Calculate stats
      await _loadStats();

      if (AppConstants.enableDebugLogs) {
        debugPrint('📚 Loaded ${_exhibits.length} exhibits');
      }
    } catch (e) {
      _error = 'Failed to load exhibits: $e';
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Failed to load exhibits: $e');
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Load statistics
  Future<void> _loadStats() async {
    try {
      final totalExhibits = _exhibits.length;
      final activeExhibits = _exhibits.where((e) => !e.isDeleted).length;
      final interactiveExhibits = _exhibits.where((e) => e.isInteractive).length;
      final popularExhibits = _exhibits.where((e) => e.isPopular).length;
      final newExhibits = _exhibits.where((e) => e.isNew).length;

      // Category breakdown
      final categoryBreakdown = <String, int>{};
      for (final exhibit in _exhibits) {
        categoryBreakdown[exhibit.category] = (categoryBreakdown[exhibit.category] ?? 0) + 1;
      }

      // Location breakdown
      final locationBreakdown = <String, int>{};
      for (final exhibit in _exhibits) {
        locationBreakdown[exhibit.location] = (locationBreakdown[exhibit.location] ?? 0) + 1;
      }

      // Average rating
      final totalRating = _exhibits.fold(0.0, (sum, e) => sum + e.rating);
      final averageRating = totalRating / totalExhibits;

      // Total views
      final totalViews = _exhibits.fold(0, (sum, e) => sum + e.viewCount);

      _stats = {
        'totalExhibits': totalExhibits,
        'activeExhibits': activeExhibits,
        'interactiveExhibits': interactiveExhibits,
        'popularExhibits': popularExhibits,
        'newExhibits': newExhibits,
        'categoryBreakdown': categoryBreakdown,
        'locationBreakdown': locationBreakdown,
        'averageRating': averageRating,
        'totalViews': totalViews,
      };

      if (AppConstants.enableDebugLogs) {
        debugPrint('📊 Stats loaded: $totalExhibits exhibits, ${averageRating.toStringAsFixed(1)} avg rating');
      }
    } catch (e) {
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Failed to load stats: $e');
      }
    }
  }

  // Get exhibit by ID
  Exhibit? getExhibitById(String id) {
    try {
      return _exhibits.firstWhere((exhibit) => exhibit.id == id);
    } catch (e) {
      return null;
    }
  }

  // Get exhibits by category
  List<Exhibit> getExhibitsByCategory(String category) {
    if (category.toLowerCase() == 'all') {
      return _exhibits;
    }
    return _exhibits.where((exhibit) => 
      exhibit.category.toLowerCase() == category.toLowerCase()
    ).toList();
  }

  // Get exhibits by location
  List<Exhibit> getExhibitsByLocation(String location) {
    if (location.toLowerCase() == 'all') {
      return _exhibits;
    }
    return _exhibits.where((exhibit) => 
      exhibit.location.toLowerCase() == location.toLowerCase()
    ).toList();
  }

  // Search exhibits
  List<Exhibit> searchExhibits(String query) {
    if (query.isEmpty) return _exhibits;
    
    final lowercaseQuery = query.toLowerCase();
    return _exhibits.where((exhibit) =>
      exhibit.name.toLowerCase().contains(lowercaseQuery) ||
      exhibit.description.toLowerCase().contains(lowercaseQuery) ||
      exhibit.category.toLowerCase().contains(lowercaseQuery) ||
      exhibit.location.toLowerCase().contains(lowercaseQuery) ||
      exhibit.tags.any((tag) => tag.toLowerCase().contains(lowercaseQuery))
    ).toList();
  }

  // Get popular exhibits
  List<Exhibit> getPopularExhibits({int limit = 5}) {
    final popular = _exhibits.where((e) => e.isPopular).toList();
    popular.sort((a, b) => b.rating.compareTo(a.rating));
    return popular.take(limit).toList();
  }

  // Get new exhibits
  List<Exhibit> getNewExhibits({int limit = 5}) {
    final newExhibits = _exhibits.where((e) => e.isNew).toList();
    newExhibits.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return newExhibits.take(limit).toList();
  }

  // Get interactive exhibits
  List<Exhibit> getInteractiveExhibits({int limit = 5}) {
    final interactive = _exhibits.where((e) => e.isInteractive).toList();
    return interactive.take(limit).toList();
  }

  // Add new exhibit
  Future<void> addExhibit(Exhibit exhibit) async {
    try {
      _isLoading = true;
      notifyListeners();

      // Simulate API call delay
      await Future.delayed(const Duration(milliseconds: 500));

      // Add to list
      _exhibits.add(exhibit);
      
      // Reload stats
      await _loadStats();

      if (AppConstants.enableDebugLogs) {
        debugPrint('➕ Added exhibit: ${exhibit.name}');
      }
    } catch (e) {
      _error = 'Failed to add exhibit: $e';
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Failed to add exhibit: $e');
      }
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Update exhibit
  Future<void> updateExhibit(Exhibit updatedExhibit) async {
    try {
      _isLoading = true;
      notifyListeners();

      // Simulate API call delay
      await Future.delayed(const Duration(milliseconds: 500));

      final index = _exhibits.indexWhere((e) => e.id == updatedExhibit.id);
      if (index != -1) {
        _exhibits[index] = updatedExhibit;
        
        // Reload stats
        await _loadStats();

        if (AppConstants.enableDebugLogs) {
          debugPrint('✏️ Updated exhibit: ${updatedExhibit.name}');
        }
      }
    } catch (e) {
      _error = 'Failed to update exhibit: $e';
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Failed to update exhibit: $e');
      }
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Delete exhibit (soft delete)
  Future<void> deleteExhibit(String id) async {
    try {
      _isLoading = true;
      notifyListeners();

      // Simulate API call delay
      await Future.delayed(const Duration(milliseconds: 500));

      final index = _exhibits.indexWhere((e) => e.id == id);
      if (index != -1) {
        final exhibit = _exhibits[index];
        _exhibits[index] = exhibit.copyWith(isDeleted: true);
        
        // Reload stats
        await _loadStats();

        if (AppConstants.enableDebugLogs) {
          debugPrint('🗑️ Deleted exhibit: $id');
        }
      }
    } catch (e) {
      _error = 'Failed to delete exhibit: $e';
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Failed to delete exhibit: $e');
      }
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Restore exhibit
  Future<void> restoreExhibit(String id) async {
    try {
      _isLoading = true;
      notifyListeners();

      // Simulate API call delay
      await Future.delayed(const Duration(milliseconds: 500));

      final index = _exhibits.indexWhere((e) => e.id == id);
      if (index != -1) {
        final exhibit = _exhibits[index];
        _exhibits[index] = exhibit.copyWith(isDeleted: false);
        
        // Reload stats
        await _loadStats();

        if (AppConstants.enableDebugLogs) {
          debugPrint('🔄 Restored exhibit: $id');
        }
      }
    } catch (e) {
      _error = 'Failed to restore exhibit: $e';
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Failed to restore exhibit: $e');
      }
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Get filtered exhibits
  List<Exhibit> getFilteredExhibits({
    String? category,
    String? location,
    String? searchQuery,
    bool? interactiveOnly,
    bool? popularOnly,
    bool? newOnly,
  }) {
    List<Exhibit> filtered = _exhibits;

    // Apply filters
    if (category != null && category.toLowerCase() != 'all') {
      filtered = filtered.where((e) => e.category.toLowerCase() == category.toLowerCase()).toList();
    }

    if (location != null && location.toLowerCase() != 'all') {
      filtered = filtered.where((e) => e.location.toLowerCase() == location.toLowerCase()).toList();
    }

    if (searchQuery != null && searchQuery.isNotEmpty) {
      filtered = searchExhibits(searchQuery);
    }

    if (interactiveOnly == true) {
      filtered = filtered.where((e) => e.isInteractive).toList();
    }

    if (popularOnly == true) {
      filtered = filtered.where((e) => e.isPopular).toList();
    }

    if (newOnly == true) {
      filtered = filtered.where((e) => e.isNew).toList();
    }

    return filtered;
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // Refresh data
  Future<void> refresh() async {
    await _loadExhibits();
  }
} 