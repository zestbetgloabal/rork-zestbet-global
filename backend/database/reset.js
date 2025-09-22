#!/usr/bin/env node

// Database reset script - Drops and recreates all tables
const { Pool } = require('pg');
const path = require('path');

// Load environment variables
function loadEnv() {
  try {
    const dotenv = require('dotenv');
    const envPaths = [
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), '../../.env'),
      '.env'
    ];
    
    for (const envPath of envPaths) {
      try {
        dotenv.config({ path: envPath });
        if (process.env.DATABASE_URL) {
          console.log(`✅ Environment loaded from: ${envPath}`);
          return;
        }
      } catch (_e) {
        // Continue to next path
      }
    }
  } catch (_e) {
    console.log('⚠️ dotenv not available, using system environment variables');
  }
}

loadEnv();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...');
    
    // Drop all tables in correct order (respecting foreign keys)
    await pool.query(`
      DROP TABLE IF EXISTS live_bet_wagers CASCADE;
      DROP TABLE IF EXISTS live_bet_markets CASCADE;
      DROP TABLE IF EXISTS social_posts CASCADE;
      DROP TABLE IF EXISTS transactions CASCADE;
      DROP TABLE IF EXISTS challenges CASCADE;
      DROP TABLE IF EXISTS bets CASCADE;
      DROP TABLE IF EXISTS live_events CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    
    console.log('✅ All tables dropped successfully!');
    console.log('🔄 Now running migration to recreate tables...');
    
    // Run the migration script
    const { spawn } = require('child_process');
    const migrate = spawn('node', ['backend/database/migrate.js'], {
      stdio: 'inherit',
      env: process.env
    });
    
    migrate.on('close', (code) => {
      if (code === 0) {
        console.log('🎉 Database reset completed successfully!');
      } else {
        console.error('❌ Migration failed with code:', code);
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Confirm before reset
console.log('⚠️  WARNING: This will delete ALL data in your database!');
console.log('Database URL:', DATABASE_URL.replace(/:[^:@]*@/, ':***@'));

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Are you sure you want to reset the database? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes') {
    resetDatabase();
  } else {
    console.log('❌ Database reset cancelled');
    process.exit(0);
  }
  rl.close();
});