class Device {
  final String id;
  final String name;
  final String ipAddress;
  final String platform;
  final DateTime lastSeen;
  final bool isConnected;

  Device({
    required this.id,
    required this.name,
    required this.ipAddress,
    required this.platform,
    required this.lastSeen,
    required this.isConnected,
  });

  factory Device.fromJson(Map<String, dynamic> json) {
    return Device(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      ipAddress: json['ipAddress'] ?? '',
      platform: json['platform'] ?? 'Unknown',
      lastSeen: DateTime.parse(json['lastSeen'] ?? DateTime.now().toIso8601String()),
      isConnected: json['isConnected'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'ipAddress': ipAddress,
      'platform': platform,
      'lastSeen': lastSeen.toIso8601String(),
      'isConnected': isConnected,
    };
  }

  Device copyWith({
    String? id,
    String? name,
    String? ipAddress,
    String? platform,
    DateTime? lastSeen,
    bool? isConnected,
  }) {
    return Device(
      id: id ?? this.id,
      name: name ?? this.name,
      ipAddress: ipAddress ?? this.ipAddress,
      platform: platform ?? this.platform,
      lastSeen: lastSeen ?? this.lastSeen,
      isConnected: isConnected ?? this.isConnected,
    );
  }

  @override
  String toString() {
    return 'Device(id: $id, name: $name, ipAddress: $ipAddress, platform: $platform, isConnected: $isConnected)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Device && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;

  // Helper methods
  String get displayName => name;
  
  String get connectionStatus {
    if (!isConnected) return 'Disconnected';
    return 'Connected';
  }
} 