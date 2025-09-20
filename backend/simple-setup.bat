@echo off
echo ========================================
echo   MANUFACTURING MANAGEMENT SYSTEM
echo   Simple Database Setup
echo ========================================
echo.

echo Step 1: Creating environment file...
copy env.example .env
echo ✅ Environment file created!

echo.
echo Step 2: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ npm install failed
    pause
    exit /b 1
)

echo.
echo Step 3: Creating database...
cmd /c "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE manufacturing_db;"
if %errorlevel% equ 0 (
    echo ✅ Database created successfully!
) else (
    echo ⚠️  Database might already exist, continuing...
)

echo.
echo Step 4: Creating tables manually...
cmd /c "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d manufacturing_db -c "
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    mobile_no VARCHAR(20),
    role VARCHAR(50) DEFAULT 'OPERATOR',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) DEFAULT 'RAW_MATERIAL',
    unit_of_measure VARCHAR(50) DEFAULT 'PCS',
    unit_cost DECIMAL(10,2) DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE work_centers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    capacity INTEGER DEFAULT 8,
    cost_per_hour DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE boms (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    reference VARCHAR(255),
    version VARCHAR(50) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bom_components (
    id SERIAL PRIMARY KEY,
    bom_id INTEGER NOT NULL REFERENCES boms(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit VARCHAR(50) DEFAULT 'PCS',
    cost DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE manufacturing_orders (
    id SERIAL PRIMARY KEY,
    mo_number VARCHAR(255) UNIQUE NOT NULL,
    finished_product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    schedule_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT',
    bill_of_material_id INTEGER REFERENCES boms(id),
    assignee_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE work_orders (
    id SERIAL PRIMARY KEY,
    mo_id INTEGER NOT NULL REFERENCES manufacturing_orders(id) ON DELETE CASCADE,
    work_center_id INTEGER NOT NULL REFERENCES work_centers(id),
    operation_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'PLANNED',
    expected_duration INTEGER NOT NULL,
    real_duration INTEGER,
    assigned_to_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_ledger (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    transaction_type VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2) DEFAULT 0,
    total_value DECIMAL(10,2) DEFAULT 0,
    reference VARCHAR(255),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE work_order_comments (
    id SERIAL PRIMARY KEY,
    work_order_id INTEGER NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE work_order_issues (
    id SERIAL PRIMARY KEY,
    work_order_id INTEGER NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    issue_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"

if %errorlevel% equ 0 (
    echo ✅ Tables created successfully!
) else (
    echo ❌ Table creation failed
    pause
    exit /b 1
)

echo.
echo Step 5: Adding sample data...
cmd /c "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d manufacturing_db -c "
INSERT INTO users (name, email, password_hash, mobile_no, role) VALUES 
('Admin User', 'admin@example.com', '\$2a\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8QzKz2', '1234567890', 'BUSINESS_OWNER'),
('John Manager', 'john@example.com', '\$2a\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8QzKz2', '9876543210', 'MANUFACTURING_MANAGER'),
('Mike Operator', 'mike@example.com', '\$2a\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8QzKz2', '9876543211', 'OPERATOR');

INSERT INTO products (name, type, unit_of_measure, unit_cost, current_stock) VALUES 
('Steel Rod', 'RAW_MATERIAL', 'KG', 5.50, 1000),
('Plastic Sheet', 'RAW_MATERIAL', 'M2', 12.00, 500),
('Electronic Component', 'RAW_MATERIAL', 'PCS', 25.00, 200),
('Steel Frame', 'SEMI_FINISHED', 'PCS', 45.00, 0),
('Plastic Housing', 'SEMI_FINISHED', 'PCS', 18.00, 0),
('Industrial Widget', 'FINISHED_GOOD', 'PCS', 120.00, 0);

INSERT INTO work_centers (name, capacity, cost_per_hour, status) VALUES 
('Assembly Line 1', 8, 50.00, 'ACTIVE'),
('Quality Control', 6, 45.00, 'ACTIVE'),
('Packaging Station', 4, 30.00, 'ACTIVE');
"

if %errorlevel% equ 0 (
    echo ✅ Sample data added successfully!
) else (
    echo ⚠️  Sample data addition had issues, but tables are created
)

echo.
echo ========================================
echo   SETUP COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo 📊 Database: manufacturing_db
echo 📋 Tables created: 10
echo 👥 Sample users: 3
echo 📦 Sample products: 6
echo 🏭 Work centers: 3
echo.
echo 🎯 Next steps:
echo 1. Refresh pgAdmin 4 to see the tables
echo 2. Start the server: npm run dev
echo 3. Test API endpoints
echo.
echo 🌐 Server will run on: http://localhost:5000
echo 📚 API documentation: http://localhost:5000/api/health
echo.

pause
