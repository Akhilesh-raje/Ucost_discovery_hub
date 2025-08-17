class UserProfile {
  final String id;
  final String name;
  final String email;
  final String role;
  final List<String> interests;
  final int age;
  final String experience;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  UserProfile({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.interests,
    required this.age,
    required this.experience,
    this.createdAt,
    this.updatedAt,
  });

  // Create from JSON
  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
      interests: List<String>.from(json['interests'] ?? []),
      age: json['age'] as int? ?? 0,
      experience: json['experience'] as String? ?? 'beginner',
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt'] as String) 
          : null,
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt'] as String) 
          : null,
    );
  }

  // Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'interests': interests,
      'age': age,
      'experience': experience,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  // Create a copy with updated fields
  UserProfile copyWith({
    String? id,
    String? name,
    String? email,
    String? role,
    List<String>? interests,
    int? age,
    String? experience,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserProfile(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      role: role ?? this.role,
      interests: interests ?? this.interests,
      age: age ?? this.age,
      experience: experience ?? this.experience,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  // Get display name
  String get displayName => name.isNotEmpty ? name : 'Guest User';

  // Get age group
  String get ageGroup {
    if (age < 13) return 'Child';
    if (age < 18) return 'Teenager';
    if (age < 30) return 'Young Adult';
    if (age < 50) return 'Adult';
    return 'Senior';
  }

  // Get experience level
  String get experienceLevel {
    switch (experience.toLowerCase()) {
      case 'beginner':
        return 'Beginner';
      case 'intermediate':
        return 'Intermediate';
      case 'advanced':
        return 'Advanced';
      case 'expert':
        return 'Expert';
      default:
        return 'Beginner';
    }
  }

  // Get primary interest
  String get primaryInterest => interests.isNotEmpty ? interests.first : 'General Science';

  // Check if user is admin
  bool get isAdmin => role.toLowerCase() == 'admin';

  // Check if user is guest
  bool get isGuest => role.toLowerCase() == 'guest';

  // Get profile completion percentage
  double get completionPercentage {
    int completedFields = 0;
    int totalFields = 6; // id, name, email, role, interests, age, experience

    if (id.isNotEmpty) completedFields++;
    if (name.isNotEmpty) completedFields++;
    if (email.isNotEmpty) completedFields++;
    if (role.isNotEmpty) completedFields++;
    if (interests.isNotEmpty) completedFields++;
    if (age > 0) completedFields++;

    return completedFields / totalFields;
  }

  // Check if profile is complete
  bool get isComplete => completionPercentage >= 0.8;

  @override
  String toString() {
    return 'UserProfile(id: $id, name: $name, email: $email, role: $role, interests: $interests, age: $age, experience: $experience)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is UserProfile &&
        other.id == id &&
        other.name == name &&
        other.email == email &&
        other.role == role;
  }

  @override
  int get hashCode {
    return id.hashCode ^ name.hashCode ^ email.hashCode ^ role.hashCode;
  }
} 