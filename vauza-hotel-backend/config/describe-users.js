require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'hotel_booking_db'
});

db.query('DESCRIBE users', (err, results) => {
    if (err) {
        console.error('ERROR:', err.message);
        process.exit(1);
    }
    console.log('Schema:', results);
    db.end();
});
