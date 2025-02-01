# Notify Them Backend
# User Management and Notification System

A robust Node.js backend service built with Express and TypeScript that handles user management, authentication, and a sophisticated notification delivery system with user availability preferences.

## 🚀 Features

### Authentication
- User registration with role-based access (admin/user)
- Secure login with JWT token generation
- Cookie-based authentication
- Protected route middleware
- Secure logout mechanism
- Availablity based notification using Bull

### User Management
- Complete user profile management
- Availability time settings
- Password hashing with bcrypt
- Email validation
- Mobile number validation
- Customizable user bio

### Notification System
- Support for critical and non-critical notifications
- Smart delivery based on user availability
- Redis-backed notification queue
- Notification retry mechanism with exponential backoff
- Real-time delivery status tracking
- Bulk notification support

## 🛠 Technical Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Queue**: Bull (Redis-backed)
- **Authentication**: JWT
- **Security**: 
  - Helmet for HTTP headers
  - CORS protection
  - Cookie security
  - Request rate limiting

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Redis (v6 or higher)
- TypeScript (v4.5 or higher)

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/devansh-dek/Reeltor-backend-assignment
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/user-management
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key
COOKIE_SECRET=your-cookie-secret
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
COOKIE_EXPIRES=24
```

4. Build the project:
```bash
npm run build
```

5. Start the server:
```bash
npm start
```

## 🌟 API Endpoints

### Authentication Routes
```
POST /auth/register - Register a new user
POST /auth/login - Login user
GET /auth/logout - Logout user (protected)
```

### User Routes
```
PUT /users/profile - Update user profile (protected)
```

### Notification Routes
```
POST /api/notifications - Create notification (admin only)
GET /api/notifications - Get user notifications (protected)
```

## 📝 API Documentation

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securePass123!",
    "name": "John Doe",
    "mobileNumber": "+1234567890",
    "bio": "User bio",
    "availabilityTime": [
        {
            "start": "09:00",
            "end": "17:00"
        }
    ]
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securePass123!"
}
```

### User Management

#### Update Profile
```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
    "name": "Updated Name",
    "mobileNumber": "+1987654321",
    "bio": "Updated bio",
    "availabilityTime": [
        {
            "start": "10:00",
            "end": "18:00"
        }
    ]
}
```

### Notifications

#### Create Notification (Admin Only)
```http
POST /api/notifications
Authorization: Bearer <token>
Content-Type: application/json

{
    "recipientIds": ["userId1", "userId2"],
    "message": "Important notification",
    "type": "critical"  // or "non-critical"
}
```

## 🔒 Security Features

1. **Password Security**
   - Passwords are hashed using bcrypt
   - Minimum length requirement
   - Password strength validation

2. **JWT Security**
   - Token expiration
   - Secure cookie storage
   - HTTP-only cookies
   - Signed cookies

3. **API Security**
   - Helmet middleware for HTTP headers
   - CORS protection
   - Request rate limiting
   - Input validation
   - Error handling middleware

## 🚦 Error Handling

The application implements a centralized error handling system with custom error classes:
- `AppError`: Base error class
- `ValidationError`: For input validation errors
- `AuthenticationError`: For auth-related errors
- `AuthorizationError`: For permission-related errors
- `NotFoundError`: For resource not found errors

## 💡 Smart Notification System

The notification system implements a sophisticated delivery mechanism:

1. **Delivery Types**
   - Critical: Delivered immediately
   - Non-critical: Delivered based on user availability

2. **Queue Management**
   - Redis-backed Bull queue
   - Automatic retries with exponential backoff
   - Failed job handling
   - Job cleanup mechanism

3. **Availability Management**
   - User-defined availability windows
   - Smart scheduling based on time zones
   - Next available time calculation

## 🧪 Testing

1. Install dependencies:
```bash
npm install --save-dev jest @types/jest supertest
```

2. Run tests:
```bash
npm test
```

## 🔄 Database Migrations

The project uses Mongoose schemas with automatic indexes creation. For production deployments, ensure indexes are created:

```bash
npm run create-indexes
```

## 📈 Monitoring

The application includes basic monitoring endpoints:
- `/health` - Basic health check
- Error logging with stack traces
- Queue monitoring through Bull

## 🚀 Deployment

1. Build the project:
```bash
npm run build
```

2. Set production environment variables:
```bash
NODE_ENV=production
```

3. Start the server:
```bash
npm start
```

## 📖 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

