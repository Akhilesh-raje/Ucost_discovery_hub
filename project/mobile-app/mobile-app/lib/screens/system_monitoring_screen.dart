import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/sync_provider.dart';
import '../utils/constants.dart';

class SystemMonitoringScreen extends StatefulWidget {
  const SystemMonitoringScreen({super.key});

  @override
  State<SystemMonitoringScreen> createState() => _SystemMonitoringScreenState();
}

class _SystemMonitoringScreenState extends State<SystemMonitoringScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;
  bool _isRefreshing = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('System Monitoring'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Theme.of(context).colorScheme.onPrimary,
        bottom: TabBar(
          controller: _tabController,
          labelColor: Theme.of(context).colorScheme.onPrimary,
          unselectedLabelColor: Theme.of(context).colorScheme.onPrimary.withOpacity(0.7),
          indicatorColor: Theme.of(context).colorScheme.onPrimary,
          tabs: const [
            Tab(icon: Icon(Icons.monitor), text: 'Overview'),
            Tab(icon: Icon(Icons.storage), text: 'Storage'),
            Tab(icon: Icon(Icons.network_check), text: 'Network'),
            Tab(icon: Icon(Icons.analytics), text: 'Performance'),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(_isRefreshing ? Icons.refresh : Icons.refresh),
            onPressed: _isRefreshing ? null : _refreshData,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOverviewTab(),
          _buildStorageTab(),
          _buildNetworkTab(),
          _buildPerformanceTab(),
        ],
      ),
    );
  }

  Widget _buildOverviewTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSystemStatusCard(),
          const SizedBox(height: 20),
          _buildResourceUsageCards(),
          const SizedBox(height: 20),
          _buildSystemInfoCard(),
          const SizedBox(height: 20),
          _buildRecentAlerts(),
        ],
      ),
    );
  }

  Widget _buildSystemStatusCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.check_circle,
                  color: Colors.green,
                  size: 32,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'System Status: Healthy',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.green,
                        ),
                      ),
                      Text(
                        'All systems operating normally',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: _buildStatusIndicator('Database', 'Online', Colors.green),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildStatusIndicator('Network', 'Connected', Colors.blue),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildStatusIndicator('Storage', 'Normal', Colors.orange),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusIndicator(String label, String status, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 4),
          Text(
            status,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResourceUsageCards() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Resource Usage',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 1.2,
          children: [
            _buildResourceCard('CPU Usage', '23%', Icons.memory, Colors.blue, 0.23),
            _buildResourceCard('Memory Usage', '67%', Icons.storage, Colors.orange, 0.67),
            _buildResourceCard('Battery Level', '89%', Icons.battery_charging_full, Colors.green, 0.89),
            _buildResourceCard('Storage Used', '72%', Icons.storage, Colors.purple, 0.72),
          ],
        ),
      ],
    );
  }

  Widget _buildResourceCard(String title, String value, IconData icon, Color color, double percentage) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, size: 32, color: color),
            const SizedBox(height: 12),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              title,
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            LinearProgressIndicator(
              value: percentage,
              backgroundColor: Colors.grey[300],
              valueColor: AlwaysStoppedAnimation<Color>(color),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSystemInfoCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'System Information',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildInfoRow('App Version', AppConstants.appVersion),
            _buildInfoRow('Flutter Version', '3.32.5'),
            _buildInfoRow('Dart Version', '3.4.0'),
            _buildInfoRow('Platform', 'Android'),
            _buildInfoRow('Device Model', 'CPH2553'),
            _buildInfoRow('OS Version', 'Android 14'),
            _buildInfoRow('Build Number', 'UP1A.231005.007'),
            _buildInfoRow('Kernel Version', '5.15.136-android14-9'),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentAlerts() {
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
                  'Recent Alerts',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton(
                  onPressed: () => _viewAllAlerts(),
                  child: const Text('View All'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildAlertItem(
              'System Update Available',
              'New version 1.1.0 is ready for installation',
              '2 hours ago',
              Icons.system_update,
              Colors.blue,
            ),
            _buildAlertItem(
              'Backup Completed',
              'Daily backup completed successfully',
              '6 hours ago',
              Icons.backup,
              Colors.green,
            ),
            _buildAlertItem(
              'Storage Warning',
              'Storage usage is approaching 80%',
              '1 day ago',
              Icons.warning,
              Colors.orange,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAlertItem(String title, String message, String time, IconData icon, Color color) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: color,
        child: Icon(icon, color: Colors.white, size: 20),
      ),
      title: Text(title),
      subtitle: Text(message),
      trailing: Text(
        time,
        style: Theme.of(context).textTheme.bodySmall,
      ),
    );
  }

  Widget _buildStorageTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildStorageOverview(),
          const SizedBox(height: 20),
          _buildStorageBreakdown(),
          const SizedBox(height: 20),
          _buildStorageActions(),
        ],
      ),
    );
  }

  Widget _buildStorageOverview() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Storage Overview',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: _buildStorageMetric('Total Storage', '64 GB', Icons.storage),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildStorageMetric('Used Storage', '23.4 GB', Icons.storage_rounded),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildStorageMetric('Available', '40.6 GB', Icons.storage_outlined),
                ),
              ],
            ),
            const SizedBox(height: 20),
            LinearProgressIndicator(
              value: 23.4 / 64,
              backgroundColor: Colors.grey[300],
              valueColor: AlwaysStoppedAnimation<Color>(Colors.blue),
              minHeight: 8,
            ),
            const SizedBox(height: 8),
            Text(
              '36.6% used',
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStorageMetric(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, size: 32, color: Colors.blue),
        const SizedBox(height: 8),
        Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildStorageBreakdown() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Storage Breakdown',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildStorageItem('App Data', '156 MB', 0.67, Colors.blue),
            _buildStorageItem('Cache', '23 MB', 0.10, Colors.orange),
            _buildStorageItem('Images', '18.2 GB', 0.78, Colors.green),
            _buildStorageItem('Documents', '2.1 GB', 0.09, Colors.purple),
            _buildStorageItem('Other', '2.9 GB', 0.12, Colors.grey),
          ],
        ),
      ),
    );
  }

  Widget _buildStorageItem(String label, String size, double percentage, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label),
              Text(
                size,
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
            ],
          ),
          const SizedBox(height: 4),
          LinearProgressIndicator(
            value: percentage,
            backgroundColor: Colors.grey[300],
            valueColor: AlwaysStoppedAnimation<Color>(color),
          ),
        ],
      ),
    );
  }

  Widget _buildStorageActions() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Storage Actions',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.cleaning_services),
              title: const Text('Clear Cache'),
              subtitle: const Text('Free up 23 MB of space'),
              onTap: () => _clearCache(),
            ),
            ListTile(
              leading: const Icon(Icons.delete_sweep),
              title: const Text('Clean Old Files'),
              subtitle: const Text('Remove unused files'),
              onTap: () => _cleanOldFiles(),
            ),
            ListTile(
              leading: const Icon(Icons.backup),
              title: const Text('Backup Data'),
              subtitle: const Text('Create backup of important data'),
              onTap: () => _backupData(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNetworkTab() {
    return Consumer<SyncProvider>(
      builder: (context, syncProvider, child) {
        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildNetworkStatusCard(syncProvider),
              const SizedBox(height: 20),
              _buildConnectionInfo(syncProvider),
              const SizedBox(height: 20),
              _buildNetworkDiagnostics(),
            ],
          ),
        );
      },
    );
  }

  Widget _buildNetworkStatusCard(SyncProvider syncProvider) {
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
                        syncProvider.isConnected ? 'Network Connected' : 'Network Disconnected',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: syncProvider.isConnected ? Colors.green : Colors.red,
                        ),
                      ),
                      Text(
                        syncProvider.connectionStatus,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: _buildNetworkMetric('Devices Found', '${syncProvider.discoveredDevices.length}', Icons.devices),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildNetworkMetric('Sync Status', syncProvider.isSyncing ? 'Syncing' : 'Idle', Icons.sync),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildNetworkMetric('Last Sync', syncProvider.lastSyncTime, Icons.access_time),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNetworkMetric(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, size: 24, color: Colors.blue),
        const SizedBox(height: 8),
        Text(
          value,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildConnectionInfo(SyncProvider syncProvider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Connection Information',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildConnectionRow('Connection Type', 'Wi-Fi'),
            _buildConnectionRow('Signal Strength', 'Excellent'),
            _buildConnectionRow('IP Address', '192.168.1.100'),
            _buildConnectionRow('MAC Address', 'AA:BB:CC:DD:EE:FF'),
            _buildConnectionRow('Network Name', 'UCOST_Network'),
            _buildConnectionRow('Security', 'WPA2-PSK'),
          ],
        ),
      ),
    );
  }

  Widget _buildConnectionRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  Widget _buildNetworkDiagnostics() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Network Diagnostics',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.speed),
              title: const Text('Speed Test'),
              subtitle: const Text('Test network connection speed'),
              onTap: () => _runSpeedTest(),
            ),
            ListTile(
              leading: const Icon(Icons.speed),
              title: const Text('Ping Test'),
              subtitle: const Text('Test network latency'),
              onTap: () => _runPingTest(),
            ),
            ListTile(
              leading: const Icon(Icons.troubleshoot),
              title: const Text('Connection Test'),
              subtitle: const Text('Test P2P connectivity'),
              onTap: () => _testConnection(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPerformanceTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildPerformanceMetrics(),
          const SizedBox(height: 20),
          _buildPerformanceCharts(),
          const SizedBox(height: 20),
          _buildPerformanceActions(),
        ],
      ),
    );
  }

  Widget _buildPerformanceMetrics() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Performance Metrics',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildPerformanceMetric('App Launch', '1.2s', Icons.rocket_launch, Colors.green),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildPerformanceMetric('Database', '45ms', Icons.storage, Colors.blue),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildPerformanceMetric('UI Render', '16ms', Icons.smartphone, Colors.orange),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPerformanceMetric(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Icon(icon, size: 32, color: color),
        const SizedBox(height: 8),
        Text(
          value,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildPerformanceCharts() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Performance Trends',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Container(
              height: 200,
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Center(
                child: Text(
                  'Performance Charts\nComing Soon',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.grey,
                    fontSize: 16,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPerformanceActions() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Performance Actions',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.tune),
              title: const Text('Optimize Performance'),
              subtitle: const Text('Run performance optimization'),
              onTap: () => _optimizePerformance(),
            ),
            ListTile(
              leading: const Icon(Icons.analytics),
              title: const Text('Performance Report'),
              subtitle: const Text('Generate detailed report'),
              onTap: () => _generateReport(),
            ),
            ListTile(
              leading: const Icon(Icons.settings),
              title: const Text('Performance Settings'),
              subtitle: const Text('Configure performance options'),
              onTap: () => _configurePerformance(),
            ),
          ],
        ),
      ),
    );
  }

  // Action methods
  void _refreshData() async {
    setState(() => _isRefreshing = true);
    
    // Simulate refresh
    await Future.delayed(const Duration(seconds: 2));
    
    setState(() => _isRefreshing = false);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('System data refreshed')),
    );
  }

  void _viewAllAlerts() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('All alerts panel coming soon!')),
    );
  }

  void _clearCache() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Cache cleared successfully')),
    );
  }

  void _cleanOldFiles() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Old files cleaned successfully')),
    );
  }

  void _backupData() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Data backup started...')),
    );
  }

  void _runSpeedTest() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Running speed test...')),
    );
  }

  void _runPingTest() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Running ping test...')),
    );
  }

  void _testConnection() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Testing P2P connection...')),
    );
  }

  void _optimizePerformance() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Performance optimization started...')),
    );
  }

  void _generateReport() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Generating performance report...')),
    );
  }

  void _configurePerformance() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Performance settings panel coming soon!')),
    );
  }
} 