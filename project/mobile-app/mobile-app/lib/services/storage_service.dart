import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/exhibit.dart';

class StorageService {
  static const String _exhibitsKey = 'exhibits';
  static const String _uploadQueueKey = 'upload_queue';
  static const String _settingsKey = 'settings';

  Future<void> initialize() async {
    // Initialize storage
  }

  Future<void> saveExhibits(List<Exhibit> exhibits) async {
    final prefs = await SharedPreferences.getInstance();
    final exhibitsJson = exhibits.map((e) => e.toJson()).toList();
    await prefs.setString(_exhibitsKey, jsonEncode(exhibitsJson));
  }

  Future<List<Exhibit>> getExhibits() async {
    final prefs = await SharedPreferences.getInstance();
    final exhibitsString = prefs.getString(_exhibitsKey);
    if (exhibitsString != null) {
      final exhibitsJson = jsonDecode(exhibitsString) as List;
      return exhibitsJson.map((e) => Exhibit.fromJson(e)).toList();
    }
    return [];
  }

  Future<void> saveUploadQueue(List<Exhibit> queue) async {
    final prefs = await SharedPreferences.getInstance();
    final queueJson = queue.map((e) => e.toJson()).toList();
    await prefs.setString(_uploadQueueKey, jsonEncode(queueJson));
  }

  Future<List<Exhibit>> getUploadQueue() async {
    final prefs = await SharedPreferences.getInstance();
    final queueString = prefs.getString(_uploadQueueKey);
    if (queueString != null) {
      final queueJson = jsonDecode(queueString) as List;
      return queueJson.map((e) => Exhibit.fromJson(e)).toList();
    }
    return [];
  }

  Future<void> saveSettings(Map<String, dynamic> settings) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_settingsKey, jsonEncode(settings));
  }

  Future<Map<String, dynamic>> getSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final settingsString = prefs.getString(_settingsKey);
    if (settingsString != null) {
      return jsonDecode(settingsString);
    }
    return {};
  }
} 