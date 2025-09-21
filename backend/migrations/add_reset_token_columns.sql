-- Add reset token columns to users table for password reset functionality
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;

-- Create index for reset token lookup
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
