const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

class AuthService {
  async register(userData) {
    const { name, email, password, mobileNo, role = 'OPERATOR' } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        mobileNo,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNo: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user,
      token
    };
  }

  async login(credentials) {
    const { email, password } = credentials;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email,
        isActive: true
      }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user data without password
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    return { message: 'Password changed successfully' };
  }

  async updateProfile(userId, profileData) {
    const { name, email, mobileNo } = profileData;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId }
        }
      });

      if (existingUser) {
        throw new Error('Email is already taken by another user');
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        mobileNo
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNo: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    return user;
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  async createDefaultAdmin() {
    try {
      // Check if admin already exists
      const existingAdmin = await prisma.user.findUnique({
        where: { email: 'heet111@gmail.com' }
      });

      if (existingAdmin) {
        return { message: 'Default admin user already exists' };
      }

      // Create default admin
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash('Admin@1234', saltRounds);

      const admin = await prisma.user.create({
        data: {
          name: 'Administrator',
          email: 'heet111@gmail.com',
          passwordHash,
          mobileNo: '1234567890',
          role: 'BUSINESS_OWNER'
        },
        select: {
          id: true,
          name: true,
          email: true,
          mobileNo: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      });

      return {
        message: 'Default admin user created successfully',
        user: admin
      };
    } catch (error) {
      throw new Error(`Failed to create default admin: ${error.message}`);
    }
  }

  async getAllUsers() {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          mobileNo: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return users;
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  async updateUserRole(userId, role) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          updatedAt: true
        }
      });

      return user;
    } catch (error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  }

  async deactivateUser(userId) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          updatedAt: true
        }
      });

      return user;
    } catch (error) {
      throw new Error(`Failed to deactivate user: ${error.message}`);
    }
  }
}

module.exports = new AuthService();
