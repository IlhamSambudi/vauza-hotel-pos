import express from "express";
import sheets from "../../server/services/googleSheet.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: "clients!A:B",
        });

        res.json(result.data.values);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
