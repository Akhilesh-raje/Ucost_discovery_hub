import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/exhibit_provider.dart';
import '../providers/user_provider.dart';
import '../providers/tour_provider.dart';
import '../models/exhibit.dart';
import '../models/user_profile.dart';
import '../utils/constants.dart';
import 'exhibit_detail_screen.dart';
import 'tour_screen.dart';

class ExhibitMapScreen extends StatefulWidget {
  const ExhibitMapScreen({super.key});

  @override
  State<ExhibitMapScreen> createState() => _ExhibitMapScreenState();
}

class _ExhibitMapScreenState extends State<ExhibitMapScreen>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;
  
  String _selectedCategory = 'All';
  String _selectedLocation = 'All';
  String _searchQuery = '';
  bool _showMapView = true;
  
  // Available options
  final List<String> _categories = [
    'All', 'Science', 'Technology', 'History', 'Art', 'Nature', 'Space'
  ];
  final List<String> _locations = [
    'All', 'Ground Floor', 'First Floor', 'Second Floor', 'Basement', 'Outdoor'
  ];

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
    
    // Load exhibits
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ExhibitProvider>(context, listen: false).loadExhibits();
    });
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
              
              // Search and filters
              _buildSearchAndFilters(),
              
              // Content area
              Expanded(
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: _showMapView 
                      ? _buildMapView() 
                      : _buildListView(),
                ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: _buildFloatingActionButton(),
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
                  'Exhibit Map',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              IconButton(
                onPressed: () => _showUserProfile(),
                icon: const Icon(Icons.person, color: Colors.white),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Welcome message
          Consumer<UserProvider>(
            builder: (context, userProvider, child) {
              final user = userProvider.userProfile;
              if (user != null) {
                return Text(
                  'Welcome back, ${user.displayName}!',
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 16,
                  ),
                  textAlign: TextAlign.center,
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndFilters() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          // Search bar
          Container(
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(0.3)),
            ),
            child: TextField(
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                });
              },
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Search exhibits...',
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
                prefixIcon: const Icon(Icons.search, color: Colors.white70),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 16,
                ),
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Category and location filters
          Row(
            children: [
              // Category filter
              Expanded(
                child: _buildFilterDropdown(
                  value: _selectedCategory,
                  items: _categories,
                  label: 'Category',
                  onChanged: (value) {
                    setState(() {
                      _selectedCategory = value!;
                    });
                  },
                ),
              ),
              
              const SizedBox(width: 12),
              
              // Location filter
              Expanded(
                child: _buildFilterDropdown(
                  value: _selectedLocation,
                  items: _locations,
                  label: 'Location',
                  onChanged: (value) {
                    setState(() {
                      _selectedLocation = value!;
                    });
                  },
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // View toggle
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildViewToggleButton(
                icon: Icons.map,
                label: 'Map',
                isSelected: _showMapView,
                onTap: () => setState(() => _showMapView = true),
              ),
              const SizedBox(width: 16),
              _buildViewToggleButton(
                icon: Icons.list,
                label: 'List',
                isSelected: !_showMapView,
                onTap: () => setState(() => _showMapView = false),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMapView() {
    return Consumer<ExhibitProvider>(
      builder: (context, exhibitProvider, child) {
        if (exhibitProvider.isLoading) {
          return const Center(
            child: CircularProgressIndicator(color: Colors.white),
          );
        }

        if (exhibitProvider.error != null) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.error_outline,
                  color: Colors.white.withOpacity(0.7),
                  size: 64,
                ),
                const SizedBox(height: 16),
                Text(
                  'Failed to load exhibits',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.7),
                    fontSize: 18,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  exhibitProvider.error!,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.5),
                    fontSize: 14,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }

        final exhibits = _getFilteredExhibits(exhibitProvider.exhibits);
        
        if (exhibits.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.search_off,
                  color: Colors.white.withOpacity(0.7),
                  size: 64,
                ),
                const SizedBox(height: 16),
                Text(
                  'No exhibits found',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.7),
                    fontSize: 18,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Try adjusting your search or filters',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.5),
                    fontSize: 14,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }

        return Container(
          margin: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white.withOpacity(0.2)),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: _buildInteractiveMap(exhibits),
          ),
        );
      },
    );
  }

  Widget _buildInteractiveMap(List<Exhibit> exhibits) {
    // This is a simplified map view - in a real app, you'd use a proper map package
    return Container(
      height: 400,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Stack(
        children: [
          // Background grid pattern
          CustomPaint(
            size: const Size(double.infinity, double.infinity),
            painter: GridPainter(),
          ),
          
          // Exhibit markers
          ...exhibits.asMap().entries.map((entry) {
            final index = entry.key;
            final exhibit = entry.value;
            final position = _calculateExhibitPosition(index, exhibits.length);
            
            return Positioned(
              left: position.dx,
              top: position.dy,
              child: _buildExhibitMarker(exhibit),
            );
          }).toList(),
          
          // Map legend
          Positioned(
            top: 16,
            right: 16,
            child: _buildMapLegend(),
          ),
        ],
      ),
    );
  }

  Widget _buildExhibitMarker(Exhibit exhibit) {
    return GestureDetector(
      onTap: () => _navigateToExhibitDetail(exhibit),
      child: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          color: _getExhibitColor(exhibit.category),
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Icon(
          _getExhibitIcon(exhibit.category),
          color: Colors.white,
          size: 24,
        ),
      ),
    );
  }

  Widget _buildMapLegend() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.7),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Legend',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 8),
          _buildLegendItem('Science', Colors.red),
          _buildLegendItem('Technology', Colors.blue),
          _buildLegendItem('History', Colors.green),
          _buildLegendItem('Art', Colors.purple),
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            label,
            style: TextStyle(
              color: Colors.white,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildListView() {
    return Consumer<ExhibitProvider>(
      builder: (context, exhibitProvider, child) {
        if (exhibitProvider.isLoading) {
          return const Center(
            child: CircularProgressIndicator(color: Colors.white),
          );
        }

        final exhibits = _getFilteredExhibits(exhibitProvider.exhibits);
        
        if (exhibits.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.search_off,
                  color: Colors.white.withOpacity(0.7),
                  size: 64,
                ),
                const SizedBox(height: 16),
                Text(
                  'No exhibits found',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.7),
                    fontSize: 18,
                  ),
                ),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(24),
          itemCount: exhibits.length,
          itemBuilder: (context, index) {
            final exhibit = exhibits[index];
            return _buildExhibitListItem(exhibit);
          },
        );
      },
    );
  }

  Widget _buildExhibitListItem(Exhibit exhibit) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.2)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
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
        title: Text(
          exhibit.displayName,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
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
                    style: TextStyle(
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
                    exhibit.locationDisplay,
                    style: TextStyle(
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
        trailing: Consumer<TourProvider>(
          builder: (context, tourProvider, child) {
            final isInTour = tourProvider.isExhibitInTour(exhibit.id);
            return IconButton(
              onPressed: () => _toggleExhibitInTour(exhibit, tourProvider),
              icon: Icon(
                isInTour ? Icons.remove_circle : Icons.add_circle_outline,
                color: isInTour ? Colors.red : Colors.white,
                size: 28,
              ),
            );
          },
        ),
        onTap: () => _navigateToExhibitDetail(exhibit),
      ),
    );
  }

  Widget _buildFilterDropdown({
    required String value,
    required List<String> items,
    required String label,
    required ValueChanged<String?> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.8),
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 4),
        Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white.withOpacity(0.3)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              items: items.map((item) => DropdownMenuItem(
                value: item,
                child: Text(
                  item,
                  style: const TextStyle(color: Colors.white, fontSize: 14),
                ),
              )).toList(),
              onChanged: onChanged,
              dropdownColor: const Color(0xFF1e40af),
              icon: const Icon(Icons.arrow_drop_down, color: Colors.white),
              style: const TextStyle(color: Colors.white),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildViewToggleButton({
    required IconData icon,
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected 
              ? Colors.white 
              : Colors.white.withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: Colors.white.withOpacity(0.3),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isSelected 
                  ? const Color(0xFF1e40af)
                  : Colors.white,
              size: 20,
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                color: isSelected 
                    ? const Color(0xFF1e40af)
                    : Colors.white,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFloatingActionButton() {
    return Consumer<TourProvider>(
      builder: (context, tourProvider, child) {
        if (!tourProvider.hasExhibits) return const SizedBox.shrink();
        
        return FloatingActionButton.extended(
          onPressed: () => _navigateToTour(),
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF1e40af),
          icon: const Icon(Icons.tour),
          label: Text('My Tour (${tourProvider.tourLength})'),
        );
      },
    );
  }

  // Helper methods
  List<Exhibit> _getFilteredExhibits(List<Exhibit> exhibits) {
    return exhibits.where((exhibit) {
      // Category filter
      if (_selectedCategory != 'All' && 
          exhibit.category.toLowerCase() != _selectedCategory.toLowerCase()) {
        return false;
      }
      
      // Location filter
      if (_selectedLocation != 'All' && 
          exhibit.location.toLowerCase() != _selectedLocation.toLowerCase()) {
        return false;
      }
      
      // Search query
      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        return exhibit.name.toLowerCase().contains(query) ||
               exhibit.description.toLowerCase().contains(query) ||
               exhibit.category.toLowerCase().contains(query) ||
               exhibit.location.toLowerCase().contains(query);
      }
      
      return true;
    }).toList();
  }

  Offset _calculateExhibitPosition(int index, int total) {
    // Simple grid positioning - in a real app, you'd use actual coordinates
    final cols = 4;
    final col = index % cols;
    final row = index ~/ cols;
    
    final spacing = 80.0;
    final startX = 40.0;
    final startY = 40.0;
    
    return Offset(
      startX + col * spacing,
      startY + row * spacing,
    );
  }

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

  void _navigateToExhibitDetail(Exhibit exhibit) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => ExhibitDetailScreen(exhibit: exhibit),
      ),
    );
  }

  void _navigateToTour() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const TourScreen(),
      ),
    );
  }

  void _toggleExhibitInTour(Exhibit exhibit, TourProvider tourProvider) {
    if (tourProvider.isExhibitInTour(exhibit.id)) {
      tourProvider.removeFromTour(exhibit.id);
    } else {
      tourProvider.addToTour(exhibit.id);
    }
  }

  void _showUserProfile() {
    // Show user profile dialog or navigate to profile screen
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('User Profile'),
        content: Consumer<UserProvider>(
          builder: (context, userProvider, child) {
            final user = userProvider.userProfile;
            if (user == null) {
              return const Text('No user profile found');
            }
            
            return Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Name: ${user.displayName}'),
                Text('Email: ${user.email}'),
                Text('Role: ${user.role}'),
                Text('Interests: ${user.interests.join(', ')}'),
                Text('Age: ${user.age}'),
                Text('Experience: ${user.experienceLevel}'),
              ],
            );
          },
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
}

// Custom painter for grid pattern
class GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.1)
      ..strokeWidth = 1;

    final spacing = 40.0;
    
    // Vertical lines
    for (double x = 0; x < size.width; x += spacing) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    
    // Horizontal lines
    for (double y = 0; y < size.height; y += spacing) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
} 