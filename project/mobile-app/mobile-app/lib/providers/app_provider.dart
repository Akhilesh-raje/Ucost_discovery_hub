import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import '../services/api_service.dart';
import '../services/p2p_service.dart';
import '../services/storage_service.dart';
import '../models/device.dart';
import '../models/sync_status.dart';

class AppProvider extends ChangeNotifier {
  final ApiService _apiService = GetIt.instance<ApiService>();
  final P2PService _p2pService = GetIt.instance<P2PService>();
  final StorageService _storageService = GetIt.instance<StorageService>();

  // Device Information
  String? _deviceId;
  String? _deviceName;
  bool _isConnected = false;
  Device? _connectedDevice;
  String _connectionType = 'none';

  // Sync Status
  SyncStatus? _syncStatus;
  bool _isSyncing = false;
  double _syncProgress = 0.0;

  // App State
  bool _isLoading = false;
  String? _errorMessage;

  // Getters
  String? get deviceId => _deviceId;
  String? get deviceName => _deviceName;
  bool get isConnected => _isConnected;
  Device? get connectedDevice => _connectedDevice;
  String get connectionType => _connectionType;
  SyncStatus? get syncStatus => _syncStatus;
  bool get isSyncing => _isSyncing;
  double get syncProgress => _syncProgress;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  AppProvider() {
    _initialize();
  }

  Future<void> _initialize() async {
    try {
      _setLoading(true);
      
      // Initialize device info
      _deviceId = await _p2pService.currentDevice?.id;
      _deviceName = await _p2pService.currentDevice?.name;
      _isConnected = _p2pService.connectedDeviceId != null;
      _connectedDevice = _p2pService.currentDevice;
      _connectionType = _isConnected ? 'p2p' : 'none';
      
      // Listen to P2P service streams
      _p2pService.connectionStatusStream.listen((status) {
        _connectionType = status.contains('Connected') ? 'p2p' : 'none';
        _isConnected = status.contains('Connected');
        notifyListeners();
      });

      _p2pService.syncStatusStream.listen((status) {
        _syncStatus = status;
        notifyListeners();
      });

      _p2pService.devicesStream.listen((devices) {
        // Handle device discovery updates
        notifyListeners();
      });

      _p2pService.dataReceivedStream.listen((data) {
        // Handle received data
        _handleReceivedData(data);
      });

      _setLoading(false);
    } catch (e) {
      _setError('Failed to initialize app: $e');
    }
  }

  void _handleReceivedData(Map<String, dynamic> data) {
    // Handle different types of received data
    final type = data['type'];
    
    switch (type) {
      case 'exhibit_sync':
        _handleExhibitSync(data);
        break;
      case 'status_update':
        _handleStatusUpdate(data);
        break;
      case 'admin_command':
        _handleAdminCommand(data);
        break;
      default:
        print('Unknown data type received: $type');
    }
  }

  void _handleExhibitSync(Map<String, dynamic> data) {
    // Handle exhibit synchronization
    print('Processing exhibit sync data');
    // TODO: Implement exhibit sync logic
  }

  void _handleStatusUpdate(Map<String, dynamic> data) {
    // Handle status updates
    print('Processing status update');
    // TODO: Implement status update logic
  }

  void _handleAdminCommand(Map<String, dynamic> data) {
    // Handle admin commands
    print('Processing admin command');
    // TODO: Implement admin command handling
  }

  // Connection Management
  Future<bool> connectToDevice(String deviceId) async {
    try {
      _setLoading(true);
      
      await _p2pService.connectToDevice(deviceId);
      
      _isConnected = true;
      _connectionType = 'p2p';
      notifyListeners();
      
      _setLoading(false);
      return true;
    } catch (e) {
      _setError('Failed to connect: $e');
      return false;
    }
  }

  Future<void> disconnectFromDevice() async {
    try {
      await _p2pService.disconnectFromDevice();
      
      _isConnected = false;
      _connectedDevice = null;
      _connectionType = 'none';
      notifyListeners();
    } catch (e) {
      _setError('Failed to disconnect: $e');
    }
  }

  // Sync Management
  Future<bool> startSync() async {
    if (!_isConnected) return false;
    
    try {
      _isSyncing = true;
      _syncProgress = 0.0;
      notifyListeners();
      
      // Simulate sync progress
      for (int i = 0; i <= 100; i += 10) {
        await Future.delayed(const Duration(milliseconds: 200));
        _syncProgress = i / 100;
        notifyListeners();
      }
      
      _isSyncing = false;
      _syncProgress = 1.0;
      notifyListeners();
      
      return true;
    } catch (e) {
      _isSyncing = false;
      _setError('Sync failed: $e');
      return false;
    }
  }

  Future<void> stopSync() async {
    _isSyncing = false;
    _syncProgress = 0.0;
    notifyListeners();
  }

  // Exhibit Management
  Future<bool> uploadExhibit(Map<String, dynamic> exhibitData) async {
    try {
      _setLoading(true);
      
      final response = await _apiService.uploadExhibit(exhibitData);
      
      _setLoading(false);
      return response['success'] == true;
    } catch (e) {
      _setError('Upload failed: $e');
      return false;
    }
  }

  Future<List<Map<String, dynamic>>> getExhibits() async {
    try {
      final response = await _apiService.get(ApiEndpoints.exhibits);
      return List<Map<String, dynamic>>.from(response.data);
    } catch (e) {
      _setError('Failed to get exhibits: $e');
      return [];
    }
  }

  // Device Discovery
  Future<List<Device>> discoverDevices() async {
    try {
      // Start discovery if not already discovering
      if (!_p2pService.isDiscovering) {
        await _p2pService.startDiscovery();
      }
      
      return _p2pService.discoveredDevices;
    } catch (e) {
      _setError('Device discovery failed: $e');
      return [];
    }
  }

  // Error Handling
  void _setError(String message) {
    _errorMessage = message;
    _isLoading = false;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  // Cleanup
  @override
  void dispose() {
    super.dispose();
  }
} 