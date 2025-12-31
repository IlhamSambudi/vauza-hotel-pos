require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'hotel_booking_db'
});

db.query('DESCRIBE reservations', (err, results) => {
    if (err) {
        console.error('Error:', err.message);
    } else {
        const col = results.find(c => c.Field === 'status_payment');
        console.log('status_payment column:', col);
    }
    db.end();
});
