import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/device.dart';
import '../models/sync_status.dart';
import '../services/p2p_service.dart';
import '../services/database_service.dart';
import '../utils/constants.dart';

class SyncProvider extends ChangeNotifier {
  final P2PService _p2pService = P2PService();
  final DatabaseService _databaseService = DatabaseService();
  
  // State variables
  bool _isInitialized = false;
  bool _isDiscovering = false;
  bool _isConnected = false;
  bool _isSyncing = false;
  String _connectionStatus = 'Disconnected';
  String _lastSyncTime = 'Never';
  int _pendingSyncCount = 0;
  int _totalExhibits = 0;
  int _syncedExhibits = 0;
  List<Device> _discoveredDevices = [];
  Device? _connectedDevice;
  List<SyncStatus> _syncHistory = [];
  String? _errorMessage;
  
  // Stream subscriptions
  StreamSubscription<List<Device>>? _devicesSubscription;
  StreamSubscription<SyncStatus>? _syncStatusSubscription;
  StreamSubscription<String>? _connectionStatusSubscription;
  
  // Getters
  bool get isInitialized => _isInitialized;
  bool get isDiscovering => _isDiscovering;
  bool get isConnected => _isConnected;
  bool get isSyncing => _isSyncing;
  String get connectionStatus => _connectionStatus;
  String get lastSyncTime => _lastSyncTime;
  int get pendingSyncCount => _pendingSyncCount;
  int get totalExhibits => _totalExhibits;
  int get syncedExhibits => _syncedExhibits;
  List<Device> get discoveredDevices => List.unmodifiable(_discoveredDevices);
  Device? get connectedDevice => _connectedDevice;
  List<SyncStatus> get syncHistory => List.unmodifiable(_syncHistory);
  String? get errorMessage => _errorMessage;
  
  // Additional getters for new screens
  int get syncedCount => _syncedExhibits;
  Device? get connectedPC => _connectedDevice;
  
  // Computed properties
  double get syncProgress {
    if (_totalExhibits == 0) return 0.0;
    return _syncedExhibits / _totalExhibits;
  }
  
  bool get hasError => _errorMessage != null;
  bool get canSync => _isConnected && !_isSyncing && _pendingSyncCount > 0;
  
  // Initialize the sync provider
  Future<void> initialize() async {
    try {
      if (_isInitialized) return;
      
      // Initialize P2P service with database
      await _p2pService.initialize(_databaseService);
      
      // Set up stream subscriptions
      _setupStreamSubscriptions();
      
      // Start discovery
      await startDiscovery();
      
      _isInitialized = true;
      _errorMessage = null;
      notifyListeners();
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('✅ SyncProvider initialized successfully');
      }
    } catch (e) {
      _errorMessage = 'Failed to initialize sync: $e';
      notifyListeners();
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ SyncProvider initialization failed: $e');
      }
    }
  }
  
  // Set up stream subscriptions
  void _setupStreamSubscriptions() {
    _devicesSubscription = _p2pService.devicesStream.listen(_onDevicesUpdated);
    _syncStatusSubscription = _p2pService.syncStatusStream.listen(_onSyncStatusUpdated);
    _connectionStatusSubscription = _p2pService.connectionStatusStream.listen(_onConnectionStatusUpdated);
  }
  
  // Handle devices updates
  void _onDevicesUpdated(List<Device> devices) {
    _discoveredDevices = devices;
    _isDiscovering = _p2pService.isDiscovering;
    _connectedDevice = _p2pService.connectedPC;
    _isConnected = _p2pService.isConnected;
    notifyListeners();
  }
  
  // Handle sync status updates
  void _onSyncStatusUpdated(SyncStatus status) {
    _isSyncing = status.status == 'syncing';
    _pendingSyncCount = status.pendingCount;
    _totalExhibits = status.totalCount;
    _syncedExhibits = status.syncedCount;
    
    if (status.status == 'completed') {
      _lastSyncTime = DateTime.now().toString().substring(0, 19);
    }
    
    // Add to sync history
    _syncHistory.insert(0, status);
    if (_syncHistory.length > 50) {
      _syncHistory = _syncHistory.take(50).toList();
    }
    
    notifyListeners();
  }
  
  // Handle connection status updates
  void _onConnectionStatusUpdated(String status) {
    _connectionStatus = status;
    notifyListeners();
  }
  
  // Start device discovery
  Future<void> startDiscovery() async {
    try {
      _isDiscovering = true;
      _errorMessage = null;
      notifyListeners();
      
      await _p2pService.startDiscovery();
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('🔍 Started device discovery');
      }
    } catch (e) {
      _errorMessage = 'Failed to start discovery: $e';
      _isDiscovering = false;
      notifyListeners();
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Device discovery failed: $e');
      }
    }
  }
  
  // Stop device discovery
  Future<void> stopDiscovery() async {
    try {
      await _p2pService.stopDiscovery();
      _isDiscovering = false;
      notifyListeners();
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('🛑 Stopped device discovery');
      }
    } catch (e) {
      _errorMessage = 'Failed to stop discovery: $e';
      notifyListeners();
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Failed to stop discovery: $e');
      }
    }
  }
  
  // Connect to a device
  Future<void> connectToDevice(Device device) async {
    try {
      _errorMessage = null;
      notifyListeners();
      
      await _p2pService.connectToDevice(device);
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('🔗 Connected to device: ${device.name}');
      }
    } catch (e) {
      _errorMessage = 'Failed to connect to device: $e';
      notifyListeners();
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Connection failed: $e');
      }
    }
  }
  
  // Disconnect from current device
  Future<void> disconnect() async {
    try {
      await _p2pService.disconnect();
      _connectedDevice = null;
      _isConnected = false;
      notifyListeners();
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('🔌 Disconnected from device');
      }
    } catch (e) {
      _errorMessage = 'Failed to disconnect: $e';
      notifyListeners();
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Disconnect failed: $e');
      }
    }
  }
  
  // Start manual sync
  Future<void> startSync() async {
    try {
      if (!_isConnected) {
        _errorMessage = 'Not connected to any device';
        notifyListeners();
        return;
      }
      
      _errorMessage = null;
      notifyListeners();
      
      await _p2pService.startSync();
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('🔄 Started manual sync');
      }
    } catch (e) {
      _errorMessage = 'Failed to start sync: $e';
      notifyListeners();
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Manual sync failed: $e');
      }
    }
  }
  
  // Stop sync
  Future<void> stopSync() async {
    try {
      await _p2pService.stopSync();
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('🛑 Stopped sync');
      }
    } catch (e) {
      _errorMessage = 'Failed to stop sync: $e';
      notifyListeners();
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Failed to stop sync: $e');
      }
    }
  }
  
  // Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Start manual sync (alias for new screens)
  Future<void> startManualSync() async {
    await startSync();
  }

  // Refresh sync status (alias for new screens)
  Future<void> refreshSyncStatus() async {
    await refreshStatus();
  }
  
  // Refresh sync status
  Future<void> refreshStatus() async {
    try {
      _errorMessage = null;
      notifyListeners();
      
      // Update connection status
      _isConnected = _p2pService.isConnected;
      _connectedDevice = _p2pService.connectedPC;
      _isDiscovering = _p2pService.isDiscovering;
      
      // Get current sync status
      final status = await _p2pService.getCurrentSyncStatus();
      if (status != null) {
        _onSyncStatusUpdated(status);
      }
      
      notifyListeners();
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('🔄 Refreshed sync status');
      }
    } catch (e) {
      _errorMessage = 'Failed to refresh status: $e';
      notifyListeners();
      
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Status refresh failed: $e');
      }
    }
  }
  
  // Get sync statistics
  Map<String, dynamic> getSyncStatistics() {
    return {
      'totalExhibits': _totalExhibits,
      'syncedExhibits': _syncedExhibits,
      'pendingSyncCount': _pendingSyncCount,
      'syncProgress': syncProgress,
      'lastSyncTime': _lastSyncTime,
      'isConnected': _isConnected,
      'isSyncing': _isSyncing,
      'connectionStatus': _connectionStatus,
      'discoveredDevices': _discoveredDevices.length,
    };
  }








  
  // Dispose resources
  @override
  void dispose() {
    _devicesSubscription?.cancel();
    _syncStatusSubscription?.cancel();
    _connectionStatusSubscription?.cancel();
    _p2pService.dispose();
    super.dispose();
  }
} 