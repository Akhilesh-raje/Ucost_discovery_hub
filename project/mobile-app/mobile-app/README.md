# UCOST Discovery Hub Mobile App

## 🌟 World-Class Museum Management System

A comprehensive Flutter mobile application for museum exhibit management with advanced P2P connectivity, QR code scanning, and real-time synchronization capabilities.

## ✨ Features

### 🔗 **P2P Connectivity**
- **Device Discovery**: Automatically discover nearby kiosks, PCs, and other mobile devices
- **Multiple Connection Types**: WiFi, Bluetooth, Mobile Data, and Direct P2P
- **Auto-Sync**: Automatically synchronize when devices are nearby
- **Real-time Communication**: Instant data transfer between connected devices

### 📱 **QR Code System**
- **QR Code Scanner**: Scan QR codes to connect to devices or download apps
- **QR Code Generator**: Generate QR codes for device pairing and app downloads
- **Multiple QR Types**: Device connection, app download, and P2P session QR codes

### 🏛️ **Exhibit Management**
- **Comprehensive Exhibit Data**: Name, description, category, location, images
- **Offline Support**: Work without internet connection
- **Upload Queue**: Queue exhibits for upload when connection is restored
- **Image Management**: Support for multiple images per exhibit
- **Search & Filter**: Advanced search and category filtering

### 📊 **Analytics & Statistics**
- **Real-time Stats**: Total exhibits, pending uploads, categories, connected devices
- **Activity Tracking**: Recent activity with timestamps
- **Progress Tracking**: Upload progress with visual indicators

### 🔔 **Notifications**
- **Connection Notifications**: Device connect/disconnect alerts
- **Upload Notifications**: Success/failure notifications for exhibit uploads
- **Sync Notifications**: Progress updates during synchronization
- **QR Code Notifications**: Scan result notifications

### 🎨 **Modern UI/UX**
- **Material Design 3**: Latest Material Design components
- **Dark/Light Theme**: Automatic theme switching
- **Smooth Animations**: Staggered animations and transitions
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: Full accessibility support

### 🔒 **Security & Privacy**
- **Permission Management**: Camera, storage, location, Bluetooth permissions
- **Data Encryption**: Secure data transmission
- **Local Storage**: Encrypted local database
- **Privacy Controls**: User-controlled data sharing

## 🏗️ Architecture

### **State Management**
- **Provider Pattern**: Centralized state management
- **Multiple Providers**: App, Connection, and Exhibit providers
- **Reactive UI**: Real-time UI updates based on state changes

### **Services Layer**
- **API Service**: RESTful API communication
- **P2P Service**: Device-to-device communication
- **Storage Service**: Local data persistence
- **QR Service**: QR code generation and scanning
- **Notification Service**: Push notifications

### **Data Models**
- **Exhibit Model**: Comprehensive exhibit data structure
- **Device Model**: Connected device information
- **Sync Status**: Synchronization state management

## 📱 Screens

### **Home Screen**
- Connection status display
- Quick action cards
- Statistics dashboard
- Recent exhibits
- Activity feed

### **QR Scanner Screen**
- Camera-based QR scanning
- Multiple QR code type support
- Real-time scan feedback

### **Exhibit Upload Screen**
- Form-based exhibit creation
- Image picker integration
- Category selection
- Location mapping

### **P2P Sync Screen**
- Device discovery
- Connection management
- Sync progress tracking
- Data transfer status

### **Settings Screen**
- App configuration
- Connection preferences
- Notification settings
- Data management

## 🚀 Getting Started

### **Prerequisites**
- Flutter SDK 3.4.0 or higher
- Android Studio / VS Code
- Android device or emulator
- USB debugging enabled

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobile-app
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Run the app**
   ```bash
   flutter run
   ```

### **Configuration**

1. **Permissions**: Grant camera, storage, and location permissions
2. **Network**: Ensure WiFi or mobile data is available
3. **Bluetooth**: Enable Bluetooth for P2P connections

## 🔧 Development

### **Project Structure**
```
lib/
├── main.dart                 # App entry point
├── models/                   # Data models
├── providers/                # State management
├── screens/                  # UI screens
├── services/                 # Business logic
├── utils/                    # Utilities and constants
└── widgets/                  # Reusable components
```

### **Key Dependencies**
- **provider**: State management
- **get_it**: Dependency injection
- **hive**: Local database
- **qr_code_scanner**: QR code scanning
- **nearby_connections**: P2P communication
- **flutter_local_notifications**: Push notifications
- **image_picker**: Image selection
- **connectivity_plus**: Network monitoring

### **Build Commands**
```bash
# Development build
flutter run

# Release build
flutter build apk --release

# Debug build
flutter build apk --debug
```

## 📊 Performance

### **Optimizations**
- **Lazy Loading**: Images and data loaded on demand
- **Caching**: Local storage for offline access
- **Compression**: Image compression for faster uploads
- **Background Processing**: Non-blocking operations

### **Memory Management**
- **Disposal**: Proper resource cleanup
- **Image Caching**: Efficient image memory usage
- **Stream Management**: Proper stream disposal

## 🔄 Integration

### **Backend Integration**
- **RESTful APIs**: Standard HTTP communication
- **WebSocket**: Real-time updates
- **File Upload**: Multipart form data
- **Authentication**: Token-based auth

### **Desktop App Integration**
- **QR Code Pairing**: Scan QR codes from desktop app
- **Data Synchronization**: Bidirectional sync
- **Shared Database**: Consistent data across platforms

## 🧪 Testing

### **Unit Tests**
```bash
flutter test
```

### **Widget Tests**
```bash
flutter test test/widget_test.dart
```

### **Integration Tests**
```bash
flutter drive --target=test_driver/app.dart
```

## 📈 Analytics

### **Usage Tracking**
- **Screen Views**: Track user navigation
- **Feature Usage**: Monitor feature adoption
- **Error Tracking**: Crash and error reporting
- **Performance Metrics**: App performance monitoring

## 🔮 Future Enhancements

### **Planned Features**
- **AI Integration**: Smart exhibit recommendations
- **AR Support**: Augmented reality exhibit viewing
- **Voice Commands**: Voice-controlled navigation
- **Offline Maps**: Indoor navigation
- **Multi-language**: Internationalization support

### **Technical Improvements**
- **Microservices**: Backend service decomposition
- **GraphQL**: Advanced data querying
- **Real-time Analytics**: Live usage analytics
- **Advanced Security**: Biometric authentication

## 🤝 Contributing

### **Development Guidelines**
1. Follow Flutter best practices
2. Write comprehensive tests
3. Document all new features
4. Maintain code quality standards
5. Use conventional commit messages

### **Code Style**
- **Dart**: Follow official Dart style guide
- **Flutter**: Use Flutter widget patterns
- **Architecture**: Follow clean architecture principles

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Flutter Team**: For the amazing framework
- **Material Design**: For the design system
- **Open Source Community**: For the excellent packages

---

**UCOST Discovery Hub Mobile App** - Revolutionizing museum management with cutting-edge mobile technology! 🚀 