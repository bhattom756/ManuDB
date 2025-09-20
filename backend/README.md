# Manufacturing Management System - Backend API

A comprehensive backend API for managing manufacturing operations, work orders, bills of materials, stock ledger, and more.

## 🚀 Features

- **User Management**: Authentication, authorization, and profile management
- **Product Management**: CRUD operations for products with different types
- **Bill of Materials (BOM)**: Create and manage BOMs with components
- **Manufacturing Orders**: Complete manufacturing order lifecycle management
- **Work Orders**: Work order creation, assignment, and tracking
- **Work Centers**: Work center management and utilization tracking
- **Stock Ledger**: Inventory tracking and stock movements
- **Dashboard**: Summary statistics and analytics

## 🛠️ Tech Stack

- **Node.js** with Express.js
- **PostgreSQL** database
- **Prisma** ORM
- **JWT** authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **helmet** for security
- **morgan** for logging

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/manufacturing_db?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="24h"
   PORT=5000
   NODE_ENV="development"
   CORS_ORIGIN="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # (Optional) Open Prisma Studio to view data
   npx prisma studio
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /change-password` - Change password
- `POST /logout` - Logout

#### Manufacturing Orders (`/api/manufacturing-orders`)
- `GET /` - Get all manufacturing orders
- `GET /:id` - Get manufacturing order by ID
- `POST /` - Create new manufacturing order
- `PUT /:id` - Update manufacturing order
- `PATCH /:id/status` - Update manufacturing order status
- `DELETE /:id` - Delete manufacturing order
- `GET /dashboard/summary` - Get dashboard summary

#### Products (`/api/products`)
- `GET /` - Get all products
- `GET /:id` - Get product by ID
- `GET /:id/stock` - Get product stock
- `POST /` - Create new product
- `PUT /:id` - Update product
- `DELETE /:id` - Delete product
- `GET /meta/types` - Get product types
- `GET /meta/units` - Get units of measure

#### Bills of Materials (`/api/boms`)
- `GET /` - Get all BOMs
- `GET /:id` - Get BOM by ID
- `GET /product/:productId` - Get BOM by product ID
- `GET /:id/cost` - Calculate BOM cost
- `POST /` - Create new BOM
- `PUT /:id` - Update BOM
- `DELETE /:id` - Delete BOM
- `POST /:bomId/components` - Add BOM component
- `PUT /components/:componentId` - Update BOM component
- `DELETE /components/:componentId` - Delete BOM component

#### Work Orders (`/api/work-orders`)
- `GET /` - Get all work orders
- `GET /:id` - Get work order by ID
- `GET /analysis/reports` - Get work order analysis
- `POST /` - Create new work order
- `PUT /:id` - Update work order
- `PATCH /:id/status` - Update work order status
- `DELETE /:id` - Delete work order
- `GET /meta/statuses` - Get work order statuses

#### Work Centers (`/api/work-centers`)
- `GET /` - Get all work centers
- `GET /:id` - Get work center by ID
- `GET /:id/utilization` - Get work center utilization
- `POST /` - Create new work center
- `PUT /:id` - Update work center
- `PATCH /:id/status` - Update work center status
- `DELETE /:id` - Delete work center
- `GET /meta/statuses` - Get work center statuses
- `GET /meta/stats` - Get work center statistics

#### Stock Ledger (`/api/stock-ledger`)
- `GET /` - Get all stock ledger entries
- `GET /stocks` - Get all product stocks
- `GET /summary` - Get stock summary
- `GET /:id` - Get stock ledger entry by ID
- `GET /product/:id/stock` - Get product stock
- `GET /product/:id/movements` - Get stock movements
- `POST /` - Create stock transaction
- `POST /product/:id/adjust` - Adjust stock
- `PUT /:id` - Update stock transaction
- `DELETE /:id` - Delete stock transaction
- `GET /meta/transaction-types` - Get transaction types

## 🔐 User Roles

- **ADMIN**: Full system access
- **MANAGER**: Management operations
- **OPERATOR**: Basic operations
- **INVENTORY_MANAGER**: Inventory management
- **OWNER**: System owner

## 📊 Database Schema

The system uses the following main entities:

- **Users**: System users with role-based access
- **Products**: Raw materials, semi-finished, and finished goods
- **BOMs**: Bills of materials with components
- **Manufacturing Orders**: Production orders
- **Work Orders**: Individual work operations
- **Work Centers**: Production work centers
- **Stock Ledger**: Inventory transactions

## 🧪 Testing

```bash
# Run the server
npm run dev

# Test health endpoint
curl http://localhost:5000/api/health

# Test authentication
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"admin","name":"Admin User","email":"admin@example.com","password":"password123","role":"ADMIN"}'
```

## 🚀 Deployment

1. Set `NODE_ENV=production`
2. Update database URL for production
3. Set secure JWT secret
4. Configure CORS for production domain
5. Run `npm start`

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team.
