const db = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function setupProductionDatabase() {
  try {
    console.log('Setting up production database...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await db.query(statement);
        console.log('✓ Executed:', statement.substring(0, 50) + '...');
      }
    }
    
    // Run migrations if they exist
    const migrationsPath = path.join(__dirname, '..', 'migrations');
    if (fs.existsSync(migrationsPath)) {
      const migrationFiles = fs.readdirSync(migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();
      
      for (const file of migrationFiles) {
        const migrationPath = path.join(migrationsPath, file);
        const migration = fs.readFileSync(migrationPath, 'utf8');
        await db.query(migration);
        console.log('✓ Applied migration:', file);
      }
    }
    
    // Seed admin user if needed
    const adminCheck = await db.query('SELECT COUNT(*) FROM users WHERE role = $1', ['admin']);
    if (parseInt(adminCheck.rows[0].count) === 0) {
      console.log('Seeding admin user...');
      // You can add admin seeding logic here
    }
    
    console.log('✅ Production database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up production database:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  setupProductionDatabase()
    .then(() => {
      console.log('Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupProductionDatabase;
