import 'dart:io';
import 'package:sqflite/sqflite.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as path;
import '../models/exhibit.dart';
import '../utils/constants.dart';

class DatabaseService {
  static final DatabaseService _instance = DatabaseService._internal();
  factory DatabaseService() => _instance;
  DatabaseService._internal();

  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    Directory documentsDirectory = await getApplicationDocumentsDirectory();
    String dbPath = path.join(documentsDirectory.path, AppConstants.databaseName);

    return await openDatabase(
      dbPath,
      version: AppConstants.databaseVersion,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE exhibits (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        location TEXT NOT NULL,
        images TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        is_deleted INTEGER DEFAULT 0,
        metadata TEXT,
        sync_status TEXT DEFAULT 'pending',
        last_sync_attempt TEXT,
        sync_retry_count INTEGER DEFAULT 0
      )
    ''');

    await db.execute('''
      CREATE TABLE sync_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exhibit_id TEXT NOT NULL,
        action TEXT NOT NULL,
        status TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        error_message TEXT,
        target_device TEXT
      )
    ''');
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    // Handle future migrations here
  }

  // Exhibit CRUD operations
  Future<List<Exhibit>> getAllExhibits() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'exhibits',
      where: 'is_deleted = ?',
      whereArgs: [0],
      orderBy: 'created_at DESC',
    );

    return List.generate(maps.length, (i) => _exhibitFromMap(maps[i]));
  }

  Future<Exhibit?> getExhibitById(String id) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'exhibits',
      where: 'id = ? AND is_deleted = ?',
      whereArgs: [id, 0],
    );

    if (maps.isNotEmpty) {
      return _exhibitFromMap(maps.first);
    }
    return null;
  }

  Future<List<Exhibit>> getPendingSyncExhibits() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'exhibits',
      where: 'sync_status = ? AND is_deleted = ?',
      whereArgs: ['pending', 0],
      orderBy: 'created_at ASC',
    );

    return List.generate(maps.length, (i) => _exhibitFromMap(maps[i]));
  }

  Future<List<Exhibit>> searchExhibits(String query) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'exhibits',
      where: 'is_deleted = ? AND (name LIKE ? OR description LIKE ? OR category LIKE ?)',
      whereArgs: [0, '%$query%', '%$query%', '%$query%'],
      orderBy: 'created_at DESC',
    );

    return List.generate(maps.length, (i) => _exhibitFromMap(maps[i]));
  }

  Future<List<Exhibit>> getExhibitsByCategory(String category) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'exhibits',
      where: 'category = ? AND is_deleted = ?',
      whereArgs: [category, 0],
      orderBy: 'created_at DESC',
    );

    return List.generate(maps.length, (i) => _exhibitFromMap(maps[i]));
  }

  Future<List<Exhibit>> getExhibitsByLocation(String location) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'exhibits',
      where: 'location = ? AND is_deleted = ?',
      whereArgs: [location, 0],
      orderBy: 'created_at DESC',
    );

    return List.generate(maps.length, (i) => _exhibitFromMap(maps[i]));
  }

  Future<void> insertExhibit(Exhibit exhibit) async {
    final db = await database;
    await db.insert('exhibits', _exhibitToMap(exhibit));
    
    // Log sync action
    await _logSyncAction(exhibit.id, 'insert', 'pending');
  }

  Future<void> updateExhibit(Exhibit exhibit) async {
    final db = await database;
    await db.update(
      'exhibits',
      _exhibitToMap(exhibit),
      where: 'id = ?',
      whereArgs: [exhibit.id],
    );
    
    // Log sync action
    await _logSyncAction(exhibit.id, 'update', 'pending');
  }

  Future<void> deleteExhibit(String id) async {
    final db = await database;
    await db.update(
      'exhibits',
      {'is_deleted': 1, 'updated_at': DateTime.now().toIso8601String()},
      where: 'id = ?',
      whereArgs: [id],
    );
    
    // Log sync action
    await _logSyncAction(id, 'delete', 'pending');
  }

  // Sync status operations
  Future<void> updateExhibitSyncStatus(String id, String status, {String? errorMessage}) async {
    final db = await database;
    
    // Get current retry count
    final currentResult = await db.query(
      'exhibits',
      columns: ['sync_retry_count'],
      where: 'id = ?',
      whereArgs: [id],
    );
    
    final currentRetryCount = currentResult.isNotEmpty ? (currentResult.first['sync_retry_count'] as int?) ?? 0 : 0;
    final newRetryCount = currentRetryCount + 1;
    
    await db.update(
      'exhibits',
      {
        'sync_status': status,
        'last_sync_attempt': DateTime.now().toIso8601String(),
        'sync_retry_count': newRetryCount,
      },
      where: 'id = ?',
      whereArgs: [id],
    );
    
    // Log sync action
    await _logSyncAction(id, 'sync', status, errorMessage: errorMessage);
  }

  Future<int> getExhibitCount() async {
    final db = await database;
    final result = await db.rawQuery('SELECT COUNT(*) as count FROM exhibits WHERE is_deleted = 0');
    return Sqflite.firstIntValue(result) ?? 0;
  }

  Future<int> getPendingSyncCount() async {
    final db = await database;
    final result = await db.rawQuery(
      'SELECT COUNT(*) as count FROM exhibits WHERE sync_status = ? AND is_deleted = 0',
      ['pending']
    );
    return Sqflite.firstIntValue(result) ?? 0;
  }

  Future<int> getSyncedCount() async {
    final db = await database;
    final result = await db.rawQuery(
      'SELECT COUNT(*) as count FROM exhibits WHERE sync_status = ? AND is_deleted = 0',
      ['completed']
    );
    return Sqflite.firstIntValue(result) ?? 0;
  }

  Future<int> getFailedSyncCount() async {
    final db = await database;
    final result = await db.rawQuery(
      'SELECT COUNT(*) as count FROM exhibits WHERE sync_status = ? AND is_deleted = 0',
      ['failed']
    );
    return Sqflite.firstIntValue(result) ?? 0;
  }

  // Sync logging
  Future<void> _logSyncAction(String exhibitId, String action, String status, {String? errorMessage}) async {
    final db = await database;
    await db.insert('sync_logs', {
      'exhibit_id': exhibitId,
      'action': action,
      'status': status,
      'timestamp': DateTime.now().toIso8601String(),
      'error_message': errorMessage,
      'target_device': 'pc_server',
    });
  }

  Future<List<Map<String, dynamic>>> getSyncLogs({int limit = 50}) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'sync_logs',
      orderBy: 'timestamp DESC',
      limit: limit,
    );
    return maps;
  }

  // Statistics
  Future<Map<String, int>> getExhibitStats() async {
    final total = await getExhibitCount();
    final pending = await getPendingSyncCount();
    final synced = await getSyncedCount();
    final failed = await getFailedSyncCount();

    return {
      'total': total,
      'pending': pending,
      'synced': synced,
      'failed': failed,
    };
  }

  Future<Map<String, int>> getCategoryStats() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.rawQuery('''
      SELECT category, COUNT(*) as count 
      FROM exhibits 
      WHERE is_deleted = 0 
      GROUP BY category 
      ORDER BY count DESC
    ''');

    final Map<String, int> stats = {};
    for (final map in maps) {
      stats[map['category'] as String] = map['count'] as int;
    }
    return stats;
  }

  Future<Map<String, int>> getLocationStats() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.rawQuery('''
      SELECT location, COUNT(*) as count 
      FROM exhibits 
      WHERE is_deleted = 0 
      GROUP BY location 
      ORDER BY count DESC
    ''');

    final Map<String, int> stats = {};
    for (final map in maps) {
      stats[map['location'] as String] = map['count'] as int;
    }
    return stats;
  }

  // Database maintenance
  Future<void> clearSyncLogs() async {
    final db = await database;
    await db.delete('sync_logs');
  }

  Future<void> resetSyncStatus() async {
    final db = await database;
    await db.update(
      'exhibits',
      {'sync_status': 'pending'},
      where: 'sync_status IN (?, ?)',
      whereArgs: ['failed', 'completed'],
    );
  }

  Future<void> close() async {
    final db = await database;
    await db.close();
    _database = null;
  }

  // Helper methods
  Exhibit _exhibitFromMap(Map<String, dynamic> map) {
    return Exhibit(
      id: map['id'] as String,
      name: map['name'] as String,
      description: map['description'] as String,
      category: map['category'] as String,
      location: map['location'] as String,
      images: (map['images'] as String?)?.split('|').where((s) => s.isNotEmpty).toList() ?? [],
      createdAt: DateTime.parse(map['created_at'] as String),
      updatedAt: DateTime.parse(map['updated_at'] as String),
      isDeleted: (map['is_deleted'] as int) == 1,
      metadata: {
        'sync_status': map['sync_status'] as String? ?? 'pending',
        'last_sync_attempt': map['last_sync_attempt'] as String?,
        'sync_retry_count': map['sync_retry_count'] as int? ?? 0,
      },
    );
  }

  Map<String, dynamic> _exhibitToMap(Exhibit exhibit) {
    return {
      'id': exhibit.id,
      'name': exhibit.name,
      'description': exhibit.description,
      'category': exhibit.category,
      'location': exhibit.location,
      'images': exhibit.images.join('|'),
      'created_at': exhibit.createdAt.toIso8601String(),
      'updated_at': exhibit.updatedAt.toIso8601String(),
      'is_deleted': exhibit.isDeleted ? 1 : 0,
      'metadata': exhibit.metadata.toString(),
      'sync_status': exhibit.metadata['sync_status'] ?? 'pending',
      'last_sync_attempt': exhibit.metadata['last_sync_attempt'],
      'sync_retry_count': exhibit.metadata['sync_retry_count'] ?? 0,
    };
  }
} 