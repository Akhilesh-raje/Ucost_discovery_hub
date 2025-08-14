import 'package:uuid/uuid.dart';

class Exhibit {
  final String id;
  final String name;
  final String description;
  final String category;
  final String location;
  final List<String> images;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isDeleted;
  final Map<String, dynamic> metadata;

  Exhibit({
    String? id,
    required this.name,
    required this.description,
    required this.category,
    required this.location,
    List<String>? images,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.isDeleted = false,
    Map<String, dynamic>? metadata,
  }) : 
    id = id ?? const Uuid().v4(),
    images = images ?? [],
    createdAt = createdAt ?? DateTime.now(),
    updatedAt = updatedAt ?? DateTime.now(),
    metadata = metadata ?? {};

  Exhibit copyWith({
    String? id,
    String? name,
    String? description,
    String? category,
    String? location,
    List<String>? images,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? isDeleted,
    Map<String, dynamic>? metadata,
  }) {
    return Exhibit(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      category: category ?? this.category,
      location: location ?? this.location,
      images: images ?? this.images,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      isDeleted: isDeleted ?? this.isDeleted,
      metadata: metadata ?? this.metadata,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'category': category,
      'location': location,
      'images': images,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'isDeleted': isDeleted,
      'metadata': metadata,
    };
  }

  factory Exhibit.fromJson(Map<String, dynamic> json) {
    return Exhibit(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      category: json['category'] as String,
      location: json['location'] as String,
      images: List<String>.from(json['images'] ?? []),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      isDeleted: json['isDeleted'] as bool? ?? false,
      metadata: Map<String, dynamic>.from(json['metadata'] ?? {}),
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Exhibit && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'Exhibit(id: $id, name: $name, category: $category, location: $location)';
  }

  // Helper methods
  bool get hasImages => images.isNotEmpty;
  
  String get firstImage => images.isNotEmpty ? images.first : '';
  
  String get displayName => isDeleted ? '$name (Deleted)' : name;
  
  String get shortDescription {
    if (description.length <= 100) return description;
    return '${description.substring(0, 100)}...';
  }
  
  String get formattedCreatedAt {
    return '${createdAt.day}/${createdAt.month}/${createdAt.year}';
  }
  
  String get formattedUpdatedAt {
    return '${updatedAt.day}/${updatedAt.month}/${updatedAt.year}';
  }
  
  bool get isRecentlyCreated {
    final now = DateTime.now();
    final difference = now.difference(createdAt);
    return difference.inDays <= 7;
  }
  
  bool get isRecentlyUpdated {
    final now = DateTime.now();
    final difference = now.difference(updatedAt);
    return difference.inDays <= 7;
  }
} 