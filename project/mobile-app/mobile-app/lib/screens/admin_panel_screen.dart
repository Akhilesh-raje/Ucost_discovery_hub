import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../utils/constants.dart';
import '../utils/theme.dart';

class AdminPanelScreen extends StatefulWidget {
  const AdminPanelScreen({super.key});

  @override
  State<AdminPanelScreen> createState() => _AdminPanelScreenState();
}

class _AdminPanelScreenState extends State<AdminPanelScreen> {
  late WebViewController _webViewController;
  bool _isLoading = true;
  bool _hasError = false;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _initializeWebView();
  }

  void _initializeWebView() {
    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            setState(() {
              _isLoading = progress < 100;
            });
          },
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
              _hasError = false;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
          },
          onWebResourceError: (WebResourceError error) {
            setState(() {
              _hasError = true;
              _errorMessage = error.description;
            });
          },
        ),
      )
      ..loadRequest(Uri.parse('${ApiEndpoints.baseUrl}/admin'));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Panel'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshWebView,
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: _showAdminSettings,
          ),
        ],
      ),
      body: _buildBody(),
      floatingActionButton: _buildFloatingActionButton(),
    );
  }

  Widget _buildBody() {
    if (_hasError) {
      return _buildErrorWidget();
    }

    return Stack(
      children: [
        WebViewWidget(controller: _webViewController),
        if (_isLoading) _buildLoadingWidget(),
      ],
    );
  }

  Widget _buildLoadingWidget() {
    return Container(
      color: Colors.white,
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Loading Admin Panel...'),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorWidget() {
    return Container(
      color: Colors.white,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: AppColors.error,
            ),
            const SizedBox(height: 16),
            Text(
              'Failed to load Admin Panel',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              _errorMessage,
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _refreshWebView,
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFloatingActionButton() {
    return FloatingActionButton.extended(
      onPressed: _showQuickActions,
      backgroundColor: AppColors.primary,
      foregroundColor: Colors.white,
      icon: const Icon(Icons.admin_panel_settings),
      label: const Text('Quick Actions'),
    );
  }

  void _refreshWebView() {
    setState(() {
      _hasError = false;
      _errorMessage = '';
    });
    _webViewController.reload();
  }

  void _showAdminSettings() {
    showModalBottomSheet(
      context: context,
      builder: (context) => _buildAdminSettings(),
    );
  }

  Widget _buildAdminSettings() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.security),
            title: const Text('Security Settings'),
            onTap: () {
              Navigator.pop(context);
              _navigateToSecuritySettings();
            },
          ),
          ListTile(
            leading: const Icon(Icons.people),
            title: const Text('User Management'),
            onTap: () {
              Navigator.pop(context);
              _navigateToUserManagement();
            },
          ),
          ListTile(
            leading: const Icon(Icons.analytics),
            title: const Text('Analytics'),
            onTap: () {
              Navigator.pop(context);
              _navigateToAnalytics();
            },
          ),
          ListTile(
            leading: const Icon(Icons.backup),
            title: const Text('Backup & Restore'),
            onTap: () {
              Navigator.pop(context);
              _navigateToBackupRestore();
            },
          ),
          ListTile(
            leading: const Icon(Icons.logout),
            title: const Text('Logout'),
            onTap: () {
              Navigator.pop(context);
              _logout();
            },
          ),
        ],
      ),
    );
  }

  void _showQuickActions() {
    showModalBottomSheet(
      context: context,
      builder: (context) => _buildQuickActions(),
    );
  }

  Widget _buildQuickActions() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
            'Quick Actions',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildQuickActionCard(
                  icon: Icons.upload,
                  title: 'Upload Exhibit',
                  onTap: _uploadExhibit,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildQuickActionCard(
                  icon: Icons.sync,
                  title: 'Sync Data',
                  onTap: _syncData,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _buildQuickActionCard(
                  icon: Icons.qr_code,
                  title: 'Generate QR',
                  onTap: _generateQR,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildQuickActionCard(
                  icon: Icons.devices,
                  title: 'Device Status',
                  onTap: _checkDeviceStatus,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionCard({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Icon(icon, size: 32, color: AppColors.primary),
              const SizedBox(height: 8),
              Text(
                title,
                style: const TextStyle(fontSize: 12),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Navigation Methods
  void _navigateToSecuritySettings() {
    _webViewController.loadRequest(
      Uri.parse('${ApiEndpoints.baseUrl}/admin/security'),
    );
  }

  void _navigateToUserManagement() {
    _webViewController.loadRequest(
      Uri.parse('${ApiEndpoints.baseUrl}/admin/users'),
    );
  }

  void _navigateToAnalytics() {
    _webViewController.loadRequest(
      Uri.parse('${ApiEndpoints.baseUrl}/admin/analytics'),
    );
  }

  void _navigateToBackupRestore() {
    _webViewController.loadRequest(
      Uri.parse('${ApiEndpoints.baseUrl}/admin/backup'),
    );
  }

  // Quick Action Methods
  void _uploadExhibit() {
    Navigator.pop(context);
    Navigator.pushNamed(context, '/exhibit-upload');
  }

  void _syncData() {
    Navigator.pop(context);
    Navigator.pushNamed(context, '/p2p-sync');
  }

  void _generateQR() {
    Navigator.pop(context);
    _showQRGenerationDialog();
  }

  void _checkDeviceStatus() {
    Navigator.pop(context);
    _showDeviceStatusDialog();
  }

  void _logout() {
    Navigator.pop(context);
    _showLogoutConfirmation();
  }

  // Dialog Methods
  void _showQRGenerationDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Generate QR Code'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.qr_code),
              title: const Text('Exhibit QR'),
              onTap: () {
                Navigator.pop(context);
                _generateExhibitQR();
              },
            ),
            ListTile(
              leading: const Icon(Icons.wifi),
              title: const Text('WiFi QR'),
              onTap: () {
                Navigator.pop(context);
                _generateWiFiQR();
              },
            ),
            ListTile(
              leading: const Icon(Icons.admin_panel_settings),
              title: const Text('Admin QR'),
              onTap: () {
                Navigator.pop(context);
                _generateAdminQR();
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  void _showDeviceStatusDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Device Status'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: Icon(Icons.check_circle, color: Colors.green),
              title: Text('Mobile App'),
              subtitle: Text('Online'),
            ),
            ListTile(
              leading: Icon(Icons.check_circle, color: Colors.green),
              title: Text('Kiosk 1'),
              subtitle: Text('Online'),
            ),
            ListTile(
              leading: Icon(Icons.error, color: Colors.red),
              title: Text('Kiosk 2'),
              subtitle: Text('Offline'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showLogoutConfirmation() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout from the admin panel?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }

  // QR Generation Methods
  void _generateExhibitQR() {
    // TODO: Implement exhibit QR generation
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Exhibit QR generation coming soon')),
    );
  }

  void _generateWiFiQR() {
    // TODO: Implement WiFi QR generation
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('WiFi QR generation coming soon')),
    );
  }

  void _generateAdminQR() {
    // TODO: Implement admin QR generation
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Admin QR generation coming soon')),
    );
  }
} 