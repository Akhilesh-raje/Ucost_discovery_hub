class SyncStatus {
  final String deviceId;
  final DateTime lastSync;
  final bool isOnline;
  final int pendingUploads;
  final int pendingDownloads;

  SyncStatus({
    required this.deviceId,
    required this.lastSync,
    required this.isOnline,
    required this.pendingUploads,
    required this.pendingDownloads,
  });

  factory SyncStatus.fromJson(Map<String, dynamic> json) {
    return SyncStatus(
      deviceId: json['deviceId'] ?? '',
      lastSync: DateTime.parse(json['lastSync'] ?? DateTime.now().toIso8601String()),
      isOnline: json['isOnline'] ?? false,
      pendingUploads: json['pendingUploads'] ?? 0,
      pendingDownloads: json['pendingDownloads'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'deviceId': deviceId,
      'lastSync': lastSync.toIso8601String(),
      'isOnline': isOnline,
      'pendingUploads': pendingUploads,
      'pendingDownloads': pendingDownloads,
    };
  }

  SyncStatus copyWith({
    String? deviceId,
    DateTime? lastSync,
    bool? isOnline,
    int? pendingUploads,
    int? pendingDownloads,
  }) {
    return SyncStatus(
      deviceId: deviceId ?? this.deviceId,
      lastSync: lastSync ?? this.lastSync,
      isOnline: isOnline ?? this.isOnline,
      pendingUploads: pendingUploads ?? this.pendingUploads,
      pendingDownloads: pendingDownloads ?? this.pendingDownloads,
    );
  }

  @override
  String toString() {
    return 'SyncStatus(deviceId: $deviceId, lastSync: $lastSync, isOnline: $isOnline, pendingUploads: $pendingUploads, pendingDownloads: $pendingDownloads)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is SyncStatus && other.deviceId == deviceId;
  }

  @override
  int get hashCode => deviceId.hashCode;
} 