import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:get_it/get_it.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

// Services
import 'services/api_service.dart';
import 'services/p2p_service.dart';
import 'services/storage_service.dart';
import 'services/qr_service.dart';
import 'services/notification_service.dart';

// Providers
import 'providers/app_provider.dart';
import 'providers/connection_provider.dart';
import 'providers/exhibit_provider.dart';

// Screens
import 'screens/home_screen.dart';

// Utils
import 'utils/constants.dart';
import 'utils/theme.dart';
import 'utils/router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  // Initialize Hive
  await Hive.initFlutter();
  
  // Request permissions
  await _requestPermissions();
  
  // Initialize services
  await _initializeServices();
  
  // Initialize notifications
  await _initializeNotifications();
  
  runApp(const UCOSTMobileApp());
}

Future<void> _requestPermissions() async {
  await Permission.camera.request();
  await Permission.storage.request();
  await Permission.location.request();
  await Permission.bluetooth.request();
  await Permission.bluetoothScan.request();
  await Permission.bluetoothConnect.request();
}

Future<void> _initializeServices() async {
  final getIt = GetIt.instance;
  
  // Register services
  getIt.registerSingleton<ApiService>(ApiService());
  getIt.registerSingleton<P2PService>(P2PService());
  getIt.registerSingleton<StorageService>(StorageService());
  getIt.registerSingleton<QRService>(QRService());
  getIt.registerSingleton<NotificationService>(NotificationService());
  
  // Initialize services
  await getIt<StorageService>().initialize();
  await getIt<P2PService>().initialize();
  await getIt<NotificationService>().initialize();
}

Future<void> _initializeNotifications() async {
  final flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();
  
  const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
  const iosSettings = DarwinInitializationSettings();
  
  const initializationSettings = InitializationSettings(
    android: androidSettings,
    iOS: iosSettings,
  );
  
  await flutterLocalNotificationsPlugin.initialize(initializationSettings);
}

class UCOSTMobileApp extends StatelessWidget {
  const UCOSTMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppProvider()),
        ChangeNotifierProvider(create: (_) => ConnectionProvider()),
        ChangeNotifierProvider(create: (_) => ExhibitProvider()),
      ],
      child: MaterialApp(
        title: AppStrings.appName,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.system,
        home: const HomeScreen(),
        debugShowCheckedModeBanner: false,
        navigatorKey: GlobalKey<NavigatorState>(),
        onGenerateRoute: AppRouter.generateRoute,
      ),
    );
  }
}

 