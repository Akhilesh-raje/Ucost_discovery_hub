import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../providers/connection_provider.dart';
import '../utils/constants.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _autoSyncEnabled = false;
  bool _darkModeEnabled = false;
  String _selectedLanguage = 'English';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildSection(
            title: 'Device Information',
            children: [
              _buildInfoTile('Device ID', 'UC-MOB-001'),
              _buildInfoTile('Device Name', 'UCOST Mobile App'),
              _buildInfoTile('Version', '1.0.0'),
              _buildInfoTile('Last Sync', '2 hours ago'),
            ],
          ),
          const SizedBox(height: 24),
          _buildSection(
            title: 'Connection Settings',
            children: [
              _buildSwitchTile(
                title: 'Auto Connect',
                subtitle: 'Automatically connect to available devices',
                value: _autoSyncEnabled,
                onChanged: (value) {
                  setState(() {
                    _autoSyncEnabled = value;
                  });
                },
              ),
              _buildListTile(
                title: 'Connection Type',
                subtitle: 'WiFi',
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  // Show connection type options
                },
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildSection(
            title: 'App Settings',
            children: [
              _buildSwitchTile(
                title: 'Notifications',
                subtitle: 'Receive push notifications',
                value: _notificationsEnabled,
                onChanged: (value) {
                  setState(() {
                    _notificationsEnabled = value;
                  });
                },
              ),
              _buildSwitchTile(
                title: 'Dark Mode',
                subtitle: 'Use dark theme',
                value: _darkModeEnabled,
                onChanged: (value) {
                  setState(() {
                    _darkModeEnabled = value;
                  });
                },
              ),
              _buildListTile(
                title: 'Language',
                subtitle: _selectedLanguage,
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  _showLanguageDialog();
                },
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildSection(
            title: 'Data Management',
            children: [
              _buildListTile(
                title: 'Clear Cache',
                subtitle: 'Free up storage space',
                trailing: const Icon(Icons.delete_outline),
                onTap: () {
                  _showClearCacheDialog();
                },
              ),
              _buildListTile(
                title: 'Export Data',
                subtitle: 'Backup your exhibits',
                trailing: const Icon(Icons.download),
                onTap: () {
                  _exportData();
                },
              ),
              _buildListTile(
                title: 'Import Data',
                subtitle: 'Restore from backup',
                trailing: const Icon(Icons.upload),
                onTap: () {
                  _importData();
                },
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildSection(
            title: 'About',
            children: [
              _buildListTile(
                title: 'Privacy Policy',
                subtitle: 'Read our privacy policy',
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  // Navigate to privacy policy
                },
              ),
              _buildListTile(
                title: 'Terms of Service',
                subtitle: 'Read our terms of service',
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  // Navigate to terms of service
                },
              ),
              _buildListTile(
                title: 'Contact Support',
                subtitle: 'Get help and support',
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  _contactSupport();
                },
              ),
            ],
          ),
          const SizedBox(height: 24),
          _buildDangerZone(),
        ],
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: Column(
            children: children,
          ),
        ),
      ],
    );
  }

  Widget _buildInfoTile(String title, String value) {
    return ListTile(
      title: Text(title),
      subtitle: Text(value),
      trailing: const Icon(Icons.info_outline, color: Colors.grey),
    );
  }

  Widget _buildSwitchTile({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return SwitchListTile(
      title: Text(title),
      subtitle: Text(subtitle),
      value: value,
      onChanged: onChanged,
      activeColor: AppColors.primary,
    );
  }

  Widget _buildListTile({
    required String title,
    required String subtitle,
    required Widget trailing,
    required VoidCallback onTap,
  }) {
    return ListTile(
      title: Text(title),
      subtitle: Text(subtitle),
      trailing: trailing,
      onTap: onTap,
    );
  }

  Widget _buildDangerZone() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Danger Zone',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppColors.error,
          ),
        ),
        const SizedBox(height: 12),
        Card(
          color: Colors.red.shade50,
          child: Column(
            children: [
              _buildListTile(
                title: 'Reset App',
                subtitle: 'Clear all data and reset to defaults',
                trailing: const Icon(Icons.warning, color: AppColors.error),
                onTap: () {
                  _showResetDialog();
                },
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showLanguageDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Select Language'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            'English',
            'Spanish',
            'French',
            'German',
            'Chinese',
          ].map((language) => RadioListTile<String>(
            title: Text(language),
            value: language,
            groupValue: _selectedLanguage,
            onChanged: (value) {
              setState(() {
                _selectedLanguage = value!;
              });
              Navigator.pop(context);
            },
          )).toList(),
        ),
      ),
    );
  }

  void _showClearCacheDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear Cache'),
        content: const Text('This will clear all cached data. This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _clearCache();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
            ),
            child: const Text('Clear'),
          ),
        ],
      ),
    );
  }

  void _showResetDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reset App'),
        content: const Text('This will delete all data and reset the app to its initial state. This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _resetApp();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
            ),
            child: const Text('Reset'),
          ),
        ],
      ),
    );
  }

  Future<void> _clearCache() async {
    // Implement cache clearing logic
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Cache cleared successfully'),
        backgroundColor: AppColors.success,
      ),
    );
  }

  Future<void> _exportData() async {
    // Implement data export logic
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Data exported successfully'),
        backgroundColor: AppColors.success,
      ),
    );
  }

  Future<void> _importData() async {
    // Implement data import logic
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Data imported successfully'),
        backgroundColor: AppColors.success,
      ),
    );
  }

  Future<void> _contactSupport() async {
    // Implement contact support logic
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Opening support contact...'),
        backgroundColor: AppColors.info,
      ),
    );
  }

  Future<void> _resetApp() async {
    // Implement app reset logic
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('App reset successfully'),
        backgroundColor: AppColors.success,
      ),
    );
  }
} 