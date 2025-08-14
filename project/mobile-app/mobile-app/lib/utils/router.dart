import 'package:flutter/material.dart';
import '../screens/home_screen.dart';
import '../screens/qr_scanner_screen.dart';
import '../screens/exhibit_upload_screen.dart';
import '../screens/p2p_sync_screen.dart';
import '../screens/settings_screen.dart';
import '../screens/admin_panel_screen.dart';

class AppRouter {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/':
        return MaterialPageRoute(builder: (_) => const HomeScreen());
      case '/qr-scanner':
        return MaterialPageRoute(builder: (_) => const QRScannerScreen());
      case '/exhibit-upload':
        return MaterialPageRoute(builder: (_) => const ExhibitUploadScreen());
      case '/p2p-sync':
        return MaterialPageRoute(builder: (_) => const P2PSyncScreen());
      case '/settings':
        return MaterialPageRoute(builder: (_) => const SettingsScreen());
      case '/admin':
        return MaterialPageRoute(builder: (_) => const AdminPanelScreen());
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            appBar: AppBar(
              title: const Text('Page Not Found'),
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.error_outline,
                    size: 64,
                    color: Colors.red,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Page not found',
                    style: Theme.of(_).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'The page "${settings.name}" does not exist.',
                    style: Theme.of(_).textTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () => Navigator.of(_).pop(),
                    child: const Text('Go Back'),
                  ),
                ],
              ),
            ),
          ),
        );
    }
  }
} 