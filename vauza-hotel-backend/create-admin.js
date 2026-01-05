import dotenv from 'dotenv';
import mysql from 'mysql2';
import bcrypt from 'bcryptjs';

dotenv.config();

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'hotel_booking_db'
});

const username = 'admin';
const password = 'admin123';
const saltRounds = 10;

const createAdmin = async () => {
    try {
        const hash = await bcrypt.hash(password, saltRounds);

        // Check if user exists
        db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
            if (err) {
                console.error('Error checking user:', err);
                process.exit(1);
            }

            if (results.length > 0) {
                // Update existing user
                console.log('User exists, updating password...');
                db.query('UPDATE users SET password = ? WHERE username = ?', [hash, username], (err, res) => {
                    if (err) {
                        console.error('Error updating user:', err);
                    } else {
                        console.log('User password updated successfully.');
                    }
                    db.end();
                });
            } else {
                // Create new user
                console.log('User does not exist, creating...');
                db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err, res) => {
                    if (err) {
                        console.error('Error creating user:', err);
                    } else {
                        console.log('User created successfully.');
                    }
                    db.end();
                });
            }
        });

    } catch (err) {
        console.error('Script error:', err);
        process.exit(1);
    }
};

createAdmin();
