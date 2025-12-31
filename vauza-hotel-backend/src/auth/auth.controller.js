import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan password wajib diisi' });
    }

    db.query(
        'SELECT * FROM users WHERE username = ? LIMIT 1',
        [username],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Server error' });
            if (results.length === 0)
                return res.status(401).json({ message: 'Username atau password salah' });

            const user = results[0];
            const isMatch = bcrypt.compareSync(password, user.password);
            if (!isMatch)
                return res.status(401).json({ message: 'Username atau password salah' });

            const token = jwt.sign(
                { id: user.id_user, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.json({
                message: 'Login berhasil',
                token
            });
        }
    );
};
