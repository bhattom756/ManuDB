# Manufacturing Management System - Complete API Endpoints Guide

## 🔗 Base URL
```
http://localhost:5000/api
```

## 🔐 Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "userId": "admin",
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "mobileNo": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "pinCode": "10001",
  "role": "ADMIN"
}
```

**Required Fields:**
- `userId` (string): Unique user identifier
- `name` (string): Full name
- `email` (string): Valid email address
- `password` (string): Minimum 6 characters

**Optional Fields:**
- `mobileNo` (string): Phone number
- `address` (string): Street address
- `city` (string): City name
- `state` (string): State/Province
- `country` (string): Country name
- `pinCode` (string): Postal/ZIP code
- `role` (enum): ADMIN, MANAGER, OPERATOR, INVENTORY_MANAGER, OWNER (default: OPERATOR)

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "userId": "admin",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2025-09-20T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.2 Login User
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "userId": "admin",
  "password": "password123"
}
```

**Required Fields:**
- `userId` (string): User ID or email
- `password` (string): User password

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "userId": "admin",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.3 Get User Profile
**GET** `/api/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": "admin",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

### 1.4 Update User Profile
**PUT** `/api/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "mobileNo": "+1234567890",
  "address": "456 New St",
  "city": "Boston",
  "state": "MA",
  "country": "USA",
  "pinCode": "02101"
}
```

### 1.5 Change Password
**POST** `/api/auth/change-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

### 1.6 Logout
**POST** `/api/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

---

## 2. Manufacturing Orders (`/api/manufacturing-orders`)

### 2.1 Get All Manufacturing Orders
**GET** `/api/manufacturing-orders`

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search by MO number or product name
- `status` (string, optional): Filter by status (DRAFT, CONFIRMED, IN_PROGRESS, TO_CLOSE, CLOSED, CANCELLED, DELETED)
- `assigneeId` (number, optional): Filter by assignee ID
- `startDate` (string, optional): Filter by start date (ISO 8601)
- `endDate` (string, optional): Filter by end date (ISO 8601)

**Example:**
```
GET /api/manufacturing-orders?page=1&limit=10&status=IN_PROGRESS&search=MO2025
```

**Response:**
```json
{
  "success": true,
  "data": {
    "manufacturingOrders": [
      {
        "id": 1,
        "moNumber": "MO20250920001",
        "finishedProduct": {
          "id": 1,
          "name": "Finished Product A",
          "type": "FINISHED_GOOD"
        },
        "quantity": 100,
        "scheduleDate": "2025-09-25T00:00:00.000Z",
        "status": "IN_PROGRESS",
        "assignee": {
          "id": 1,
          "userId": "admin",
          "name": "Admin User"
        },
        "workOrders": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### 2.2 Get Manufacturing Order by ID
**GET** `/api/manufacturing-orders/:id`

**Path Parameters:**
- `id` (number): Manufacturing order ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "moNumber": "MO20250920001",
    "finishedProduct": {...},
    "billOfMaterial": {
      "id": 1,
      "reference": "BOM001",
      "components": [...]
    },
    "workOrders": [...],
    "assignee": {...}
  }
}
```

### 2.3 Create Manufacturing Order
**POST** `/api/manufacturing-orders`

**Required Role:** ADMIN, MANAGER, OPERATOR

**Request Body:**
```json
{
  "finishedProductId": 1,
  "quantity": 100,
  "scheduleDate": "2025-09-25T00:00:00.000Z",
  "startDate": "2025-09-20T00:00:00.000Z",
  "endDate": "2025-09-30T00:00:00.000Z",
  "billOfMaterialId": 1,
  "assigneeId": 1
}
```

**Required Fields:**
- `finishedProductId` (number): ID of the finished product
- `quantity` (number): Quantity to manufacture
- `scheduleDate` (string): Scheduled date (ISO 8601)

**Optional Fields:**
- `startDate` (string): Start date (ISO 8601)
- `endDate` (string): End date (ISO 8601)
- `billOfMaterialId` (number): BOM ID to use
- `assigneeId` (number): User ID to assign to

### 2.4 Update Manufacturing Order
**PUT** `/api/manufacturing-orders/:id`

**Request Body:** (Same as create, all fields optional)

### 2.5 Update Manufacturing Order Status
**PATCH** `/api/manufacturing-orders/:id/status`

**Request Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

**Valid Statuses:**
- DRAFT, CONFIRMED, IN_PROGRESS, TO_CLOSE, CLOSED, CANCELLED, DELETED

### 2.6 Delete Manufacturing Order
**DELETE** `/api/manufacturing-orders/:id`

**Required Role:** ADMIN, MANAGER
**Note:** Only DRAFT status orders can be deleted

### 2.7 Get Dashboard Summary
**GET** `/api/manufacturing-orders/dashboard/summary`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalManufacturingOrders": 25,
    "totalWorkOrders": 150,
    "totalProducts": 50,
    "totalBOMs": 30,
    "totalWorkCenters": 5,
    "totalStockLedger": 200
  }
}
```

---

## 3. Products (`/api/products`)

### 3.1 Get All Products
**GET** `/api/products`

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search by name or description
- `type` (string, optional): Filter by type (FINISHED_GOOD, RAW_MATERIAL, SEMI_FINISHED)
- `sortBy` (string, optional): Sort field (default: name)
- `sortOrder` (string, optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Product A",
        "description": "Description here",
        "type": "FINISHED_GOOD",
        "unitOfMeasure": "PCS",
        "unitCost": 10.50,
        "_count": {
          "bomComponents": 5,
          "stockLedger": 20,
          "manufacturingOrders": 3
        }
      }
    ],
    "pagination": {...}
  }
}
```

### 3.2 Get Product by ID
**GET** `/api/products/:id`

**Response includes:**
- Product details
- BOM components
- Recent stock ledger entries
- Recent manufacturing orders

### 3.3 Get Product Stock
**GET** `/api/products/:id/stock`

**Response:**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "name": "Product A",
      "unitOfMeasure": "PCS",
      "unitCost": 10.50
    },
    "currentStock": 150,
    "stockHistory": [...]
  }
}
```

### 3.3 Create Product
**POST** `/api/products`

**Required Role:** ADMIN, MANAGER, INVENTORY_MANAGER

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "type": "FINISHED_GOOD",
  "unitOfMeasure": "PCS",
  "unitCost": 15.75
}
```

**Required Fields:**
- `name` (string): Product name
- `type` (enum): FINISHED_GOOD, RAW_MATERIAL, SEMI_FINISHED
- `unitOfMeasure` (string): Unit of measurement

**Optional Fields:**
- `description` (string): Product description
- `unitCost` (number): Unit cost

### 3.4 Update Product
**PUT** `/api/products/:id`

**Request Body:** (Same as create, all fields optional)

### 3.5 Delete Product
**DELETE** `/api/products/:id`

**Required Role:** ADMIN, MANAGER
**Note:** Cannot delete if used in BOMs, stock ledger, or manufacturing orders

### 3.6 Get Product Types
**GET** `/api/products/meta/types`

**Response:**
```json
{
  "success": true,
  "data": ["FINISHED_GOOD", "RAW_MATERIAL", "SEMI_FINISHED"]
}
```

### 3.7 Get Units of Measure
**GET** `/api/products/meta/units`

**Response:**
```json
{
  "success": true,
  "data": ["PCS", "KG", "G", "L", "ML", "M", "CM", "MM", "M2", "M3", "BOX", "CARTON", "PALLET", "ROLL", "SET", "PAIR", "DOZEN"]
}
```

---

## 4. Bills of Materials (`/api/boms`)

### 4.1 Get All BOMs
**GET** `/api/boms`

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `search` (string, optional): Search by reference or product name
- `productId` (number, optional): Filter by product ID
- `isActive` (boolean, optional): Filter by active status

### 4.2 Get BOM by ID
**GET** `/api/boms/:id`

### 4.3 Get BOM by Product ID
**GET** `/api/boms/product/:productId`

### 4.4 Calculate BOM Cost
**GET** `/api/boms/:id/cost`

**Response:**
```json
{
  "success": true,
  "data": {
    "bom": {...},
    "componentCosts": [...],
    "totalCost": 125.50
  }
}
```

### 4.5 Create BOM
**POST** `/api/boms`

**Required Role:** ADMIN, MANAGER, INVENTORY_MANAGER

**Request Body:**
```json
{
  "productId": 1,
  "reference": "BOM001",
  "version": "1.0",
  "components": [
    {
      "productId": 2,
      "quantity": 2,
      "unit": "PCS",
      "cost": 5.50
    },
    {
      "productId": 3,
      "quantity": 1,
      "unit": "KG",
      "cost": 10.00
    }
  ]
}
```

**Required Fields:**
- `productId` (number): Product ID

**Optional Fields:**
- `reference` (string): BOM reference
- `version` (string): BOM version (default: 1.0)
- `components` (array): Array of BOM components

### 4.6 Update BOM
**PUT** `/api/boms/:id`

### 4.7 Delete BOM
**DELETE** `/api/boms/:id`

**Required Role:** ADMIN, MANAGER

### 4.8 Add BOM Component
**POST** `/api/boms/:bomId/components`

**Request Body:**
```json
{
  "productId": 2,
  "quantity": 2,
  "unit": "PCS",
  "cost": 5.50
}
```

### 4.9 Update BOM Component
**PUT** `/api/boms/components/:componentId`

### 4.10 Delete BOM Component
**DELETE** `/api/boms/components/:componentId`

**Required Role:** ADMIN, MANAGER

---

## 5. Work Orders (`/api/work-orders`)

### 5.1 Get All Work Orders
**GET** `/api/work-orders`

**Query Parameters:**
- `page`, `limit`: Pagination
- `search` (string): Search by operation, work center, or product
- `status` (string): Filter by status (PLANNED, STARTED, PAUSED, COMPLETED, CANCELLED)
- `workCenterId` (number): Filter by work center
- `moId` (number): Filter by manufacturing order
- `assignedToId` (number): Filter by assigned user
- `operation` (string): Filter by operation name
- `workCenter` (string): Filter by work center name
- `product` (string): Filter by product name

### 5.2 Get Work Order by ID
**GET** `/api/work-orders/:id`

### 5.3 Get Work Order Analysis
**GET** `/api/work-orders/analysis/reports`

**Query Parameters:**
- `startDate` (string): Analysis start date
- `endDate` (string): Analysis end date
- `workCenterId` (number): Filter by work center
- `assignedToId` (number): Filter by assigned user

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "totalWorkOrders": 50,
      "totalExpectedDuration": 2400,
      "totalRealDuration": 2200,
      "statusBreakdown": {
        "COMPLETED": 30,
        "IN_PROGRESS": 15,
        "PLANNED": 5
      },
      "workCenterBreakdown": {...},
      "efficiency": 92
    },
    "workOrders": [...]
  }
}
```

### 5.4 Get Work Order Statuses
**GET** `/api/work-orders/meta/statuses`

### 5.5 Create Work Order
**POST** `/api/work-orders`

**Required Role:** ADMIN, MANAGER, OPERATOR

**Request Body:**
```json
{
  "moId": 1,
  "workCenterId": 1,
  "operationName": "Assembly",
  "expectedDuration": 120,
  "assignedToId": 1
}
```

**Required Fields:**
- `moId` (number): Manufacturing order ID
- `workCenterId` (number): Work center ID
- `operationName` (string): Operation name
- `expectedDuration` (number): Duration in minutes

**Optional Fields:**
- `assignedToId` (number): User ID to assign to

### 5.6 Update Work Order
**PUT** `/api/work-orders/:id`

### 5.7 Update Work Order Status
**PATCH** `/api/work-orders/:id/status`

**Request Body:**
```json
{
  "status": "STARTED"
}
```

### 5.8 Delete Work Order
**DELETE** `/api/work-orders/:id`

**Required Role:** ADMIN, MANAGER
**Note:** Only PLANNED status work orders can be deleted

---

## 6. Work Centers (`/api/work-centers`)

### 6.1 Get All Work Centers
**GET** `/api/work-centers`

**Query Parameters:**
- `page`, `limit`: Pagination
- `search` (string): Search by name or description
- `status` (string): Filter by status (ACTIVE, UNDER_MAINTENANCE, INACTIVE)
- `sortBy` (string): Sort field (default: name)
- `sortOrder` (string): Sort order (asc, desc)

### 6.2 Get Work Center by ID
**GET** `/api/work-centers/:id`

### 6.3 Get Work Center Utilization
**GET** `/api/work-centers/:id/utilization`

**Query Parameters:**
- `startDate` (string): Start date for utilization calculation
- `endDate` (string): End date for utilization calculation

**Response:**
```json
{
  "success": true,
  "data": {
    "workCenter": {...},
    "workOrders": [...],
    "utilization": {
      "expected": 85.5,
      "actual": 78.2,
      "totalExpectedDuration": 1200,
      "totalRealDuration": 1100,
      "totalCapacity": 1440
    }
  }
}
```

### 6.4 Get Work Center Statuses
**GET** `/api/work-centers/meta/statuses`

### 6.5 Get Work Center Statistics
**GET** `/api/work-centers/meta/stats`

### 6.6 Create Work Center
**POST** `/api/work-centers`

**Required Role:** ADMIN, MANAGER

**Request Body:**
```json
{
  "name": "Assembly Line 1",
  "description": "Main assembly line",
  "capacity": 8,
  "costPerHour": 50.00,
  "status": "ACTIVE"
}
```

**Required Fields:**
- `name` (string): Work center name

**Optional Fields:**
- `description` (string): Description
- `capacity` (number): Hours per day (default: 8)
- `costPerHour` (number): Cost per hour (default: 0)
- `status` (enum): ACTIVE, UNDER_MAINTENANCE, INACTIVE (default: ACTIVE)

### 6.7 Update Work Center
**PUT** `/api/work-centers/:id`

### 6.8 Update Work Center Status
**PATCH** `/api/work-centers/:id/status`

### 6.9 Delete Work Center
**DELETE** `/api/work-centers/:id`

**Required Role:** ADMIN, MANAGER
**Note:** Cannot delete if has work orders

---

## 7. Stock Ledger (`/api/stock-ledger`)

### 7.1 Get All Stock Ledger Entries
**GET** `/api/stock-ledger`

**Query Parameters:**
- `page`, `limit`: Pagination
- `search` (string): Search by product name or reference
- `productId` (number): Filter by product ID
- `transactionType` (string): Filter by type (IN, OUT, ADJUSTMENT)
- `startDate` (string): Filter by start date
- `endDate` (string): Filter by end date
- `reference` (string): Filter by reference

### 7.2 Get All Product Stocks
**GET** `/api/stock-ledger/stocks`

**Query Parameters:**
- `search` (string): Search by product name
- `type` (string): Filter by product type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "product": {
        "id": 1,
        "name": "Product A",
        "type": "FINISHED_GOOD",
        "unitOfMeasure": "PCS",
        "unitCost": 10.50
      },
      "currentStock": 150,
      "totalIn": 200,
      "totalOut": 50,
      "totalValue": 1575.00,
      "freeToUse": 150,
      "incoming": 0,
      "outgoing": 0
    }
  ]
}
```

### 7.3 Get Stock Summary
**GET** `/api/stock-ledger/summary`

### 7.4 Get Transaction Types
**GET** `/api/stock-ledger/meta/transaction-types`

### 7.5 Get Stock Ledger Entry by ID
**GET** `/api/stock-ledger/:id`

### 7.6 Get Product Stock
**GET** `/api/stock-ledger/product/:id/stock`

### 7.7 Get Stock Movements
**GET** `/api/stock-ledger/product/:id/movements`

**Query Parameters:**
- `startDate` (string): Start date
- `endDate` (string): End date

### 7.8 Create Stock Transaction
**POST** `/api/stock-ledger`

**Required Role:** ADMIN, MANAGER, INVENTORY_MANAGER

**Request Body:**
```json
{
  "productId": 1,
  "transactionType": "IN",
  "quantity": 100,
  "unitCost": 10.50,
  "reference": "MO20250920001",
  "referenceId": 1
}
```

**Required Fields:**
- `productId` (number): Product ID
- `transactionType` (enum): IN, OUT, ADJUSTMENT
- `quantity` (number): Quantity

**Optional Fields:**
- `unitCost` (number): Unit cost
- `reference` (string): Reference (MO number, etc.)
- `referenceId` (number): Reference ID

### 7.9 Adjust Stock
**POST** `/api/stock-ledger/product/:id/adjust`

**Required Role:** ADMIN, MANAGER, INVENTORY_MANAGER

**Request Body:**
```json
{
  "quantity": 150,
  "reason": "Physical count adjustment"
}
```

### 7.10 Update Stock Transaction
**PUT** `/api/stock-ledger/:id`

### 7.11 Delete Stock Transaction
**DELETE** `/api/stock-ledger/:id`

**Required Role:** ADMIN, MANAGER

---

## 8. Health Check

### 8.1 API Health
**GET** `/api/health`

**Response:**
```json
{
  "success": true,
  "message": "Manufacturing Management System API is running",
  "timestamp": "2025-09-20T12:00:00.000Z",
  "version": "1.0.0"
}
```

### 8.2 Root Endpoint
**GET** `/`

**Response:**
```json
{
  "success": true,
  "message": "Manufacturing Management System API",
  "version": "1.0.0",
  "documentation": "/api/health",
  "endpoints": {
    "auth": "/api/auth",
    "manufacturingOrders": "/api/manufacturing-orders",
    "products": "/api/products",
    "boms": "/api/boms",
    "workOrders": "/api/work-orders",
    "workCenters": "/api/work-centers",
    "stockLedger": "/api/stock-ledger"
  }
}
```

---

## 🔐 User Roles and Permissions

| Role | Description | Permissions |
|------|-------------|-------------|
| **ADMIN** | System Administrator | Full access to all endpoints |
| **MANAGER** | Operations Manager | Most operations, can delete records |
| **OPERATOR** | Production Operator | Basic operations, create/update orders |
| **INVENTORY_MANAGER** | Inventory Manager | Product and stock management |
| **OWNER** | System Owner | Full access (same as ADMIN) |

---

## 📝 Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...] // Validation errors (if any)
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

---

## 🧪 Testing Examples

### cURL Examples

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"admin","name":"Admin User","email":"admin@example.com","password":"password123","role":"ADMIN"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"admin","password":"password123"}'
```

**Create Product:**
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Test Product","type":"FINISHED_GOOD","unitOfMeasure":"PCS","unitCost":10.50}'
```

**Get Manufacturing Orders:**
```bash
curl -X GET "http://localhost:5000/api/manufacturing-orders?page=1&limit=10&status=IN_PROGRESS" \
  -H "Authorization: Bearer <token>"
```

This comprehensive guide covers all available endpoints with their parameters, request/response formats, and usage examples. Each endpoint includes proper authentication requirements and role-based permissions.

---

## 🧪 Complete Project Testing Flow

This section provides a step-by-step testing flow to verify all functionality of the Manufacturing Management System.

### Prerequisites
1. **Database Setup**: Ensure PostgreSQL is running and create a database named `manufacturing_db`
2. **Environment**: Update `.env` file with correct database credentials
3. **Server Running**: Start the backend server (`npm run dev` or `node server.js`)

### Step 1: Database Setup and Migration

```bash
# Navigate to backend directory
cd backend

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### Step 2: Health Check and Basic Setup

```bash
# Test API health
curl http://localhost:5000/api/health

# Test root endpoint
curl http://localhost:5000/
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Manufacturing Management System API is running",
  "timestamp": "2025-09-20T12:00:00.000Z",
  "version": "1.0.0"
}
```

### Step 3: User Management Flow

#### 3.1 Register Admin User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "admin",
    "name": "System Administrator",
    "email": "admin@manufacturing.com",
    "password": "admin123456",
    "mobileNo": "+1234567890",
    "address": "123 Manufacturing St",
    "city": "Industrial City",
    "state": "IC",
    "country": "USA",
    "pinCode": "12345",
    "role": "ADMIN"
  }'
```

**Save the token from response for subsequent requests!**

#### 3.2 Register Additional Users
```bash
# Register Manager
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "manager1",
    "name": "Production Manager",
    "email": "manager@manufacturing.com",
    "password": "manager123",
    "role": "MANAGER"
  }'

# Register Operator
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "operator1",
    "name": "Production Operator",
    "email": "operator@manufacturing.com",
    "password": "operator123",
    "role": "OPERATOR"
  }'

# Register Inventory Manager
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "inventory1",
    "name": "Inventory Manager",
    "email": "inventory@manufacturing.com",
    "password": "inventory123",
    "role": "INVENTORY_MANAGER"
  }'
```

#### 3.3 Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "admin",
    "password": "admin123456"
  }'
```

### Step 4: Product Management Flow

#### 4.1 Create Raw Materials
```bash
# Raw Material 1
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "name": "Steel Rod",
    "description": "High-grade steel rod for manufacturing",
    "type": "RAW_MATERIAL",
    "unitOfMeasure": "KG",
    "unitCost": 5.50
  }'

# Raw Material 2
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "name": "Plastic Sheet",
    "description": "Industrial plastic sheet",
    "type": "RAW_MATERIAL",
    "unitOfMeasure": "M2",
    "unitCost": 12.00
  }'

# Raw Material 3
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "name": "Electronic Component A",
    "description": "Microcontroller unit",
    "type": "RAW_MATERIAL",
    "unitOfMeasure": "PCS",
    "unitCost": 25.00
  }'
```

#### 4.2 Create Semi-Finished Products
```bash
# Semi-Finished Product 1
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "name": "Steel Frame",
    "description": "Manufactured steel frame",
    "type": "SEMI_FINISHED",
    "unitOfMeasure": "PCS",
    "unitCost": 45.00
  }'

# Semi-Finished Product 2
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "name": "Plastic Housing",
    "description": "Molded plastic housing",
    "type": "SEMI_FINISHED",
    "unitOfMeasure": "PCS",
    "unitCost": 18.00
  }'
```

#### 4.3 Create Finished Products
```bash
# Finished Product 1
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "name": "Industrial Widget A",
    "description": "Complete industrial widget",
    "type": "FINISHED_GOOD",
    "unitOfMeasure": "PCS",
    "unitCost": 120.00
  }'

# Finished Product 2
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "name": "Consumer Device B",
    "description": "Consumer electronic device",
    "type": "FINISHED_GOOD",
    "unitOfMeasure": "PCS",
    "unitCost": 85.00
  }'
```

#### 4.4 Get All Products
```bash
curl -X GET "http://localhost:5000/api/products?page=1&limit=10" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Step 5: Work Center Management Flow

#### 5.1 Create Work Centers
```bash
# Work Center 1
curl -X POST http://localhost:5000/api/work-centers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "name": "Assembly Line 1",
    "description": "Main assembly line for widgets",
    "capacity": 8,
    "costPerHour": 50.00,
    "status": "ACTIVE"
  }'

# Work Center 2
curl -X POST http://localhost:5000/api/work-centers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "name": "Quality Control Station",
    "description": "Quality inspection and testing",
    "capacity": 6,
    "costPerHour": 45.00,
    "status": "ACTIVE"
  }'

# Work Center 3
curl -X POST http://localhost:5000/api/work-centers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "name": "Packaging Station",
    "description": "Final packaging and labeling",
    "capacity": 4,
    "costPerHour": 30.00,
    "status": "ACTIVE"
  }'
```

#### 5.2 Get Work Centers
```bash
curl -X GET "http://localhost:5000/api/work-centers" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Step 6: Bill of Materials (BOM) Flow

#### 6.1 Create BOM for Finished Product
```bash
curl -X POST http://localhost:5000/api/boms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "productId": 6,
    "reference": "BOM-WIDGET-A-001",
    "version": "1.0",
    "components": [
      {
        "productId": 1,
        "quantity": 2,
        "unit": "KG",
        "cost": 5.50
      },
      {
        "productId": 4,
        "quantity": 1,
        "unit": "PCS",
        "cost": 45.00
      },
      {
        "productId": 3,
        "quantity": 1,
        "unit": "PCS",
        "cost": 25.00
      }
    ]
  }'
```

#### 6.2 Create BOM for Second Finished Product
```bash
curl -X POST http://localhost:5000/api/boms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "productId": 7,
    "reference": "BOM-DEVICE-B-001",
    "version": "1.0",
    "components": [
      {
        "productId": 2,
        "quantity": 1,
        "unit": "M2",
        "cost": 12.00
      },
      {
        "productId": 5,
        "quantity": 1,
        "unit": "PCS",
        "cost": 18.00
      },
      {
        "productId": 3,
        "quantity": 2,
        "unit": "PCS",
        "cost": 25.00
      }
    ]
  }'
```

#### 6.3 Get BOMs
```bash
curl -X GET "http://localhost:5000/api/boms" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### 6.4 Calculate BOM Cost
```bash
curl -X GET "http://localhost:5000/api/boms/1/cost" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Step 7: Stock Management Flow

#### 7.1 Add Initial Stock
```bash
# Add stock for raw materials
curl -X POST http://localhost:5000/api/stock-ledger \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "productId": 1,
    "transactionType": "IN",
    "quantity": 1000,
    "unitCost": 5.50,
    "reference": "INITIAL_STOCK",
    "referenceId": 1
  }'

curl -X POST http://localhost:5000/api/stock-ledger \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "productId": 2,
    "transactionType": "IN",
    "quantity": 500,
    "unitCost": 12.00,
    "reference": "INITIAL_STOCK",
    "referenceId": 2
  }'

curl -X POST http://localhost:5000/api/stock-ledger \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "productId": 3,
    "transactionType": "IN",
    "quantity": 200,
    "unitCost": 25.00,
    "reference": "INITIAL_STOCK",
    "referenceId": 3
  }'
```

#### 7.2 Get Stock Summary
```bash
curl -X GET "http://localhost:5000/api/stock-ledger/stocks" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### 7.3 Get Product Stock Details
```bash
curl -X GET "http://localhost:5000/api/products/1/stock" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Step 8: Manufacturing Order Flow

#### 8.1 Create Manufacturing Order
```bash
curl -X POST http://localhost:5000/api/manufacturing-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "finishedProductId": 6,
    "quantity": 50,
    "scheduleDate": "2025-09-25T00:00:00.000Z",
    "startDate": "2025-09-22T00:00:00.000Z",
    "endDate": "2025-09-28T00:00:00.000Z",
    "billOfMaterialId": 1,
    "assigneeId": 2
  }'
```

#### 8.2 Create Second Manufacturing Order
```bash
curl -X POST http://localhost:5000/api/manufacturing-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "finishedProductId": 7,
    "quantity": 30,
    "scheduleDate": "2025-09-26T00:00:00.000Z",
    "startDate": "2025-09-23T00:00:00.000Z",
    "endDate": "2025-09-29T00:00:00.000Z",
    "billOfMaterialId": 2,
    "assigneeId": 2
  }'
```

#### 8.3 Get Manufacturing Orders
```bash
curl -X GET "http://localhost:5000/api/manufacturing-orders" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### 8.4 Update Manufacturing Order Status
```bash
# Confirm the order
curl -X PATCH http://localhost:5000/api/manufacturing-orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{"status": "CONFIRMED"}'

# Start production
curl -X PATCH http://localhost:5000/api/manufacturing-orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{"status": "IN_PROGRESS"}'
```

### Step 9: Work Order Flow

#### 9.1 Create Work Orders for Manufacturing Order 1
```bash
# Assembly work order
curl -X POST http://localhost:5000/api/work-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "moId": 1,
    "workCenterId": 1,
    "operationName": "Assembly",
    "expectedDuration": 120,
    "assignedToId": 3
  }'

# Quality control work order
curl -X POST http://localhost:5000/api/work-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "moId": 1,
    "workCenterId": 2,
    "operationName": "Quality Inspection",
    "expectedDuration": 30,
    "assignedToId": 3
  }'

# Packaging work order
curl -X POST http://localhost:5000/api/work-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "moId": 1,
    "workCenterId": 3,
    "operationName": "Packaging",
    "expectedDuration": 45,
    "assignedToId": 3
  }'
```

#### 9.2 Create Work Orders for Manufacturing Order 2
```bash
# Assembly work order
curl -X POST http://localhost:5000/api/work-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "moId": 2,
    "workCenterId": 1,
    "operationName": "Assembly",
    "expectedDuration": 90,
    "assignedToId": 3
  }'

# Quality control work order
curl -X POST http://localhost:5000/api/work-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "moId": 2,
    "workCenterId": 2,
    "operationName": "Quality Inspection",
    "expectedDuration": 25,
    "assignedToId": 3
  }'
```

#### 9.3 Get Work Orders
```bash
curl -X GET "http://localhost:5000/api/work-orders" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### 9.4 Update Work Order Status
```bash
# Start first work order
curl -X PATCH http://localhost:5000/api/work-orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{"status": "STARTED"}'

# Complete first work order
curl -X PATCH http://localhost:5000/api/work-orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{"status": "COMPLETED"}'
```

### Step 10: Stock Movement Flow

#### 10.1 Consume Raw Materials (OUT transactions)
```bash
# Consume steel rods
curl -X POST http://localhost:5000/api/stock-ledger \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "productId": 1,
    "transactionType": "OUT",
    "quantity": 100,
    "unitCost": 5.50,
    "reference": "MO20250920001",
    "referenceId": 1
  }'

# Consume electronic components
curl -X POST http://localhost:5000/api/stock-ledger \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "productId": 3,
    "transactionType": "OUT",
    "quantity": 50,
    "unitCost": 25.00,
    "reference": "MO20250920001",
    "referenceId": 1
  }'
```

#### 10.2 Add Finished Products to Stock (IN transactions)
```bash
# Add finished widgets to stock
curl -X POST http://localhost:5000/api/stock-ledger \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "productId": 6,
    "transactionType": "IN",
    "quantity": 50,
    "unitCost": 120.00,
    "reference": "MO20250920001",
    "referenceId": 1
  }'
```

### Step 11: Analytics and Reporting Flow

#### 11.1 Get Dashboard Summary
```bash
curl -X GET "http://localhost:5000/api/manufacturing-orders/dashboard/summary" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### 11.2 Get Work Order Analysis
```bash
curl -X GET "http://localhost:5000/api/work-orders/analysis/reports?startDate=2025-09-01&endDate=2025-09-30" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### 11.3 Get Work Center Utilization
```bash
curl -X GET "http://localhost:5000/api/work-centers/1/utilization?startDate=2025-09-01&endDate=2025-09-30" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### 11.4 Get Stock Summary
```bash
curl -X GET "http://localhost:5000/api/stock-ledger/summary" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Step 12: Complete Manufacturing Order Lifecycle

#### 12.1 Complete Manufacturing Orders
```bash
# Mark manufacturing order as completed
curl -X PATCH http://localhost:5000/api/manufacturing-orders/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{"status": "CLOSED"}'

curl -X PATCH http://localhost:5000/api/manufacturing-orders/2/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{"status": "CLOSED"}'
```

#### 12.2 Final Dashboard Check
```bash
curl -X GET "http://localhost:5000/api/manufacturing-orders/dashboard/summary" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Step 13: Error Handling and Edge Cases

#### 13.1 Test Invalid Authentication
```bash
# Try to access protected endpoint without token
curl -X GET "http://localhost:5000/api/products"

# Try with invalid token
curl -X GET "http://localhost:5000/api/products" \
  -H "Authorization: Bearer invalid_token"
```

#### 13.2 Test Validation Errors
```bash
# Try to create product with invalid data
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "name": "",
    "type": "INVALID_TYPE",
    "unitOfMeasure": ""
  }'
```

#### 13.3 Test Role-based Access
```bash
# Try to delete with operator role (should fail)
curl -X DELETE http://localhost:5000/api/products/1 \
  -H "Authorization: Bearer <OPERATOR_TOKEN>"
```

### Step 14: Performance and Load Testing

#### 14.1 Test Pagination
```bash
# Test with different page sizes
curl -X GET "http://localhost:5000/api/products?page=1&limit=5" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

curl -X GET "http://localhost:5000/api/products?page=2&limit=10" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### 14.2 Test Search and Filtering
```bash
# Test search functionality
curl -X GET "http://localhost:5000/api/products?search=steel" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"

# Test filtering
curl -X GET "http://localhost:5000/api/products?type=RAW_MATERIAL" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Step 15: Data Integrity Tests

#### 15.1 Test Foreign Key Constraints
```bash
# Try to create work order with non-existent manufacturing order
curl -X POST http://localhost:5000/api/work-orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "moId": 999,
    "workCenterId": 1,
    "operationName": "Test",
    "expectedDuration": 60
  }'
```

#### 15.2 Test Cascade Deletes
```bash
# Try to delete product that's used in BOM (should fail)
curl -X DELETE http://localhost:5000/api/products/1 \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Expected Results Summary

After completing this flow, you should have:

✅ **Users**: 4 users with different roles  
✅ **Products**: 7 products (3 raw materials, 2 semi-finished, 2 finished)  
✅ **Work Centers**: 3 active work centers  
✅ **BOMs**: 2 complete bills of materials  
✅ **Manufacturing Orders**: 2 orders in different statuses  
✅ **Work Orders**: 5 work orders assigned to different work centers  
✅ **Stock Transactions**: Multiple IN/OUT transactions  
✅ **Analytics**: Dashboard summaries and reports  

### Troubleshooting Common Issues

1. **Database Connection Error**: Ensure PostgreSQL is running and credentials are correct
2. **Token Expired**: Re-login to get a fresh token
3. **Validation Errors**: Check required fields and data types
4. **Permission Denied**: Ensure user has correct role for the operation
5. **Foreign Key Errors**: Ensure referenced records exist before creating dependent records

This comprehensive testing flow will verify all aspects of your Manufacturing Management System API!
