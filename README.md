# Milk Delivery Tracking System

A comprehensive full-stack web application for managing daily milk deliveries with separate interfaces for users and administrators.

## Features

### User Features
- **Registration & Authentication**: Secure user registration with email and password
- **Milk Ordering**: Select from predefined milk quantities (250ml to 2L) with automatic price calculation
- **Delivery Scheduling**: Choose morning or evening delivery times
- **Order Management**: View, update, and cancel delivery orders
- **Monthly Statistics**: Track total milk received and amount spent
- **Payment Management**: View outstanding payments and make payments
- **Profile Management**: Update personal information and delivery address

### Admin Features
- **Dashboard**: Comprehensive overview with charts and statistics
- **User Management**: View all registered users
- **Delivery Management**: Monitor all deliveries with filtering options
- **Payment Tracking**: Track payment status and outstanding amounts
- **Milk Rate Management**: Update milk prices for different quantities
- **Analytics**: Visual charts for daily deliveries and payment status
- **Calendar View**: Daily delivery overview

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database with Sequelize ORM
- **JWT** authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation

### Frontend
- **React.js** with functional components and hooks
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Recharts** for data visualization
- **React Calendar** for calendar functionality
- **React Toastify** for notifications

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Backend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   - Copy `env.example` to `.env`
   - Update the following variables:
   ```
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=milk_delivery_db
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   ```

3. **Database Setup**:
   - Create a MySQL database named `milk_delivery_db`
   - The application will automatically create tables on first run

4. **Start the backend server**:
   ```bash
   npm run server
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

### Running Both Servers

From the root directory, you can run both servers simultaneously:
```bash
npm run dev
```

## Default Admin Credentials

- **Email**: admin@milkdelivery.com
- **Password**: admin123

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### User Routes
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/deliveries` - Get user's delivery history
- `GET /api/users/stats` - Get user's monthly statistics
- `GET /api/users/payments` - Get user's payment history

### Delivery Routes
- `GET /api/deliveries/options` - Get available milk options
- `POST /api/deliveries/order` - Place a delivery order
- `PUT /api/deliveries/:id` - Update a delivery order
- `DELETE /api/deliveries/:id` - Cancel a delivery order

### Payment Routes
- `POST /api/payments` - Create a payment record
- `GET /api/payments/outstanding` - Get outstanding payment amount

### Admin Routes
- `GET /api/admin/dashboard` - Get dashboard data
- `GET /api/admin/users` - Get all users
- `GET /api/admin/deliveries` - Get all deliveries
- `GET /api/admin/payments` - Get all payments
- `GET /api/admin/milk-rates` - Get all milk rates
- `POST /api/admin/milk-rates` - Create new milk rate
- `PUT /api/admin/milk-rates/:id` - Update milk rate

## Database Schema

### Tables
- **users**: User accounts (admin and regular users)
- **milk_rates**: Available milk quantities and prices
- **milk_deliveries**: Delivery orders and history
- **payments**: Payment records and status

### Default Data
The system automatically initializes with:
- Default admin user
- Predefined milk rates (250ml to 2L)
- Sample data for testing

## Features in Detail

### User Dashboard
- **Order Placement**: Easy-to-use form for placing milk orders
- **Calendar Integration**: Visual calendar showing delivery dates
- **Statistics Cards**: Monthly totals for milk and spending
- **Order History**: Table view of recent deliveries with cancel option

### Admin Dashboard
- **Analytics Charts**: Bar charts for daily deliveries, pie charts for payment status
- **User Management**: Complete user list with registration dates
- **Delivery Monitoring**: All deliveries with user information
- **Payment Tracking**: Payment status and outstanding amounts
- **Rate Management**: Update milk prices with real-time updates

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- Protected routes for admin and user areas

## Development

### Project Structure
```
milk-delivery-tracking/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── MilkRate.js
│   │   ├── MilkDelivery.js
│   │   ├── Payment.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── deliveries.js
│   │   ├── payments.js
│   │   └── admin.js
│   ├── seeders/
│   │   └── initData.js
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.


