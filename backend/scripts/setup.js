const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Clean Manufacturing Management System...');

    // Create default admin user
    console.log('👤 Creating default admin user...');
    
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'heet111@gmail.com' }
    });

    if (existingAdmin) {
      console.log('✅ Default admin user already exists');
    } else {
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash('Admin@1234', saltRounds);

      const admin = await prisma.user.create({
        data: {
          name: 'Business Owner',
          email: 'heet111@gmail.com',
          passwordHash,
          mobileNo: '1234567890',
          role: 'BUSINESS_OWNER'
        }
      });

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
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const userPasswordHash = await bcrypt.hash(userData.password, 12);
        const user = await prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            passwordHash: userPasswordHash,
            mobileNo: userData.mobileNo,
            role: userData.role
          }
        });
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
      const existingProduct = await prisma.product.findUnique({
        where: { name: productData.name }
      });

      if (!existingProduct) {
        const product = await prisma.product.create({
          data: productData
        });
        console.log(`   ✅ Created product: ${product.name} (Stock: ${product.currentStock})`);
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
      const existingWorkCenter = await prisma.workCenter.findUnique({
        where: { name: workCenterData.name }
      });

      if (!existingWorkCenter) {
        const workCenter = await prisma.workCenter.create({
          data: workCenterData
        });
        console.log(`   ✅ Created work center: ${workCenter.name}`);
      } else {
        console.log(`   ⚠️  Work center already exists: ${workCenterData.name}`);
      }
    }

    // Create sample BOMs
    console.log('📋 Creating sample BOMs...');
    
    const finishedProducts = await prisma.product.findMany({
      where: { type: 'FINISHED_GOOD' }
    });

    const rawMaterials = await prisma.product.findMany({
      where: { type: 'RAW_MATERIAL' }
    });

    const semiFinished = await prisma.product.findMany({
      where: { type: 'SEMI_FINISHED' }
    });

    if (finishedProducts.length >= 2 && rawMaterials.length >= 3 && semiFinished.length >= 2) {
      // Create BOM for first finished product
      const bom1 = await prisma.bOM.create({
        data: {
          productId: finishedProducts[0].id,
          reference: 'BOM-WIDGET-001',
          version: '1.0'
        }
      });

      // Add components to BOM 1
      await prisma.bOMComponent.createMany({
        data: [
          {
            bomId: bom1.id,
            productId: rawMaterials[0].id, // Steel Rod
            quantity: 2,
            unit: 'KG',
            cost: rawMaterials[0].unitCost,
            total: 2 * rawMaterials[0].unitCost
          },
          {
            bomId: bom1.id,
            productId: semiFinished[0].id, // Steel Frame
            quantity: 1,
            unit: 'PCS',
            cost: semiFinished[0].unitCost,
            total: semiFinished[0].unitCost
          },
          {
            bomId: bom1.id,
            productId: rawMaterials[2].id, // Electronic Component
            quantity: 1,
            unit: 'PCS',
            cost: rawMaterials[2].unitCost,
            total: rawMaterials[2].unitCost
          }
        ]
      });

      console.log(`   ✅ Created BOM for ${finishedProducts[0].name}`);

      // Create BOM for second finished product
      const bom2 = await prisma.bOM.create({
        data: {
          productId: finishedProducts[1].id,
          reference: 'BOM-DEVICE-001',
          version: '1.0'
        }
      });

      // Add components to BOM 2
      await prisma.bOMComponent.createMany({
        data: [
          {
            bomId: bom2.id,
            productId: rawMaterials[1].id, // Plastic Sheet
            quantity: 1,
            unit: 'M2',
            cost: rawMaterials[1].unitCost,
            total: rawMaterials[1].unitCost
          },
          {
            bomId: bom2.id,
            productId: semiFinished[1].id, // Plastic Housing
            quantity: 1,
            unit: 'PCS',
            cost: semiFinished[1].unitCost,
            total: semiFinished[1].unitCost
          },
          {
            bomId: bom2.id,
            productId: rawMaterials[2].id, // Electronic Component
            quantity: 2,
            unit: 'PCS',
            cost: rawMaterials[2].unitCost,
            total: 2 * rawMaterials[2].unitCost
          }
        ]
      });

      console.log(`   ✅ Created BOM for ${finishedProducts[1].name}`);
    }

    // Create initial stock ledger entries
    console.log('📊 Creating initial stock ledger entries...');
    
    const rawMaterials = await prisma.product.findMany({
      where: { type: 'RAW_MATERIAL' }
    });

    for (const product of rawMaterials) {
      // Check if stock ledger already exists
      const existingStock = await prisma.stockLedger.findFirst({
        where: {
          productId: product.id,
          reference: 'INITIAL_STOCK'
        }
      });

      if (!existingStock) {
        await prisma.stockLedger.create({
          data: {
            productId: product.id,
            transactionType: 'IN',
            quantity: product.currentStock,
            unitCost: product.unitCost,
            totalValue: product.currentStock * product.unitCost,
            reference: 'INITIAL_STOCK'
          }
        });

        console.log(`   ✅ Created initial stock entry for ${product.name}: ${product.currentStock} ${product.unitOfMeasure}`);
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
    await prisma.$disconnect();
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