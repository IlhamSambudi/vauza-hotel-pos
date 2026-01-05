import sheets from '../../server/services/googleSheet.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
    const { username, password } = req.body;
    const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
    const USERS_RANGE = "users!A:C"; // Username, Password, Role

    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan password wajib diisi' });
    }

    try {
        const result = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: USERS_RANGE
        });

        const rows = result.data.values || [];

        // Find user by username
        // Row format: [ID, Username, PasswordHash, Role]
        // User said: A=ID, B=Username, C=Password
        const userRow = rows.find(row => row[1] === username);

        if (!userRow) {
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        const storedHash = userRow[2];
        let isMatch = false;

        // Check if stored password is a bcrypt hash (starts with $2b$ or $2a$)
        if (storedHash.startsWith('$2b$') || storedHash.startsWith('$2a$')) {
            isMatch = bcrypt.compareSync(password, storedHash);
        } else {
            // Fallback for plain text (as seen in Row 2)
            isMatch = (password === storedHash);
        }

        if (!isMatch) {
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        const user = {
            id: userRow[0],
            username: userRow[1],
            role: userRow[3] || 'staff' // Assuming D might be role, or default to staff
        };

        const token = jwt.sign(
            { username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login berhasil',
            token,
            user
        });

    } catch (err) {
        console.error("Auth Error:", err);
        return res.status(500).json({ message: 'Server authentication error' });
    }
};
