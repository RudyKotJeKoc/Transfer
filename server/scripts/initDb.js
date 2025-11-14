const User = require('../models/User');
const db = require('../config/database');

// Wait for database to be ready
setTimeout(async () => {
    try {
        console.log('Initializing database with default users...');

        const defaultUsers = [
            { username: 'Roy', password: 'roy123', email: 'roy@transfer.local', role: 'admin' },
            { username: 'Jiri', password: 'jiri123', email: 'jiri@transfer.local', role: 'admin' },
            { username: 'Hans', password: 'hans123', email: 'hans@transfer.local', role: 'technician' },
            { username: 'Remon', password: 'remon123', email: 'remon@transfer.local', role: 'technician' },
            { username: 'Patrick', password: 'patrick123', email: 'patrick@transfer.local', role: 'technician' },
            { username: 'Jon', password: 'jon123', email: 'jon@transfer.local', role: 'viewer' },
            { username: 'Wil', password: 'wil123', email: 'wil@transfer.local', role: 'viewer' },
            { username: 'Berry', password: 'berry123', email: 'berry@transfer.local', role: 'viewer' },
            { username: 'Mark', password: 'mark123', email: 'mark@transfer.local', role: 'viewer' },
            { username: 'Adrian', password: 'adrian123', email: 'adrian@transfer.local', role: 'viewer' },
            { username: 'Jeffrey', password: 'jeffrey123', email: 'jeffrey@transfer.local', role: 'viewer' },
            { username: 'John L.', password: 'johnl123', email: 'johnl@transfer.local', role: 'viewer' }
        ];

        for (const userData of defaultUsers) {
            try {
                // Check if user exists
                const existingUser = await User.findByUsername(userData.username);

                if (!existingUser) {
                    await User.create(
                        userData.username,
                        userData.password,
                        userData.email,
                        userData.role
                    );
                    console.log(`✓ Created user: ${userData.username} (${userData.role})`);
                } else {
                    console.log(`- User already exists: ${userData.username}`);
                }
            } catch (error) {
                console.error(`✗ Error creating user ${userData.username}:`, error.message);
            }
        }

        console.log('\nDatabase initialization complete!');
        console.log('\n╔═══════════════════════════════════════════════════════╗');
        console.log('║   Default Login Credentials                          ║');
        console.log('╠═══════════════════════════════════════════════════════╣');
        console.log('║   Admin Users:                                        ║');
        console.log('║   - Username: Roy    Password: roy123                ║');
        console.log('║   - Username: Jiri   Password: jiri123               ║');
        console.log('╠═══════════════════════════════════════════════════════╣');
        console.log('║   Note: Change passwords in production!              ║');
        console.log('╚═══════════════════════════════════════════════════════╝\n');

        // Close database connection
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            }
            process.exit(0);
        });
    } catch (error) {
        console.error('Fatal error during initialization:', error);
        process.exit(1);
    }
}, 2000); // Wait 2 seconds for database to initialize
