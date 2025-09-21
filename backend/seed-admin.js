const bcrypt = require('bcryptjs');
const db = require('./src/config/database');

async function seedAdmin() {
  try {
    console.log('🌱 Starting admin user seeding...');
    
    // Check if admin already exists
    const existingAdmin = await db.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@factory.com']
    );
    
    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const result = await db.query(
      `INSERT INTO users (email, password, name, role, is_active, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
       RETURNING id, email, name, role`,
      [
        'admin@factory.com',
        hashedPassword,
        'System Administrator',
        'BUSINESS_OWNER',
        true
      ]
    );
    
    const admin = result.rows[0];
    console.log('✅ Admin user created successfully:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Password: admin123`);
    console.log('');
    console.log('🔐 You can now login with:');
    console.log('   Email: admin@factory.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

// Run the seed function
seedAdmin();
