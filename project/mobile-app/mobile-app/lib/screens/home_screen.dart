import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../providers/app_provider.dart';
import '../providers/connection_provider.dart';
import '../providers/exhibit_provider.dart';
import '../utils/constants.dart';
import '../widgets/connection_status_widget.dart';
import '../widgets/quick_action_card.dart';
import '../widgets/exhibit_card.dart';
import '../widgets/stats_card.dart';
import 'qr_scanner_screen.dart';
import 'exhibit_upload_screen.dart';
import 'p2p_sync_screen.dart';
import 'settings_screen.dart';
import 'admin_panel_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
    
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutBack,
    ));
    
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: SlideTransition(
            position: _slideAnimation,
            child: CustomScrollView(
              slivers: [
                _buildAppBar(),
                _buildContent(),
              ],
            ),
          ),
        ),
      ),
      floatingActionButton: _buildFloatingActionButton(),
    );
  }

  Widget _buildAppBar() {
    return SliverAppBar(
      expandedHeight: 120,
      floating: false,
      pinned: true,
      backgroundColor: AppColors.primary,
      flexibleSpace: FlexibleSpaceBar(
        title: const Text(
          'UCOST Discovery Hub',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        background: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.primary,
                Color(0xFF1976D2),
              ],
            ),
          ),
          child: const Center(
            child: Icon(
              Icons.museum,
              size: 60,
              color: Colors.white,
            ),
          ),
        ),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.notifications, color: Colors.white),
          onPressed: () {
            // Show notifications
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Notifications coming soon!'),
                backgroundColor: AppColors.primary,
              ),
            );
          },
        ),
        IconButton(
          icon: const Icon(Icons.settings, color: Colors.white),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const SettingsScreen()),
            );
          },
        ),
      ],
    );
  }

  Widget _buildContent() {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildConnectionStatus(),
            const SizedBox(height: 24),
            _buildQuickActions(),
            const SizedBox(height: 24),
            _buildStatsSection(),
            const SizedBox(height: 24),
            _buildRecentExhibits(),
            const SizedBox(height: 24),
            _buildRecentActivity(),
          ],
        ),
      ),
    );
  }

  Widget _buildConnectionStatus() {
    return Consumer<ConnectionProvider>(
      builder: (context, connectionProvider, child) {
        return ConnectionStatusWidget(
          isConnected: connectionProvider.isConnected,
          connectionType: connectionProvider.connectionType,
          connectedDevices: connectionProvider.connectedDevices,
        );
      },
    );
  }

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Quick Actions',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        AnimationLimiter(
          child: GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 1.2,
            children: AnimationConfiguration.toStaggeredList(
              duration: const Duration(milliseconds: 600),
              childAnimationBuilder: (widget) => SlideAnimation(
                horizontalOffset: 50.0,
                child: FadeInAnimation(child: widget),
              ),
              children: [
                QuickActionCard(
                  title: 'Scan QR Code',
                  subtitle: 'Connect to devices',
                  icon: Icons.qr_code_scanner,
                  color: AppColors.primary,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const QRScannerScreen(),
                      ),
                    );
                  },
                ),
                QuickActionCard(
                  title: 'Upload Exhibit',
                  subtitle: 'Add new exhibits',
                  icon: Icons.upload,
                  color: Colors.green,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const ExhibitUploadScreen(),
                      ),
                    );
                  },
                ),
                QuickActionCard(
                  title: 'P2P Sync',
                  subtitle: 'Sync with devices',
                  icon: Icons.sync,
                  color: Colors.orange,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const P2PSyncScreen(),
                      ),
                    );
                  },
                ),
                QuickActionCard(
                  title: 'Settings',
                  subtitle: 'App configuration',
                  icon: Icons.settings,
                  color: Colors.purple,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const SettingsScreen(),
                      ),
                    );
                  },
                ),
                QuickActionCard(
                  title: 'Admin Panel',
                  subtitle: 'Full admin access',
                  icon: Icons.admin_panel_settings,
                  color: Colors.red,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const AdminPanelScreen(),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatsSection() {
    return Consumer<ExhibitProvider>(
      builder: (context, exhibitProvider, child) {
        final totalExhibits = exhibitProvider.exhibits.length;
        final uploadQueue = exhibitProvider.uploadQueue.length;
        final categories = exhibitProvider.getCategories().length;
        
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Statistics',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: StatsCard(
                    title: 'Total Exhibits',
                    value: totalExhibits.toString(),
                    icon: Icons.museum,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: StatsCard(
                    title: 'Pending Uploads',
                    value: uploadQueue.toString(),
                    icon: Icons.upload,
                    color: Colors.orange,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: StatsCard(
                    title: 'Categories',
                    value: categories.toString(),
                    icon: Icons.category,
                    color: Colors.green,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Consumer<ConnectionProvider>(
                    builder: (context, connectionProvider, child) {
                      return StatsCard(
                        title: 'Connected Devices',
                        value: connectionProvider.connectedDevices.length.toString(),
                        icon: Icons.devices,
                        color: Colors.purple,
                      );
                    },
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  Widget _buildRecentExhibits() {
    return Consumer<ExhibitProvider>(
      builder: (context, exhibitProvider, child) {
        final recentExhibits = exhibitProvider.exhibits
            .where((exhibit) => exhibit.isRecentlyCreated || exhibit.isRecentlyUpdated)
            .take(3)
            .toList();

        if (recentExhibits.isEmpty) {
          return const SizedBox.shrink();
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Recent Exhibits',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ...recentExhibits.map((exhibit) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: ExhibitCard(exhibit: exhibit),
            )),
          ],
        );
      },
    );
  }

  Widget _buildRecentActivity() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Recent Activity',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _buildActivityItem(
                  icon: Icons.qr_code_scanner,
                  title: 'QR Code Scanned',
                  subtitle: 'Connected to Kiosk 1',
                  time: '2 minutes ago',
                  color: AppColors.primary,
                ),
                const Divider(),
                _buildActivityItem(
                  icon: Icons.upload,
                  title: 'Exhibit Uploaded',
                  subtitle: 'Ancient Artifacts Collection',
                  time: '5 minutes ago',
                  color: Colors.green,
                ),
                const Divider(),
                _buildActivityItem(
                  icon: Icons.sync,
                  title: 'Sync Completed',
                  subtitle: '3 exhibits synchronized',
                  time: '10 minutes ago',
                  color: Colors.orange,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildActivityItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required String time,
    required Color color,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Text(
            time,
            style: TextStyle(
              color: Colors.grey[500],
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFloatingActionButton() {
    return Consumer<ExhibitProvider>(
      builder: (context, exhibitProvider, child) {
        if (exhibitProvider.uploadQueue.isEmpty) {
          return FloatingActionButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ExhibitUploadScreen(),
                ),
              );
            },
            backgroundColor: AppColors.primary,
            child: const Icon(Icons.add, color: Colors.white),
          );
        } else {
          return FloatingActionButton.extended(
            onPressed: () {
              exhibitProvider.uploadAllQueuedExhibits();
            },
            backgroundColor: Colors.orange,
            icon: const Icon(Icons.upload, color: Colors.white),
            label: Text(
              'Upload ${exhibitProvider.uploadQueue.length}',
              style: const TextStyle(color: Colors.white),
            ),
          );
        }
      },
    );
  }
} 