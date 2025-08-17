import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/sync_provider.dart';
import '../models/device.dart';
import '../models/sync_status.dart';
import '../utils/constants.dart';
import '../utils/theme.dart';

class SyncManagementScreen extends StatefulWidget {
  const SyncManagementScreen({super.key});

  @override
  State<SyncManagementScreen> createState() => _SyncManagementScreenState();
}

class _SyncManagementScreenState extends State<SyncManagementScreen> {
  bool _isDiscovering = false;
  bool _isManualSync = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<SyncProvider>().initialize();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sync Management'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Theme.of(context).colorScheme.onPrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _isDiscovering ? null : _startDiscovery,
            tooltip: 'Start Discovery',
          ),
        ],
      ),
      body: Consumer<SyncProvider>(
        builder: (context, syncProvider, child) {
          return RefreshIndicator(
            onRefresh: () async {
              await syncProvider.initialize();
              await syncProvider.refreshSyncStatus();
            },
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildConnectionStatus(syncProvider),
                  const SizedBox(height: 24),
                  _buildDeviceDiscovery(syncProvider),
                  const SizedBox(height: 24),
                  _buildSyncStatus(syncProvider),
                  const SizedBox(height: 24),
                  _buildManualSync(syncProvider),
                  const SizedBox(height: 24),
                  _buildSyncHistory(syncProvider),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildConnectionStatus(SyncProvider syncProvider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  syncProvider.isConnected ? Icons.wifi : Icons.wifi_off,
                  color: syncProvider.isConnected ? Colors.green : Colors.red,
                  size: 32,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        syncProvider.isConnected ? 'Connected' : 'Disconnected',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: syncProvider.isConnected ? Colors.green : Colors.red,
                        ),
                      ),
                      Text(
                        syncProvider.isConnected
                            ? 'P2P sync is active'
                            : 'No P2P connection available',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (syncProvider.connectedPC != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.computer),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Connected to: ${syncProvider.connectedPC!.name}',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          Text(
                            'IP: ${syncProvider.connectedPC!.ipAddress}',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () => syncProvider.disconnect(),
                      icon: const Icon(Icons.link_off),
                      tooltip: 'Disconnect',
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDeviceDiscovery(SyncProvider syncProvider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Device Discovery',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                ElevatedButton.icon(
                  onPressed: _isDiscovering ? null : _startDiscovery,
                  icon: _isDiscovering
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.search),
                  label: Text(_isDiscovering ? 'Discovering...' : 'Discover'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (syncProvider.discoveredDevices.isEmpty)
              Center(
                child: Column(
                  children: [
                    Icon(
                      Icons.devices_other,
                      size: 64,
                      color: Colors.grey[400],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No devices discovered',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Tap "Discover" to find nearby devices',
                      style: Theme.of(context).textTheme.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              )
            else
              Column(
                children: syncProvider.discoveredDevices.map((device) {
                  final isConnected = syncProvider.connectedPC?.id == device.id;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: isConnected
                            ? Theme.of(context).colorScheme.primary
                            : Colors.grey[300]!,
                        width: isConnected ? 2 : 1,
                      ),
                      borderRadius: BorderRadius.circular(12),
                      color: isConnected
                          ? Theme.of(context).colorScheme.primaryContainer.withOpacity(0.1)
                          : null,
                    ),
                    child: Row(
                      children: [
                        Icon(
                          device.deviceType == 'pc' ? Icons.computer : Icons.phone_android,
                          color: isConnected
                              ? Theme.of(context).colorScheme.primary
                              : Colors.grey[600],
                          size: 32,
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                device.name,
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                '${device.platform} • ${device.ipAddress}',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                              const SizedBox(height: 4),
                              Wrap(
                                spacing: 4,
                                children: device.capabilities.map((capability) {
                                  return Chip(
                                    label: Text(capability),
                                    backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
                                    labelStyle: const TextStyle(fontSize: 10),
                                  );
                                }).toList(),
                              ),
                            ],
                          ),
                        ),
                        if (isConnected)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Theme.of(context).colorScheme.primary,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text(
                              'Connected',
                              style: TextStyle(color: Colors.white, fontSize: 12),
                            ),
                          )
                        else
                          ElevatedButton(
                            onPressed: () => _connectToDevice(device),
                            child: const Text('Connect'),
                          ),
                      ],
                    ),
                  );
                }).toList(),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSyncStatus(SyncProvider syncProvider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Sync Status',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildStatusCard(
                    'Total Exhibits',
                    '${syncProvider.totalExhibits}',
                    Icons.museum,
                    Colors.blue,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildStatusCard(
                    'Pending Sync',
                    '${syncProvider.pendingSyncCount}',
                    Icons.schedule,
                    Colors.orange,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildStatusCard(
                    'Synced',
                    '${syncProvider.syncedCount}',
                    Icons.sync,
                    Colors.green,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (syncProvider.lastSyncTime != null)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.secondaryContainer,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.access_time),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Last Sync',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          Text(
                            syncProvider.lastSyncTime!,
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: 8),
          Text(
            value,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            title,
            style: Theme.of(context).textTheme.bodySmall,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildManualSync(SyncProvider syncProvider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Manual Sync',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _isManualSync || !syncProvider.isConnected
                        ? null
                        : () => _startManualSync(syncProvider),
                    icon: _isManualSync
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.sync),
                    label: Text(_isManualSync ? 'Syncing...' : 'Start Sync'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      foregroundColor: Theme.of(context).colorScheme.onPrimary,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: !syncProvider.isConnected ? null : () => _stopSync(syncProvider),
                    icon: const Icon(Icons.stop),
                    label: const Text('Stop Sync'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (syncProvider.syncProgress > 0 && syncProvider.syncProgress < 100)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Sync Progress'),
                      Text('${syncProvider.syncProgress.toInt()}%'),
                    ],
                  ),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: syncProvider.syncProgress / 100,
                    backgroundColor: Colors.grey[300],
                    valueColor: AlwaysStoppedAnimation<Color>(
                      Theme.of(context).colorScheme.primary,
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSyncHistory(SyncProvider syncProvider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Sync History',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            if (syncProvider.syncHistory.isEmpty)
              Center(
                child: Column(
                  children: [
                    Icon(
                      Icons.history,
                      size: 64,
                      color: Colors.grey[400],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No sync history',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Sync history will appear here after synchronization',
                      style: Theme.of(context).textTheme.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: syncProvider.syncHistory.length,
                itemBuilder: (context, index) {
                  final syncLog = syncProvider.syncHistory[index];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey[300]!),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          _getSyncStatusIcon(syncLog.status),
                          color: _getSyncStatusColor(syncLog.status),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Sync Operation',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              Text(
                                syncLog.targetDevice ?? 'Local',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                              Text(
                                DateTime.now().toString().substring(0, 19),
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: _getSyncStatusColor(syncLog.status).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            syncLog.status,
                            style: TextStyle(
                              color: _getSyncStatusColor(syncLog.status),
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  IconData _getSyncStatusIcon(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return Icons.check_circle;
      case 'failed':
        return Icons.error;
      case 'pending':
        return Icons.schedule;
      case 'syncing':
        return Icons.sync;
      default:
        return Icons.info;
    }
  }

  Color _getSyncStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'completed':
        return Colors.green;
      case 'failed':
        return Colors.red;
      case 'pending':
        return Colors.orange;
      case 'syncing':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  Future<void> _startDiscovery() async {
    setState(() => _isDiscovering = true);
    try {
      await context.read<SyncProvider>().startDiscovery();
    } finally {
      setState(() => _isDiscovering = false);
    }
  }

  Future<void> _connectToDevice(Device device) async {
    try {
      await context.read<SyncProvider>().connectToDevice(device);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Connected to ${device.name}'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to connect: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _startManualSync(SyncProvider syncProvider) async {
    setState(() => _isManualSync = true);
    try {
      await syncProvider.startManualSync();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Manual sync started'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to start sync: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() => _isManualSync = false);
    }
  }

  Future<void> _stopSync(SyncProvider syncProvider) async {
    try {
      await syncProvider.stopSync();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Sync stopped'),
          backgroundColor: Colors.orange,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to stop sync: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
} 