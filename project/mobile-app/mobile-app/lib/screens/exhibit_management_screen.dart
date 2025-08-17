import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../providers/exhibit_provider.dart';
import '../models/exhibit.dart';
import '../utils/constants.dart';
import '../utils/theme.dart';

class ExhibitManagementScreen extends StatefulWidget {
  const ExhibitManagementScreen({super.key});

  @override
  State<ExhibitManagementScreen> createState() => _ExhibitManagementScreenState();
}

class _ExhibitManagementScreenState extends State<ExhibitManagementScreen> {
  final _searchController = TextEditingController();
  String _selectedCategory = 'All';
  String _selectedLocation = 'All';
  bool _showDeleted = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ExhibitProvider>().refreshExhibits();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Exhibit Management'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Theme.of(context).colorScheme.onPrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showAddExhibitDialog(context),
            tooltip: 'Add Exhibit',
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearchAndFilters(),
          Expanded(
            child: Consumer<ExhibitProvider>(
              builder: (context, provider, child) {
                if (provider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (provider.hasError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.error, size: 64, color: Colors.red[300]),
                        const SizedBox(height: 16),
                        Text('Error: ${provider.error}'),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () => provider.refreshExhibits(),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  );
                }

                final filteredExhibits = _getFilteredExhibits(provider.exhibits);
                
                if (filteredExhibits.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.museum, size: 64, color: Colors.grey[400]),
                        const SizedBox(height: 16),
                        Text(
                          _searchController.text.isNotEmpty || _selectedCategory != 'All' || _selectedLocation != 'All'
                              ? 'No exhibits match your filters'
                              : 'No exhibits found',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        if (_searchController.text.isEmpty && _selectedCategory == 'All' && _selectedLocation == 'All')
                          ElevatedButton(
                            onPressed: () => _showAddExhibitDialog(context),
                            child: const Text('Add First Exhibit'),
                          ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: filteredExhibits.length,
                  itemBuilder: (context, index) {
                    final exhibit = filteredExhibits[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundImage: exhibit.hasImages
                              ? FileImage(File(exhibit.firstImage))
                              : null,
                          child: !exhibit.hasImages
                              ? const Icon(Icons.museum)
                              : null,
                        ),
                        title: Text(
                          exhibit.displayName,
                          style: TextStyle(
                            decoration: exhibit.isDeleted ? TextDecoration.lineThrough : null,
                          ),
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(exhibit.shortDescription),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Chip(
                                  label: Text(exhibit.category),
                                  backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                                ),
                                const SizedBox(width: 8),
                                Chip(
                                  label: Text(exhibit.location),
                                  backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
                                ),
                              ],
                            ),
                          ],
                        ),
                        trailing: PopupMenuButton<String>(
                          onSelected: (value) => _handleExhibitAction(value, exhibit),
                          itemBuilder: (context) => [
                            const PopupMenuItem(
                              value: 'edit',
                              child: Row(
                                children: [
                                  Icon(Icons.edit),
                                  SizedBox(width: 8),
                                  Text('Edit'),
                                ],
                              ),
                            ),
                            if (exhibit.isDeleted)
                              const PopupMenuItem(
                                value: 'restore',
                                child: Row(
                                  children: [
                                    Icon(Icons.restore),
                                    SizedBox(width: 8),
                                    Text('Restore'),
                                  ],
                                ),
                              )
                            else
                              const PopupMenuItem(
                                value: 'delete',
                                child: Row(
                                  children: [
                                    Icon(Icons.delete),
                                    SizedBox(width: 8),
                                    Text('Delete'),
                                  ],
                                ),
                              ),
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
                          ],
                        ),
                        onTap: () => _showExhibitDetails(context, exhibit),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndFilters() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Search exhibits...',
              prefixIcon: const Icon(Icons.search),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              filled: true,
              fillColor: Theme.of(context).colorScheme.surface,
            ),
            onChanged: (value) => setState(() {}),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedCategory,
                  decoration: InputDecoration(
                    labelText: 'Category',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  items: ['All', 'Science', 'Technology', 'History', 'Art', 'Nature', 'Space', 'Other']
                      .map((category) => DropdownMenuItem(
                            value: category,
                            child: Text(category),
                          ))
                      .toList(),
                  onChanged: (value) => setState(() => _selectedCategory = value!),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedLocation,
                  decoration: InputDecoration(
                    labelText: 'Location',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  items: ['All', 'Ground Floor', 'First Floor', 'Second Floor', 'Outdoor', 'Special Exhibit']
                      .map((location) => DropdownMenuItem(
                            value: location,
                            child: Text(location),
                          ))
                      .toList(),
                  onChanged: (value) => setState(() => _selectedLocation = value!),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: FilterChip(
                  label: const Text('Show Deleted'),
                  selected: _showDeleted,
                  onSelected: (value) => setState(() => _showDeleted = value),
                  selectedColor: Theme.of(context).colorScheme.primaryContainer,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Consumer<ExhibitProvider>(
                  builder: (context, provider, child) {
                    return Text(
                      '${_getFilteredExhibits(provider.exhibits).length} exhibits',
                      style: Theme.of(context).textTheme.bodyMedium,
                      textAlign: TextAlign.center,
                    );
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  List<Exhibit> _getFilteredExhibits(List<Exhibit> exhibits) {
    return exhibits.where((exhibit) {
      // Search filter
      if (_searchController.text.isNotEmpty) {
        final searchLower = _searchController.text.toLowerCase();
        if (!exhibit.name.toLowerCase().contains(searchLower) &&
            !exhibit.description.toLowerCase().contains(searchLower) &&
            !exhibit.category.toLowerCase().contains(searchLower) &&
            !exhibit.location.toLowerCase().contains(searchLower)) {
          return false;
        }
      }

      // Category filter
      if (_selectedCategory != 'All' && exhibit.category != _selectedCategory) {
        return false;
      }

      // Location filter
      if (_selectedLocation != 'All' && exhibit.location != _selectedLocation) {
        return false;
      }

      // Deleted filter
      if (!_showDeleted && exhibit.isDeleted) {
        return false;
      }

      return true;
    }).toList();
  }

  void _handleExhibitAction(String action, Exhibit exhibit) {
    switch (action) {
      case 'edit':
        _showEditExhibitDialog(context, exhibit);
        break;
      case 'delete':
        _showDeleteConfirmation(context, exhibit);
        break;
      case 'restore':
        _restoreExhibit(exhibit);
        break;
      case 'view':
        _showExhibitDetails(context, exhibit);
        break;
    }
  }

  void _showAddExhibitDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => const ExhibitFormDialog(),
    );
  }

  void _showEditExhibitDialog(BuildContext context, Exhibit exhibit) {
    showDialog(
      context: context,
      builder: (context) => ExhibitFormDialog(exhibit: exhibit),
    );
  }

  void _showDeleteConfirmation(BuildContext context, Exhibit exhibit) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Exhibit'),
        content: Text('Are you sure you want to delete "${exhibit.name}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              _deleteExhibit(exhibit);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _deleteExhibit(Exhibit exhibit) {
    context.read<ExhibitProvider>().deleteExhibit(exhibit.id);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Exhibit "${exhibit.name}" deleted'),
        backgroundColor: Colors.red,
      ),
    );
  }

  void _restoreExhibit(Exhibit exhibit) {
    context.read<ExhibitProvider>().restoreExhibit(exhibit.id);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Exhibit "${exhibit.name}" restored'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _showExhibitDetails(BuildContext context, Exhibit exhibit) {
    showDialog(
      context: context,
      builder: (context) => ExhibitDetailsDialog(exhibit: exhibit),
    );
  }
}

class ExhibitFormDialog extends StatefulWidget {
  final Exhibit? exhibit;

  const ExhibitFormDialog({super.key, this.exhibit});

  @override
  State<ExhibitFormDialog> createState() => _ExhibitFormDialogState();
}

class _ExhibitFormDialogState extends State<ExhibitFormDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _categoryController = TextEditingController();
  final _locationController = TextEditingController();
  List<String> _images = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.exhibit != null) {
      _nameController.text = widget.exhibit!.name;
      _descriptionController.text = widget.exhibit!.description;
      _categoryController.text = widget.exhibit!.category;
      _locationController.text = widget.exhibit!.location;
      _images = List.from(widget.exhibit!.images);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.exhibit == null ? 'Add Exhibit' : 'Edit Exhibit'),
      content: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Name *',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Name is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Description *',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Description is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _categoryController,
                decoration: const InputDecoration(
                  labelText: 'Category *',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Category is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _locationController,
                decoration: const InputDecoration(
                  labelText: 'Location *',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Location is required';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              _buildImageSection(),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _isLoading ? null : _saveExhibit,
          child: _isLoading
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : Text(widget.exhibit == null ? 'Add' : 'Save'),
        ),
      ],
    );
  }

  Widget _buildImageSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Images (${_images.length})',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            ElevatedButton.icon(
              onPressed: _pickImage,
              icon: const Icon(Icons.add_a_photo),
              label: const Text('Add'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        if (_images.isNotEmpty)
          SizedBox(
            height: 100,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: _images.length,
              itemBuilder: (context, index) {
                return Container(
                  margin: const EdgeInsets.only(right: 8),
                  child: Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.file(
                          File(_images[index]),
                          width: 100,
                          height: 100,
                          fit: BoxFit.cover,
                        ),
                      ),
                      Positioned(
                        top: 4,
                        right: 4,
                        child: GestureDetector(
                          onTap: () => _removeImage(index),
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: Colors.red,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.close,
                              color: Colors.white,
                              size: 16,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
      ],
    );
  }

  Future<void> _pickImage() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );

      if (image != null) {
        setState(() {
          _images.add(image.path);
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to pick image: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _removeImage(int index) {
    setState(() {
      _images.removeAt(index);
    });
  }

  Future<void> _saveExhibit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_images.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('At least one image is required'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final exhibit = Exhibit(
        id: widget.exhibit?.id,
        name: _nameController.text.trim(),
        description: _descriptionController.text.trim(),
        category: _categoryController.text.trim(),
        location: _locationController.text.trim(),
        images: _images,
        createdAt: widget.exhibit?.createdAt,
        updatedAt: DateTime.now(),
      );

      if (widget.exhibit == null) {
        await context.read<ExhibitProvider>().addExhibit(exhibit);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Exhibit "${exhibit.name}" added successfully'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        await context.read<ExhibitProvider>().updateExhibit(exhibit);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Exhibit "${exhibit.name}" updated successfully'),
            backgroundColor: Colors.green,
          ),
        );
      }

      Navigator.of(context).pop();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to save exhibit: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }
}

class ExhibitDetailsDialog extends StatelessWidget {
  final Exhibit exhibit;

  const ExhibitDetailsDialog({super.key, required this.exhibit});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(exhibit.name),
      content: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            if (exhibit.hasImages)
              Container(
                height: 200,
                width: double.infinity,
                child: PageView.builder(
                  itemCount: exhibit.images.length,
                  itemBuilder: (context, index) {
                    return ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.file(
                        File(exhibit.images[index]),
                        fit: BoxFit.cover,
                      ),
                    );
                  },
                ),
              ),
            const SizedBox(height: 16),
            _buildDetailRow('Description', exhibit.description),
            _buildDetailRow('Category', exhibit.category),
            _buildDetailRow('Location', exhibit.location),
            _buildDetailRow('Created', exhibit.formattedCreatedAt),
            _buildDetailRow('Updated', exhibit.formattedUpdatedAt),
            if (exhibit.isDeleted)
              Container(
                margin: const EdgeInsets.only(top: 8),
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.red[100],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(Icons.warning, color: Colors.red[700]),
                    const SizedBox(width: 8),
                    Text(
                      'This exhibit has been deleted',
                      style: TextStyle(color: Colors.red[700]),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Close'),
        ),
      ],
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
} 