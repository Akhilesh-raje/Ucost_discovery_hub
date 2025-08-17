import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/sync_provider.dart';
import '../screens/exhibit_management_screen.dart';
import '../screens/sync_management_screen.dart';
import '../screens/analytics_screen.dart';
import '../screens/admin_dashboard_screen.dart';
import '../screens/user_management_screen.dart';
import '../screens/system_monitoring_screen.dart';
import '../screens/settings_screen.dart';
import '../utils/constants.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Column(
        children: [
          _buildHeader(context),
          Expanded(
            child: _buildMenuItems(context),
          ),
          _buildFooter(context),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Consumer<SyncProvider>(
      builder: (context, syncProvider, child) {
        return UserAccountsDrawerHeader(
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primary,
          ),
          currentAccountPicture: CircleAvatar(
            backgroundColor: Theme.of(context).colorScheme.onPrimary,
            child: Icon(
              Icons.museum,
              color: Theme.of(context).colorScheme.primary,
              size: 32,
            ),
          ),
          accountName: const Text(
            'UCOST Admin',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          accountEmail: Text(
            syncProvider.isConnected ? 'Connected' : 'Offline',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 12,
            ),
          ),
        );
      },
    );
  }

  Widget _buildMenuItems(BuildContext context) {
    return ListView(
      padding: EdgeInsets.zero,
      children: [
        _buildMenuItem(
          context,
          icon: Icons.dashboard,
          title: 'Dashboard',
          subtitle: 'Main overview',
          onTap: () => Navigator.of(context).pop(),
        ),
        const Divider(),
        _buildMenuItem(
          context,
          icon: Icons.museum,
          title: 'Exhibit Management',
          subtitle: 'Add, edit, delete exhibits',
          onTap: () => _navigateToScreen(context, const ExhibitManagementScreen()),
        ),
        _buildMenuItem(
          context,
          icon: Icons.sync,
          title: 'Sync Management',
          subtitle: 'P2P synchronization',
          onTap: () => _navigateToScreen(context, const SyncManagementScreen()),
        ),
        _buildMenuItem(
          context,
          icon: Icons.analytics,
          title: 'Analytics',
          subtitle: 'Reports and charts',
          onTap: () => _navigateToScreen(context, const AnalyticsScreen()),
        ),
        const Divider(),
        _buildMenuItem(
          context,
          icon: Icons.admin_panel_settings,
          title: 'Admin Dashboard',
          subtitle: 'System overview and control',
          onTap: () => _navigateToScreen(context, const AdminDashboardScreen()),
        ),
        _buildMenuItem(
          context,
          icon: Icons.people,
          title: 'User Management',
          subtitle: 'Manage users and permissions',
          onTap: () => _navigateToScreen(context, const UserManagementScreen()),
        ),
        _buildMenuItem(
          context,
          icon: Icons.monitor,
          title: 'System Monitoring',
          subtitle: 'Monitor system health',
          onTap: () => _navigateToScreen(context, const SystemMonitoringScreen()),
        ),
        const Divider(),
        _buildMenuItem(
          context,
          icon: Icons.settings,
          title: 'Settings',
          subtitle: 'App configuration',
          onTap: () => _navigateToScreen(context, const SettingsScreen()),
        ),
        _buildMenuItem(
          context,
          icon: Icons.help,
          title: 'Help & Support',
          subtitle: 'Documentation and help',
          onTap: () => _showHelpDialog(context),
        ),
        _buildMenuItem(
          context,
          icon: Icons.info,
          title: 'About',
          subtitle: 'App information',
          onTap: () => _showAboutDialog(context),
        ),
      ],
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(
        icon,
        color: Theme.of(context).colorScheme.primary,
      ),
      title: Text(
        title,
        style: const TextStyle(fontWeight: FontWeight.w500),
      ),
      subtitle: Text(
        subtitle,
        style: Theme.of(context).textTheme.bodySmall,
      ),
      onTap: onTap,
      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const Divider(),
          Row(
            children: [
              Icon(
                Icons.power_settings_new,
                color: Colors.grey[600],
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Version ${AppConstants.appVersion}',
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _navigateToScreen(BuildContext context, Widget screen) {
    Navigator.of(context).pop(); // Close drawer
    Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => screen),
    );
  }

  void _showHelpDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Help & Support'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Need help with the UCOST Mobile App?'),
            SizedBox(height: 16),
            Text('• Check the user manual'),
            Text('• Contact support team'),
            Text('• Visit our website'),
            Text('• Watch tutorial videos'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              _contactSupport(context);
            },
            child: const Text('Contact Support'),
          ),
        ],
      ),
    );
  }

  void _showAboutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('About UCOST Mobile App'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('UCOST Discovery Hub Mobile Application'),
            SizedBox(height: 8),
            Text('Version: 1.0.0'),
            Text('Build: 1'),
            Text('Flutter: 3.32.5'),
            SizedBox(height: 16),
            Text('A comprehensive museum management system with P2P synchronization capabilities.'),
            SizedBox(height: 8),
            Text('© 2025 UCOST. All rights reserved.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _contactSupport(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Support contact functionality coming soon!'),
        backgroundColor: Colors.blue,
      ),
    );
  }
} 