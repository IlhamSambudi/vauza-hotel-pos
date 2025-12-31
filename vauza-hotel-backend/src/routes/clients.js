import express from "express";
import sheets from "../../server/services/googleSheet.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const RANGE = "clients!A:B";

// GET ALL CLIENTS
router.get("/", async (req, res) => {
    try {
        const result = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "clients!A:D", // Expand range
        });

        const rows = result.data.values || [];
        const data = rows.slice(1)
            // .filter(row => row[3] !== 'delete') // REMOVED FILTER
            .map((row) => ({
                id_client: row[0],
                nama_client: row[1],
                tag_status: row[3] // Col D
            }));

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE CLIENT
router.post("/", async (req, res) => {
    try {
        const { nama_client } = req.body;
        const id_client = Date.now().toString();
        const tag_status = 'new';

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "clients!A:D",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                // ID, Name, (Empty Col C), Tag Status
                values: [[id_client, nama_client, "", tag_status]],
            },
        });

        res.json({ message: "Client created", id_client });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE CLIENT
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_client } = req.body;

        const result = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "clients!A:A" });
        const rows = result.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === id);

        if (rowIndex === -1) return res.status(404).json({ message: "Client not found" });

        const actualRow = rowIndex + 1;

        // Update Name (Col B) and Status (Col D)
        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                data: [
                    { range: `clients!B${actualRow}`, values: [[nama_client]] },
                    { range: `clients!D${actualRow}`, values: [['edited']] }
                ],
                valueInputOption: "USER_ENTERED"
            }
        });

        res.json({ message: "Client updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE CLIENT (Soft Delete)
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "clients!A:A" });
        const rows = result.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === id);

        if (rowIndex === -1) return res.status(404).json({ message: "Client not found" });

        const actualRow = rowIndex + 1;

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `clients!D${actualRow}`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [['delete']] }
        });

        res.json({ message: "Client deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
