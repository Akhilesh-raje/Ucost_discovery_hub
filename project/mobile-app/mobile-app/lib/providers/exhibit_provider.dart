import 'package:flutter/material.dart';
import '../models/exhibit.dart';

class ExhibitProvider extends ChangeNotifier {
  List<Exhibit> _exhibits = [];
  List<Exhibit> _uploadQueue = [];

  // Getters
  List<Exhibit> get exhibits => _exhibits;
  List<Exhibit> get uploadQueue => _uploadQueue;

  ExhibitProvider() {
    _loadMockData();
  }

  void _loadMockData() {
    _exhibits = [
      Exhibit(
        name: 'Ancient Artifacts Collection',
        description: 'A collection of ancient artifacts from various civilizations including pottery, tools, and decorative items.',
        category: 'Archaeology',
        location: 'Gallery A, Floor 1',
        images: [
          'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        ],
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
      ),
      Exhibit(
        name: 'Modern Art Gallery',
        description: 'Contemporary art pieces from local and international artists showcasing various styles and techniques.',
        category: 'Modern Art',
        location: 'Gallery B, Floor 2',
        images: [
          'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
        ],
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
      Exhibit(
        name: 'Natural History Display',
        description: 'Fossils, minerals, and specimens from the natural world, including dinosaur bones and rare minerals.',
        category: 'Natural History',
        location: 'Gallery C, Floor 1',
        images: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
          'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400',
        ],
        createdAt: DateTime.now().subtract(const Duration(hours: 6)),
      ),
    ];
  }

  Future<bool> addExhibit(Exhibit exhibit) async {
    try {
      // Simulate upload delay
      await Future.delayed(const Duration(seconds: 2));
      
      _exhibits.add(exhibit);
      notifyListeners();
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> updateExhibit(Exhibit exhibit) async {
    try {
      final index = _exhibits.indexWhere((e) => e.id == exhibit.id);
      if (index != -1) {
        _exhibits[index] = exhibit;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> deleteExhibit(String exhibitId) async {
    try {
      _exhibits.removeWhere((e) => e.id == exhibitId);
      notifyListeners();
      return true;
    } catch (e) {
      return false;
    }
  }

  void addToUploadQueue(Exhibit exhibit) {
    _uploadQueue.add(exhibit);
    notifyListeners();
  }

  void removeFromUploadQueue(String exhibitId) {
    _uploadQueue.removeWhere((e) => e.id == exhibitId);
    notifyListeners();
  }

  Future<void> uploadAllQueuedExhibits() async {
    for (final exhibit in _uploadQueue) {
      await addExhibit(exhibit);
    }
    _uploadQueue.clear();
    notifyListeners();
  }

  List<Exhibit> getExhibitsByCategory(String category) {
    return _exhibits.where((e) => e.category == category).toList();
  }

  List<String> getCategories() {
    return _exhibits.map((e) => e.category).toSet().toList();
  }

  List<Exhibit> searchExhibits(String query) {
    final lowercaseQuery = query.toLowerCase();
    return _exhibits.where((exhibit) {
      return exhibit.name.toLowerCase().contains(lowercaseQuery) ||
             exhibit.description.toLowerCase().contains(lowercaseQuery) ||
             exhibit.category.toLowerCase().contains(lowercaseQuery) ||
             exhibit.location.toLowerCase().contains(lowercaseQuery);
    }).toList();
  }

  List<Exhibit> getRecentExhibits({int limit = 5}) {
    final sortedExhibits = List<Exhibit>.from(_exhibits);
    sortedExhibits.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return sortedExhibits.take(limit).toList();
  }

  List<Exhibit> getExhibitsByLocation(String location) {
    return _exhibits.where((e) => e.location == location).toList();
  }

  int getTotalExhibits() {
    return _exhibits.length;
  }

  int getExhibitsByCategoryCount(String category) {
    return _exhibits.where((e) => e.category == category).length;
  }

  Map<String, int> getCategoryStats() {
    final stats = <String, int>{};
    for (final exhibit in _exhibits) {
      stats[exhibit.category] = (stats[exhibit.category] ?? 0) + 1;
    }
    return stats;
  }

  Exhibit? getExhibitById(String id) {
    try {
      return _exhibits.firstWhere((e) => e.id == id);
    } catch (e) {
      return null;
    }
  }
} 