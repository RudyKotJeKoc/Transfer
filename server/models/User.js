const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    // Create new user
    static async create(username, password, email = null, role = 'viewer') {
        const hashedPassword = await bcrypt.hash(password, 10);

        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)`,
                [username, hashedPassword, email, role],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, username, email, role });
                    }
                }
            );
        });
    }

    // Find user by username
    static async findByUsername(username) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM users WHERE username = ?`,
                [username],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }

    // Find user by ID
    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT id, username, email, role, created_at FROM users WHERE id = ?`,
                [id],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        });
    }

    // Verify password
    static async verifyPassword(password, hashedPassword) {
        return bcrypt.compare(password, hashedPassword);
    }

    // Get all users
    static async getAll() {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT id, username, email, role, created_at FROM users`,
                [],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    // Update user
    static async update(id, updates) {
        const fields = [];
        const values = [];

        Object.keys(updates).forEach(key => {
            if (key !== 'password' && key !== 'id') {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });

        if (updates.password) {
            const hashedPassword = await bcrypt.hash(updates.password, 10);
            fields.push('password = ?');
            values.push(hashedPassword);
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
                values,
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ changes: this.changes });
                    }
                }
            );
        });
    }

    // Delete user
    static async delete(id) {
        return new Promise((resolve, reject) => {
            db.run(
                `DELETE FROM users WHERE id = ?`,
                [id],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ changes: this.changes });
                    }
                }
            );
        });
    }
}

module.exports = User;
