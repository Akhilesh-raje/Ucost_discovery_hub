import 'package:flutter/material.dart';
import '../utils/constants.dart';

class UserManagementScreen extends StatefulWidget {
  const UserManagementScreen({super.key});

  @override
  State<UserManagementScreen> createState() => _UserManagementScreenState();
}

class _UserManagementScreenState extends State<UserManagementScreen> {
  final List<Map<String, dynamic>> _users = [
    {
      'id': '1',
      'name': 'Admin User',
      'email': 'admin@ucost.gov.in',
      'role': 'Administrator',
      'status': 'Active',
      'lastLogin': '2 hours ago',
      'permissions': ['all'],
      'createdAt': '2024-01-15',
    },
    {
      'id': '2',
      'name': 'Dr. Smith',
      'email': 'smith@ucost.gov.in',
      'role': 'Curator',
      'status': 'Active',
      'lastLogin': '1 day ago',
      'permissions': ['exhibits', 'analytics', 'sync'],
      'createdAt': '2024-02-20',
    },
    {
      'id': '3',
      'name': 'Guide Johnson',
      'email': 'johnson@ucost.gov.in',
      'role': 'Guide',
      'status': 'Active',
      'lastLogin': '3 days ago',
      'permissions': ['exhibits', 'view'],
      'createdAt': '2024-03-10',
    },
    {
      'id': '4',
      'name': 'Volunteer Brown',
      'email': 'brown@ucost.gov.in',
      'role': 'Volunteer',
      'status': 'Inactive',
      'lastLogin': '1 week ago',
      'permissions': ['exhibits', 'view'],
      'createdAt': '2024-04-05',
    },
  ];

  String _selectedRole = 'All';
  String _selectedStatus = 'All';
  final TextEditingController _searchController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('User Management'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Theme.of(context).colorScheme.onPrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add),
            onPressed: () => _showAddUserDialog(),
            tooltip: 'Add User',
          ),
        ],
      ),
      body: Column(
        children: [
          _buildFilters(),
                  Expanded(
          child: Builder(
            builder: (context) {
              final filteredUsers = _getFilteredUsers();
              return _buildUserList(filteredUsers);
            },
          ),
        ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddUserDialog(),
        icon: const Icon(Icons.person_add),
        label: const Text('Add User'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Theme.of(context).colorScheme.onPrimary,
      ),
    );
  }

  Widget _buildFilters() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Search users...',
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
                  value: _selectedRole,
                  decoration: InputDecoration(
                    labelText: 'Role',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  items: ['All', 'Administrator', 'Curator', 'Guide', 'Volunteer']
                      .map((role) => DropdownMenuItem(
                            value: role,
                            child: Text(role),
                          ))
                      .toList(),
                  onChanged: (value) => setState(() => _selectedRole = value!),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedStatus,
                  decoration: InputDecoration(
                    labelText: 'Status',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  items: ['All', 'Active', 'Inactive', 'Suspended']
                      .map((status) => DropdownMenuItem(
                            value: status,
                            child: Text(status),
                          ))
                      .toList(),
                  onChanged: (value) => setState(() => _selectedStatus = value!),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Builder(
                  builder: (context) {
                    final filteredUsers = _getFilteredUsers();
                    return Text(
                      '${filteredUsers.length} users found',
                      style: Theme.of(context).textTheme.bodyMedium,
                      textAlign: TextAlign.center,
                    );
                  },
                ),
              ),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    final filteredUsers = _getFilteredUsers();
                    _exportUsers(filteredUsers);
                  },
                  icon: const Icon(Icons.download),
                  label: const Text('Export'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildUserList(List<Map<String, dynamic>> users) {
    if (users.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.people_outline,
              size: 64,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 16),
            Text(
              'No users found',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Try adjusting your filters or add a new user',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: users.length,
      itemBuilder: (context, index) {
        final user = users[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: _getUserRoleColor(user['role']),
              child: Text(
                user['name'][0],
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            title: Text(
              user['name'],
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(user['email']),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: _getUserRoleColor(user['role']).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        user['role'],
                        style: TextStyle(
                          color: _getUserRoleColor(user['role']),
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: _getStatusColor(user['status']).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        user['status'],
                        style: TextStyle(
                          color: _getStatusColor(user['status']),
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Last login: ${user['lastLogin']}',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
            trailing: PopupMenuButton<String>(
              onSelected: (value) => _handleUserAction(value, user),
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
                const PopupMenuItem(
                  value: 'edit',
                  child: Row(
                    children: [
                      Icon(Icons.edit),
                      SizedBox(width: 8),
                      Text('Edit User'),
                    ],
                  ),
                ),
                if (user['status'] == 'Active')
                  const PopupMenuItem(
                    value: 'suspend',
                    child: Row(
                      children: [
                        Icon(Icons.block),
                        SizedBox(width: 8),
                        Text('Suspend'),
                      ],
                    ),
                  )
                else
                  const PopupMenuItem(
                    value: 'activate',
                    child: Row(
                      children: [
                        Icon(Icons.check_circle),
                        SizedBox(width: 8),
                        Text('Activate'),
                      ],
                    ),
                  ),
                const PopupMenuItem(
                  value: 'permissions',
                  child: Row(
                    children: [
                      Icon(Icons.security),
                      SizedBox(width: 8),
                      Text('Permissions'),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'delete',
                  child: Row(
                    children: [
                      Icon(Icons.delete, color: Colors.red),
                      SizedBox(width: 8),
                      Text('Delete', style: TextStyle(color: Colors.red)),
                    ],
                  ),
                ),
              ],
            ),
            onTap: () => _showUserDetails(user),
          ),
        );
      },
    );
  }

  List<Map<String, dynamic>> _getFilteredUsers() {
    return _users.where((user) {
      // Search filter
      if (_searchController.text.isNotEmpty) {
        final searchLower = _searchController.text.toLowerCase();
        if (!user['name'].toLowerCase().contains(searchLower) &&
            !user['email'].toLowerCase().contains(searchLower) &&
            !user['role'].toLowerCase().contains(searchLower)) {
          return false;
        }
      }

      // Role filter
      if (_selectedRole != 'All' && user['role'] != _selectedRole) {
        return false;
      }

      // Status filter
      if (_selectedStatus != 'All' && user['status'] != _selectedStatus) {
        return false;
      }

      return true;
    }).toList();
  }

  Color _getUserRoleColor(String role) {
    switch (role) {
      case 'Administrator':
        return Colors.red;
      case 'Curator':
        return Colors.orange;
      case 'Guide':
        return Colors.blue;
      case 'Volunteer':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Active':
        return Colors.green;
      case 'Inactive':
        return Colors.grey;
      case 'Suspended':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  void _showAddUserDialog() {
    showDialog(
      context: context,
      builder: (context) => const AddUserDialog(),
    );
  }

  void _showUserDetails(Map<String, dynamic> user) {
    showDialog(
      context: context,
      builder: (context) => UserDetailsDialog(user: user),
    );
  }

  void _handleUserAction(String action, Map<String, dynamic> user) {
    switch (action) {
      case 'view':
        _showUserDetails(user);
        break;
      case 'edit':
        _showEditUserDialog(user);
        break;
      case 'suspend':
        _suspendUser(user);
        break;
      case 'activate':
        _activateUser(user);
        break;
      case 'permissions':
        _showPermissionsDialog(user);
        break;
      case 'delete':
        _showDeleteConfirmation(user);
        break;
    }
  }

  void _showEditUserDialog(Map<String, dynamic> user) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Edit user: ${user['name']}')),
    );
  }

  void _suspendUser(Map<String, dynamic> user) {
    setState(() {
      user['status'] = 'Suspended';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('User ${user['name']} suspended')),
    );
  }

  void _activateUser(Map<String, dynamic> user) {
    setState(() {
      user['status'] = 'Active';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('User ${user['name']} activated')),
    );
  }

  void _showPermissionsDialog(Map<String, dynamic> user) {
    showDialog(
      context: context,
      builder: (context) => PermissionsDialog(user: user),
    );
  }

  void _showDeleteConfirmation(Map<String, dynamic> user) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete User'),
        content: Text('Are you sure you want to delete "${user['name']}"? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              _deleteUser(user);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _deleteUser(Map<String, dynamic> user) {
    setState(() {
      _users.removeWhere((u) => u['id'] == user['id']);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('User ${user['name']} deleted')),
    );
  }

  void _exportUsers(List<Map<String, dynamic>> users) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Exporting ${users.length} users...')),
    );
  }
}

class AddUserDialog extends StatefulWidget {
  const AddUserDialog({super.key});

  @override
  State<AddUserDialog> createState() => _AddUserDialogState();
}

class _AddUserDialogState extends State<AddUserDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  String _selectedRole = 'Guide';
  String _selectedStatus = 'Active';
  List<String> _selectedPermissions = ['exhibits', 'view'];

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add New User'),
      content: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Full Name *',
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
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: 'Email *',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Email is required';
                  }
                  if (!value.contains('@')) {
                    return 'Please enter a valid email';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedRole,
                decoration: const InputDecoration(
                  labelText: 'Role *',
                  border: OutlineInputBorder(),
                ),
                items: ['Administrator', 'Curator', 'Guide', 'Volunteer']
                    .map((role) => DropdownMenuItem(
                          value: role,
                          child: Text(role),
                        ))
                    .toList(),
                onChanged: (value) => setState(() => _selectedRole = value!),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedStatus,
                decoration: const InputDecoration(
                  labelText: 'Status *',
                  border: OutlineInputBorder(),
                ),
                items: ['Active', 'Inactive']
                    .map((status) => DropdownMenuItem(
                          value: status,
                          child: Text(status),
                        ))
                    .toList(),
                onChanged: (value) => setState(() => _selectedStatus = value!),
              ),
              const SizedBox(height: 16),
              _buildPermissionsSection(),
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
          onPressed: _saveUser,
          child: const Text('Add User'),
        ),
      ],
    );
  }

  Widget _buildPermissionsSection() {
    final allPermissions = [
      'exhibits',
      'analytics',
      'sync',
      'users',
      'settings',
      'view',
      'edit',
      'delete',
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Permissions',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          children: allPermissions.map((permission) {
            final isSelected = _selectedPermissions.contains(permission);
            return FilterChip(
              label: Text(permission),
              selected: isSelected,
              onSelected: (selected) {
                setState(() {
                  if (selected) {
                    _selectedPermissions.add(permission);
                  } else {
                    _selectedPermissions.remove(permission);
                  }
                });
              },
            );
          }).toList(),
        ),
      ],
    );
  }

  void _saveUser() {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    // Here you would typically save the user to your database
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('User ${_nameController.text} added successfully')),
    );
    Navigator.of(context).pop();
  }
}

class UserDetailsDialog extends StatelessWidget {
  final Map<String, dynamic> user;

  const UserDetailsDialog({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(user['name']),
      content: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildDetailRow('Email', user['email']),
            _buildDetailRow('Role', user['role']),
            _buildDetailRow('Status', user['status']),
            _buildDetailRow('Last Login', user['lastLogin']),
            _buildDetailRow('Created', user['createdAt']),
            const SizedBox(height: 16),
            Text(
              'Permissions:',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: (user['permissions'] as List<String>).map((permission) {
                return Chip(
                  label: Text(permission),
                  backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                );
              }).toList(),
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

class PermissionsDialog extends StatefulWidget {
  final Map<String, dynamic> user;

  const PermissionsDialog({super.key, required this.user});

  @override
  State<PermissionsDialog> createState() => _PermissionsDialogState();
}

class _PermissionsDialogState extends State<PermissionsDialog> {
  late List<String> _selectedPermissions;

  @override
  void initState() {
    super.initState();
    _selectedPermissions = List.from(widget.user['permissions']);
  }

  @override
  Widget build(BuildContext context) {
    final allPermissions = [
      'exhibits',
      'analytics',
      'sync',
      'users',
      'settings',
      'view',
      'edit',
      'delete',
    ];

    return AlertDialog(
      title: Text('Permissions for ${widget.user['name']}'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Select permissions for this user:',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              children: allPermissions.map((permission) {
                final isSelected = _selectedPermissions.contains(permission);
                return FilterChip(
                  label: Text(permission),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      if (selected) {
                        _selectedPermissions.add(permission);
                      } else {
                        _selectedPermissions.remove(permission);
                      }
                    });
                  },
                );
              }).toList(),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _savePermissions,
          child: const Text('Save'),
        ),
      ],
    );
  }

  void _savePermissions() {
    // Here you would typically save the permissions to your database
    widget.user['permissions'] = List.from(_selectedPermissions);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Permissions updated successfully')),
    );
    Navigator.of(context).pop();
  }
} 