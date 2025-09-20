const db = require('../src/config/database');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Clean Manufacturing Management System...');

    // Create default admin user
    console.log('👤 Creating default admin user...');
    
    const existingAdminResult = await db.query(
      'SELECT id FROM users WHERE email = $1',
      ['heet111@gmail.com']
    );

    if (existingAdminResult.rows.length > 0) {
      console.log('✅ Default admin user already exists');
    } else {
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash('Admin@1234', saltRounds);

      const adminResult = await db.query(
        `INSERT INTO users (name, email, password_hash, mobile_no, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        ['Business Owner', 'heet111@gmail.com', passwordHash, '1234567890', 'BUSINESS_OWNER']
      );

      const admin = adminResult.rows[0];
      console.log('✅ Default business owner created successfully');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
    }

    // Create sample users for each role
    console.log('👥 Creating sample users for each role...');
    
    const sampleUsers = [
      {
        name: 'John Manufacturing Manager',
        email: 'john.manager@company.com',
        password: 'Manager@123',
        mobileNo: '9876543210',
        role: 'MANUFACTURING_MANAGER'
      },
      {
        name: 'Mike Operator',
        email: 'mike.operator@company.com',
        password: 'Operator@123',
        mobileNo: '9876543211',
        role: 'OPERATOR'
      },
      {
        name: 'Sarah Inventory Manager',
        email: 'sarah.inventory@company.com',
        password: 'Inventory@123',
        mobileNo: '9876543212',
        role: 'INVENTORY_MANAGER'
      }
    ];

    for (const userData of sampleUsers) {
      const existingUserResult = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [userData.email]
      );

      if (existingUserResult.rows.length === 0) {
        const userPasswordHash = await bcrypt.hash(userData.password, 12);
        const userResult = await db.query(
          `INSERT INTO users (name, email, password_hash, mobile_no, role)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [userData.name, userData.email, userPasswordHash, userData.mobileNo, userData.role]
        );
        const user = userResult.rows[0];
        console.log(`   ✅ Created ${userData.role}: ${user.name} (${user.email})`);
      } else {
        console.log(`   ⚠️  User already exists: ${userData.name}`);
      }
    }

    // Create sample products
    console.log('📦 Creating sample products...');
    
    const products = [
      {
        name: 'Steel Rod',
        type: 'RAW_MATERIAL',
        unitOfMeasure: 'KG',
        unitCost: 5.50,
        currentStock: 1000
      },
      {
        name: 'Plastic Sheet',
        type: 'RAW_MATERIAL',
        unitOfMeasure: 'M2',
        unitCost: 12.00,
        currentStock: 500
      },
      {
        name: 'Electronic Component',
        type: 'RAW_MATERIAL',
        unitOfMeasure: 'PCS',
        unitCost: 25.00,
        currentStock: 200
      },
      {
        name: 'Steel Frame',
        type: 'SEMI_FINISHED',
        unitOfMeasure: 'PCS',
        unitCost: 45.00,
        currentStock: 0
      },
      {
        name: 'Plastic Housing',
        type: 'SEMI_FINISHED',
        unitOfMeasure: 'PCS',
        unitCost: 18.00,
        currentStock: 0
      },
      {
        name: 'Industrial Widget',
        type: 'FINISHED_GOOD',
        unitOfMeasure: 'PCS',
        unitCost: 120.00,
        currentStock: 0
      },
      {
        name: 'Consumer Device',
        type: 'FINISHED_GOOD',
        unitOfMeasure: 'PCS',
        unitCost: 85.00,
        currentStock: 0
      }
    ];

    for (const productData of products) {
      const existingProductResult = await db.query(
        'SELECT id FROM products WHERE name = $1',
        [productData.name]
      );

      if (existingProductResult.rows.length === 0) {
        const productResult = await db.query(
          `INSERT INTO products (name, type, unit_of_measure, unit_cost, current_stock)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [productData.name, productData.type, productData.unitOfMeasure, productData.unitCost, productData.currentStock]
        );
        const product = productResult.rows[0];
        console.log(`   ✅ Created product: ${product.name} (Stock: ${product.current_stock})`);
      } else {
        console.log(`   ⚠️  Product already exists: ${productData.name}`);
      }
    }

    // Create sample work centers
    console.log('🏭 Creating sample work centers...');
    
    const workCenters = [
      {
        name: 'Assembly Line 1',
        capacity: 8,
        costPerHour: 50.00,
        status: 'ACTIVE'
      },
      {
        name: 'Quality Control',
        capacity: 6,
        costPerHour: 45.00,
        status: 'ACTIVE'
      },
      {
        name: 'Packaging Station',
        capacity: 4,
        costPerHour: 30.00,
        status: 'ACTIVE'
      }
    ];

    for (const workCenterData of workCenters) {
      const existingWorkCenterResult = await db.query(
        'SELECT id FROM work_centers WHERE name = $1',
        [workCenterData.name]
      );

      if (existingWorkCenterResult.rows.length === 0) {
        const workCenterResult = await db.query(
          `INSERT INTO work_centers (name, capacity, cost_per_hour, status)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [workCenterData.name, workCenterData.capacity, workCenterData.costPerHour, workCenterData.status]
        );
        const workCenter = workCenterResult.rows[0];
        console.log(`   ✅ Created work center: ${workCenter.name}`);
      } else {
        console.log(`   ⚠️  Work center already exists: ${workCenterData.name}`);
      }
    }

    // Create sample BOMs
    console.log('📋 Creating sample BOMs...');
    
    const finishedProductsResult = await db.query(
      "SELECT * FROM products WHERE type = 'FINISHED_GOOD'"
    );
    const finishedProducts = finishedProductsResult.rows;

    const rawMaterialsResult = await db.query(
      "SELECT * FROM products WHERE type = 'RAW_MATERIAL'"
    );
    const rawMaterials = rawMaterialsResult.rows;

    const semiFinishedResult = await db.query(
      "SELECT * FROM products WHERE type = 'SEMI_FINISHED'"
    );
    const semiFinished = semiFinishedResult.rows;

    if (finishedProducts.length >= 2 && rawMaterials.length >= 3 && semiFinished.length >= 2) {
      // Create BOM for first finished product
      const bom1Result = await db.query(
        `INSERT INTO boms (product_id, reference, version)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [finishedProducts[0].id, 'BOM-WIDGET-001', '1.0']
      );
      const bom1 = bom1Result.rows[0];

      // Add components to BOM 1
      await db.query(
        `INSERT INTO bom_components (bom_id, product_id, quantity, unit, cost, total)
         VALUES ($1, $2, $3, $4, $5, $6),
                ($7, $8, $9, $10, $11, $12),
                ($13, $14, $15, $16, $17, $18)`,
        [
          bom1.id, rawMaterials[0].id, 2, 'KG', rawMaterials[0].unit_cost, 2 * rawMaterials[0].unit_cost,
          bom1.id, semiFinished[0].id, 1, 'PCS', semiFinished[0].unit_cost, semiFinished[0].unit_cost,
          bom1.id, rawMaterials[2].id, 1, 'PCS', rawMaterials[2].unit_cost, rawMaterials[2].unit_cost
        ]
      );

      console.log(`   ✅ Created BOM for ${finishedProducts[0].name}`);

      // Create BOM for second finished product
      const bom2Result = await db.query(
        `INSERT INTO boms (product_id, reference, version)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [finishedProducts[1].id, 'BOM-DEVICE-001', '1.0']
      );
      const bom2 = bom2Result.rows[0];

      // Add components to BOM 2
      await db.query(
        `INSERT INTO bom_components (bom_id, product_id, quantity, unit, cost, total)
         VALUES ($1, $2, $3, $4, $5, $6),
                ($7, $8, $9, $10, $11, $12),
                ($13, $14, $15, $16, $17, $18)`,
        [
          bom2.id, rawMaterials[1].id, 1, 'M2', rawMaterials[1].unit_cost, rawMaterials[1].unit_cost,
          bom2.id, semiFinished[1].id, 1, 'PCS', semiFinished[1].unit_cost, semiFinished[1].unit_cost,
          bom2.id, rawMaterials[2].id, 2, 'PCS', rawMaterials[2].unit_cost, 2 * rawMaterials[2].unit_cost
        ]
      );

      console.log(`   ✅ Created BOM for ${finishedProducts[1].name}`);
    }

    // Create initial stock ledger entries
    console.log('📊 Creating initial stock ledger entries...');
    
    const rawMaterialsForStock = await db.query(
      "SELECT * FROM products WHERE type = 'RAW_MATERIAL'"
    );

    for (const product of rawMaterialsForStock.rows) {
      // Check if stock ledger already exists
      const existingStockResult = await db.query(
        'SELECT id FROM stock_ledger WHERE product_id = $1 AND reference = $2',
        [product.id, 'INITIAL_STOCK']
      );

      if (existingStockResult.rows.length === 0) {
        await db.query(
          `INSERT INTO stock_ledger (product_id, transaction_type, quantity, unit_cost, total_value, reference)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [product.id, 'IN', product.current_stock, product.unit_cost, product.current_stock * product.unit_cost, 'INITIAL_STOCK']
        );

        console.log(`   ✅ Created initial stock entry for ${product.name}: ${product.current_stock} ${product.unit_of_measure}`);
      } else {
        console.log(`   ⚠️  Initial stock already exists for ${product.name}`);
      }
    }

    console.log('🎉 Clean database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Login with any of these users:');
    console.log('   Business Owner: heet111@gmail.com / Admin@1234');
    console.log('   Manufacturing Manager: john.manager@company.com / Manager@123');
    console.log('   Operator: mike.operator@company.com / Operator@123');
    console.log('   Inventory Manager: sarah.inventory@company.com / Inventory@123');
    console.log('3. Access the API at: http://localhost:5000/api');
    console.log('4. View API documentation: http://localhost:5000/api/health');
    console.log('\n🎯 Each user will see a different dashboard based on their role!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✅ Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupDatabase;