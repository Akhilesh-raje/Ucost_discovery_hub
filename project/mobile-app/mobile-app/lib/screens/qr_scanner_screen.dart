import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import '../providers/app_provider.dart';
import '../services/qr_service.dart';
import '../utils/constants.dart';
import '../utils/theme.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  late MobileScannerController _scannerController;
  final QRService _qrService = QRService();
  bool _isScanning = true;
  bool _isFlashOn = false;
  bool _isFrontCamera = false;
  String _lastScannedCode = '';
  List<String> _scanHistory = [];

  @override
  void initState() {
    super.initState();
    _scannerController = _qrService.createScannerController();
  }

  @override
  void dispose() {
    _scannerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('QR Scanner'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: Icon(_isFlashOn ? Icons.flash_on : Icons.flash_off),
            onPressed: _toggleFlash,
          ),
          IconButton(
            icon: const Icon(Icons.switch_camera),
            onPressed: _switchCamera,
          ),
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: _showScanHistory,
          ),
        ],
      ),
      body: _buildBody(),
      floatingActionButton: _buildFloatingActionButton(),
    );
  }

  Widget _buildBody() {
    return Stack(
      children: [
        // Scanner View
        MobileScanner(
          controller: _scannerController,
          onDetect: _onQRCodeDetected,
        ),
        
        // Overlay UI
        _buildScannerOverlay(),
        
        // Scan History Button
        Positioned(
          top: 16,
          right: 16,
          child: FloatingActionButton.small(
            onPressed: _showScanHistory,
            backgroundColor: Colors.black54,
            foregroundColor: Colors.white,
            child: const Icon(Icons.history),
          ),
        ),
      ],
    );
  }

  Widget _buildScannerOverlay() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.3),
      ),
      child: Column(
        children: [
          // Top section
          Expanded(
            flex: 2,
            child: Container(),
          ),
          
          // Center section with scan area
          Expanded(
            flex: 3,
            child: Row(
              children: [
                // Left margin
                Expanded(flex: 1, child: Container()),
                
                // Scan area
                Expanded(
                  flex: 3,
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.white, width: 2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Stack(
                      children: [
                        // Corner indicators
                        Positioned(
                          top: 0,
                          left: 0,
                          child: Container(
                            width: 20,
                            height: 20,
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.only(
                                topLeft: Radius.circular(12),
                              ),
                            ),
                          ),
                        ),
                        Positioned(
                          top: 0,
                          right: 0,
                          child: Container(
                            width: 20,
                            height: 20,
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.only(
                                topRight: Radius.circular(12),
                              ),
                            ),
                          ),
                        ),
          Positioned(
                          bottom: 0,
            left: 0,
                          child: Container(
                            width: 20,
                            height: 20,
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.only(
                                bottomLeft: Radius.circular(12),
                              ),
                            ),
                          ),
                        ),
                        Positioned(
                          bottom: 0,
            right: 0,
              child: Container(
                            width: 20,
                            height: 20,
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.only(
                                bottomRight: Radius.circular(12),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                // Right margin
                Expanded(flex: 1, child: Container()),
              ],
            ),
          ),
          
          // Bottom section
          Expanded(
            flex: 2,
            child: Container(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Text(
                    'Position QR code within the frame',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Scanning for UCOST QR codes...',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.8),
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFloatingActionButton() {
    return FloatingActionButton.extended(
      onPressed: _isScanning ? _stopScanning : _startScanning,
      backgroundColor: _isScanning ? Colors.red : AppColors.primary,
      foregroundColor: Colors.white,
      icon: Icon(_isScanning ? Icons.stop : Icons.play_arrow),
      label: Text(_isScanning ? 'Stop' : 'Start'),
    );
  }

  void _onQRCodeDetected(BarcodeCapture capture) {
    final List<Barcode> barcodes = capture.barcodes;
    
    for (final barcode in barcodes) {
      final code = barcode.rawValue ?? '';
      
      if (code.isNotEmpty && code != _lastScannedCode) {
        _lastScannedCode = code;
        _processQRCode(code);
      }
    }
  }

  void _processQRCode(String qrData) {
    // Add to scan history
    if (!_scanHistory.contains(qrData)) {
      _scanHistory.add(qrData);
    }
    
    // Analyze QR code
    final analytics = _qrService.analyzeQRCode(qrData);
    
    if (analytics.isValid) {
      _showQRCodeResult(analytics);
    } else {
      _showInvalidQRCode(qrData);
    }
  }

  void _showQRCodeResult(QRCodeAnalytics analytics) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('QR Code Detected - ${analytics.type.toString().split('.').last.toUpperCase()}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Type: ${analytics.type.toString().split('.').last}'),
            Text('Action: ${analytics.action.toString().split('.').last}'),
            if (analytics.timestamp != null)
              Text('Timestamp: ${analytics.timestamp!.toLocal()}'),
            const SizedBox(height: 16),
            const Text('Data:', style: TextStyle(fontWeight: FontWeight.bold)),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                analytics.data?.toString() ?? 'No data',
                style: const TextStyle(fontSize: 12),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _handleQRCodeAction(analytics);
            },
            child: const Text('Process'),
          ),
        ],
      ),
    );
  }

  void _showInvalidQRCode(String qrData) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Invalid QR Code'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.error_outline,
              color: Colors.red,
              size: 48,
            ),
            const SizedBox(height: 16),
            const Text('This QR code is not a valid UCOST QR code.'),
            const SizedBox(height: 8),
            Text(
              'Code: ${qrData.length > 50 ? '${qrData.substring(0, 50)}...' : qrData}',
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _handleQRCodeAction(QRCodeAnalytics analytics) {
    switch (analytics.type) {
      case QRCodeType.exhibit:
        _handleExhibitQR(analytics);
        break;
      case QRCodeType.connection:
        _handleConnectionQR(analytics);
        break;
      case QRCodeType.admin:
        _handleAdminQR(analytics);
        break;
      case QRCodeType.wifi:
        _handleWiFiQR(analytics);
        break;
      case QRCodeType.sync:
        _handleSyncQR(analytics);
        break;
      default:
        _showUnsupportedQRCode(analytics);
    }
  }

  void _handleExhibitQR(QRCodeAnalytics analytics) {
    final data = analytics.data;
    if (data != null) {
      final exhibitId = data['id'] as String?;
      final exhibitName = data['name'] as String?;
      
      if (exhibitId != null && exhibitName != null) {
        // Navigate to exhibit details or upload
        Navigator.pushNamed(context, '/exhibit-upload', arguments: {
          'exhibit_id': exhibitId,
          'exhibit_name': exhibitName,
        });
      }
    }
  }

  void _handleConnectionQR(QRCodeAnalytics analytics) {
    final data = analytics.data;
    if (data != null) {
      final deviceId = data['device_id'] as String?;
      final deviceName = data['device_name'] as String?;
      
      if (deviceId != null && deviceName != null) {
        // Navigate to P2P sync with device
        Navigator.pushNamed(context, '/p2p-sync', arguments: {
          'target_device_id': deviceId,
          'target_device_name': deviceName,
        });
      }
    }
  }

  void _handleAdminQR(QRCodeAnalytics analytics) {
    final data = analytics.data;
    if (data != null) {
      final adminId = data['admin_id'] as String?;
      final permissions = data['permissions'] as String?;
      
      if (adminId != null && permissions != null) {
        // Navigate to admin panel
        Navigator.pushNamed(context, '/admin');
      }
    }
  }

  void _handleWiFiQR(QRCodeAnalytics analytics) {
    final data = analytics.data;
    if (data != null) {
      final ssid = data['ssid'] as String?;
      final password = data['password'] as String?;
      
      if (ssid != null && password != null) {
        _showWiFiConnectionDialog(ssid, password);
      }
    }
  }

  void _handleSyncQR(QRCodeAnalytics analytics) {
    final data = analytics.data;
    if (data != null) {
      final deviceId = data['device_id'] as String?;
      final syncType = data['sync_type'] as String?;
      
      if (deviceId != null && syncType != null) {
        // Navigate to sync screen
        Navigator.pushNamed(context, '/p2p-sync', arguments: {
          'target_device_id': deviceId,
          'sync_type': syncType,
        });
      }
    }
  }

  void _showUnsupportedQRCode(QRCodeAnalytics analytics) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Unsupported QR code type: ${analytics.type}'),
        backgroundColor: Colors.orange,
      ),
    );
  }

  void _showWiFiConnectionDialog(String ssid, String password) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('WiFi Connection'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Network: $ssid'),
            const SizedBox(height: 8),
            Text('Password: $password'),
            const SizedBox(height: 16),
            const Text('Would you like to connect to this WiFi network?'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // TODO: Implement WiFi connection
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('WiFi connection coming soon')),
              );
            },
            child: const Text('Connect'),
          ),
        ],
      ),
    );
  }

  void _showScanHistory() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
            const Text(
                  'Scan History',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
                TextButton(
                  onPressed: () {
                    setState(() {
                      _scanHistory.clear();
                    });
                    Navigator.pop(context);
                  },
                  child: const Text('Clear'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (_scanHistory.isEmpty)
              const Center(
                child: Text('No scan history'),
              )
            else
              Expanded(
                child: ListView.builder(
                  itemCount: _scanHistory.length,
                  itemBuilder: (context, index) {
                    final qrData = _scanHistory[index];
                    final analytics = _qrService.analyzeQRCode(qrData);
                    
                    return ListTile(
                      leading: Icon(
                        analytics.isValid ? Icons.check_circle : Icons.error,
                        color: analytics.isValid ? Colors.green : Colors.red,
                      ),
                      title: Text(
                        analytics.isValid 
                          ? '${analytics.type.toString().split('.').last} QR'
                          : 'Invalid QR',
                      ),
                      subtitle: Text(
                        qrData.length > 30 
                          ? '${qrData.substring(0, 30)}...'
                          : qrData,
                      ),
                      onTap: () {
                        Navigator.pop(context);
                        if (analytics.isValid) {
                          _showQRCodeResult(analytics);
                        } else {
                          _showInvalidQRCode(qrData);
                        }
                      },
                    );
                  },
                ),
            ),
          ],
        ),
      ),
    );
  }

  void _toggleFlash() {
    setState(() {
      _isFlashOn = !_isFlashOn;
    });
    _scannerController.toggleTorch();
  }

  void _switchCamera() {
    setState(() {
      _isFrontCamera = !_isFrontCamera;
    });
    _scannerController.switchCamera();
  }

  void _startScanning() {
    setState(() {
      _isScanning = true;
    });
    _scannerController.start();
  }

  void _stopScanning() {
    setState(() {
      _isScanning = false;
    });
    _scannerController.stop();
  }
} 