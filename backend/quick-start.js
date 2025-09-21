const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Quick Start for Manufacturing Management System');
console.log('================================================\n');

console.log('📋 Step 1: Setup Database and Create Test Users');
console.log('Run this command in the backend directory:');
console.log('npm run setup\n');

console.log('📋 Step 2: Start Backend Server');
console.log('Run this command in the backend directory:');
console.log('npm run dev\n');

console.log('📋 Step 3: Start Frontend');
console.log('Run this command in the frontend directory:');
console.log('npm run dev\n');

console.log('👤 Test User Accounts:');
console.log('======================');
console.log('Business Owner:');
console.log('  Email: heet111@gmail.com');
console.log('  Password: Admin@1234');
console.log('  Access: Full system access, all features\n');

console.log('Manufacturing Manager:');
console.log('  Email: john.manager@company.com');
console.log('  Password: Manager@123');
console.log('  Access: Production orders, workflow oversight\n');

console.log('Operator:');
console.log('  Email: mike.operator@company.com');
console.log('  Password: Operator@123');
console.log('  Access: Assigned work orders, status updates\n');

console.log('Inventory Manager:');
console.log('  Email: sarah.inventory@company.com');
console.log('  Password: Inventory@123');
console.log('  Access: Stock management, inventory tracking\n');

console.log('🌐 URLs:');
console.log('=======');
console.log('Frontend: http://localhost:5173');
console.log('Backend API: http://localhost:5000/api');
console.log('Health Check: http://localhost:5000/api/health\n');

console.log('🔧 Troubleshooting:');
console.log('==================');
console.log('1. If you get "Invalid token" error:');
console.log('   - Make sure you are logged in first');
console.log('   - Check if the backend server is running');
console.log('   - Verify the JWT_SECRET is set in .env file\n');

console.log('2. If database connection fails:');
console.log('   - Check PostgreSQL is running');
console.log('   - Verify DATABASE_URL in .env file');
console.log('   - Run: npm run setup\n');

console.log('3. If frontend can\'t connect to backend:');
console.log('   - Check backend is running on port 5000');
console.log('   - Check CORS settings in backend');
console.log('   - Check browser console for errors\n');

console.log('✅ Ready to start! Run the commands above to get started.');
