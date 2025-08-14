import 'dart:convert';
import 'dart:io';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:crypto/crypto.dart';
import '../utils/constants.dart';

class QRService {
  // Singleton pattern
  static final QRService _instance = QRService._internal();
  factory QRService() => _instance;
  QRService._internal();

  // QR Code Generation
  String generateQRCode(Map<String, dynamic> data) {
    final timestamp = DateTime.now().toIso8601String();
    final qrData = {
      ...data,
      'timestamp': timestamp,
      'prefix': QRConfig.qrPrefix,
    };
    
    return json.encode(qrData);
  }

  String generateExhibitQR(String exhibitId, String exhibitName) {
    return generateQRCode({
      'type': 'exhibit',
      'id': exhibitId,
      'name': exhibitName,
      'action': 'view',
    });
  }

  String generateConnectionQR(String deviceId, String deviceName) {
    return generateQRCode({
      'type': 'connection',
      'device_id': deviceId,
      'device_name': deviceName,
      'action': 'connect',
    });
  }

  String generateAdminQR(String adminId, String permissions) {
    return generateQRCode({
      'type': 'admin',
      'admin_id': adminId,
      'permissions': permissions,
      'action': 'access',
    });
  }

  // QR Code Validation
  bool isValidQRCode(String qrData) {
    try {
      final data = json.decode(qrData);
      
      // Check if it has required fields
      if (!data.containsKey('prefix') || 
          !data.containsKey('timestamp') || 
          !data.containsKey('type')) {
        return false;
      }
      
      // Check prefix
      if (data['prefix'] != QRConfig.qrPrefix) {
        return false;
      }
      
      // Check timestamp (QR codes should not be older than 1 hour)
      final timestamp = DateTime.parse(data['timestamp']);
      final now = DateTime.now();
      if (now.difference(timestamp) > QRConfig.qrExpiry) {
        return false;
      }
      
      return true;
    } catch (e) {
      return false;
    }
  }

  // QR Code Parsing
  Map<String, dynamic>? parseQRCode(String qrData) {
    try {
      if (!isValidQRCode(qrData)) {
        return null;
      }
      
      final data = json.decode(qrData);
      return data;
    } catch (e) {
      return null;
    }
  }

  // QR Code Type Detection
  QRCodeType getQRCodeType(String qrData) {
    final data = parseQRCode(qrData);
    if (data == null) return QRCodeType.unknown;
    
    final type = data['type'] as String?;
    switch (type) {
      case 'exhibit':
        return QRCodeType.exhibit;
      case 'connection':
        return QRCodeType.connection;
      case 'admin':
        return QRCodeType.admin;
      default:
        return QRCodeType.unknown;
    }
  }

  // QR Code Security
  String generateSecureQR(Map<String, dynamic> data, String secretKey) {
    final timestamp = DateTime.now().toIso8601String();
    final qrData = {
      ...data,
      'timestamp': timestamp,
      'prefix': QRConfig.qrPrefix,
    };
    
    // Generate signature
    final signature = _generateSignature(qrData, secretKey);
    qrData['signature'] = signature;
    
    return json.encode(qrData);
  }

  bool verifySecureQR(String qrData, String secretKey) {
    try {
      final data = json.decode(qrData);
      final signature = data['signature'] as String?;
      
      if (signature == null) return false;
      
      // Remove signature for verification
      final dataWithoutSignature = Map<String, dynamic>.from(data);
      dataWithoutSignature.remove('signature');
      
      final expectedSignature = _generateSignature(dataWithoutSignature, secretKey);
      return signature == expectedSignature;
    } catch (e) {
      return false;
    }
  }

  String _generateSignature(Map<String, dynamic> data, String secretKey) {
    final dataString = json.encode(data);
    final bytes = utf8.encode(dataString + secretKey);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  // QR Code Generation for UI
  QrPainter createQrPainter(String data, {double size = 200}) {
    return QrPainter(
      data: data,
      version: QRConfig.qrVersion,
      errorCorrectionLevel: QRConfig.qrErrorCorrectionLevel,
      color: const Color(0xFF000000),
      emptyColor: const Color(0xFFFFFFFF),
    );
  }

  // Mobile Scanner Configuration
  MobileScannerController createScannerController({
    bool autoStart = true,
  }) {
    return MobileScannerController(
      autoStart: autoStart,
      formats: [BarcodeFormat.qrCode],
      detectionSpeed: DetectionSpeed.normal,
      facing: CameraFacing.back,
      torchEnabled: false,
    );
  }

  // QR Code Actions
  QRCodeAction parseQRCodeAction(String qrData) {
    final data = parseQRCode(qrData);
    if (data == null) return QRCodeAction.unknown;
    
    final action = data['action'] as String?;
    switch (action) {
      case 'view':
        return QRCodeAction.view;
      case 'connect':
        return QRCodeAction.connect;
      case 'access':
        return QRCodeAction.access;
      case 'upload':
        return QRCodeAction.upload;
      case 'sync':
        return QRCodeAction.sync;
      default:
        return QRCodeAction.unknown;
    }
  }

  // Exhibit-specific QR Methods
  String generateExhibitViewQR(String exhibitId, String exhibitName, String description) {
    return generateQRCode({
      'type': 'exhibit',
      'id': exhibitId,
      'name': exhibitName,
      'description': description,
      'action': 'view',
    });
  }

  String generateExhibitUploadQR(String exhibitId, String exhibitName) {
    return generateQRCode({
      'type': 'exhibit',
      'id': exhibitId,
      'name': exhibitName,
      'action': 'upload',
    });
  }

  // Connection-specific QR Methods
  String generateP2PConnectionQR(String deviceId, String deviceName, String deviceType) {
    return generateQRCode({
      'type': 'connection',
      'device_id': deviceId,
      'device_name': deviceName,
      'device_type': deviceType,
      'action': 'connect',
    });
  }

  String generateWiFiConnectionQR(String ssid, String password, String security) {
    return generateQRCode({
      'type': 'wifi',
      'ssid': ssid,
      'password': password,
      'security': security,
      'action': 'connect',
    });
  }

  // Admin-specific QR Methods
  String generateAdminAccessQR(String adminId, List<String> permissions, Duration expiry) {
    return generateQRCode({
      'type': 'admin',
      'admin_id': adminId,
      'permissions': permissions,
      'expiry': expiry.inSeconds,
      'action': 'access',
    });
  }

  String generateSyncQR(String deviceId, String syncType, Map<String, dynamic> syncData) {
    return generateQRCode({
      'type': 'sync',
      'device_id': deviceId,
      'sync_type': syncType,
      'sync_data': syncData,
      'action': 'sync',
    });
  }

  // QR Code Analytics
  QRCodeAnalytics analyzeQRCode(String qrData) {
    final data = parseQRCode(qrData);
    if (data == null) {
      return QRCodeAnalytics(
        isValid: false,
        type: QRCodeType.unknown,
        action: QRCodeAction.unknown,
        timestamp: null,
        size: qrData.length,
      );
    }
    
    return QRCodeAnalytics(
      isValid: true,
      type: getQRCodeType(qrData),
      action: parseQRCodeAction(qrData),
      timestamp: DateTime.tryParse(data['timestamp'] ?? ''),
      size: qrData.length,
      data: data,
    );
  }
}

// Enums
enum QRCodeType {
  exhibit,
  connection,
  admin,
  wifi,
  sync,
  unknown,
}

enum QRCodeAction {
  view,
  connect,
  access,
  upload,
  sync,
  unknown,
}

// Analytics Class
class QRCodeAnalytics {
  final bool isValid;
  final QRCodeType type;
  final QRCodeAction action;
  final DateTime? timestamp;
  final int size;
  final Map<String, dynamic>? data;

  QRCodeAnalytics({
    required this.isValid,
    required this.type,
    required this.action,
    this.timestamp,
    required this.size,
    this.data,
  });

  Map<String, dynamic> toJson() {
    return {
      'isValid': isValid,
      'type': type.toString(),
      'action': action.toString(),
      'timestamp': timestamp?.toIso8601String(),
      'size': size,
      'data': data,
    };
  }
} 