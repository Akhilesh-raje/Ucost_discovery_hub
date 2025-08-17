import 'package:uuid/uuid.dart';

class Exhibit {
  final String id;
  final String name;
  final String description;
  final String category;
  final String location;
  final String imagePath;
  final List<String> images;
  final Map<String, dynamic> metadata;
  final List<String> tags;
  final double rating;
  final int viewCount;
  final bool isInteractive;
  final bool isPopular;
  final bool isNew;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isDeleted;
  final String? audioGuide;
  final String? videoUrl;
  final Map<String, dynamic>? coordinates;
  final String? difficulty;
  final int? estimatedDuration;
  final List<String>? relatedExhibits;

  Exhibit({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    required this.location,
    required this.imagePath,
    this.images = const [],
    this.metadata = const {},
    this.tags = const [],
    this.rating = 0.0,
    this.viewCount = 0,
    this.isInteractive = false,
    this.isPopular = false,
    this.isNew = false,
    required this.createdAt,
    required this.updatedAt,
    this.isDeleted = false,
    this.audioGuide,
    this.videoUrl,
    this.coordinates,
    this.difficulty,
    this.estimatedDuration,
    this.relatedExhibits,
  });

  // Create from JSON
  factory Exhibit.fromJson(Map<String, dynamic> json) {
    return Exhibit(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      category: json['category'] as String,
      location: json['location'] as String,
      imagePath: json['imagePath'] as String? ?? '',
      images: List<String>.from(json['images'] ?? []),
      metadata: Map<String, dynamic>.from(json['metadata'] ?? {}),
      tags: List<String>.from(json['tags'] ?? []),
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      viewCount: json['viewCount'] as int? ?? 0,
      isInteractive: json['isInteractive'] as bool? ?? false,
      isPopular: json['isPopular'] as bool? ?? false,
      isNew: json['isNew'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      isDeleted: json['isDeleted'] as bool? ?? false,
      audioGuide: json['audioGuide'] as String?,
      videoUrl: json['videoUrl'] as String?,
      coordinates: json['coordinates'] != null 
          ? Map<String, dynamic>.from(json['coordinates'] as Map)
          : null,
      difficulty: json['difficulty'] as String?,
      estimatedDuration: json['estimatedDuration'] as int?,
      relatedExhibits: json['relatedExhibits'] != null 
          ? List<String>.from(json['relatedExhibits'] as List)
          : null,
    );
  }

  // Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'category': category,
      'location': location,
      'imagePath': imagePath,
      'images': images,
      'metadata': metadata,
      'tags': tags,
      'rating': rating,
      'viewCount': viewCount,
      'isInteractive': isInteractive,
      'isPopular': isPopular,
      'isNew': isNew,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'isDeleted': isDeleted,
      'audioGuide': audioGuide,
      'videoUrl': videoUrl,
      'coordinates': coordinates,
      'difficulty': difficulty,
      'estimatedDuration': estimatedDuration,
      'relatedExhibits': relatedExhibits,
    };
  }

  // Create a copy with updated fields
  Exhibit copyWith({
    String? id,
    String? name,
    String? description,
    String? category,
    String? location,
    String? imagePath,
    List<String>? images,
    Map<String, dynamic>? metadata,
    List<String>? tags,
    double? rating,
    int? viewCount,
    bool? isInteractive,
    bool? isPopular,
    bool? isNew,
    DateTime? createdAt,
    DateTime? updatedAt,
    bool? isDeleted,
    String? audioGuide,
    String? videoUrl,
    Map<String, dynamic>? coordinates,
    String? difficulty,
    int? estimatedDuration,
    List<String>? relatedExhibits,
  }) {
    return Exhibit(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      category: category ?? this.category,
      location: location ?? this.location,
      imagePath: imagePath ?? this.imagePath,
      images: images ?? this.images,
      metadata: metadata ?? this.metadata,
      tags: tags ?? this.tags,
      rating: rating ?? this.rating,
      viewCount: viewCount ?? this.viewCount,
      isInteractive: isInteractive ?? this.isInteractive,
      isPopular: isPopular ?? this.isPopular,
      isNew: isNew ?? this.isNew,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      isDeleted: isDeleted ?? this.isDeleted,
      audioGuide: audioGuide ?? this.audioGuide,
      videoUrl: videoUrl ?? this.videoUrl,
      coordinates: coordinates ?? this.coordinates,
      difficulty: difficulty ?? this.difficulty,
      estimatedDuration: estimatedDuration ?? this.estimatedDuration,
      relatedExhibits: relatedExhibits ?? this.relatedExhibits,
    );
  }

  // Get display name
  String get displayName => name.isNotEmpty ? name : 'Unnamed Exhibit';

  // Get short description (first 100 characters)
  String get shortDescription {
    if (description.length <= 100) return description;
    return '${description.substring(0, 100)}...';
  }

  // Get primary image
  String get primaryImage => images.isNotEmpty ? images.first : imagePath;

  // Get all images including primary
  List<String> get allImages {
    List<String> all = [];
    if (imagePath.isNotEmpty) all.add(imagePath);
    all.addAll(images);
    return all.toSet().toList(); // Remove duplicates
  }

  // Check if exhibit has media
  bool get hasMedia => allImages.isNotEmpty || audioGuide != null || videoUrl != null;

  // Get difficulty level
  String get difficultyLevel {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'Easy';
      case 'medium':
        return 'Medium';
      case 'hard':
        return 'Hard';
      default:
        return 'Beginner';
    }
  }

  // Get estimated duration in minutes
  String get durationText {
    if (estimatedDuration == null) return '5-10 min';
    if (estimatedDuration! < 5) return 'Quick visit';
    if (estimatedDuration! < 15) return '${estimatedDuration} min';
    if (estimatedDuration! < 60) return '${estimatedDuration} min';
    final hours = estimatedDuration! ~/ 60;
    final minutes = estimatedDuration! % 60;
    if (minutes == 0) return '${hours}h';
    return '${hours}h ${minutes}m';
  }

  // Get category display name
  String get categoryDisplay {
    switch (category.toLowerCase()) {
      case 'science':
        return 'Science';
      case 'technology':
        return 'Technology';
      case 'history':
        return 'History';
      case 'art':
        return 'Art';
      case 'nature':
        return 'Nature';
      case 'space':
        return 'Space';
      default:
        return category;
    }
  }

  // Get location display name
  String get locationDisplay {
    switch (location.toLowerCase()) {
      case 'ground_floor':
        return 'Ground Floor';
      case 'first_floor':
        return 'First Floor';
      case 'second_floor':
        return 'Second Floor';
      case 'basement':
        return 'Basement';
      case 'outdoor':
        return 'Outdoor';
      default:
        return location;
    }
  }

  // Check if exhibit is accessible
  bool get isAccessible => metadata['accessible'] == true;

  // Get age restrictions
  String get ageRestriction {
    final minAge = metadata['minAge'] as int?;
    if (minAge == null) return 'All ages';
    if (minAge < 13) return 'Children under ${minAge} must be accompanied';
    return 'Ages ${minAge}+';
  }

  // Get popularity indicator
  String get popularityIndicator {
    if (isPopular) return '🔥 Popular';
    if (isNew) return '🆕 New';
    if (rating >= 4.5) return '⭐ Highly Rated';
    if (viewCount > 1000) return '👥 Well Visited';
    return '📖 Standard';
  }

  @override
  String toString() {
    return 'Exhibit(id: $id, name: $name, category: $category, location: $location)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Exhibit && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
} 