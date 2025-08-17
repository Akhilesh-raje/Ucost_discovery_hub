import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/tour_provider.dart';
import '../providers/exhibit_provider.dart';
import '../models/exhibit.dart';

class TourScreen extends StatefulWidget {
  const TourScreen({super.key});

  @override
  State<TourScreen> createState() => _TourScreenState();
}

class _TourScreenState extends State<TourScreen>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeInOut,
    ));
    
    _fadeController.forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF1e40af),
              Color(0xFF3b82f6),
              Color(0xFF60a5fa),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header
              _buildHeader(),
              
              // Content area
              Expanded(
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: Consumer<TourProvider>(
                    builder: (context, tourProvider, child) {
                      if (!tourProvider.hasExhibits) {
                        return _buildEmptyState();
                      }
                      
                      return _buildTourContent(tourProvider);
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          // Top row with back button and title
          Row(
            children: [
              IconButton(
                onPressed: () => Navigator.of(context).pop(),
                icon: const Icon(Icons.arrow_back, color: Colors.white),
              ),
              Expanded(
                child: Text(
                  'My Tour',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              Consumer<TourProvider>(
                builder: (context, tourProvider, child) {
                  if (tourProvider.hasExhibits) {
                    return IconButton(
                      onPressed: () => _showClearTourDialog(tourProvider),
                      icon: const Icon(Icons.clear_all, color: Colors.white),
                      tooltip: 'Clear Tour',
                    );
                  }
                  return const SizedBox(width: 48);
                },
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Tour summary
          Consumer<TourProvider>(
            builder: (context, tourProvider, child) {
              if (!tourProvider.hasExhibits) return const SizedBox.shrink();
              
              return Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.2)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: _buildSummaryItem(
                        icon: Icons.museum,
                        label: 'Exhibits',
                        value: '${tourProvider.tourLength}',
                      ),
                    ),
                    Expanded(
                      child: _buildSummaryItem(
                        icon: Icons.timer,
                        label: 'Duration',
                        value: '${tourProvider.estimatedTourDuration} min',
                      ),
                    ),
                    Expanded(
                      child: _buildSummaryItem(
                        icon: Icons.route,
                        label: 'Status',
                        value: tourProvider.isTourActive ? 'Active' : 'Ready',
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItem({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Column(
      children: [
        Icon(
          icon,
          color: Colors.white.withOpacity(0.7),
          size: 24,
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.7),
            fontSize: 12,
          ),
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
            Icons.tour,
            color: Colors.white.withOpacity(0.7),
            size: 80,
          ),
          const SizedBox(height: 24),
          const Text(
            'No Exhibits in Tour',
            style: TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Add exhibits to your tour from the exhibit map to get started.',
            style: TextStyle(
              color: Colors.white.withOpacity(0.7),
              fontSize: 16,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),
          ElevatedButton.icon(
            onPressed: () => Navigator.of(context).pop(),
            icon: const Icon(Icons.explore),
            label: const Text('Explore Exhibits'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xFF1e40af),
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTourContent(TourProvider tourProvider) {
    return Column(
      children: [
        // Tour actions
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: tourProvider.isTourActive 
                      ? () => _stopTour(tourProvider)
                      : () => _startTour(tourProvider),
                  icon: Icon(
                    tourProvider.isTourActive ? Icons.stop : Icons.play_arrow,
                  ),
                  label: Text(
                    tourProvider.isTourActive ? 'Stop Tour' : 'Start Tour',
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: tourProvider.isTourActive 
                        ? Colors.red 
                        : Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
              
              const SizedBox(width: 16),
              
              if (tourProvider.isTourActive)
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _showTourProgress(tourProvider),
                    icon: const Icon(Icons.analytics),
                    label: const Text('Progress'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
        
        const SizedBox(height: 24),
        
        // Tour progress indicator
        if (tourProvider.isTourActive)
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Tour Progress',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.8),
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Text(
                      '${(tourProvider.tourProgress * 100).round()}%',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                LinearProgressIndicator(
                  value: tourProvider.tourProgress,
                  backgroundColor: Colors.white.withOpacity(0.3),
                  valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              ],
            ),
          ),
        
        const SizedBox(height: 24),
        
        // Exhibit list
        Expanded(
          child: Consumer<ExhibitProvider>(
            builder: (context, exhibitProvider, child) {
              final tourExhibits = exhibitProvider.exhibits
                  .where((exhibit) => tourProvider.isExhibitInTour(exhibit.id))
                  .toList();
              
              if (tourExhibits.isEmpty) {
                return const Center(
                  child: CircularProgressIndicator(color: Colors.white),
                );
              }
              
              return ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                itemCount: tourExhibits.length,
                itemBuilder: (context, index) {
                  final exhibit = tourExhibits[index];
                  return _buildExhibitListItem(exhibit, index, tourProvider);
                },
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildExhibitListItem(Exhibit exhibit, int index, TourProvider tourProvider) {
    final isCurrentExhibit = tourProvider.isTourActive && 
                             tourProvider.currentExhibitIndex == index;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: isCurrentExhibit 
            ? Colors.white.withOpacity(0.2)
            : Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isCurrentExhibit 
              ? Colors.white 
              : Colors.white.withOpacity(0.2),
          width: isCurrentExhibit ? 2 : 1,
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Stack(
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: _getExhibitColor(exhibit.category),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                _getExhibitIcon(exhibit.category),
                color: Colors.white,
                size: 28,
              ),
            ),
            if (isCurrentExhibit)
              Positioned(
                top: -4,
                right: -4,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(
                    color: Colors.green,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.play_arrow,
                    color: Colors.white,
                    size: 16,
                  ),
                ),
              ),
          ],
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                exhibit.displayName,
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: isCurrentExhibit ? FontWeight.bold : FontWeight.w600,
                  fontSize: 16,
                ),
              ),
            ),
            if (tourProvider.isTourActive)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${index + 1}/${tourProvider.tourLength}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              exhibit.shortDescription,
              style: TextStyle(
                color: Colors.white.withOpacity(0.8),
                fontSize: 14,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    exhibit.categoryDisplay,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    exhibit.durationText,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
        trailing: PopupMenuButton<String>(
          icon: const Icon(Icons.more_vert, color: Colors.white),
          onSelected: (value) => _handleExhibitAction(value, exhibit, tourProvider),
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'view',
              child: Row(
                children: [
                  Icon(Icons.visibility),
                  SizedBox(width: 8),
                  Text('View Details'),
                ],
              ),
            ),
            if (tourProvider.isTourActive)
              const PopupMenuItem(
                value: 'jump',
                child: Row(
                  children: [
                    Icon(Icons.navigation),
                    SizedBox(width: 8),
                    Text('Jump to This'),
                  ],
                ),
              ),
            const PopupMenuItem(
              value: 'remove',
              child: Row(
                children: [
                  Icon(Icons.remove_circle, color: Colors.red),
                  SizedBox(width: 8),
                  Text('Remove from Tour', style: TextStyle(color: Colors.red)),
                ],
              ),
            ),
          ],
        ),
        onTap: () => _viewExhibitDetails(exhibit),
      ),
    );
  }

  // Helper methods
  Color _getExhibitColor(String category) {
    switch (category.toLowerCase()) {
      case 'science':
        return Colors.red;
      case 'technology':
        return Colors.blue;
      case 'history':
        return Colors.green;
      case 'art':
        return Colors.purple;
      case 'nature':
        return Colors.teal;
      case 'space':
        return Colors.indigo;
      default:
        return Colors.grey;
    }
  }

  IconData _getExhibitIcon(String category) {
    switch (category.toLowerCase()) {
      case 'science':
        return Icons.science;
      case 'technology':
        return Icons.computer;
      case 'history':
        return Icons.history_edu;
      case 'art':
        return Icons.palette;
      case 'nature':
        return Icons.nature;
      case 'space':
        return Icons.rocket;
      default:
        return Icons.museum;
    }
  }

  void _startTour(TourProvider tourProvider) async {
    try {
      await tourProvider.startTour();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Tour started! Enjoy your journey.'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to start tour: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _stopTour(TourProvider tourProvider) async {
    try {
      await tourProvider.stopTour();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Tour stopped.'),
          backgroundColor: Colors.orange,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to stop tour: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showTourProgress(TourProvider tourProvider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Tour Progress'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Current Exhibit: ${tourProvider.currentExhibitIndex + 1}/${tourProvider.tourLength}'),
            const SizedBox(height: 16),
            LinearProgressIndicator(
              value: tourProvider.tourProgress,
              backgroundColor: Colors.grey[300],
              valueColor: const AlwaysStoppedAnimation<Color>(Colors.blue),
            ),
            const SizedBox(height: 16),
            Text('Estimated Time Remaining: ${_calculateRemainingTime(tourProvider)}'),
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

  String _calculateRemainingTime(TourProvider tourProvider) {
    final remainingExhibits = tourProvider.tourLength - tourProvider.currentExhibitIndex - 1;
    final estimatedMinutes = remainingExhibits * 5; // 5 minutes per exhibit
    
    if (estimatedMinutes < 60) {
      return '$estimatedMinutes minutes';
    } else {
      final hours = estimatedMinutes ~/ 60;
      final minutes = estimatedMinutes % 60;
      return '${hours}h ${minutes}m';
    }
  }

  void _handleExhibitAction(String action, Exhibit exhibit, TourProvider tourProvider) {
    switch (action) {
      case 'view':
        _viewExhibitDetails(exhibit);
        break;
      case 'jump':
        tourProvider.goToExhibit(tourProvider.selectedExhibitIds.indexOf(exhibit.id));
        break;
      case 'remove':
        tourProvider.removeFromTour(exhibit.id);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${exhibit.displayName} removed from tour'),
            backgroundColor: Colors.red,
          ),
        );
        break;
    }
  }

  void _viewExhibitDetails(Exhibit exhibit) {
    // Navigate to exhibit detail screen
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => ExhibitDetailScreen(exhibit: exhibit),
      ),
    );
  }

  void _showClearTourDialog(TourProvider tourProvider) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear Tour'),
        content: const Text('Are you sure you want to remove all exhibits from your tour? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              tourProvider.clearTour();
              Navigator.of(context).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Tour cleared'),
                  backgroundColor: Colors.orange,
                ),
              );
            },
            child: const Text('Clear', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
} 