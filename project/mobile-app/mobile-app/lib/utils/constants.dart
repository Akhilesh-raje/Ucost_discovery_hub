import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFF1976D2);
  static const Color secondary = Color(0xFF42A5F5);
  static const Color accent = Color(0xFF2196F3);
  static const Color background = Color(0xFFF5F5F5);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color error = Color(0xFFD32F2F);
  static const Color success = Color(0xFF388E3C);
  static const Color warning = Color(0xFFF57C00);
  static const Color info = Color(0xFF1976D2);
  
  // UCOST Brand Colors
  static const Color ucostBlue = Color(0xFF1E3A8A);
  static const Color ucostGreen = Color(0xFF059669);
  static const Color ucostOrange = Color(0xFFEA580C);
}

class AppSizes {
  static const double paddingSmall = 8.0;
  static const double paddingMedium = 16.0;
  static const double paddingLarge = 24.0;
  static const double paddingXLarge = 32.0;
  
  static const double radiusSmall = 4.0;
  static const double radiusMedium = 8.0;
  static const double radiusLarge = 12.0;
  static const double radiusXLarge = 16.0;
  
  static const double iconSmall = 16.0;
  static const double iconMedium = 24.0;
  static const double iconLarge = 32.0;
  static const double iconXLarge = 48.0;
  
  // Additional constants for theme
  static const double borderRadius = 8.0;
  static const double buttonPadding = 12.0;
}

class AppStrings {
  // App Information
  static const String appName = 'UCOST Discovery Hub';
  static const String appVersion = '1.0.0';
  static const String appDescription = 'Mobile app for museum exhibit management';
  
  // Navigation
  static const String home = 'Home';
  static const String upload = 'Upload';
  static const String sync = 'Sync';
  static const String settings = 'Settings';
  static const String admin = 'Admin';
  
  // Actions
  static const String scan = 'Scan QR Code';
  static const String connect = 'Connect';
  static const String disconnect = 'Disconnect';
  static const String uploadExhibit = 'Upload Exhibit';
  static const String syncData = 'Sync Data';
  static const String settingsTitle = 'Settings';
  
  // Messages
  static const String connecting = 'Connecting...';
  static const String connected = 'Connected';
  static const String disconnected = 'Disconnected';
  static const String uploading = 'Uploading...';
  static const String syncing = 'Syncing...';
  static const String scanning = 'Scanning...';
  
  // Errors
  static const String connectionError = 'Connection failed';
  static const String uploadError = 'Upload failed';
  static const String syncError = 'Sync failed';
  static const String scanError = 'Scan failed';
  static const String permissionError = 'Permission denied';
  
  // Success
  static const String uploadSuccess = 'Upload successful';
  static const String syncSuccess = 'Sync successful';
  static const String connectionSuccess = 'Connection successful';
}

class ApiEndpoints {
  // Base URLs
  static const String baseUrl = 'http://192.168.1.100:5000';
  static const String wsUrl = 'ws://192.168.1.100:5000';
  
  // Authentication
  static const String login = '/api/auth/login';
  static const String register = '/api/auth/register';
  static const String verify = '/api/auth/verify';
  
  // Mobile App Endpoints
  static const String mobileRegister = '/api/mobile/register-device';
  static const String mobileUpload = '/api/mobile/upload-exhibit';
  static const String mobileSync = '/api/mobile/sync-status';
  static const String mobileConnect = '/api/mobile/p2p-connect';
  
  // Exhibits
  static const String exhibits = '/api/exhibits';
  static const String exhibitUpload = '/api/exhibits/upload';
  static const String exhibitUpdate = '/api/exhibits/update';
  static const String exhibitDelete = '/api/exhibits/delete';
  
  // P2P Sync
  static const String p2pStatus = '/api/p2p/status';
  static const String p2pConnect = '/api/p2p/connect';
  static const String p2pDisconnect = '/api/p2p/disconnect';
  static const String p2pSync = '/api/p2p/sync';
  
  // QR Code
  static const String qrGenerate = '/api/qr/generate';
  static const String qrDownload = '/api/qr/download';
}

class P2PConfig {
  static const int port = 5002;
  static const String serviceId = 'ucost-discovery-hub';
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration syncInterval = Duration(minutes: 5);
  static const int maxRetries = 3;
}

class StorageKeys {
  static const String deviceId = 'device_id';
  static const String deviceName = 'device_name';
  static const String lastSync = 'last_sync';
  static const String connectionHistory = 'connection_history';
  static const String uploadQueue = 'upload_queue';
  static const String settings = 'settings';
  static const String authToken = 'auth_token';
}

class FileConfig {
  static const int maxImageSize = 10 * 1024 * 1024; // 10MB
  static const int maxVideoSize = 100 * 1024 * 1024; // 100MB
  static const List<String> supportedImageFormats = ['jpg', 'jpeg', 'png', 'webp'];
  static const List<String> supportedVideoFormats = ['mp4', 'avi', 'mov'];
  static const List<String> supportedDocumentFormats = ['pdf', 'doc', 'docx'];
}

class QRConfig {
  static const String qrPrefix = 'ucost://';
  static const Duration qrExpiry = Duration(hours: 1);
  static const int qrVersion = 10;
  static const int qrErrorCorrectionLevel = 3;
}

class NetworkConfig {
  static const Duration connectionTimeout = Duration(seconds: 10);
  static const Duration readTimeout = Duration(seconds: 30);
  static const Duration writeTimeout = Duration(seconds: 30);
  static const int maxRetries = 3;
  static const Duration retryDelay = Duration(seconds: 2);
} 

class AppConstants {
  // App Information
  static const String appName = 'UCOST Mobile Admin';
  static const String appVersion = '1.0.0';
  static const String appDescription = 'World-Class Museum Management System';
  
  // API Configuration
  static const String baseUrl = 'http://localhost:5000';
  static const String apiVersion = '/api';
  static const Duration apiTimeout = Duration(seconds: 30);
  
  // P2P Configuration
  static const String serviceType = '_ucost-sync._tcp';
  static const String serviceName = 'UCOST-Mobile-App';
  static const Duration discoveryInterval = Duration(seconds: 10);
  static const Duration syncInterval = Duration(seconds: 30);
  static const Duration connectionTimeout = Duration(seconds: 15);
  
  // Database Configuration
  static const String databaseName = 'ucost_exhibits.db';
  static const int databaseVersion = 1;
  
  // Storage Configuration
  static const String imageDirectory = 'exhibit_images';
  static const int maxImageSize = 10 * 1024 * 1024; // 10MB
  static const List<String> supportedImageFormats = ['jpg', 'jpeg', 'png', 'webp'];
  
  // UI Configuration
  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration snackbarDuration = Duration(seconds: 3);
  static const double defaultPadding = 16.0;
  static const double defaultRadius = 12.0;
  
  // Sync Configuration
  static const int maxRetryAttempts = 3;
  static const Duration retryDelay = Duration(seconds: 5);
  static const List<String> syncStatuses = ['pending', 'syncing', 'completed', 'failed'];
  
  // Exhibit Categories
  static const List<String> exhibitCategories = [
    'Science',
    'Technology',
    'History',
    'Art',
    'Nature',
    'Space',
    'Innovation',
    'Education',
    'Interactive',
    'Temporary',
    'Permanent',
    'Special',
  ];
  
  // Exhibit Locations
  static const List<String> exhibitLocations = [
    'Ground Floor',
    'First Floor',
    'Second Floor',
    'Basement',
    'Outdoor',
    'Special Gallery',
    'Main Hall',
    'Science Lab',
    'Technology Zone',
    'History Section',
    'Art Gallery',
    'Nature Corner',
  ];
  
  // Error Messages
  static const String networkError = 'Network connection error. Please check your internet connection.';
  static const String databaseError = 'Database operation failed. Please try again.';
  static const String syncError = 'Synchronization failed. Please check your connection.';
  static const String uploadError = 'Upload failed. Please try again.';
  static const String generalError = 'Something went wrong. Please try again.';
  
  // Success Messages
  static const String syncSuccess = 'Data synchronized successfully!';
  static const String uploadSuccess = 'Exhibit uploaded successfully!';
  static const String deleteSuccess = 'Exhibit deleted successfully!';
  static const String updateSuccess = 'Exhibit updated successfully!';
  
  // Validation Messages
  static const String nameRequired = 'Exhibit name is required';
  static const String descriptionRequired = 'Exhibit description is required';
  static const String categoryRequired = 'Please select a category';
  static const String locationRequired = 'Please select a location';
  static const String imageRequired = 'At least one image is required';
  
  // Debug Configuration
  static const bool enableDebugLogs = true;
  static const bool enablePerformanceLogs = false;
  static const bool enableNetworkLogs = true;
} 