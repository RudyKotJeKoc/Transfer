const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database.sqlite');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    // Users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT,
            role TEXT DEFAULT 'viewer',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table ready');
        }
    });

    // Machines table
    db.run(`
        CREATE TABLE IF NOT EXISTS machines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            number TEXT,
            status TEXT NOT NULL,
            destination TEXT,
            line TEXT,
            responsible TEXT NOT NULL,
            notes TEXT,
            weight REAL,
            dimensions TEXT,
            power REAL,
            voltage TEXT,
            oil TEXT,
            requirements TEXT,
            hazmat TEXT,
            dismantling_date DATE,
            transport_date DATE,
            installation_date DATE,
            ppap_date DATE,
            transport_company TEXT,
            planning_notes TEXT,
            ce_certificate TEXT,
            manual_link TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER,
            FOREIGN KEY (created_by) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating machines table:', err.message);
        } else {
            console.log('Machines table ready');
        }
    });

    // Machine history table for audit trail
    db.run(`
        CREATE TABLE IF NOT EXISTS machine_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            machine_id INTEGER NOT NULL,
            user_id INTEGER,
            action TEXT NOT NULL,
            changes TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (machine_id) REFERENCES machines(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating machine_history table:', err.message);
        } else {
            console.log('Machine history table ready');
        }
    });
}

module.exports = db;
