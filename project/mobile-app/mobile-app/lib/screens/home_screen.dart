import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/exhibit_provider.dart';
import '../providers/sync_provider.dart';
import '../widgets/stats_card.dart';
import '../widgets/quick_action_card.dart';
import '../widgets/exhibit_card.dart';
import '../screens/exhibit_management_screen.dart';
import '../screens/sync_management_screen.dart';
import '../screens/analytics_screen.dart';
import '../screens/admin_dashboard_screen.dart';
import '../screens/user_management_screen.dart';
import '../screens/system_monitoring_screen.dart';
import '../screens/settings_screen.dart';
import '../widgets/app_drawer.dart';
import '../utils/constants.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    // Initialize providers when screen loads
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeProviders();
    });
  }

  Future<void> _initializeProviders() async {
    try {
      // Initialize sync provider
      await context.read<SyncProvider>().initialize();
      
      // Refresh exhibits
      if (mounted) {
        await context.read<ExhibitProvider>().refreshExhibits();
      }
    } catch (e) {
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Failed to initialize providers: $e');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(),
      drawer: const AppDrawer(),
      body: _buildBody(),
      floatingActionButton: _buildFloatingActionButton(),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      title: const Text(AppConstants.appName),
      backgroundColor: Theme.of(context).colorScheme.primary,
      foregroundColor: Theme.of(context).colorScheme.onPrimary,
      elevation: 2,
      automaticallyImplyLeading: true,
      actions: [
        IconButton(
          icon: const Icon(Icons.refresh),
          onPressed: () => _refreshData(),
          tooltip: 'Refresh',
        ),
      ],
    );
  }

  Widget _buildBody() {
    return Consumer2<ExhibitProvider, SyncProvider>(
      builder: (context, exhibitProvider, syncProvider, child) {
        if (exhibitProvider.isLoading) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text('Loading exhibits...'),
              ],
            ),
          );
        }

        if (exhibitProvider.hasError) {
          return _buildErrorWidget(exhibitProvider.error!);
        }

        return RefreshIndicator(
          onRefresh: _refreshData,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppConstants.defaultPadding),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Welcome Card
                _buildWelcomeCard(),
                
                const SizedBox(height: 20),
                
                // Sync Status Card
                _buildSyncStatusCard(syncProvider),
                
                const SizedBox(height: 20),
                
                // Statistics Dashboard
                _buildStatsDashboard(exhibitProvider),
                
                const SizedBox(height: 20),
                
                // Quick Actions
                _buildQuickActions(),
                
                const SizedBox(height: 20),
                
                // Recent Exhibits
                _buildRecentExhibits(exhibitProvider),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildWelcomeCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.defaultPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  Icons.museum,
                  size: 32,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Welcome to UCOST',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Museum Management System',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              'Manage your museum exhibits with ease. Upload, organize, and sync data across devices.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSyncStatusCard(SyncProvider syncProvider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.defaultPadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  syncProvider.isConnected ? Icons.cloud_done : Icons.cloud_off,
                  color: syncProvider.isConnected ? Colors.green : Colors.red,
                ),
                const SizedBox(width: 8),
                Text(
                  'Sync Status',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                if (syncProvider.isSyncing)
                  const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              syncProvider.connectionStatus,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            if (syncProvider.isConnected) ...[
              const SizedBox(height: 8),
              Text(
                'Last sync: ${syncProvider.lastSyncTime}',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
              if (syncProvider.pendingSyncCount > 0) ...[
                const SizedBox(height: 8),
                LinearProgressIndicator(
                  value: syncProvider.syncProgress,
                  backgroundColor: Colors.grey[300],
                  valueColor: AlwaysStoppedAnimation<Color>(
                    Theme.of(context).colorScheme.primary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${syncProvider.syncedExhibits}/${syncProvider.totalExhibits} synced',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ],
            if (syncProvider.hasError) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.red[50],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(Icons.error, color: Colors.red[700], size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        syncProvider.errorMessage!,
                        style: TextStyle(
                          color: Colors.red[700],
                          fontSize: 12,
                        ),
                      ),
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

  Widget _buildStatsDashboard(ExhibitProvider exhibitProvider) {
    final stats = exhibitProvider.stats;
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Statistics',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: StatsCard(
                title: 'Total Exhibits',
                value: stats['total']?.toString() ?? '0',
                icon: Icons.museum,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: StatsCard(
                title: 'Pending Sync',
                value: stats['pending']?.toString() ?? '0',
                icon: Icons.sync,
                color: Colors.orange,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: StatsCard(
                title: 'Synced',
                value: stats['synced']?.toString() ?? '0',
                icon: Icons.cloud_done,
                color: Colors.green,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: StatsCard(
                title: 'Failed',
                value: stats['failed']?.toString() ?? '0',
                icon: Icons.error,
                color: Colors.red,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Actions',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: QuickActionCard(
                title: 'Manage Exhibits',
                subtitle: 'Add, edit, delete',
                icon: Icons.museum,
                onTap: () => _navigateToExhibitManagement(),
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: QuickActionCard(
                title: 'Sync Management',
                subtitle: 'P2P sync control',
                icon: Icons.sync,
                onTap: () => _navigateToSyncManagement(),
                color: Colors.green,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: QuickActionCard(
                title: 'Analytics',
                subtitle: 'Reports & charts',
                icon: Icons.analytics,
                onTap: () => _navigateToAnalytics(),
                color: Colors.blue,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: QuickActionCard(
                title: 'Admin Panel',
                subtitle: 'System control',
                icon: Icons.admin_panel_settings,
                onTap: () => _navigateToAdminDashboard(),
                color: Colors.red,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: QuickActionCard(
                title: 'User Management',
                subtitle: 'Manage users',
                icon: Icons.people,
                onTap: () => _navigateToUserManagement(),
                color: Colors.purple,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: QuickActionCard(
                title: 'System Monitor',
                subtitle: 'Health & performance',
                icon: Icons.monitor,
                onTap: () => _navigateToSystemMonitoring(),
                color: Colors.teal,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: QuickActionCard(
                title: 'Settings',
                subtitle: 'App configuration',
                icon: Icons.settings,
                onTap: () => _navigateToSettings(),
                color: Colors.grey,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: QuickActionCard(
                title: 'Help & Support',
                subtitle: 'Documentation',
                icon: Icons.help,
                onTap: () => _showHelpDialog(),
                color: Colors.indigo,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRecentExhibits(ExhibitProvider exhibitProvider) {
    final recentExhibits = exhibitProvider.getRecentExhibits(limit: 5);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'Recent Exhibits',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const Spacer(),
            TextButton(
              onPressed: () => _viewAllExhibits(),
              child: const Text('View All'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (recentExhibits.isEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(AppConstants.defaultPadding * 2),
              child: Column(
                children: [
                  Icon(
                    Icons.museum_outlined,
                    size: 48,
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'No exhibits yet',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Add your first exhibit to get started',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () => _navigateToExhibitManagement(),
                    icon: const Icon(Icons.add),
                    label: const Text('Add Exhibit'),
                  ),
                ],
              ),
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: recentExhibits.length,
            itemBuilder: (context, index) {
              final exhibit = recentExhibits[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: ExhibitCard(
                  exhibit: exhibit,
                  onTap: () => _viewExhibit(exhibit),
                ),
              );
            },
          ),
      ],
    );
  }

  Widget _buildErrorWidget(String error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 64,
            color: Theme.of(context).colorScheme.error,
          ),
          const SizedBox(height: 16),
          Text(
            'Error Loading Data',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: Theme.of(context).colorScheme.error,
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Text(
              error,
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => _refreshData(),
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildFloatingActionButton() {
    return FloatingActionButton.extended(
      onPressed: () => _navigateToExhibitManagement(),
      icon: const Icon(Icons.add),
      label: const Text('Add Exhibit'),
      backgroundColor: Theme.of(context).colorScheme.primary,
      foregroundColor: Theme.of(context).colorScheme.onPrimary,
    );
  }

  // Action methods
  Future<void> _refreshData() async {
    try {
      if (mounted) {
        await context.read<ExhibitProvider>().refreshExhibits();
        await context.read<SyncProvider>().refreshStatus();
      }
    } catch (e) {
      if (AppConstants.enableDebugLogs) {
        debugPrint('❌ Failed to refresh data: $e');
      }
    }
  }

  void _navigateToExhibitManagement() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const ExhibitManagementScreen(),
      ),
    );
  }

  void _navigateToSyncManagement() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const SyncManagementScreen(),
      ),
    );
  }

  void _navigateToAnalytics() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const AnalyticsScreen(),
      ),
    );
  }

  void _navigateToSettings() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const SettingsScreen(),
      ),
    );
  }

  void _navigateToAdminDashboard() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const AdminDashboardScreen(),
      ),
    );
  }

  void _navigateToUserManagement() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const UserManagementScreen(),
      ),
    );
  }

  void _navigateToSystemMonitoring() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const SystemMonitoringScreen(),
      ),
    );
  }

  void _showHelpDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Help & Support'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Welcome to UCOST Mobile Admin!'),
            SizedBox(height: 16),
            Text('• Use the navigation drawer to access all features'),
            Text('• Quick actions provide fast access to common tasks'),
            Text('• Admin panel gives you full system control'),
            Text('• Check system monitoring for health status'),
            SizedBox(height: 16),
            Text('For additional support, contact your system administrator.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Got it'),
          ),
        ],
      ),
    );
  }

  void _viewExhibit(dynamic exhibit) {
    // TODO: Navigate to exhibit detail screen
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Viewing exhibit: ${exhibit.name}'),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _viewAllExhibits() {
    // TODO: Navigate to all exhibits screen
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('All exhibits functionality coming soon!'),
        duration: Duration(seconds: 2),
      ),
    );
  }
} 