require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'hotel_booking_db'
});

db.query('SELECT 1', (err, results) => {
    if (err) {
        console.error('CONNECTION ERROR:', err.message);
        process.exit(1);
    }
    console.log('Connection successful!');

    db.query('SELECT COUNT(*) as count FROM clients', (err, results) => {
        if (err) console.error('Error querying clients:', err.message);
        else console.log('Clients count:', results[0].count);

        db.query('SELECT COUNT(*) as count FROM hotels', (err, results) => {
            if (err) console.error('Error querying hotels:', err.message);
            else console.log('Hotels count:', results[0].count);

            db.end();
        });
    });
});
