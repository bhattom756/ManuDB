const db = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function setupProductionDatabase() {
  try {
    console.log('Setting up production database...');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements while respecting quotes and dollar-quoting
    const statements = splitSqlStatements(schema);
    
    // Execute each statement, ignore idempotent duplicates
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (!trimmed) continue;

      try {
        await db.query(trimmed);
        console.log('✓ Executed:', trimmed.substring(0, 80) + '...');
      } catch (err) {
        const message = String(err && err.message ? err.message : err);
        const code = err && err.code ? String(err.code) : '';
        // Common duplicate/idempotent cases in PG:
        // 42710 duplicate_object (e.g., type/table already exists)
        // 42P07 duplicate_table
        // 42701 duplicate_column
        // 23505 unique_violation (for seed data)
        const isIdempotent =
          code === '42710' ||
          code === '42P07' ||
          code === '42701' ||
          code === '23505' ||
          /already exists/i.test(message) ||
          /duplicate/i.test(message);

        if (isIdempotent) {
          console.log('↷ Skipped (already exists):', trimmed.substring(0, 80) + '...');
          continue;
        }

        console.error('❌ Statement failed:', trimmed.substring(0, 120) + '...');
        throw err;
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

// --- Helpers ---
function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false; // -- comment
  let inBlockComment = false; // /* ... */
  let inDollarTag = null; // like $func$

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    const next = i + 1 < sql.length ? sql[i + 1] : '';

    // Handle exiting line comments
    if (inLineComment) {
      current += ch;
      if (ch === '\n') inLineComment = false;
      continue;
    }

    // Handle exiting block comments
    if (inBlockComment) {
      current += ch;
      if (ch === '*' && next === '/') {
        current += next; i++; inBlockComment = false;
      }
      continue;
    }

    // Detect start of comments when not in quotes/dollar-quote
    if (!inSingle && !inDouble && !inDollarTag) {
      if (ch === '-' && next === '-') { inLineComment = true; current += ch; continue; }
      if (ch === '/' && next === '*') { inBlockComment = true; current += ch; continue; }
    }

    // Dollar-quoting start/end detection
    if (!inSingle && !inDouble) {
      if (!inDollarTag && ch === '$') {
        // Capture tag like $tag$
        const match = sql.slice(i).match(/^\$[a-zA-Z0-9_]*\$/);
        if (match) { inDollarTag = match[0]; current += inDollarTag; i += inDollarTag.length - 1; continue; }
      } else if (inDollarTag && ch === '$') {
        const match = sql.slice(i, i + inDollarTag.length);
        if (match === inDollarTag) { current += match; i += inDollarTag.length - 1; inDollarTag = null; continue; }
      }
    }

    // Quote toggling when not in dollar-quote
    if (!inDollarTag) {
      if (ch === "'" && !inDouble) { inSingle = !inSingle; current += ch; continue; }
      if (ch === '"' && !inSingle) { inDouble = !inDouble; current += ch; continue; }
    }

    // Statement terminator when not inside any quoted/comment/dollar context
    if (ch === ';' && !inSingle && !inDouble && !inDollarTag) {
      const trimmed = current.trim();
      if (trimmed) statements.push(trimmed);
      current = '';
      continue;
    }

    current += ch;
  }

  const tail = current.trim();
  if (tail) statements.push(tail);
  return statements;
}
