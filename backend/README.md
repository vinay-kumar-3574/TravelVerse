# TravelVerse Backend

A comprehensive Node.js backend for the TravelVerse AI-powered travel assistant application.

## 🚀 Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Trip Management**: Complete CRUD operations for travel planning
- **Transport Bookings**: Flight, train, and bus booking management
- **Hotel Bookings**: Accommodation booking and management
- **Payment Processing**: Payment handling and refund management
- **Family Member Management**: Support for family travel planning
- **Comprehensive Dashboard**: Analytics and statistics for users
- **RESTful API**: Well-structured API endpoints following REST principles
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Error Handling**: Centralized error handling with custom error classes

## 🏗️ Architecture

```
backend/
├── src/
│   ├── models/          # Mongoose schemas and models
│   ├── routes/          # API route definitions
│   ├── middleware/      # Custom middleware functions
│   ├── controllers/     # Business logic controllers
│   └── server.js        # Main server file
├── package.json         # Dependencies and scripts
├── env.example          # Environment variables template
└── README.md           # This file
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Joi for input validation
- **Password Hashing**: bcryptjs
- **Logging**: Morgan
- **Compression**: Compression middleware

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TravelVerse-main/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/travelverse
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `POST /change-password` - Change password
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `POST /logout` - User logout
- `POST /refresh-token` - Refresh JWT token

### Users (`/api/users`)
- `GET /` - Get all users (admin only)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user by ID
- `DELETE /:id` - Delete user (admin only)
- `GET /:id/family-members` - Get family members
- `POST /:id/family-members` - Add family member
- `PUT /:id/family-members/:memberId` - Update family member
- `DELETE /:id/family-members/:memberId` - Delete family member

### Trips (`/api/trips`)
- `GET /` - Get all trips with filtering and pagination
- `GET /:id` - Get trip by ID
- `POST /` - Create new trip
- `PUT /:id` - Update trip
- `DELETE /:id` - Delete trip
- `GET /:id/expenses` - Get trip expenses
- `POST /:id/expenses` - Add expense to trip
- `PUT /:id/expenses/:expenseId` - Update expense
- `DELETE /:id/expenses/:expenseId` - Delete expense
- `GET /:id/itinerary` - Get trip itinerary
- `POST /:id/itinerary` - Add itinerary item
- `PUT /:id/itinerary/:itemId` - Update itinerary item
- `DELETE /:id/itinerary/:itemId` - Delete itinerary item
- `GET /stats/overview` - Get trip statistics

### Transport (`/api/transport`)
- `GET /` - Get transport bookings
- `GET /:id` - Get transport booking by ID
- `POST /` - Create transport booking
- `PUT /:id` - Update transport booking
- `PATCH /:id/cancel` - Cancel transport booking
- `DELETE /:id` - Delete transport booking
- `GET /search/options` - Search transport options
- `GET /stats/overview` - Get transport statistics

### Hotels (`/api/hotels`)
- `GET /` - Get hotel bookings
- `GET /:id` - Get hotel booking by ID
- `POST /` - Create hotel booking
- `PUT /:id` - Update hotel booking
- `PATCH /:id/cancel` - Cancel hotel booking
- `DELETE /:id` - Delete hotel booking
- `GET /search/options` - Search hotel options
- `GET /stats/overview` - Get hotel statistics
- `GET /amenities/list` - Get available amenities

### Bookings (`/api/bookings`)
- `GET /` - Get all bookings (combined)
- `GET /:id` - Get booking by ID
- `PATCH /:id/cancel` - Cancel booking
- `GET /stats/overview` - Get booking statistics
- `GET /recent/list` - Get recent bookings

### Payments (`/api/payments`)
- `GET /` - Get payment history
- `GET /:id` - Get payment details
- `POST /process` - Process payment
- `POST /:id/refund` - Request refund
- `GET /stats/overview` - Get payment statistics
- `GET /methods/available` - Get available payment methods

### Dashboard (`/api/dashboard`)
- `GET /overview` - Get comprehensive dashboard data
- `GET /charts` - Get chart data for analytics
- `GET /quick-actions` - Get available quick actions
- `GET /notifications` - Get user notifications

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for Express
- **Input Validation**: Joi schema validation
- **Role-based Access Control**: Different permission levels for users

## 📊 Database Models

### User
- Basic profile information
- Authentication details
- Travel preferences
- Emergency contacts

### Trip
- Trip details and planning
- Budget tracking
- Itinerary management
- Expense tracking

### TransportBooking
- Flight, train, bus bookings
- Passenger information
- Pricing and payment status
- Cancellation handling

### HotelBooking
- Hotel reservations
- Room and guest details
- Amenities and pricing
- Check-in/check-out management

### FamilyMember
- Family member profiles
- Travel documents
- Special requirements
- Relationship tracking

## 🚀 Development

### Scripts
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests
```

### Environment Variables
See `env.example` for all required environment variables.

### Database Connection
The application automatically connects to MongoDB on startup. Ensure MongoDB is running and accessible.

## 🔧 Configuration

### MongoDB Connection
```javascript
// Default connection string
MONGODB_URI=mongodb://localhost:27017/travelverse

// Production connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/travelverse
```

### JWT Configuration
```javascript
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d
```

### Server Configuration
```javascript
PORT=5000
NODE_ENV=development
```

## 📝 Error Handling

The application includes comprehensive error handling:

- **AppError Class**: Custom error class for application errors
- **Global Error Handler**: Centralized error processing
- **Async Handler**: Wrapper for async route handlers
- **Validation Errors**: Mongoose validation error handling
- **JWT Errors**: Token validation error handling

## 🧪 Testing

```bash
npm test
```

## 📦 Production Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set strong JWT secret
4. Enable HTTPS in production
5. Configure proper CORS settings
6. Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

## 🔮 Future Enhancements

- AI-powered travel recommendations
- Real-time notifications
- Payment gateway integration
- Email service integration
- File upload for documents
- Advanced analytics and reporting
- Multi-language support
- Mobile app API endpoints
