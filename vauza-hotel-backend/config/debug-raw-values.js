import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, "credentials/google-service-account.json"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

async function run() {
    try {
        console.log(`Checking Spreadsheet: ${SPREADSHEET_ID}`);

        // 1. Raw Clients
        const resClients = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "clients!A:C" });
        console.log("\n--- RAW CLIENTS ---");
        console.log(resClients.data.values);

        // 2. Raw Payments
        const resPay = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "payments!A:Z" });
        console.log("\n--- RAW PAYMENTS ---");
        const rows = resPay.data.values || [];
        if (rows.length > 0) {
            console.log("HEADER ROW:", rows[0]);
            rows.slice(1, 6).forEach((r, i) => console.log(`Row ${i + 1}: ${r}`));
        } else {
            console.log("No headers found in Payments!");
        }

    } catch (err) {
        console.error("Error:", err.message);
    }
}

run();
