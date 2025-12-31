require('dotenv').config();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'hotel_booking_db'
});

const newPassword = bcrypt.hashSync('admin123', 10);

db.query(
    'UPDATE users SET password = ? WHERE username = "admin"',
    [newPassword],
    (err, result) => {
        if (err) {
            console.error('ERROR:', err.message);
            process.exit(1);
        }
        console.log('Password updated for admin. New password: admin123');
        db.end();
    }
);
