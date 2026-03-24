const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function init() {
  // Use the provided password to connect as 'postgres' superuser first
  const superuserPassword = process.env.DB_PASSWORD || '';
  
  const client = new Client({
    user: 'postgres',
    host: '127.0.0.1',
    password: superuserPassword,
    database: 'postgres',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Connected as superuser.');

    // Create app user if not exists
    try {
      await client.query(`CREATE USER civicfix_user WITH PASSWORD '${superuserPassword || 'secure_password'}'`);
      console.log('Created user civicfix_user');
    } catch (e) {
      if (e.code === '42710') console.log('User civicfix_user already exists');
      else console.error('Error creating user:', e.message);
    }

    // Create database if not exists
    const dbName = 'civicfix_db';
    const checkDb = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (checkDb.rows.length === 0) {
      await client.query(`CREATE DATABASE ${dbName} OWNER civicfix_user`);
      console.log(`Created database: ${dbName}`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }
  } catch (err) {
    if (err.code === '28P01') {
       console.error('AUTHENTICATION_FAILED: The password in .env is incorrect.');
    } else {
       console.error('CONNECTION_FAILED:', err.message);
    }
    process.exit(1);
  } finally {
    await client.end();
  }

  // Now connect to civicfix_db to run schema
  const civicClient = new Client({
    user: 'postgres',
    host: '127.0.0.1',
    password: superuserPassword,
    database: 'civicfix_db',
    port: 5432,
  });

  try {
    await civicClient.connect();
    console.log('Connected to civicfix_db to run schema.');

    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error('Schema file not found at:', schemaPath);
      return;
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Enable extensions
    await civicClient.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

    // Run schema
    const queries = schemaSql.split(';').filter(q => q.trim().length > 0);
    for (let q of queries) {
      try {
        await civicClient.query(q);
      } catch (innerErr) {
        if (!innerErr.message.includes('already exists') && !innerErr.message.includes('already a policy')) {
           console.warn('Schema Query Warning:', innerErr.message);
        }
      }
    }
    console.log('Database tables and schema initialized successfully!');
  } catch (err) {
    console.error('Failed to initialize schema:', err.message);
  } finally {
    await civicClient.end();
  }
}

init();
