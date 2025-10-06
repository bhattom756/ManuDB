const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const db = require('../config/database');

// Configure SendGrid (only if API key is provided)
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.log('⚠️  SendGrid API key not configured. Email features will be disabled.');
}

class AuthService {
  async register(userData) {
    const { name, email, password, mobileNo, role = 'OPERATOR' } = userData;

    if (!name || !email || !password) {
      const err = new Error('Name, email and password are required');
      err.statusCode = 400;
      throw err;
    }

    // Check if user already exists
    const existingUserResult = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUserResult.rows.length > 0) {
      const err = new Error('User with this email already exists');
      err.statusCode = 409; // conflict
      throw err;
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
    // Validate input
    if (!currentPassword || !newPassword) {
      throw new Error('Current password and new password are required');
    }

    if (currentPassword === newPassword) {
      throw new Error('New password must be different from current password');
    }

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

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
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
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

  async forgotPassword(email) {
    try {
      // Check if user exists
      const userResult = await db.query(
        'SELECT id, name, email FROM users WHERE email = $1 AND is_active = true',
        [email]
      );

      if (userResult.rows.length === 0) {
        // Don't reveal if user exists or not for security
        return { message: 'If an account with that email exists, a password reset link has been sent.' };
      }

      const user = userResult.rows[0];

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      
      // Set token expiry (1 hour from now)
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

      // Store reset token in database
      await db.query(
        'UPDATE users SET reset_token = $1, reset_token_expiry = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [resetTokenHash, resetTokenExpiry, user.id]
      );

      // Create reset URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

      // Send email
      const msg = {
        to: user.email,
        from: process.env.FROM_EMAIL || 'test@example.com',
        subject: 'Password Reset Request - Mojo Manufacturing',
        text: `
          Hello ${user.name},
          
          You requested a password reset for your Mojo Manufacturing account.
          
          Click the link below to reset your password:
          ${resetUrl}
          
          This link will expire in 1 hour.
          
          If you didn't request this password reset, please ignore this email.
          
          Best regards,
          Mojo Manufacturing Team
        `,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello ${user.name},</p>
            <p>You requested a password reset for your Mojo Manufacturing account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">Best regards,<br>Mojo Manufacturing Team</p>
          </div>
        `
      };

      // Check if SendGrid is configured
      if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
        console.log('⚠️  SendGrid not configured. Password reset email would be sent to:', email);
        console.log('Reset URL:', resetUrl);
        return { message: 'Password reset email would be sent (SendGrid not configured)' };
      }

      await sgMail.send(msg);

      return { message: 'Password reset email sent successfully' };
    } catch (error) {
      console.error('Forgot password error:', error);
      
      // Provide more specific error messages
      if (error.code === 403) {
        throw new Error('SendGrid API key is invalid or sender email is not verified. Please check your SendGrid configuration.');
      } else if (error.code === 400) {
        throw new Error('Invalid email format or SendGrid configuration error.');
      } else {
        throw new Error(`Failed to send password reset email: ${error.message}`);
      }
    }
  }

  async resetPassword(token, newPassword) {
    try {
      // Hash the token to compare with stored hash
      const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with valid reset token
      const userResult = await db.query(
        'SELECT id, reset_token_expiry FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
        [resetTokenHash]
      );

      if (userResult.rows.length === 0) {
        throw new Error('Invalid or expired reset token');
      }

      const user = userResult.rows[0];

      // Validate new password
      if (!newPassword || newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Hash new password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password and clear reset token
      await db.query(
        'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [passwordHash, user.id]
      );

      return { message: 'Password reset successfully' };
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error('Failed to reset password');
    }
  }
}

module.exports = new AuthService();
