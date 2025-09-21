const fs = require('fs');
const path = require('path');

// Create .env file with default values
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

const envPath = path.join(__dirname, '.env');

try {
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists. Skipping creation.');
    console.log('📝 Current .env file location:', envPath);
  } else {
    // Create .env file
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('📝 File location:', envPath);
    console.log('');
    console.log('🔧 Default configuration:');
    console.log('   Database: localhost:5432/manufacturing_db');
    console.log('   User: postgres');
    console.log('   Password: password');
    console.log('');
    console.log('⚠️  Please update the .env file with your actual database credentials!');
  }
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('');
  console.log('📝 Please create a .env file manually with the following content:');
  console.log('');
  console.log(envContent);
}
