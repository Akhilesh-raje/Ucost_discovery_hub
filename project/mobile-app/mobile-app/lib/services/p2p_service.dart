import 'dart:async';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../models/device.dart';
import '../models/sync_status.dart';
import '../services/database_service.dart';
import '../utils/constants.dart';

class P2PService {
  static final P2PService _instance = P2PService._internal();
  factory P2PService() => _instance;
  P2PService._internal();

  // Stream controllers for real-time updates
  final StreamController<List<Device>> _devicesController = StreamController<List<Device>>.broadcast();
  final StreamController<SyncStatus> _syncStatusController = StreamController<SyncStatus>.broadcast();
  final StreamController<String> _connectionStatusController = StreamController<String>.broadcast();

  // Streams for UI updates
  Stream<List<Device>> get devicesStream => _devicesController.stream;
  Stream<SyncStatus> get syncStatusStream => _syncStatusController.stream;
  Stream<String> get connectionStatusStream => _connectionStatusController.stream;

  // State management
  List<Device> _discoveredDevices = [];
  Device? _currentDevice;
  Device? _connectedPC;
  final bool _isAdvertising = false;
  bool _isDiscovering = false;
  Timer? _syncTimer;
  Timer? _discoveryTimer;
  
  // Database service
  late DatabaseService _database;
  
  // Configuration
  static const Duration _discoveryInterval = Duration(seconds: 10);
  static const Duration _syncInterval = Duration(seconds: 30);

  // Getters
  List<Device> get discoveredDevices => List.unmodifiable(_discoveredDevices);
  Device? get currentDevice => _currentDevice;
  Device? get connectedPC => _connectedPC;
  bool get isAdvertising => _isAdvertising;
  bool get isDiscovering => _isDiscovering;
  bool get isConnected => _connectedPC != null;

  Future<void> initialize(DatabaseService database) async {
    try {
      _database = database;
      
      // Initialize current device
      await _initializeCurrentDevice();
      
      // Set up connectivity monitoring
      _setupConnectivityMonitoring();
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('✅ P2P Service initialized successfully');
      }
    } catch (e) {
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ P2P Service initialization failed: $e');
      }
      rethrow;
    }
  }

  Future<void> _initializeCurrentDevice() async {
    try {
      final deviceId = await _generateDeviceId();
      final deviceName = await _getDeviceName();
      final ipAddress = await _getDeviceIP();
      
      _currentDevice = Device(
        id: deviceId,
        name: deviceName,
        ipAddress: ipAddress,
        platform: Platform.isAndroid ? 'Android' : 'iOS',
        isConnected: false,
        lastSeen: DateTime.now(),
        deviceType: 'mobile',
        capabilities: ['exhibit_upload', 'p2p_sync', 'database_client'],
        connectionType: 'wifi',
        isOnline: true,
      );
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('📱 Current device initialized: ${_currentDevice!.name}');
      }
    } catch (e) {
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Failed to initialize current device: $e');
      }
      rethrow;
    }
  }

  Future<String> _generateDeviceId() async {
    // Simple device ID generation
    return 'mobile_${DateTime.now().millisecondsSinceEpoch}';
  }

  Future<String> _getDeviceName() async {
    try {
      if (Platform.isAndroid) {
        return 'Android Device';
      } else if (Platform.isIOS) {
        return 'iOS Device';
      } else {
        return 'Mobile Device';
      }
    } catch (e) {
      return 'Unknown Device';
    }
  }

  Future<String> _getDeviceIP() async {
    try {
      final interfaces = await NetworkInterface.list();
      for (final interface in interfaces) {
        if (interface.name.toLowerCase().contains('wlan') || 
            interface.name.toLowerCase().contains('wifi')) {
          for (final addr in interface.addresses) {
            if (addr.type == InternetAddressType.IPv4 && 
                !addr.address.startsWith('127.')) {
              return addr.address;
            }
          }
        }
      }
      return '127.0.0.1';
    } catch (e) {
      return '127.0.0.1';
    }
  }

  void _setupConnectivityMonitoring() {
    Connectivity().onConnectivityChanged.listen((ConnectivityResult result) {
      if (result == ConnectivityResult.wifi) {
        startDiscovery();
      } else {
        stopDiscovery();
      }
    });
  }

  Future<void> startDiscovery() async {
    if (_isDiscovering) return;
    
    try {
      _isDiscovering = true;
      _discoveryTimer = Timer.periodic(_discoveryInterval, (_) => _discoverDevices());
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('🔍 Started device discovery');
      }
    } catch (e) {
      _isDiscovering = false;
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Failed to start discovery: $e');
      }
    }
  }

  Future<void> stopDiscovery() async {
    _isDiscovering = false;
    _discoveryTimer?.cancel();
    
    if (AppConstants.enableDebugLogs) {
      debugPrint('🛑 Stopped device discovery');
    }
  }

  Future<void> _discoverDevices() async {
    try {
      // Simulate device discovery for demo purposes
      // In a real implementation, this would use mDNS or other discovery protocols
      final mockDevices = [
        Device(
          id: 'pc_001',
          name: 'UCOST PC Server',
          ipAddress: '192.168.1.100',
          platform: 'Windows',
          isConnected: false,
          lastSeen: DateTime.now(),
          deviceType: 'pc',
          capabilities: ['database_server', 'p2p_sync'],
          connectionType: 'wifi',
          isOnline: true,
        ),
      ];
      
      _discoveredDevices = mockDevices;
      _devicesController.add(_discoveredDevices);
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('📡 Discovered ${_discoveredDevices.length} devices');
      }
    } catch (e) {
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Device discovery failed: $e');
      }
    }
  }

  Future<void> connectToDevice(Device device) async {
    try {
      _connectedPC = device;
      _connectionStatusController.add('Connected to ${device.name}');
      
      // Start automatic sync
      _startAutoSync();
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('🔗 Connected to device: ${device.name}');
      }
    } catch (e) {
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Connection failed: $e');
      }
      rethrow;
    }
  }

  Future<void> disconnect() async {
    try {
      _stopAutoSync();
      _connectedPC = null;
      _connectionStatusController.add('Disconnected');
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('🔌 Disconnected from device');
      }
    } catch (e) {
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Disconnect failed: $e');
      }
    }
  }

  void _startAutoSync() {
    _syncTimer = Timer.periodic(_syncInterval, (_) => _performSync());
  }

  void _stopAutoSync() {
    _syncTimer?.cancel();
  }

  Future<void> startSync() async {
    await _performSync();
  }

  Future<void> stopSync() async {
    _syncTimer?.cancel();
  }

  Future<void> _performSync() async {
    if (_connectedPC == null) return;
    
    try {
      // Get pending exhibits
      final pendingExhibits = await _database.getPendingSyncExhibits();
      
      if (pendingExhibits.isEmpty) {
        _syncStatusController.add(SyncStatus(
          status: 'completed',
          pendingCount: 0,
          totalCount: 0,
          syncedCount: 0,
          timestamp: DateTime.now(),
        ));
        return;
      }
      
      // Update sync status
      _syncStatusController.add(SyncStatus(
        status: 'syncing',
        pendingCount: pendingExhibits.length,
        totalCount: pendingExhibits.length,
        syncedCount: 0,
        timestamp: DateTime.now(),
      ));
      
      // Simulate sync process
      int syncedCount = 0;
      for (final exhibit in pendingExhibits) {
        try {
          // Simulate API call to PC server
          await Future.delayed(const Duration(milliseconds: 100));
          
          // Update exhibit sync status
          await _database.updateExhibitSyncStatus(exhibit.id, 'completed');
          syncedCount++;
          
          // Update progress
          _syncStatusController.add(SyncStatus(
            status: 'syncing',
            pendingCount: pendingExhibits.length - syncedCount,
            totalCount: pendingExhibits.length,
            syncedCount: syncedCount,
            timestamp: DateTime.now(),
          ));
        } catch (e) {
          await _database.updateExhibitSyncStatus(exhibit.id, 'failed');
          if (AppConstants.enableDebugLogs) {
            debugPrint('❌ Failed to sync exhibit ${exhibit.id}: $e');
          }
        }
      }
      
      // Final sync status
      _syncStatusController.add(SyncStatus(
        status: 'completed',
        pendingCount: 0,
        totalCount: pendingExhibits.length,
        syncedCount: syncedCount,
        timestamp: DateTime.now(),
      ));
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('✅ Sync completed: $syncedCount/${pendingExhibits.length} exhibits');
      }
    } catch (e) {
      _syncStatusController.add(SyncStatus(
        status: 'failed',
        pendingCount: 0,
        totalCount: 0,
        syncedCount: 0,
        timestamp: DateTime.now(),
        errorMessage: e.toString(),
      ));
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Sync failed: $e');
      }
    }
  }

  Future<SyncStatus?> getCurrentSyncStatus() async {
    try {
      final pendingCount = await _database.getPendingSyncCount();
      final totalCount = await _database.getExhibitCount();
      
      return SyncStatus(
        status: pendingCount > 0 ? 'pending' : 'completed',
        pendingCount: pendingCount,
        totalCount: totalCount,
        syncedCount: totalCount - pendingCount,
        timestamp: DateTime.now(),
      );
    } catch (e) {
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Failed to get sync status: $e');
      }
      return null;
    }
  }

  void dispose() {
    _discoveryTimer?.cancel();
    _syncTimer?.cancel();
    _devicesController.close();
    _syncStatusController.close();
    _connectionStatusController.close();
  }
} 