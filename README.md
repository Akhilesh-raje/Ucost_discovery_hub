# UCOST Discovery Hub

**Museum Exhibit Management System by Uttarakhand Science and Technology Council**

A comprehensive, decentralized museum management system with AI-powered recommendations, P2P synchronization, and multi-platform support.

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm 9+
- Flutter SDK (for mobile development)
- Git

### **Installation**
```bash
# Clone the repository
git clone https://github.com/ucost/uc-discovery-hub.git
cd uc-discovery-hub

# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

### **Available Commands**
```bash
# Development
npm run dev              # Start backend + frontend
npm run dev:desktop      # Start desktop app
npm run dev:mobile       # Start mobile app
npm run dev:ai           # Start AI system

# Building
npm run build            # Build all components
npm run build:backend    # Build backend only
npm run build:frontend   # Build frontend only
npm run build:desktop    # Build desktop app

# Testing
npm run test             # Run all tests
npm run test:backend     # Test backend
npm run test:frontend    # Test frontend

# Production
npm run package          # Create desktop package
npm run create-exe       # Create Windows executable
```

## 🏗️ **Project Structure**

```
ucost-discovery-hub/
├── 📁 project/                    # Main application components
│   ├── 📁 backend/               # Express.js API server
│   ├── 📁 frontend/              # React web application
│   ├── 📁 mobile-app/            # Flutter mobile app
│   ├── 📁 ai-system/             # AI components
│   ├── 📁 p2p-sync/              # P2P synchronization
│   └── 📁 shared/                # Shared utilities
│
├── 📁 desktop/                    # Desktop application
│   ├── 📁 electron/              # Electron main process
│   ├── 📁 assets/                # Desktop assets
│   └── package.json              # Desktop dependencies
│
├── 📁 docs/                       # Documentation
│   ├── 📁 api/                   # API documentation
│   ├── 📁 deployment/            # Deployment guides
│   ├── 📁 development/           # Development guides
│   └── 📁 user-guide/            # User documentation
│
├── 📁 scripts/                    # Build and utility scripts
│   ├── 📁 build/                 # Build scripts
│   ├── 📁 deploy/                # Deployment scripts
│   └── 📁 dev/                   # Development scripts
│
└── 📁 tests/                      # Test suites
    ├── 📁 unit/                  # Unit tests
    ├── 📁 integration/           # Integration tests
    └── 📁 e2e/                   # End-to-end tests
```

## 🎯 **Core Features**

### **Museum Management**
- 📊 **Exhibit Management**: Upload, categorize, and display exhibits
- 🗺️ **Interactive Maps**: Multi-floor museum navigation
- 🎨 **Tour Creation**: AI-optimized tour planning
- 📈 **Analytics Dashboard**: Visitor statistics and insights
- 👥 **Admin Panel**: Complete management interface

### **AI-Powered System**
- 🧠 **User Profiling**: Intelligent visitor analysis
- 🎯 **Exhibit Matching**: Smart recommendation engine
- 🚀 **Tour Optimization**: Genetic algorithm-based planning
- 📊 **Analytics Engine**: Comprehensive data analysis

### **Multi-Platform Support**
- 🖥️ **Desktop Application**: Native Windows executable
- 📱 **Mobile Application**: Flutter-based Android/iOS app
- 🌐 **Web Application**: Browser-based interface
- 🔗 **P2P Sync**: Device-to-device synchronization

## 🔧 **Development**

### **Backend Development**
```bash
cd project/backend
npm run dev          # Start development server
npm run build        # Build for production
npm test             # Run tests
```

### **Frontend Development**
```bash
cd project/frontend
npm run dev          # Start development server
npm run build        # Build for production
npm test             # Run tests
```

### **Mobile Development**
```bash
cd project/mobile-app
flutter run          # Run on connected device
flutter build apk    # Build Android APK
flutter build ios    # Build iOS app
```

### **AI System Development**
```bash
cd project/ai-system
npm run dev          # Start AI development server
npm run build        # Build AI components
npm test             # Test AI algorithms
```

## 🚀 **Deployment**

### **Desktop Application**
```bash
# Create Windows executable
npm run create-exe

# Install from generated file
UCOST-Discovery-Hub-Setup-1.0.0.exe
```

### **Web Application**
```bash
# Build for production
npm run build

# Deploy to server
npm run deploy
```

### **Mobile Application**
```bash
# Build APK for Android
cd project/mobile-app
flutter build apk --release

# Build for iOS
flutter build ios --release
```

## 🔐 **Security Features**

- **Time-based Authentication**: Dynamic secret codes
- **End-to-End Encryption**: Secure P2P data transmission
- **Device Verification**: Software-only connections
- **Credential Management**: Custom authentication system

## 📊 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - Admin login
- `POST /api/auth/verify-secret-code` - Time-based verification
- `POST /api/auth/verify-ucost` - Software verification

### **Exhibits**
- `GET /api/exhibits` - List all exhibits
- `POST /api/exhibits` - Upload new exhibit
- `PUT /api/exhibits/:id` - Update exhibit
- `DELETE /api/exhibits/:id` - Remove exhibit

### **Tours**
- `GET /api/tours` - List all tours
- `POST /api/tours` - Create new tour
- `GET /api/tours/:id` - Get tour details

### **Analytics**
- `GET /api/analytics` - Visitor statistics
- `GET /api/analytics/popular` - Popular exhibits
- `GET /api/analytics/tours` - Tour usage data

## 🧪 **Testing**

### **Run All Tests**
```bash
npm run test
```

### **Component-Specific Testing**
```bash
npm run test:backend    # Backend tests
npm run test:frontend   # Frontend tests
npm run test:ai         # AI system tests
```

### **Manual Testing**
1. **Desktop App**: Install and run the .exe file
2. **P2P Sync**: Enable sync and test device discovery
3. **Authentication**: Test time-based secret codes
4. **Exhibit Management**: Upload and manage exhibits

## 📈 **Performance**

### **System Requirements**
- **Desktop**: Windows 10/11, 4GB RAM, 500MB storage
- **Mobile**: Android 8+ / iOS 12+, 2GB RAM
- **Web**: Modern browser with JavaScript enabled

### **Optimization Features**
- ✅ **Code Splitting**: Lazy-loaded components
- ✅ **Database Indexing**: Optimized queries
- ✅ **Caching**: Redis for session management
- ✅ **Compression**: Gzip for API responses

## 🤝 **Contributing**

### **Development Workflow**
1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Submit** pull request

### **Code Standards**
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent formatting
- **Jest**: Unit testing framework

## 📄 **License**

**MIT License** - See [LICENSE](LICENSE) file for details

## 👥 **Team**

**Uttarakhand Science and Technology Council**
- **Project Lead**: Development Team
- **AI System**: Custom machine learning algorithms
- **P2P Architecture**: Decentralized synchronization
- **Multi-Platform**: Desktop, mobile, and web applications

## 📞 **Support**

### **Documentation**
- **User Guide**: [docs/user-guide/](docs/user-guide/)
- **API Reference**: [docs/api/](docs/api/)
- **Development Guide**: [docs/development/](docs/development/)
- **Deployment Guide**: [docs/deployment/](docs/deployment/)

### **Contact**
- **Email**: support@ucost.uk.gov.in
- **Website**: https://ucost.uk.gov.in
- **Documentation**: https://github.com/ucost/uc-discovery-hub

---

**🎉 UCOST Discovery Hub - Empowering museums with intelligent, decentralized technology!** 