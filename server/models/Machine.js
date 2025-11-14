const db = require('../config/database');

class Machine {
    // Create new machine
    static async create(machineData, userId) {
        const {
            type, number, status, destination, line, responsible, notes,
            weight, dimensions, power, voltage, oil, requirements, hazmat,
            dismantlingDate, transportDate, installationDate, ppapDate,
            transportCompany, planningNotes, ceCertificate, manualLink
        } = machineData;

        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO machines (
                    type, number, status, destination, line, responsible, notes,
                    weight, dimensions, power, voltage, oil, requirements, hazmat,
                    dismantling_date, transport_date, installation_date, ppap_date,
                    transport_company, planning_notes, ce_certificate, manual_link, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    type, number, status, destination, line, responsible, notes,
                    weight, dimensions, power, voltage, oil, requirements, hazmat,
                    dismantlingDate, transportDate, installationDate, ppapDate,
                    transportCompany, planningNotes, ceCertificate, manualLink, userId
                ],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        // Log to history
                        Machine.logHistory(this.lastID, userId, 'CREATE', machineData);
                        resolve({ id: this.lastID, ...machineData });
                    }
                }
            );
        });
    }

    // Get all machines
    static async getAll(filters = {}) {
        let query = 'SELECT * FROM machines WHERE 1=1';
        const params = [];

        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        if (filters.destination) {
            query += ' AND destination = ?';
            params.push(filters.destination);
        }

        if (filters.responsible) {
            query += ' AND responsible = ?';
            params.push(filters.responsible);
        }

        if (filters.search) {
            query += ' AND (type LIKE ? OR number LIKE ? OR notes LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY updated_at DESC';

        return new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Get machine by ID
    static async getById(id) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM machines WHERE id = ?`,
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

    // Update machine
    static async update(id, updates, userId) {
        const fields = [];
        const values = [];

        const allowedFields = [
            'type', 'number', 'status', 'destination', 'line', 'responsible', 'notes',
            'weight', 'dimensions', 'power', 'voltage', 'oil', 'requirements', 'hazmat',
            'dismantling_date', 'transport_date', 'installation_date', 'ppap_date',
            'transport_company', 'planning_notes', 'ce_certificate', 'manual_link'
        ];

        Object.keys(updates).forEach(key => {
            const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            if (allowedFields.includes(dbKey)) {
                fields.push(`${dbKey} = ?`);
                values.push(updates[key]);
            }
        });

        if (fields.length === 0) {
            return Promise.reject(new Error('No valid fields to update'));
        }

        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE machines SET ${fields.join(', ')} WHERE id = ?`,
                values,
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        // Log to history
                        Machine.logHistory(id, userId, 'UPDATE', updates);
                        resolve({ changes: this.changes });
                    }
                }
            );
        });
    }

    // Delete machine
    static async delete(id, userId) {
        return new Promise((resolve, reject) => {
            db.run(
                `DELETE FROM machines WHERE id = ?`,
                [id],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        // Log to history
                        Machine.logHistory(id, userId, 'DELETE', {});
                        resolve({ changes: this.changes });
                    }
                }
            );
        });
    }

    // Get machine history
    static async getHistory(machineId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT h.*, u.username
                 FROM machine_history h
                 LEFT JOIN users u ON h.user_id = u.id
                 WHERE h.machine_id = ?
                 ORDER BY h.timestamp DESC`,
                [machineId],
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

    // Log action to history
    static async logHistory(machineId, userId, action, changes) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO machine_history (machine_id, user_id, action, changes)
                 VALUES (?, ?, ?, ?)`,
                [machineId, userId, action, JSON.stringify(changes)],
                function(err) {
                    if (err) {
                        console.error('Error logging history:', err);
                        reject(err);
                    } else {
                        resolve({ id: this.lastID });
                    }
                }
            );
        });
    }

    // Get statistics
    static async getStatistics() {
        return new Promise((resolve, reject) => {
            const stats = {};

            // Total machines
            db.get('SELECT COUNT(*) as total FROM machines', [], (err, row) => {
                if (err) return reject(err);
                stats.total = row.total;

                // By destination
                db.all(
                    `SELECT destination, COUNT(*) as count FROM machines
                     GROUP BY destination`,
                    [],
                    (err, rows) => {
                        if (err) return reject(err);
                        stats.byDestination = rows;

                        // By status
                        db.all(
                            `SELECT status, COUNT(*) as count FROM machines
                             GROUP BY status`,
                            [],
                            (err, rows) => {
                                if (err) return reject(err);
                                stats.byStatus = rows;

                                resolve(stats);
                            }
                        );
                    }
                );
            });
        });
    }
}

module.exports = Machine;
