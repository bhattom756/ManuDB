-- Manufacturing Management System - PostgreSQL Schema
-- Direct PostgreSQL implementation without Prisma

-- Create enums
CREATE TYPE role_enum AS ENUM (
  'MANUFACTURING_MANAGER',
  'OPERATOR', 
  'INVENTORY_MANAGER',
  'BUSINESS_OWNER'
);

CREATE TYPE product_type_enum AS ENUM (
  'FINISHED_GOOD',
  'RAW_MATERIAL',
  'SEMI_FINISHED'
);

CREATE TYPE mo_status_enum AS ENUM (
  'DRAFT',
  'CONFIRMED',
  'IN_PROGRESS',
  'TO_CLOSE',
  'CLOSED',
  'CANCELLED',
  'DELETED'
);

CREATE TYPE wo_status_enum AS ENUM (
  'PLANNED',
  'STARTED',
  'PAUSED',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE work_center_status_enum AS ENUM (
  'ACTIVE',
  'UNDER_MAINTENANCE',
  'INACTIVE'
);

CREATE TYPE transaction_type_enum AS ENUM (
  'IN',
  'OUT',
  'ADJUSTMENT'
);

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  mobile_no VARCHAR(20),
  role role_enum DEFAULT 'OPERATOR',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  type product_type_enum DEFAULT 'RAW_MATERIAL',
  unit_of_measure VARCHAR(50) DEFAULT 'PCS',
  unit_cost DECIMAL(10,2) DEFAULT 0,
  current_stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOMs table
CREATE TABLE boms (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reference VARCHAR(255),
  version VARCHAR(50) DEFAULT '1.0',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOM Components table
CREATE TABLE bom_components (
  id SERIAL PRIMARY KEY,
  bom_id INTEGER NOT NULL REFERENCES boms(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit VARCHAR(50) DEFAULT 'PCS',
  cost DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0
);

-- Work Centers table
CREATE TABLE work_centers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  capacity INTEGER DEFAULT 8,
  cost_per_hour DECIMAL(10,2) DEFAULT 0,
  status work_center_status_enum DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manufacturing Orders table
CREATE TABLE manufacturing_orders (
  id SERIAL PRIMARY KEY,
  mo_number VARCHAR(255) UNIQUE NOT NULL,
  finished_product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  schedule_date TIMESTAMP NOT NULL,
  status mo_status_enum DEFAULT 'DRAFT',
  bill_of_material_id INTEGER REFERENCES boms(id),
  assignee_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work Orders table
CREATE TABLE work_orders (
  id SERIAL PRIMARY KEY,
  mo_id INTEGER NOT NULL REFERENCES manufacturing_orders(id) ON DELETE CASCADE,
  work_center_id INTEGER NOT NULL REFERENCES work_centers(id),
  operation_name VARCHAR(255) NOT NULL,
  status wo_status_enum DEFAULT 'PLANNED',
  expected_duration INTEGER NOT NULL,
  real_duration INTEGER,
  assigned_to_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock Ledger table
CREATE TABLE stock_ledger (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  transaction_type transaction_type_enum NOT NULL,
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10,2) DEFAULT 0,
  total_value DECIMAL(10,2) DEFAULT 0,
  reference VARCHAR(255),
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work Order Comments table
CREATE TABLE work_order_comments (
  id SERIAL PRIMARY KEY,
  work_order_id INTEGER NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work Order Issues table
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

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_manufacturing_orders_mo_number ON manufacturing_orders(mo_number);
CREATE INDEX idx_manufacturing_orders_status ON manufacturing_orders(status);
CREATE INDEX idx_work_orders_mo_id ON work_orders(mo_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_stock_ledger_product_id ON stock_ledger(product_id);
CREATE INDEX idx_stock_ledger_transaction_date ON stock_ledger(transaction_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boms_updated_at BEFORE UPDATE ON boms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_centers_updated_at BEFORE UPDATE ON work_centers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manufacturing_orders_updated_at BEFORE UPDATE ON manufacturing_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON work_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_order_issues_updated_at BEFORE UPDATE ON work_order_issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
