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

db.query(
    'SELECT * FROM users WHERE username = ? LIMIT 1',
    [username],
    (err, results) => {
        if (err) {
            console.error('DB Error:', err);
            process.exit(1);
        }
        if (results.length === 0) {
            console.log('User not found');
        } else {
            const user = results[0];
            console.log('User found:', user.username);
            console.log('Stored Hash:', user.password);

            const isMatch = bcrypt.compareSync(password, user.password);
            console.log('Password Match Result:', isMatch);
        }
        db.end();
    }
);
