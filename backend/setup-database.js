const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🚀 Setting up Manufacturing Management System Database...');
  console.log('');

  // First, create the .env file if it doesn't exist
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file...');
    const envContent = `# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=manufacturing_db
DB_USER=postgres
DB_PASSWORD=password

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Environment
NODE_ENV=development

# Server Configuration
PORT=5000
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created!');
    console.log('⚠️  Please update the database credentials in .env file if needed');
    console.log('');
  }

  // Database connection configuration
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || 'password'),
    database: 'postgres', // Connect to default postgres database first
  };

  console.log('🔌 Connecting to PostgreSQL...');
  console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`   User: ${dbConfig.user}`);
  console.log('');

  const pool = new Pool(dbConfig);

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL successfully!');
    console.log('');

    // Check if database exists
    const dbName = process.env.DB_NAME || 'manufacturing_db';
    const dbExists = await pool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (dbExists.rows.length === 0) {
      console.log(`📦 Creating database: ${dbName}...`);
      await pool.query(`CREATE DATABASE "${dbName}"`);
      console.log('✅ Database created successfully!');
    } else {
      console.log(`✅ Database '${dbName}' already exists`);
    }

    console.log('');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('');
      console.log('🔧 Common solutions:');
      console.log('1. Check your PostgreSQL password in the .env file');
      console.log('2. Make sure PostgreSQL is running');
      console.log('3. Verify the username and host are correct');
      console.log('');
      console.log('💡 Default PostgreSQL setup:');
      console.log('   - Username: postgres');
      console.log('   - Password: (your PostgreSQL password)');
      console.log('   - Host: localhost');
      console.log('   - Port: 5432');
    }
    
    throw error;
  } finally {
    await pool.end();
  }

  // Now connect to the specific database and create schema
  console.log('📋 Creating database schema...');
  const appPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'manufacturing_db',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || 'password'),
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    // Read and execute schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error('Schema file not found: schema.sql');
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await appPool.query(statement);
        } catch (error) {
          // Skip errors for existing objects (like enums or tables)
          if (!error.message.includes('already exists')) {
            console.warn('⚠️  Warning:', error.message);
          }
        }
      }
    }
    
    console.log('✅ Database schema created successfully!');
    console.log('');

  } catch (error) {
    console.error('❌ Schema creation failed:', error.message);
    throw error;
  } finally {
    await appPool.end();
  }

  console.log('🎉 Database setup completed successfully!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Start the server: npm run dev');
  console.log('2. The server will automatically create initial users');
  console.log('');
  console.log('🔑 Default login credentials:');
  console.log('   Admin: admin@factory.com / admin123');
  console.log('   Manager: manager@factory.com / manager123');
  console.log('   Inventory: inventory@factory.com / inventory123');
  console.log('   Operator: operator@factory.com / operator123');
}

// Run if this file is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = setupDatabase;
