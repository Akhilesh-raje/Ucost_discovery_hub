class Device {
  final String id;
  final String name;
  final String ipAddress;
  final String type;
  final bool isOnline;
  final DateTime lastSeen;
  final Map<String, dynamic> capabilities;
  final String? version;
  final String? platform;
  final Map<String, dynamic>? metadata;

  Device({
    required this.id,
    required this.name,
    required this.ipAddress,
    required this.type,
    required this.isOnline,
    required this.lastSeen,
    this.capabilities = const {},
    this.version,
    this.platform,
    this.metadata,
  });

  // Create from JSON
  factory Device.fromJson(Map<String, dynamic> json) {
    return Device(
      id: json['id'] as String,
      name: json['name'] as String,
      ipAddress: json['ipAddress'] as String,
      type: json['type'] as String,
      isOnline: json['isOnline'] as bool? ?? false,
      lastSeen: DateTime.parse(json['lastSeen'] as String),
      capabilities: Map<String, dynamic>.from(json['capabilities'] ?? {}),
      version: json['version'] as String?,
      platform: json['platform'] as String?,
      metadata: json['metadata'] != null 
          ? Map<String, dynamic>.from(json['metadata'] as Map)
          : null,
    );
  }

  // Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'ipAddress': ipAddress,
      'type': type,
      'isOnline': isOnline,
      'lastSeen': lastSeen.toIso8601String(),
      'capabilities': capabilities,
      'version': version,
      'platform': platform,
      'metadata': metadata,
    };
  }

  // Create a copy with updated fields
  Device copyWith({
    String? id,
    String? name,
    String? ipAddress,
    String? type,
    bool? isOnline,
    DateTime? lastSeen,
    Map<String, dynamic>? capabilities,
    String? version,
    String? platform,
    Map<String, dynamic>? metadata,
  }) {
    return Device(
      id: id ?? this.id,
      name: name ?? this.name,
      ipAddress: ipAddress ?? this.ipAddress,
      type: type ?? this.type,
      isOnline: isOnline ?? this.isOnline,
      lastSeen: lastSeen ?? this.lastSeen,
      capabilities: capabilities ?? this.capabilities,
      version: version ?? this.version,
      platform: platform ?? this.platform,
      metadata: metadata ?? this.metadata,
    );
  }

  // Get display name
  String get displayName => name.isNotEmpty ? name : 'Unknown Device';

  // Get device type display
  String get typeDisplay {
    switch (type.toLowerCase()) {
      case 'pc':
        return 'PC';
      case 'mobile':
        return 'Mobile';
      case 'tablet':
        return 'Tablet';
      case 'server':
        return 'Server';
      case 'kiosk':
        return 'Kiosk';
      default:
        return type;
    }
  }

  // Get platform display
  String get platformDisplay {
    switch (platform?.toLowerCase()) {
      case 'android':
        return 'Android';
      case 'ios':
        return 'iOS';
      case 'windows':
        return 'Windows';
      case 'macos':
        return 'macOS';
      case 'linux':
        return 'Linux';
      default:
        return platform ?? 'Unknown';
    }
  }

  // Check if device supports specific capability
  bool supportsCapability(String capability) {
    return capabilities[capability] == true;
  }

  // Get supported capabilities list
  List<String> get supportedCapabilities {
    return capabilities.entries
        .where((entry) => entry.value == true)
        .map((entry) => entry.key)
        .toList();
  }

  // Check if device is recent (seen in last 5 minutes)
  bool get isRecent {
    final now = DateTime.now();
    final difference = now.difference(lastSeen);
    return difference.inMinutes <= 5;
  }

  // Get connection status text
  String get statusText {
    if (!isOnline) return 'Offline';
    if (isRecent) return 'Online';
    return 'Recently Online';
  }

  // Get status color indicator
  String get statusIndicator {
    if (!isOnline) return '🔴';
    if (isRecent) return '🟢';
    return '🟡';
  }

  // Get device info summary
  String get deviceInfo {
    final parts = <String>[];
    if (platform != null) parts.add(platformDisplay);
    if (version != null) parts.add('v$version');
    if (type.isNotEmpty) parts.add(typeDisplay);
    return parts.join(' • ');
  }

  // Check if device is compatible
  bool get isCompatible {
    // Check for basic sync capabilities
    return supportsCapability('sync') && supportsCapability('data');
  }

  // Get sync priority (higher number = higher priority)
  int get syncPriority {
    int priority = 0;
    
    // Online devices get higher priority
    if (isOnline) priority += 10;
    
    // Recent devices get higher priority
    if (isRecent) priority += 5;
    
    // PCs typically have more data
    if (type.toLowerCase() == 'pc') priority += 3;
    
    // Servers get highest priority
    if (type.toLowerCase() == 'server') priority += 5;
    
    return priority;
  }

  @override
  String toString() {
    return 'Device(id: $id, name: $name, type: $type, ip: $ipAddress, online: $isOnline)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Device && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
} 