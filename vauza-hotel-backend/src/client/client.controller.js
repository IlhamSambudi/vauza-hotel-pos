import db from '../config/db.js';

export const getAll = (req, res) => {
    db.query('SELECT * FROM clients', (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
};

export const create = (req, res) => {
    const { nama_client } = req.body;
    db.query(
        'INSERT INTO clients (nama_client) VALUES (?)',
        [nama_client],
        () => res.json({ message: 'Client created' })
    );
};
