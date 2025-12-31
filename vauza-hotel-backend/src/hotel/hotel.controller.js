import db from '../config/db.js';

export const getAll = (req, res) => {
    db.query('SELECT * FROM hotels', (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
};

export const create = (req, res) => {
    const { nama_hotel, city } = req.body;
    db.query(
        'INSERT INTO hotels (nama_hotel, city) VALUES (?, ?)',
        [nama_hotel, city],
        () => res.json({ message: 'Hotel created' })
    );
};
