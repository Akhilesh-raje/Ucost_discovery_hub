# 🏛️ UCOST Mobile Admin App

**World-Class Museum Management System with Local-First P2P Sync**

A powerful Flutter-based mobile application that enables museum administrators to upload and manage exhibits offline, with automatic synchronization to PC databases when connected to the same local network.

## ✨ Features

### 🎯 **Core Functionality**
- **Exhibit Management**: Create, edit, and delete museum exhibits
- **Image Upload**: Multi-image support with local storage
- **Offline-First**: Works completely offline with local SQLite database
- **P2P Auto-Sync**: Automatically syncs with PC when on same WiFi network

### 🔄 **Smart Synchronization**
- **Auto-Discovery**: Automatically finds PC database servers on local network
- **mDNS Support**: Zero-configuration networking using multicast DNS
- **Conflict Resolution**: Handles data conflicts between devices
- **Sync Status Tracking**: Real-time sync status and progress monitoring

### 📱 **Cross-Platform Support**
- **Android**: Full native Android support
- **iOS**: Full native iOS support  
- **Capacitor**: Web and desktop deployment capabilities
- **Responsive Design**: Optimized for all screen sizes

## 🚀 Quick Start

### Prerequisites
- Flutter SDK (3.4.0 or higher)
- Node.js (16 or higher)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   cd project/mobile-app/mobile-app
   ```

2. **Install Flutter dependencies**
   ```bash
   flutter pub get
   ```

3. **Install Capacitor**
   ```bash
   npm install
   ```

4. **Build and setup Capacitor**
   ```bash
   node scripts/build_capacitor.js build
   ```

### Running the App

#### **Development Mode**
```bash
# Run on Android emulator/device
node scripts/build_capacitor.js run android

# Run on iOS simulator/device
node scripts/build_capacitor.js run ios

# Open in Android Studio
node scripts/build_capacitor.js open android

# Open in Xcode
node scripts/build_capacitor.js open ios
```

#### **Production Build**
```bash
# Build Android APK
node scripts/build_capacitor.js release android

# Build iOS app (requires Xcode)
node scripts/build_capacitor.js release ios
```

## 🏗️ Architecture

### **Local-First Design**
```
📱 Mobile App → 🗄️ Local SQLite → 🔄 P2P Sync → 💻 PC Database
```

### **Core Components**

#### **1. Database Service (`database_service.dart`)**
- **SQLite Integration**: Local data persistence using Drift
- **Sync Tracking**: Tracks sync status for all exhibits
- **Conflict Resolution**: Handles data conflicts gracefully

#### **2. Enhanced P2P Service (`enhanced_p2p_service.dart`)**
- **mDNS Discovery**: Automatic device discovery on local network
- **Auto-Connection**: Automatically connects to PC servers
- **Real-time Sync**: Continuous synchronization when connected

#### **3. Enhanced Exhibit Provider (`enhanced_exhibit_provider.dart`)**
- **State Management**: Manages exhibit data and sync status
- **Offline Operations**: All operations work offline
- **Sync Coordination**: Coordinates with P2P service

#### **4. UI Components**
- **Enhanced Upload Screen**: Rich exhibit creation interface
- **Sync Status Panel**: Real-time sync monitoring
- **Settings Management**: App configuration and preferences

## 🔧 Configuration

### **Capacitor Configuration**
```typescript
// capacitor.config.ts
{
  appId: 'com.ucost.mobileapp',
  appName: 'UCOST Mobile Admin',
  webDir: 'build/web',
  plugins: {
    SplashScreen: { /* ... */ },
    StatusBar: { /* ... */ },
    LocalNotifications: { /* ... */ }
  }
}
```

### **P2P Network Configuration**
```dart
// Enhanced P2P Service
final String _serviceType = '_ucost-sync._tcp';
final String _serviceName = 'UCOST-Mobile-App';
static const Duration _autoSyncInterval = Duration(seconds: 30);
```

## 📊 Database Schema

### **Exhibits Table**
```sql
CREATE TABLE exhibits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  images TEXT, -- Pipe-separated image paths
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  metadata TEXT, -- JSON metadata
  sync_status TEXT DEFAULT 'pending',
  last_sync_attempt DATETIME,
  sync_retry_count INTEGER DEFAULT 0
);
```

### **Sync Logs Table**
```sql
CREATE TABLE sync_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exhibit_id TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  error_message TEXT,
  target_device TEXT
);
```

## 🔄 P2P Sync Workflow

### **1. Offline Operation**
```
📱 Admin uploads exhibit → 💾 Saved to local SQLite → ✅ Ready for sync
```

### **2. Network Discovery**
```
📶 WiFi connected → 🔍 mDNS discovery → 🖥️ PC server found → 🔗 Auto-connect
```

### **3. Automatic Sync**
```
🔄 Auto-sync every 30s → 📤 Send pending exhibits → 💻 PC database updated → ✅ Sync complete
```

### **4. Conflict Resolution**
```
⚠️ Conflict detected → 🔄 Merge strategies → 📊 Data integrity → ✅ Conflict resolved
```

## 🛠️ Development

### **Project Structure**
```
lib/
├── models/           # Data models
├── providers/        # State management
├── screens/          # UI screens
├── services/         # Business logic
├── utils/            # Utilities
└── main.dart         # App entry point
```

### **Key Dependencies**
```yaml
dependencies:
  flutter: sdk: flutter
  drift: ^2.15.0           # Type-safe SQLite
  multicast_dns: ^0.3.0+1  # mDNS discovery
  network_info_plus: ^4.1.0+1  # Network information
  connectivity_plus: ^5.0.2    # Connectivity monitoring
  image_picker: ^1.1.2         # Image selection
  path_provider: ^2.1.5        # File system access
```

### **Building and Testing**
```bash
# Run tests
flutter test

# Build for web
flutter build web

# Build for mobile
flutter build apk --release
flutter build ios --release

# Analyze code
flutter analyze
```

## 🚀 Deployment

### **Android**
1. Build APK: `node scripts/build_capacitor.js release android`
2. APK location: `android/app/build/outputs/apk/release/`
3. Install on device or distribute via app stores

### **iOS**
1. Open in Xcode: `node scripts/build_capacitor.js open ios`
2. Configure signing and capabilities
3. Build and archive for App Store distribution

### **Web**
1. Build web version: `flutter build web`
2. Deploy to any web hosting service
3. Access via browser on any device

## 🔍 Troubleshooting

### **Common Issues**

#### **P2P Connection Failed**
- Check if devices are on same WiFi network
- Verify firewall settings allow local connections
- Ensure PC server is running and accessible

#### **Sync Not Working**
- Check sync status in app
- Verify database permissions
- Review sync logs for errors

#### **Build Errors**
- Ensure Flutter and Node.js versions are compatible
- Clean build: `flutter clean && flutter pub get`
- Check Capacitor configuration

### **Debug Mode**
```bash
# Enable debug logging
flutter run --debug

# View device logs
flutter logs

# Check P2P service status
# Look for logs starting with 🔍 📡 🔗 🔄
```

## 📱 Usage Guide

### **For Museum Administrators**

1. **Upload Exhibits**
   - Open app and go to Upload tab
   - Fill in exhibit details (name, description, category, location)
   - Add multiple images
   - Tap "Upload Exhibit"

2. **Monitor Sync Status**
   - Check connection status at top of screen
   - View pending sync count
   - Monitor sync progress in real-time

3. **Manage Data**
   - View all uploaded exhibits
   - Edit exhibit information
   - Delete outdated exhibits

### **For IT Administrators**

1. **Setup PC Server**
   - Run UCOST backend on PC
   - Ensure mDNS service is enabled
   - Configure firewall for local connections

2. **Network Configuration**
   - Ensure mobile devices and PC are on same WiFi
   - Configure network security appropriately
   - Monitor network performance

## 🔒 Security Features

- **Local Data Encryption**: SQLite database encryption
- **Secure P2P Communication**: HTTP over local network
- **Permission Management**: Camera and storage access control
- **Data Validation**: Input sanitization and validation

## 📈 Performance

- **Offline Performance**: Instant exhibit creation and editing
- **Sync Efficiency**: Only syncs changed data
- **Memory Management**: Efficient image handling and storage
- **Battery Optimization**: Minimal background processing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join community discussions on GitHub
- **Email**: Contact development team for enterprise support

---

**Built with ❤️ for the UCOST Discovery Hub Project**

*Empowering museums with intelligent, offline-first exhibit management* 