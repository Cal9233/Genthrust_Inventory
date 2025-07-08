require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function initDatabase() {
    try {
        console.log('Initializing database...');
        
        // Read schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Execute schema
        await pool.query(schema);
        
        console.log('Database initialized successfully!');
        console.log('Tables created:');
        console.log('- users');
        console.log('- quotes');
        console.log('- inventory_items');
        console.log('- quote_responses');
        console.log('- excel_files');
        
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run if called directly
if (require.main === module) {
    initDatabase();
}

module.exports = initDatabase;