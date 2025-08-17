import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/tour_provider.dart';
import '../models/exhibit.dart';

class ExhibitDetailScreen extends StatefulWidget {
  final Exhibit exhibit;

  const ExhibitDetailScreen({
    super.key,
    required this.exhibit,
  });

  @override
  State<ExhibitDetailScreen> createState() => _ExhibitDetailScreenState();
}

class _ExhibitDetailScreenState extends State<ExhibitDetailScreen>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late AnimationController _slideController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  
  int _currentImageIndex = 0;
  bool _isExpanded = false;

  @override
  void initState() {
    super.initState();
    
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    
    _slideController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeInOut,
    ));

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideController,
      curve: Curves.easeOutCubic,
    ));

    // Start animations
    _fadeController.forward();
    Future.delayed(const Duration(milliseconds: 200), () {
      _slideController.forward();
    });
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
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
              // Header with back button
              _buildHeader(),
              
              // Content area
              Expanded(
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: SlideTransition(
                    position: _slideAnimation,
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Exhibit image gallery
                          _buildImageGallery(),
                          
                          const SizedBox(height: 24),
                          
                          // Exhibit title and basic info
                          _buildExhibitHeader(),
                          
                          const SizedBox(height: 20),
                          
                          // Quick stats
                          _buildQuickStats(),
                          
                          const SizedBox(height: 24),
                          
                          // Description
                          _buildDescription(),
                          
                          const SizedBox(height: 24),
                          
                          // Additional information
                          _buildAdditionalInfo(),
                          
                          const SizedBox(height: 24),
                          
                          // Actions
                          _buildActions(),
                        ],
                      ),
                    ),
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
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          IconButton(
            onPressed: () => Navigator.of(context).pop(),
            icon: const Icon(Icons.arrow_back, color: Colors.white),
          ),
          Expanded(
            child: Text(
              'Exhibit Details',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(width: 48), // Balance the back button
        ],
      ),
    );
  }

  Widget _buildImageGallery() {
    final images = widget.exhibit.allImages;
    
    if (images.isEmpty) {
      return Container(
        height: 200,
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.2)),
        ),
        child: Center(
          child: Icon(
            Icons.image_not_supported,
            color: Colors.white.withOpacity(0.5),
            size: 64,
          ),
        ),
      );
    }

    return Column(
      children: [
        // Main image
        Container(
          height: 250,
          width: double.infinity,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withOpacity(0.2)),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: PageView.builder(
              itemCount: images.length,
              onPageChanged: (index) {
                setState(() {
                  _currentImageIndex = index;
                });
              },
              itemBuilder: (context, index) {
                return Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.1),
                  ),
                  child: Center(
                    child: Text(
                      'Image ${index + 1}',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.7),
                        fontSize: 18,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ),
        
        // Image indicators
        if (images.length > 1) ...[
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(images.length, (index) {
              return Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: index == _currentImageIndex
                      ? Colors.white
                      : Colors.white.withOpacity(0.3),
                ),
              );
            }),
          ),
        ],
      ],
    );
  }

  Widget _buildExhibitHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title
        Text(
          widget.exhibit.displayName,
          style: const TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        
        const SizedBox(height: 8),
        
        // Category and location
        Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: _getExhibitColor(widget.exhibit.category).withOpacity(0.2),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: _getExhibitColor(widget.exhibit.category),
                  width: 1,
                ),
              ),
              child: Text(
                widget.exhibit.categoryDisplay,
                style: TextStyle(
                  color: _getExhibitColor(widget.exhibit.category),
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
            
            const SizedBox(width: 12),
            
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withOpacity(0.3)),
              ),
              child: Text(
                widget.exhibit.locationDisplay,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
        
        const SizedBox(height: 16),
        
        // Popularity indicator
        Row(
          children: [
            Text(
              widget.exhibit.popularityIndicator,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            
            const Spacer(),
            
            // Rating
            if (widget.exhibit.rating > 0) ...[
              Row(
                children: [
                  const Icon(Icons.star, color: Colors.amber, size: 20),
                  const SizedBox(width: 4),
                  Text(
                    widget.exhibit.rating.toStringAsFixed(1),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ],
    );
  }

  Widget _buildQuickStats() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildStatItem(
              icon: Icons.timer,
              label: 'Duration',
              value: widget.exhibit.durationText,
            ),
          ),
          Expanded(
            child: _buildStatItem(
              icon: Icons.trending_up,
              label: 'Difficulty',
              value: widget.exhibit.difficultyLevel,
            ),
          ),
          Expanded(
            child: _buildStatItem(
              icon: Icons.visibility,
              label: 'Views',
              value: '${widget.exhibit.viewCount}',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem({
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

  Widget _buildDescription() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Description',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        
        const SizedBox(height: 12),
        
        AnimatedCrossFade(
          duration: const Duration(milliseconds: 300),
          crossFadeState: _isExpanded 
              ? CrossFadeState.showSecond 
              : CrossFadeState.showFirst,
          firstChild: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.exhibit.shortDescription,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.9),
                  fontSize: 16,
                  height: 1.5,
                ),
              ),
              if (widget.exhibit.description.length > 100) ...[
                const SizedBox(height: 8),
                GestureDetector(
                  onTap: () => setState(() => _isExpanded = true),
                  child: Text(
                    'Read more',
                    style: TextStyle(
                      color: Colors.blue[200],
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ),
              ],
            ],
          ),
          secondChild: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.exhibit.description,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.9),
                  fontSize: 16,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: () => setState(() => _isExpanded = false),
                child: Text(
                  'Show less',
                  style: TextStyle(
                    color: Colors.blue[200],
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAdditionalInfo() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Additional Information',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          
          const SizedBox(height: 16),
          
          _buildInfoRow('Accessibility', widget.exhibit.isAccessible ? 'Wheelchair accessible' : 'Limited accessibility'),
          _buildInfoRow('Age Restriction', widget.exhibit.ageRestriction),
          if (widget.exhibit.tags.isNotEmpty)
            _buildInfoRow('Tags', widget.exhibit.tags.join(', ')),
          if (widget.exhibit.audioGuide != null)
            _buildInfoRow('Audio Guide', 'Available'),
          if (widget.exhibit.videoUrl != null)
            _buildInfoRow('Video', 'Available'),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: TextStyle(
                color: Colors.white.withOpacity(0.7),
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActions() {
    return Consumer<TourProvider>(
      builder: (context, tourProvider, child) {
        final isInTour = tourProvider.isExhibitInTour(widget.exhibit.id);
        
        return Column(
          children: [
            // Add/Remove from tour button
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () => _toggleTourStatus(tourProvider),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isInTour ? Colors.red : Colors.white,
                  foregroundColor: isInTour ? Colors.white : const Color(0xFF1e40af),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  elevation: 4,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      isInTour ? Icons.remove_circle : Icons.add_circle,
                      size: 24,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      isInTour ? 'Remove from Tour' : 'Add to Tour',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Secondary actions
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _shareExhibit(),
                    icon: const Icon(Icons.share),
                    label: const Text('Share'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Colors.white, width: 2),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                
                const SizedBox(width: 16),
                
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _showLocation(),
                    icon: const Icon(Icons.location_on),
                    label: const Text('Location'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Colors.white, width: 2),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        );
      },
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

  void _toggleTourStatus(TourProvider tourProvider) {
    if (tourProvider.isExhibitInTour(widget.exhibit.id)) {
      tourProvider.removeFromTour(widget.exhibit.id);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${widget.exhibit.displayName} removed from tour'),
          backgroundColor: Colors.red,
        ),
      );
    } else {
      tourProvider.addToTour(widget.exhibit.id);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${widget.exhibit.displayName} added to tour'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  void _shareExhibit() {
    // In a real app, this would implement sharing functionality
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Sharing functionality would be implemented here'),
        backgroundColor: Colors.blue,
      ),
    );
  }

  void _showLocation() {
    // In a real app, this would show the exhibit location on a map
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${widget.exhibit.displayName} is located on ${widget.exhibit.locationDisplay}'),
        backgroundColor: Colors.blue,
      ),
    );
  }
} 