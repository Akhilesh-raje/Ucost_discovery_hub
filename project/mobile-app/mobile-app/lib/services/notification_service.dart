import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  final FlutterLocalNotificationsPlugin _notifications = FlutterLocalNotificationsPlugin();

  Future<void> initialize() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings();
    
    const initializationSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );
    
    await _notifications.initialize(initializationSettings);
  }

  Future<void> showNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'ucost_channel',
      'UCOST Notifications',
      channelDescription: 'Notifications for UCOST Discovery Hub',
      importance: Importance.high,
      priority: Priority.high,
    );
    
    const iosDetails = DarwinNotificationDetails();
    
    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
    
    await _notifications.show(
      DateTime.now().millisecondsSinceEpoch.remainder(100000),
      title,
      body,
      details,
      payload: payload,
    );
  }

  Future<void> showConnectionNotification({
    required String deviceName,
    required bool isConnected,
  }) async {
    final title = isConnected ? 'Connected' : 'Disconnected';
    final body = isConnected 
        ? 'Successfully connected to $deviceName'
        : 'Disconnected from $deviceName';
    
    await showNotification(title: title, body: body);
  }

  Future<void> showSyncNotification({
    required String title,
    required String body,
  }) async {
    await showNotification(title: title, body: body);
  }

  Future<void> showExhibitUploadNotification({
    required String exhibitName,
    required bool isSuccess,
  }) async {
    final title = isSuccess ? 'Upload Successful' : 'Upload Failed';
    final body = isSuccess 
        ? '$exhibitName uploaded successfully'
        : 'Failed to upload $exhibitName';
    
    await showNotification(title: title, body: body);
  }

  Future<void> cancelNotification(int id) async {
    await _notifications.cancel(id);
  }

  Future<void> cancelAllNotifications() async {
    await _notifications.cancelAll();
  }
} 