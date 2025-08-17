class SyncStatus {
  final String id;
  final String action;
  final String timestamp;
  final String status;
  final String details;
  final String? deviceId;
  final String? deviceName;
  final int? itemsProcessed;
  final int? totalItems;
  final String? errorMessage;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;

  SyncStatus({
    required this.id,
    required this.action,
    required this.timestamp,
    required this.status,
    required this.details,
    this.deviceId,
    this.deviceName,
    this.itemsProcessed,
    this.totalItems,
    this.errorMessage,
    this.metadata,
    required this.createdAt,
  });

  // Create from JSON
  factory SyncStatus.fromJson(Map<String, dynamic> json) {
    return SyncStatus(
      id: json['id'] as String,
      action: json['action'] as String,
      timestamp: json['timestamp'] as String,
      status: json['status'] as String,
      details: json['details'] as String,
      deviceId: json['deviceId'] as String?,
      deviceName: json['deviceName'] as String?,
      itemsProcessed: json['itemsProcessed'] as int?,
      totalItems: json['totalItems'] as int?,
      errorMessage: json['errorMessage'] as String?,
      metadata: json['metadata'] != null 
          ? Map<String, dynamic>.from(json['metadata'] as Map)
          : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  // Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'action': action,
      'timestamp': timestamp,
      'status': status,
      'details': details,
      'deviceId': deviceId,
      'deviceName': deviceName,
      'itemsProcessed': itemsProcessed,
      'totalItems': totalItems,
      'errorMessage': errorMessage,
      'metadata': metadata,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  // Create a copy with updated fields
  SyncStatus copyWith({
    String? id,
    String? action,
    String? timestamp,
    String? status,
    String? details,
    String? deviceId,
    String? deviceName,
    int? itemsProcessed,
    int? totalItems,
    String? errorMessage,
    Map<String, dynamic>? metadata,
    DateTime? createdAt,
  }) {
    return SyncStatus(
      id: id ?? this.id,
      action: action ?? this.action,
      timestamp: timestamp ?? this.timestamp,
      status: status ?? this.status,
      details: details ?? this.details,
      deviceId: deviceId ?? this.deviceId,
      deviceName: deviceName ?? this.deviceName,
      itemsProcessed: itemsProcessed ?? this.itemsProcessed,
      totalItems: totalItems ?? this.totalItems,
      errorMessage: errorMessage ?? this.errorMessage,
      metadata: metadata ?? this.metadata,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  // Get display action name
  String get actionDisplay {
    switch (action.toLowerCase()) {
      case 'sync_started':
        return 'Sync Started';
      case 'sync_completed':
        return 'Sync Completed';
      case 'sync_failed':
        return 'Sync Failed';
      case 'device_connected':
        return 'Device Connected';
      case 'device_disconnected':
        return 'Device Disconnected';
      case 'data_uploaded':
        return 'Data Uploaded';
      case 'data_downloaded':
        return 'Data Downloaded';
      case 'conflict_resolved':
        return 'Conflict Resolved';
      default:
        return action;
    }
  }

  // Get status display
  String get statusDisplay {
    switch (status.toLowerCase()) {
      case 'success':
        return 'Success';
      case 'failed':
        return 'Failed';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  // Get status color indicator
  String get statusIndicator {
    switch (status.toLowerCase()) {
      case 'success':
        return '🟢';
      case 'failed':
        return '🔴';
      case 'in_progress':
        return '🟡';
      case 'pending':
        return '🔵';
      case 'cancelled':
        return '⚫';
      default:
        return '⚪';
    }
  }

  // Check if sync is in progress
  bool get isInProgress => status.toLowerCase() == 'in_progress';

  // Check if sync was successful
  bool get isSuccessful => status.toLowerCase() == 'success';

  // Check if sync failed
  bool get isFailed => status.toLowerCase() == 'failed';

  // Check if sync is pending
  bool get isPending => status.toLowerCase() == 'pending';

  // Get progress percentage
  double get progressPercentage {
    if (totalItems == null || totalItems == 0) return 0.0;
    if (itemsProcessed == null) return 0.0;
    return itemsProcessed! / totalItems!;
  }

  // Get progress text
  String get progressText {
    if (itemsProcessed == null || totalItems == null) {
      return 'Processing...';
    }
    return '${itemsProcessed}/${totalItems} items';
  }

  // Get time ago text
  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(createdAt);
    
    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else {
      return '${difference.inDays}d ago';
    }
  }

  // Get device display name
  String get deviceDisplayName {
    if (deviceName != null && deviceName!.isNotEmpty) {
      return deviceName!;
    }
    if (deviceId != null) {
      return 'Device ${deviceId!.substring(0, 8)}...';
    }
    return 'Unknown Device';
  }

  // Get sync summary
  String get syncSummary {
    if (isSuccessful) {
      if (itemsProcessed != null && totalItems != null) {
        return 'Successfully synced ${itemsProcessed} items';
      }
      return 'Sync completed successfully';
    } else if (isFailed) {
      return 'Sync failed: ${errorMessage ?? 'Unknown error'}';
    } else if (isInProgress) {
      return 'Sync in progress: $progressText';
    } else if (isPending) {
      return 'Sync pending';
    }
    return 'Sync status: $statusDisplay';
  }

  // Check if this is a recent sync
  bool get isRecent {
    final now = DateTime.now();
    final difference = now.difference(createdAt);
    return difference.inMinutes <= 5;
  }

  // Get priority for display (higher number = higher priority)
  int get displayPriority {
    int priority = 0;
    
    // Failed syncs get highest priority
    if (isFailed) priority += 100;
    
    // In-progress syncs get high priority
    if (isInProgress) priority += 50;
    
    // Recent syncs get higher priority
    if (isRecent) priority += 25;
    
    // Pending syncs get medium priority
    if (isPending) priority += 10;
    
    return priority;
  }

  @override
  String toString() {
    return 'SyncStatus(id: $id, action: $action, status: $status, device: $deviceDisplayName)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is SyncStatus && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
} 