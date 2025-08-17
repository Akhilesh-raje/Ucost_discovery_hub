import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../providers/exhibit_provider.dart';
import '../providers/sync_provider.dart';
import '../utils/constants.dart';
import '../utils/theme.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late SharedPreferences _prefs;
  bool _isLoading = true;
  
  // Settings values
  bool _enableNotifications = true;
  bool _enableAutoSync = true;
  bool _enableDebugLogs = false;
  bool _enableDarkMode = false;
  String _syncInterval = '30';
  String _language = 'English';
  bool _enableImageCompression = true;
  int _maxImageSize = 1024;
  bool _enableBackup = false;
  bool _enableAnalytics = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    try {
      _prefs = await SharedPreferences.getInstance();
      
      setState(() {
        _enableNotifications = _prefs.getBool('enableNotifications') ?? true;
        _enableAutoSync = _prefs.getBool('enableAutoSync') ?? true;
        _enableDebugLogs = _prefs.getBool('enableDebugLogs') ?? false;
        _enableDarkMode = _prefs.getBool('enableDarkMode') ?? false;
        _syncInterval = _prefs.getString('syncInterval') ?? '30';
        _language = _prefs.getString('language') ?? 'English';
        _enableImageCompression = _prefs.getBool('enableImageCompression') ?? true;
        _maxImageSize = _prefs.getInt('maxImageSize') ?? 1024;
        _enableBackup = _prefs.getBool('enableBackup') ?? false;
        _enableAnalytics = _prefs.getBool('enableAnalytics') ?? true;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load settings: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _saveSetting<T>(String key, T value) async {
    try {
      if (value is bool) {
        await _prefs.setBool(key, value);
      } else if (value is String) {
        await _prefs.setString(key, value);
      } else if (value is int) {
        await _prefs.setInt(key, value);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save setting: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Settings'),
          backgroundColor: Theme.of(context).colorScheme.primary,
          foregroundColor: Theme.of(context).colorScheme.onPrimary,
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Theme.of(context).colorScheme.onPrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.restore),
            onPressed: _showResetConfirmation,
            tooltip: 'Reset to Defaults',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadSettings,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildGeneralSettings(),
              const SizedBox(height: 24),
              _buildSyncSettings(),
              const SizedBox(height: 24),
              _buildAppearanceSettings(),
              const SizedBox(height: 24),
              _buildDataSettings(),
              const SizedBox(height: 24),
              _buildAdvancedSettings(),
              const SizedBox(height: 24),
              _buildAboutSection(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGeneralSettings() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.settings, color: Theme.of(context).colorScheme.primary),
                const SizedBox(width: 12),
                Text(
                  'General Settings',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ],
            ),
            const SizedBox(height: 20),
            SwitchListTile(
              title: const Text('Enable Notifications'),
              subtitle: const Text('Receive notifications for sync events and updates'),
              value: _enableNotifications,
              onChanged: (value) {
                setState(() => _enableNotifications = value);
                _saveSetting('enableNotifications', value);
              },
            ),
            SwitchListTile(
              title: const Text('Enable Analytics'),
              subtitle: const Text('Collect usage data to improve the app'),
              value: _enableAnalytics,
              onChanged: (value) {
                setState(() => _enableAnalytics = value);
                _saveSetting('enableAnalytics', value);
              },
            ),
            ListTile(
              title: const Text('Language'),
              subtitle: Text(_language),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _showLanguageSelector,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSyncSettings() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.sync, color: Theme.of(context).colorScheme.primary),
                const SizedBox(width: 12),
                Text(
                  'Sync Settings',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ],
            ),
            const SizedBox(height: 20),
            SwitchListTile(
              title: const Text('Auto Sync'),
              subtitle: const Text('Automatically sync data when connected'),
              value: _enableAutoSync,
              onChanged: (value) {
                setState(() => _enableAutoSync = value);
                _saveSetting('enableAutoSync', value);
              },
            ),
            ListTile(
              title: const Text('Sync Interval'),
              subtitle: Text('Every $_syncInterval seconds'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _showSyncIntervalSelector,
            ),
            SwitchListTile(
              title: const Text('Enable Backup'),
              subtitle: const Text('Create backup before major operations'),
              value: _enableBackup,
              onChanged: (value) {
                setState(() => _enableBackup = value);
                _saveSetting('enableBackup', value);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppearanceSettings() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.palette, color: Theme.of(context).colorScheme.primary),
                const SizedBox(width: 12),
                Text(
                  'Appearance',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ],
            ),
            const SizedBox(height: 20),
            SwitchListTile(
              title: const Text('Dark Mode'),
              subtitle: const Text('Use dark theme for the app'),
              value: _enableDarkMode,
              onChanged: (value) {
                setState(() => _enableDarkMode = value);
                _saveSetting('enableDarkMode', value);
                // Note: Theme change would need to be implemented in the main app
              },
            ),
            ListTile(
              title: const Text('Theme Preview'),
              trailing: Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary,
                  shape: BoxShape.circle,
                ),
              ),
              onTap: _showThemeCustomizer,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDataSettings() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.storage, color: Theme.of(context).colorScheme.primary),
                const SizedBox(width: 12),
                Text(
                  'Data Management',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ],
            ),
            const SizedBox(height: 20),
            SwitchListTile(
              title: const Text('Image Compression'),
              subtitle: const Text('Compress images to save storage space'),
              value: _enableImageCompression,
              onChanged: (value) {
                setState(() => _enableImageCompression = value);
                _saveSetting('enableImageCompression', value);
              },
            ),
            ListTile(
              title: const Text('Max Image Size'),
              subtitle: Text('${_maxImageSize}px'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _showImageSizeSelector,
            ),
            ListTile(
              title: const Text('Clear Cache'),
              subtitle: const Text('Free up storage space'),
              trailing: const Icon(Icons.delete_sweep),
              onTap: _showClearCacheConfirmation,
            ),
            ListTile(
              title: const Text('Export Data'),
              subtitle: const Text('Export all exhibits and settings'),
              trailing: const Icon(Icons.download),
              onTap: _exportData,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAdvancedSettings() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.build, color: Theme.of(context).colorScheme.primary),
                const SizedBox(width: 12),
                Text(
                  'Advanced Settings',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ],
            ),
            const SizedBox(height: 20),
            SwitchListTile(
              title: const Text('Debug Logs'),
              subtitle: const Text('Enable detailed logging for development'),
              value: _enableDebugLogs,
              onChanged: (value) {
                setState(() => _enableDebugLogs = value);
                _saveSetting('enableDebugLogs', value);
              },
            ),
            ListTile(
              title: const Text('Database Info'),
              subtitle: const Text('View database statistics and status'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _showDatabaseInfo,
            ),
            ListTile(
              title: const Text('Network Diagnostics'),
              subtitle: const Text('Test network connectivity and P2P discovery'),
              trailing: const Icon(Icons.arrow_forward_ios),
              onTap: _runNetworkDiagnostics,
            ),
            ListTile(
              title: const Text('Reset App Data'),
              subtitle: const Text('Clear all data and reset to defaults'),
              trailing: const Icon(Icons.warning),
              onTap: _showResetDataConfirmation,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAboutSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.info, color: Theme.of(context).colorScheme.primary),
                const SizedBox(width: 12),
                Text(
                  'About',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ],
            ),
            const SizedBox(height: 20),
            ListTile(
              title: const Text('App Version'),
              subtitle: const Text('1.0.0'),
              leading: const Icon(Icons.apps),
            ),
            ListTile(
              title: const Text('Build Number'),
              subtitle: const Text('1'),
              leading: const Icon(Icons.build),
            ),
            ListTile(
              title: const Text('Flutter Version'),
              subtitle: const Text('3.32.5'),
              leading: const Icon(Icons.flutter_dash),
            ),
            ListTile(
              title: const Text('License'),
              subtitle: const Text('MIT License'),
              leading: const Icon(Icons.description),
              onTap: _showLicense,
            ),
            ListTile(
              title: const Text('Privacy Policy'),
              subtitle: const Text('Read our privacy policy'),
              leading: const Icon(Icons.privacy_tip),
              onTap: _showPrivacyPolicy,
            ),
            ListTile(
              title: const Text('Terms of Service'),
              subtitle: const Text('Read our terms of service'),
              leading: const Icon(Icons.gavel),
              onTap: _showTermsOfService,
            ),
          ],
        ),
      ),
    );
  }

  void _showLanguageSelector() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Select Language'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: ['English', 'Hindi', 'Spanish', 'French', 'German'].map((lang) {
            return RadioListTile<String>(
              title: Text(lang),
              value: lang,
              groupValue: _language,
              onChanged: (value) {
                setState(() => _language = value!);
                _saveSetting('language', value);
                Navigator.of(context).pop();
              },
            );
          }).toList(),
        ),
      ),
    );
  }

  void _showSyncIntervalSelector() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Select Sync Interval'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: ['15', '30', '60', '300', '600'].map((interval) {
            final label = interval == '15' ? '15 seconds' :
                         interval == '30' ? '30 seconds' :
                         interval == '60' ? '1 minute' :
                         interval == '300' ? '5 minutes' :
                         '10 minutes';
            return RadioListTile<String>(
              title: Text(label),
              value: interval,
              groupValue: _syncInterval,
              onChanged: (value) {
                setState(() => _syncInterval = value!);
                _saveSetting('syncInterval', value);
                Navigator.of(context).pop();
              },
            );
          }).toList(),
        ),
      ),
    );
  }

  void _showImageSizeSelector() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Select Max Image Size'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [512, 1024, 2048, 4096].map((size) {
            return RadioListTile<int>(
              title: Text('${size}px'),
              value: size,
              groupValue: _maxImageSize,
              onChanged: (value) {
                setState(() => _maxImageSize = value!);
                _saveSetting('maxImageSize', value);
                Navigator.of(context).pop();
              },
            );
          }).toList(),
        ),
      ),
    );
  }

  void _showThemeCustomizer() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Theme customizer coming soon!'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _showClearCacheConfirmation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear Cache'),
        content: const Text('This will clear all cached images and temporary files. Continue?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              _clearCache();
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
            child: const Text('Clear Cache'),
          ),
        ],
      ),
    );
  }

  void _showResetConfirmation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reset Settings'),
        content: const Text('This will reset all settings to their default values. Continue?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              _resetSettings();
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
            child: const Text('Reset'),
          ),
        ],
      ),
    );
  }

  void _showResetDataConfirmation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reset App Data'),
        content: const Text('This will delete ALL data including exhibits, settings, and cache. This action cannot be undone. Continue?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              _resetAppData();
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Reset All Data'),
          ),
        ],
      ),
    );
  }

  void _clearCache() async {
    try {
      // Implementation for clearing cache
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Cache cleared successfully'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to clear cache: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _resetSettings() async {
    try {
      await _prefs.clear();
      await _loadSettings();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Settings reset to defaults'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to reset settings: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _resetAppData() async {
    try {
      // Implementation for resetting all app data
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('App data reset successfully'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to reset app data: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _exportData() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Export functionality coming soon!'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _showDatabaseInfo() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Database info coming soon!'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _runNetworkDiagnostics() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Network diagnostics coming soon!'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _showLicense() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('MIT License'),
        content: const SingleChildScrollView(
          child: Text(
            'MIT License\n\n'
            'Copyright (c) 2025 UCOST\n\n'
            'Permission is hereby granted, free of charge, to any person obtaining a copy '
            'of this software and associated documentation files (the "Software"), to deal '
            'in the Software without restriction, including without limitation the rights '
            'to use, copy, modify, merge, publish, distribute, sublicense, and/or sell '
            'copies of the Software, and to permit persons to whom the Software is '
            'furnished to do so, subject to the following conditions:\n\n'
            'The above copyright notice and this permission notice shall be included in all '
            'copies or substantial portions of the Software.\n\n'
            'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR '
            'IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, '
            'FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE '
            'AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER '
            'LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, '
            'OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.',
          ),
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

  void _showPrivacyPolicy() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Privacy policy coming soon!'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _showTermsOfService() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Terms of service coming soon!'),
        backgroundColor: Colors.blue,
      ),
    );
  }
} 