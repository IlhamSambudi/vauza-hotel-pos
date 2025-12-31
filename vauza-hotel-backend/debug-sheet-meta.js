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

        // 1. Get Metadata (Sheet Names & GIDs)
        const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
        console.log("\n--- Sheets Metadata ---");
        meta.data.sheets.forEach(s => {
            console.log(`Title: "${s.properties.title}", ID (GID): ${s.properties.sheetId}`);
        });

        // 2. Check Clients Data
        console.log("\n--- Clients Data (First 5) ---");
        const resClients = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "clients!A:B"
        });
        const clients = resClients.data.values || [];
        console.log(clients.slice(0, 5));
        const clientIds = new Set(clients.map(c => c[0]));

        // 3. Check Reservations Data matching Clients
        console.log("\n--- Reservations Data (First 5) & Client Match ---");
        const resRsv = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "reservations!A:B" // Fetch ID and Client ID
        });
        const rsvs = resRsv.data.values || [];
        rsvs.slice(0, 5).forEach((r, i) => {
            const id_client = r[1];
            const exists = clientIds.has(id_client);
            console.log(`Row ${i + 1}: RSV=${r[0]}, ClientID="${id_client}" -> Found in Clients? ${exists}`);
        });

        // 4. Test Index Finding for Delete
        console.log("\n--- Delete Logic Test ---");
        const target = rsvs[1] ? rsvs[1][0] : "NONE"; // Try to find the first real one
        if (target !== "NONE") {
            const rowIndex = rsvs.findIndex(r => r[0] === target);
            console.log(`Searching for "${target}": Found at index ${rowIndex} (Row ${rowIndex + 1})`);
        }

    } catch (err) {
        console.error("Error:", err.message);
    }
}

run();
