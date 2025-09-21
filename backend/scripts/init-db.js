const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Function to parse SQL statements handling dollar-quoted strings
function parseSQLStatements(sql) {
  const statements = [];
  let currentStatement = '';
  let inDollarQuote = false;
  let dollarTag = '';
  let i = 0;
  
  while (i < sql.length) {
    const char = sql[i];
    
    if (!inDollarQuote) {
      if (char === '$') {
        // Check for dollar-quoted string start
        let j = i + 1;
        let tag = '';
        while (j < sql.length && sql[j] !== '$') {
          tag += sql[j];
          j++;
        }
        if (j < sql.length && sql[j] === '$') {
          inDollarQuote = true;
          dollarTag = tag;
          currentStatement += sql.substring(i, j + 1);
          i = j + 1;
          continue;
        }
      } else if (char === ';') {
        // End of statement
        if (currentStatement.trim()) {
          statements.push(currentStatement.trim());
        }
        currentStatement = '';
        i++;
        continue;
      }
    } else {
      // Inside dollar-quoted string
      if (char === '$') {
        // Check for dollar-quoted string end
        let j = i + 1;
        let tag = '';
        while (j < sql.length && sql[j] !== '$') {
          tag += sql[j];
          j++;
        }
        if (j < sql.length && sql[j] === '$' && tag === dollarTag) {
          inDollarQuote = false;
          dollarTag = '';
          currentStatement += sql.substring(i, j + 1);
          i = j + 1;
          continue;
        }
      }
    }
    
    currentStatement += char;
    i++;
  }
  
  // Add the last statement if it exists
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }
  
  return statements;
}

async function initializeDatabase() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'manufacturing_db',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || 'admin'),
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🚀 Initializing PostgreSQL database...');
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Parse SQL statements properly handling dollar-quoted strings
    const statements = parseSQLStatements(schema);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
        } catch (error) {
          // Ignore "already exists" errors for types and tables
          if (error.code === '42710' || error.code === '42P07') {
            console.log(`⚠️  Skipping existing object: ${error.message.split('\n')[0]}`);
            continue;
          }
          throw error;
        }
      }
    }
    console.log('📝 Next steps:');
    console.log('1. Run: npm run db:setup');
    console.log('2. Start the server: npm run dev');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = initializeDatabase;
