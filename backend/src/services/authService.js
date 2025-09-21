const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

class AuthService {
  async register(userData) {
    const { name, email, password, mobileNo, role = 'OPERATOR' } = userData;

    // Check if user already exists
    const existingUserResult = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUserResult.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userResult = await db.query(
      `INSERT INTO users (name, email, password_hash, mobile_no, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, mobile_no, role, is_active, created_at`,
      [name, email, passwordHash, mobileNo, role]
    );

    const user = userResult.rows[0];

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
    const userResult = await db.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (userResult.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const userResult = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.rows[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, userId]
    );

    return { message: 'Password changed successfully' };
  }

  async updateProfile(userId, profileData) {
    const { name, email, mobileNo } = profileData;

    // Check if email is already taken by another user
    if (email) {
      const existingUserResult = await db.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );

      if (existingUserResult.rows.length > 0) {
        throw new Error('Email is already taken by another user');
      }
    }

    const userResult = await db.query(
      `UPDATE users 
       SET name = $1, email = $2, mobile_no = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, name, email, mobile_no, role, is_active, updated_at`,
      [name, email, mobileNo, userId]
    );

    return userResult.rows[0];
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
      const existingAdminResult = await db.query(
        'SELECT id FROM users WHERE email = $1',
        ['heet111@gmail.com']
      );

      if (existingAdminResult.rows.length > 0) {
        return { message: 'Default admin user already exists' };
      }

      // Create default admin
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash('Admin@1234', saltRounds);

      const adminResult = await db.query(
        `INSERT INTO users (name, email, password_hash, mobile_no, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, email, mobile_no, role, is_active, created_at`,
        ['Administrator', 'heet111@gmail.com', passwordHash, '1234567890', 'BUSINESS_OWNER']
      );

      const admin = adminResult.rows[0];

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
      const usersResult = await db.query(
        `SELECT id, name, email, mobile_no, role, is_active, created_at, updated_at
         FROM users
         ORDER BY created_at DESC`
      );

      return usersResult.rows;
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  async updateUserRole(userId, role) {
    try {
      const userResult = await db.query(
        `UPDATE users 
         SET role = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id, name, email, role, is_active, updated_at`,
        [role, userId]
      );

      return userResult.rows[0];
    } catch (error) {
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  }

  async deactivateUser(userId) {
    try {
      const userResult = await db.query(
        `UPDATE users 
         SET is_active = false, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING id, name, email, is_active, updated_at`,
        [userId]
      );

      return userResult.rows[0];
    } catch (error) {
      throw new Error(`Failed to deactivate user: ${error.message}`);
    }
  }

  async activateUser(userId) {
    try {
      const userResult = await db.query(
        `UPDATE users 
         SET is_active = true, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING id, name, email, is_active, updated_at`,
        [userId]
      );

      return userResult.rows[0];
    } catch (error) {
      throw new Error(`Failed to activate user: ${error.message}`);
    }
  }

  async getUserById(userId) {
    try {
      const userResult = await db.query(
        `SELECT id, name, email, mobile_no, role, is_active, created_at, updated_at
         FROM users
         WHERE id = $1`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      return userResult.rows[0];
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  }
}

module.exports = new AuthService();
