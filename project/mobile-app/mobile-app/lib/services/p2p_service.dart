import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:network_info_plus/network_info_plus.dart';
import 'package:wifi_scan/wifi_scan.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../models/device.dart';
import '../models/sync_status.dart';
import '../utils/constants.dart';

class P2PService {
  // Singleton pattern
  static final P2PService _instance = P2PService._internal();
  factory P2PService() => _instance;
  P2PService._internal();

  // Stream controllers for real-time updates
  final StreamController<List<Device>> _devicesController = StreamController<List<Device>>.broadcast();
  final StreamController<SyncStatus> _syncStatusController = StreamController<SyncStatus>.broadcast();
  final StreamController<String> _connectionStatusController = StreamController<String>.broadcast();
  final StreamController<Map<String, dynamic>> _dataReceivedController = StreamController<Map<String, dynamic>>.broadcast();

  // Streams for UI updates
  Stream<List<Device>> get devicesStream => _devicesController.stream;
  Stream<SyncStatus> get syncStatusStream => _syncStatusController.stream;
  Stream<String> get connectionStatusStream => _connectionStatusController.stream;
  Stream<Map<String, dynamic>> get dataReceivedStream => _dataReceivedController.stream;

  // State management
  List<Device> _discoveredDevices = [];
  Device? _currentDevice;
  String? _connectedDeviceId;
  bool _isAdvertising = false;
  bool _isDiscovering = false;
  Timer? _syncTimer;
  Timer? _discoveryTimer;

  // Getters
  List<Device> get discoveredDevices => List.unmodifiable(_discoveredDevices);
  Device? get currentDevice => _currentDevice;
  String? get connectedDeviceId => _connectedDeviceId;
  bool get isAdvertising => _isAdvertising;
  bool get isDiscovering => _isDiscovering;

  Future<void> initialize() async {
    try {
      // Initialize current device
      await _initializeCurrentDevice();
      
      // Set up connectivity monitoring
      _setupConnectivityMonitoring();
      
      print('✅ P2P Service initialized successfully (Mock Mode)');
    } catch (e) {
      print('❌ P2P Service initialization failed: $e');
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
      );
      
      print('📱 Current device initialized: ${_currentDevice!.name}');
    } catch (e) {
      print('❌ Failed to initialize current device: $e');
      rethrow;
    }
  }

  Future<String> _generateDeviceId() async {
    // Generate a unique device ID based on device info
    final deviceInfo = await _getDeviceInfo();
    return 'ucost_${deviceInfo.hashCode}_${DateTime.now().millisecondsSinceEpoch}';
  }

  Future<String> _getDeviceName() async {
    try {
      return Platform.isAndroid ? 'Android Device' : 'iOS Device';
    } catch (e) {
      return 'Unknown Device';
    }
  }

  Future<String> _getDeviceIP() async {
    try {
      final networkInfo = NetworkInfo();
      return await networkInfo.getWifiIP() ?? 'Unknown';
    } catch (e) {
      return 'Unknown';
    }
  }

  Future<Map<String, dynamic>> _getDeviceInfo() async {
    return {
      'platform': Platform.operatingSystem,
      'version': Platform.operatingSystemVersion,
    };
  }

  void _setupConnectivityMonitoring() {
    Connectivity().onConnectivityChanged.listen((ConnectivityResult result) {
      if (result == ConnectivityResult.wifi) {
        _onWifiConnected();
      } else {
        _onWifiDisconnected();
      }
    });
  }

  void _onWifiConnected() {
    print('📶 WiFi connected - starting P2P services');
    startAdvertising();
    startDiscovery();
  }

  void _onWifiDisconnected() {
    print('📶 WiFi disconnected - stopping P2P services');
    stopAdvertising();
    stopDiscovery();
  }

  // Mock Advertising (Making this device discoverable)
  Future<void> startAdvertising() async {
    if (_isAdvertising) return;
    
    try {
      // Simulate advertising
      await Future.delayed(const Duration(milliseconds: 500));
      
      _isAdvertising = true;
      _connectionStatusController.add('Advertising started (Mock)');
      print('📡 Started advertising as: ${_currentDevice!.name} (Mock)');
    } catch (e) {
      print('❌ Failed to start advertising: $e');
      rethrow;
    }
  }

  Future<void> stopAdvertising() async {
    if (!_isAdvertising) return;
    
    try {
      _isAdvertising = false;
      _connectionStatusController.add('Advertising stopped');
      print('📡 Stopped advertising');
    } catch (e) {
      print('❌ Failed to stop advertising: $e');
    }
  }

  // Mock Discovery (Finding other devices)
  Future<void> startDiscovery() async {
    if (_isDiscovering) return;
    
    try {
      _isDiscovering = true;
      _connectionStatusController.add('Discovery started (Mock)');
      print('🔍 Started discovering devices (Mock)');
      
      // Start periodic discovery simulation
      _discoveryTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
        _simulateDeviceDiscovery();
      });
    } catch (e) {
      print('❌ Failed to start discovery: $e');
      rethrow;
    }
  }

  Future<void> stopDiscovery() async {
    if (!_isDiscovering) return;
    
    try {
      _discoveryTimer?.cancel();
      _isDiscovering = false;
      _connectionStatusController.add('Discovery stopped');
      print('🔍 Stopped discovering devices');
    } catch (e) {
      print('❌ Failed to stop discovery: $e');
    }
  }

  void _simulateDeviceDiscovery() {
    // Simulate discovering mock devices
    final mockDevices = [
      Device(
        id: 'kiosk-1',
        name: 'UCOST Kiosk 1',
        ipAddress: '192.168.1.100',
        platform: 'Android',
        isConnected: false,
        lastSeen: DateTime.now(),
      ),
      Device(
        id: 'kiosk-2',
        name: 'UCOST Kiosk 2',
        ipAddress: '192.168.1.101',
        platform: 'Android',
        isConnected: false,
        lastSeen: DateTime.now(),
      ),
      Device(
        id: 'mobile-1',
        name: 'Mobile Device 1',
        ipAddress: '192.168.1.102',
        platform: 'Android',
        isConnected: false,
        lastSeen: DateTime.now(),
      ),
    ];

    // Randomly add/remove devices to simulate discovery
    if (_discoveredDevices.isEmpty) {
      _discoveredDevices.addAll(mockDevices);
    } else {
      // Simulate device coming and going
      if (DateTime.now().millisecondsSinceEpoch % 10 == 0) {
        _discoveredDevices.clear();
        _discoveredDevices.addAll(mockDevices.take(2));
      }
    }
    
    _devicesController.add(_discoveredDevices);
  }

  // Mock Connection Management
  Future<void> connectToDevice(String deviceId) async {
    try {
      print('🔗 Requesting connection to: $deviceId (Mock)');
      
      // Simulate connection delay
      await Future.delayed(const Duration(seconds: 2));
      
      final device = _discoveredDevices.firstWhere(
        (d) => d.id == deviceId,
        orElse: () => Device(
          id: deviceId,
          name: 'Unknown Device',
          ipAddress: 'Unknown',
          platform: 'Unknown',
          isConnected: false,
          lastSeen: DateTime.now(),
        ),
      );
      
      _connectedDeviceId = deviceId;
      _connectionStatusController.add('Connected to ${device.name}');
      
      // Start periodic sync
      _startPeriodicSync();
      
      print('🔗 Connected to device: ${device.name}');
    } catch (e) {
      print('❌ Failed to request connection: $e');
      rethrow;
    }
  }

  Future<void> disconnectFromDevice() async {
    if (_connectedDeviceId != null) {
      try {
        _connectedDeviceId = null;
        _connectionStatusController.add('Disconnected');
        
        // Stop periodic sync
        _stopPeriodicSync();
        
        print('🔗 Disconnected from device');
      } catch (e) {
        print('❌ Failed to disconnect: $e');
      }
    }
  }

  // Mock Data Transfer
  Future<void> sendData(String endpointId, Map<String, dynamic> data) async {
    try {
      // Simulate data transfer
      await Future.delayed(const Duration(milliseconds: 500));
      
      print('📤 Sent data to: $endpointId (Mock)');
      
      // Simulate receiving response
      await Future.delayed(const Duration(milliseconds: 300));
      _dataReceivedController.add({
        'type': 'response',
        'from': endpointId,
        'data': {'status': 'received'},
      });
    } catch (e) {
      print('❌ Failed to send data: $e');
      rethrow;
    }
  }

  Future<void> sendExhibitSync(String endpointId, Map<String, dynamic> exhibitData) async {
    final data = {
      'type': 'exhibit_sync',
      'timestamp': DateTime.now().toIso8601String(),
      'data': exhibitData,
    };
    
    await sendData(endpointId, data);
  }

  Future<void> sendStatusUpdate(String endpointId, SyncStatus status) async {
    final data = {
      'type': 'status_update',
      'timestamp': DateTime.now().toIso8601String(),
      'status': status.toJson(),
    };
    
    await sendData(endpointId, data);
  }

  // Periodic Sync
  void _startPeriodicSync() {
    _syncTimer?.cancel();
    _syncTimer = Timer.periodic(P2PConfig.syncInterval, (timer) {
      if (_connectedDeviceId != null) {
        _performPeriodicSync();
      }
    });
  }

  void _stopPeriodicSync() {
    _syncTimer?.cancel();
    _syncTimer = null;
  }

  Future<void> _performPeriodicSync() async {
    try {
      final syncStatus = SyncStatus(
        deviceId: _currentDevice!.id,
        lastSync: DateTime.now(),
        isOnline: true,
        pendingUploads: 0,
        pendingDownloads: 0,
      );
      
      await sendStatusUpdate(_connectedDeviceId!, syncStatus);
      _syncStatusController.add(syncStatus);
    } catch (e) {
      print('❌ Periodic sync failed: $e');
    }
  }

  // WiFi Network Scanning
  Future<List<WiFiAccessPoint>> scanWiFiNetworks() async {
    try {
      final canGetScannedResults = await WiFiScan.instance.canGetScannedResults();
      
      if (canGetScannedResults == CanGetScannedResults.yes) {
        final results = await WiFiScan.instance.getScannedResults();
        return results;
      } else {
        print('⚠️ Cannot get scanned results');
        return [];
      }
    } catch (e) {
      print('❌ WiFi scan failed: $e');
      return [];
    }
  }

  // Cleanup
  void dispose() {
    stopAdvertising();
    stopDiscovery();
    disconnectFromDevice();
    _stopPeriodicSync();
    
    _devicesController.close();
    _syncStatusController.close();
    _connectionStatusController.close();
    _dataReceivedController.close();
  }
} 