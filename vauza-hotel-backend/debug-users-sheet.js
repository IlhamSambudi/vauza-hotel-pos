import sheets from './server/services/googleSheet.js';
import dotenv from 'dotenv';
dotenv.config();

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const RANGE = "users!A:E";

async function readUsers() {
    try {
        console.log("Reading users sheet...");
        const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE
        });

        const rows = res.data.values || [];
        console.log("Total rows:", rows.length);
        rows.forEach((row, i) => {
            console.log(`Row ${i + 1}:`, JSON.stringify(row));
        });

    } catch (err) {
        console.error("Error reading users:", err);
    }
}

readUsers();
