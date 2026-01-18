import sheets from './server/services/googleSheet.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const RANGE = "users!A:C"; // ID, Username, PasswordHash

async function seedAdmin() {
    try {
        console.log("Checking if users sheet exists...");

        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE
        });

        const rows = res.data.values || [];
        // Check Col B (index 1) for username
        const adminExists = rows.find(row => row[1] === 'admin');

        if (adminExists) {
            console.log("Admin user already exists in Sheet. (ID: " + adminExists[0] + ")");
            // We might want to force update password if it was wrong before
            // But finding row index is tricky without full scan.
            // Let's assume user deletes bad row if needed, or we implement update.
            console.log("To reset password, please delete the admin row in the Sheet manually and re-run this.");
            return;
        }

        console.log("Creating admin user...");
        const hash = bcrypt.hashSync('admin123', 10);

        // Structure: [ID, Username, Password]
        const newRow = ['u_admin_01', 'admin', hash, 'admin'];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [newRow]
            }
        });

        console.log("Admin user created in Sheet with correct structure.");

    } catch (err) {
        console.error("Error seeding admin:", err);
    }
}

seedAdmin();
