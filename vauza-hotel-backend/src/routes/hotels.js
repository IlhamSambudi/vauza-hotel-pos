import express from "express";
import sheets from "../../server/services/googleSheet.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const RANGE = "hotels!A:C";

// GET ALL HOTELS
router.get("/", async (req, res) => {
    try {
        const result = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "hotels!A:D" // Expand range to check status
        });

        const rows = result.data.values || [];
        const data = rows.slice(1)
            // .filter(row => row[3] !== 'delete') // REMOVED FILTER
            .map((row) => ({
                id_hotel: row[0],
                nama_hotel: row[1],
                city: row[2],
                tag_status: row[3] // Col D
            }));

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE HOTEL
router.post("/", async (req, res) => {
    try {
        const { nama_hotel, city } = req.body;
        const id_hotel = "HT" + Date.now().toString().slice(-5);
        const tag_status = 'new';

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "hotels!A:D",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [[id_hotel, nama_hotel, city, tag_status]], // status at Col D
            },
        });

        res.json({ message: "Hotel added", id_hotel });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE HOTEL
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_hotel, city } = req.body;

        const result = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "hotels!A:A" });
        const rows = result.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === id);

        if (rowIndex === -1) return res.status(404).json({ message: "Hotel not found" });

        const actualRow = rowIndex + 1;

        // Update Name (B), City (C), Status (D)
        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                data: [
                    { range: `hotels!B${actualRow}:C${actualRow}`, values: [[nama_hotel, city]] },
                    { range: `hotels!D${actualRow}`, values: [['edited']] }
                ],
                valueInputOption: "USER_ENTERED"
            }
        });

        res.json({ message: "Hotel updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE HOTEL (Soft Delete)
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "hotels!A:A" });
        const rows = result.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === id);

        if (rowIndex === -1) return res.status(404).json({ message: "Hotel not found" });

        const actualRow = rowIndex + 1;

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `hotels!D${actualRow}`, // Col 4 (D) is status
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [['delete']] }
        });

        res.json({ message: "Hotel deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
