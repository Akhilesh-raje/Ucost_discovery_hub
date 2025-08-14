import 'package:flutter/material.dart';
import '../models/device.dart';
import '../models/sync_status.dart';

class ConnectionProvider extends ChangeNotifier {
  bool _isConnected = false;
  String _connectionType = 'none';
  Device? _connectedDevice;
  List<Device> _connectedDevices = [];
  bool _isSyncing = false;
  double _syncProgress = 0.0;
  SyncStatus _syncStatus = SyncStatus.idle;

  // Getters
  bool get isConnected => _isConnected;
  String get connectionType => _connectionType;
  Device? get connectedDevice => _connectedDevice;
  List<Device> get connectedDevices => _connectedDevices;
  bool get isSyncing => _isSyncing;
  double get syncProgress => _syncProgress;
  SyncStatus get syncStatus => _syncStatus;

  // Connection methods
  Future<bool> connectToDevice(String deviceId) async {
    try {
      // Simulate connection delay
      await Future.delayed(const Duration(seconds: 2));
      
      // Mock device data
      final device = Device(
        id: deviceId,
        name: 'Kiosk 1',
        type: 'kiosk',
        ipAddress: '192.168.1.100',
        port: 5000,
        connectionType: 'wifi',
        lastSeen: DateTime.now(),
        isOnline: true,
        capabilities: {'upload': true, 'sync': true, 'receive': true},
      );

      _connectedDevice = device;
      _connectedDevices = [device];
      _isConnected = true;
      _connectionType = 'wifi';
      notifyListeners();

      return true;
    } catch (e) {
      return false;
    }
  }

  Future<void> disconnect() async {
    _connectedDevice = null;
    _connectedDevices = [];
    _isConnected = false;
    _connectionType = 'none';
    _isSyncing = false;
    _syncProgress = 0.0;
    _syncStatus = SyncStatus.idle;
    notifyListeners();
  }

  Future<bool> startSync() async {
    if (!_isConnected) {
      return false;
    }

    try {
      _isSyncing = true;
      _syncStatus = SyncStatus.syncing;
      _syncProgress = 0.0;
      notifyListeners();

      // Simulate sync progress
      for (int i = 0; i <= 100; i += 10) {
        await Future.delayed(const Duration(milliseconds: 200));
        _syncProgress = i / 100;
        notifyListeners();
      }

      _isSyncing = false;
      _syncStatus = SyncStatus.completed;
      notifyListeners();

      return true;
    } catch (e) {
      _isSyncing = false;
      _syncStatus = SyncStatus.error;
      notifyListeners();
      return false;
    }
  }

  Future<void> stopSync() async {
    _isSyncing = false;
    _syncStatus = SyncStatus.idle;
    _syncProgress = 0.0;
    notifyListeners();
  }

  Future<List<Device>> scanForDevices() async {
    // Simulate device scanning
    await Future.delayed(const Duration(seconds: 2));
    
    return [
      Device(
        id: 'kiosk-1',
        name: 'Kiosk 1',
        type: 'kiosk',
        ipAddress: '192.168.1.100',
        port: 5000,
        connectionType: 'wifi',
        lastSeen: DateTime.now(),
        isOnline: true,
        capabilities: {'upload': true, 'sync': true, 'receive': true},
      ),
      Device(
        id: 'mobile-1',
        name: 'Mobile Device',
        type: 'mobile',
        ipAddress: '192.168.1.101',
        port: 5000,
        connectionType: 'wifi',
        lastSeen: DateTime.now(),
        isOnline: true,
        capabilities: {'upload': true, 'sync': true, 'receive': false},
      ),
    ];
  }
} 