import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/connection_provider.dart';
import '../providers/exhibit_provider.dart';
import '../models/device.dart';
import '../utils/constants.dart';

class P2PSyncScreen extends StatefulWidget {
  const P2PSyncScreen({super.key});

  @override
  State<P2PSyncScreen> createState() => _P2PSyncScreenState();
}

class _P2PSyncScreenState extends State<P2PSyncScreen> {
  bool _isScanning = false;
  List<Device> _availableDevices = [];

  @override
  void initState() {
    super.initState();
    _loadAvailableDevices();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('P2P Sync'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          _buildConnectionStatus(),
          Expanded(
            child: _buildDeviceList(),
          ),
          _buildSyncControls(),
        ],
      ),
    );
  }

  Widget _buildConnectionStatus() {
    return Consumer<ConnectionProvider>(
      builder: (context, connectionProvider, child) {
        return Container(
          padding: const EdgeInsets.all(16),
          margin: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: connectionProvider.isConnected ? AppColors.success : AppColors.error,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Icon(
                connectionProvider.isConnected ? Icons.wifi : Icons.wifi_off,
                color: Colors.white,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      connectionProvider.isConnected ? 'Connected' : 'Disconnected',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      connectionProvider.connectionType,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDeviceList() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Available Devices',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                onPressed: _isScanning ? null : _startScan,
                icon: _isScanning
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.refresh),
              ),
            ],
          ),
        ),
        Expanded(
          child: _availableDevices.isEmpty
              ? _buildEmptyState()
              : _buildDeviceListView(),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.devices_other,
            size: 64,
            color: Colors.grey.shade400,
          ),
          const SizedBox(height: 16),
          Text(
            'No devices found',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Tap the refresh button to scan for devices',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeviceListView() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _availableDevices.length,
      itemBuilder: (context, index) {
        final device = _availableDevices[index];
        return _buildDeviceCard(device);
      },
    );
  }

  Widget _buildDeviceCard(Device device) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: device.isOnline ? AppColors.success : Colors.grey,
          child: Icon(
            _getDeviceIcon(device.type),
            color: Colors.white,
          ),
        ),
        title: Text(device.displayName),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(device.connectionStatus),
            Text('${device.ipAddress}:${device.port}'),
          ],
        ),
        trailing: ElevatedButton(
          onPressed: device.isOnline ? () => _connectToDevice(device) : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          ),
          child: const Text('Connect'),
        ),
      ),
    );
  }

  Widget _buildSyncControls() {
    return Consumer<ConnectionProvider>(
      builder: (context, connectionProvider, child) {
        if (!connectionProvider.isConnected) {
          return const SizedBox.shrink();
        }

        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              if (connectionProvider.isSyncing) ...[
                LinearProgressIndicator(
                  value: connectionProvider.syncProgress,
                  backgroundColor: Colors.grey.shade300,
                  valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                ),
                const SizedBox(height: 8),
                Text(
                  'Syncing... ${(connectionProvider.syncProgress * 100).toInt()}%',
                  style: const TextStyle(fontSize: 14),
                ),
              ],
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: connectionProvider.isSyncing
                          ? null
                          : () => _startSync(connectionProvider),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                      ),
                      child: Text(
                        connectionProvider.isSyncing ? 'Syncing...' : 'Start Sync',
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: connectionProvider.isSyncing
                          ? () => _stopSync(connectionProvider)
                          : () => _disconnect(connectionProvider),
                      child: Text(
                        connectionProvider.isSyncing ? 'Stop' : 'Disconnect',
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  IconData _getDeviceIcon(String type) {
    switch (type) {
      case 'kiosk':
        return Icons.desktop_mac;
      case 'mobile':
        return Icons.phone_android;
      case 'desktop':
        return Icons.computer;
      default:
        return Icons.devices_other;
    }
  }

  Future<void> _loadAvailableDevices() async {
    // Mock data for demonstration
    setState(() {
      _availableDevices = [
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
    });
  }

  Future<void> _startScan() async {
    setState(() {
      _isScanning = true;
    });

    // Simulate scanning
    await Future.delayed(const Duration(seconds: 2));

    setState(() {
      _isScanning = false;
    });

    // Refresh device list
    await _loadAvailableDevices();
  }

  Future<void> _connectToDevice(Device device) async {
    final connectionProvider = Provider.of<ConnectionProvider>(context, listen: false);
    final success = await connectionProvider.connectToDevice(device.id);
    
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Connected to ${device.displayName}'),
          backgroundColor: AppColors.success,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to connect'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> _startSync(ConnectionProvider connectionProvider) async {
    final success = await connectionProvider.startSync();
    
    if (!success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to start sync'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> _stopSync(ConnectionProvider connectionProvider) async {
    await connectionProvider.stopSync();
  }

  Future<void> _disconnect(ConnectionProvider connectionProvider) async {
    await connectionProvider.disconnect();
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Disconnected'),
        backgroundColor: AppColors.info,
      ),
    );
  }
} 