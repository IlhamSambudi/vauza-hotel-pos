require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'hotel_booking_db'
});

const sql = "ALTER TABLE reservations ADD COLUMN meal VARCHAR(50) DEFAULT 'Breakfast' AFTER total_amount";

db.query(sql, (err) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column meal already exists');
        } else {
            console.error('Error altering table:', err.message);
            process.exit(1);
        }
    } else {
        console.log('Column meal added successfully');
    }
    db.end();
});
