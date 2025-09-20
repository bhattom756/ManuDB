# Updated Authentication System - Email-Based Login

## 🎯 **Overview**

The authentication system has been updated to remove the `userId` field and use email-based login instead. This makes the system more standard and user-friendly.

## 🔄 **Changes Made**

### **1. Database Schema Updates**
- ❌ **Removed**: `userId` field from User model
- ✅ **Kept**: `email` as the unique identifier for login
- ✅ **Updated**: All user-related queries to use email instead of userId

### **2. Authentication Service Updates**
- **Register**: Now only requires `name`, `email`, `password`, `mobileNo`, `role`
- **Login**: Now uses `email` and `password` instead of `userId` and `password`
- **JWT Token**: Now contains `id`, `email`, `role` (removed `userId`)

### **3. Validation Updates**
- **Registration**: Removed `userId` validation
- **Login**: Changed from `userId` to `email` validation
- **Profile Updates**: Removed `userId` from select fields

### **4. Setup Script Updates**
- **Default Admin**: Now created with email only
- **Sample Users**: Removed `userId` from all sample users
- **Console Output**: Updated to show email instead of userId

## 📝 **Updated API Endpoints**

### **Authentication Endpoints**

#### **1. Register User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@company.com",
  "password": "Password@123",
  "mobileNo": "9876543210",
  "role": "MANUFACTURING_MANAGER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@company.com",
      "mobileNo": "9876543210",
      "role": "MANUFACTURING_MANAGER",
      "isActive": true,
      "createdAt": "2025-01-20T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### **2. Login User**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@company.com",
  "password": "Password@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@company.com",
      "mobileNo": "9876543210",
      "role": "MANUFACTURING_MANAGER",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### **3. Create Default Admin**
```http
POST /api/auth/create-default-admin
Content-Type: application/json

{}
```

**Response:**
```json
{
  "success": true,
  "message": "Default admin user created successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Business Owner",
      "email": "heet111@gmail.com",
      "mobileNo": "1234567890",
      "role": "BUSINESS_OWNER",
      "isActive": true,
      "createdAt": "2025-01-20T10:30:00.000Z"
    }
  }
}
```

#### **4. Get Profile**
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@company.com",
    "mobileNo": "9876543210",
    "role": "MANUFACTURING_MANAGER",
    "isActive": true,
    "updatedAt": "2025-01-20T10:30:00.000Z"
  }
}
```

#### **5. Update Profile**
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.updated@company.com",
  "mobileNo": "9876543211"
}
```

#### **6. Change Password**
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "Password@123",
  "newPassword": "NewPassword@123"
}
```

#### **7. Logout**
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

## 👥 **Sample Users (Updated)**

### **Default Users Created by Setup Script:**

| Role | Email | Password | Name |
|------|-------|----------|------|
| **Business Owner** | `heet111@gmail.com` | `Admin@1234` | Administrator |
| **Manufacturing Manager** | `john.manager@company.com` | `Manager@123` | John Manufacturing Manager |
| **Operator** | `mike.operator@company.com` | `Operator@123` | Mike Operator |
| **Inventory Manager** | `sarah.inventory@company.com` | `Inventory@123` | Sarah Inventory Manager |

## 🧪 **Testing Instructions**

### **1. Setup Backend:**
```bash
cd backend
npm run setup  # Creates sample data and users
npm start      # Start the server
```

### **2. Test Authentication:**
```bash
# Create default admin
curl -X POST http://localhost:5000/api/auth/create-default-admin

# Login with business owner
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"heet111@gmail.com","password":"Admin@1234"}'

# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@company.com","password":"Test@123","role":"OPERATOR"}'
```

### **3. Test with Postman:**
- Import the updated Postman collections
- All authentication endpoints now use email-based login
- Remove any `userId` fields from request bodies

## 🔐 **JWT Token Structure**

The JWT token now contains:
```json
{
  "id": 1,
  "email": "john.doe@company.com",
  "role": "MANUFACTURING_MANAGER",
  "iat": 1642678800,
  "exp": 1642765200
}
```

## ⚠️ **Migration Required**

To apply these changes to your database:

```bash
cd backend
npx prisma migrate dev --name remove_user_id_field
npx prisma generate
```

## ✅ **Benefits of Email-Based Login**

1. **Standard Practice**: Email is the universal identifier
2. **User-Friendly**: Users remember their email, not custom IDs
3. **Simplified**: No need to manage custom user IDs
4. **Secure**: Email is already unique and validated
5. **Cleaner**: Removes unnecessary complexity

## 🎯 **Ready to Test!**

The authentication system is now cleaner and more standard. Users can register and login using their email addresses, making the system more intuitive and user-friendly.

**Happy Testing! 🎉**
