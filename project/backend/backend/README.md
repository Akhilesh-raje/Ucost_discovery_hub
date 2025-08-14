# UCost Discovery Hub - Backend API

Backend API for the UCost Discovery Hub science museum kiosk system.

## 🚀 Features

- **Exhibit Management**: CRUD operations for science exhibits
- **User Profiles**: Visitor onboarding and preferences
- **Tour System**: Personalized exhibit tours
- **Admin Panel**: Secure admin authentication and management
- **Analytics**: Visitor tracking and statistics
- **File Upload**: Image upload for exhibits
- **Map Integration**: Floor-based exhibit placement

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer
- **Security**: Helmet, CORS
- **Logging**: Morgan

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp env.example .env
```

Update the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/ucost_db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# Frontend URL
FRONTEND_URL=http://localhost:8080
```

### 3. Database Setup

Generate Prisma client:
```bash
npm run db:generate
```

Push database schema:
```bash
npm run db:push
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Exhibits
- `GET /api/exhibits` - List all exhibits
- `GET /api/exhibits/:id` - Get exhibit details
- `POST /api/exhibits` - Create new exhibit (admin)
- `PUT /api/exhibits/:id` - Update exhibit (admin)
- `DELETE /api/exhibits/:id` - Delete exhibit (admin)

### Users
- `POST /api/users/profile` - Save user profile
- `GET /api/users/profile/:email` - Get user profile
- `GET /api/users/:userId/tours` - Get user tours

### Tours
- `POST /api/tours` - Create tour
- `GET /api/tours/:id` - Get tour details
- `PUT /api/tours/:id` - Update tour
- `DELETE /api/tours/:id` - Delete tour
- `POST /api/tours/:id/exhibits` - Add exhibit to tour
- `DELETE /api/tours/:id/exhibits/:exhibitId` - Remove exhibit from tour

### Analytics
- `POST /api/analytics/track` - Track visitor activity
- `GET /api/analytics/visitors` - Get visitor statistics
- `GET /api/analytics/popular-exhibits` - Get popular exhibits
- `GET /api/analytics/page-stats` - Get page visit statistics
- `GET /api/analytics/daily-trends` - Get daily visitor trends

## 🗄️ Database Schema

### Core Models
- **User**: Visitor profiles and preferences
- **AdminUser**: System administrators
- **Exhibit**: Science exhibits with metadata
- **Tour**: User-created exhibit collections
- **TourExhibit**: Junction table for tour-exhibit relationships
- **VisitorAnalytics**: Visitor activity tracking

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Security headers with Helmet
- File upload validation
- Input sanitization

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── app.ts           # Main application
├── prisma/
│   └── schema.prisma    # Database schema
├── uploads/             # File storage
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Ensure all required environment variables are set in production.

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Write clear documentation
5. Test all endpoints

## 📞 Support

For questions or issues, contact the UCost development team.

---

**UCost Discovery Hub Backend** - Powering the future of interactive science education 