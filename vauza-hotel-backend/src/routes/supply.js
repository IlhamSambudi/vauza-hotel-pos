import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { google } from 'googleapis';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Folder ID for Supply CLs
const SUPPLY_FOLDER_ID = "1t0XbKuA6PkAajeOzmXgy1X3gp7QaJsHk";
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// Local Storage Setup for Multer (Temp)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `SUPPLY-${timestamp}${ext}`);
    }
});
const upload = multer({ storage });

// Google Sheets Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, "../../credentials/google-service-account.json"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

import { uploadFile } from '../../server/services/googleDrive.js';

// GET /supply - List all Supply CLs
router.get('/', async (req, res) => {
    try {
        const result = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "supplier!A:R" // A-R (18 chars)
        });
        const rows = result.data.values || [];
        if (rows.length > 0) rows.shift(); // Remove header

        const supplies = rows
            .map((row, index) => {
                // Status is at Column R => index 17
                if (row[17] === 'delete') return null;
                return {
                    id_row: index + 2,
                    vendor: row[0],
                    no_rsv: row[1],
                    id_hotel: row[2], // Col C
                    checkin: row[3],
                    checkout: row[4],
                    staynight: row[5],
                    meal: row[6],
                    double: row[7],
                    triple: row[8],
                    quad: row[9],
                    extra: row[10],
                    double_rates: row[11],
                    triple_rates: row[12],
                    quad_rates: row[13],
                    extra_rates: row[14],
                    total_amount: row[15], // Col P
                    file_url: row[16],     // Col Q
                    tag_status: row[17] || 'active' // Col R
                };
            })
            .filter(item => item !== null)
            .reverse();

        res.json(supplies);
    } catch (err) {
        console.error("Error fetching supply list:", err);
        res.status(500).json({ message: "Failed to fetch supply list" });
    }
});

// POST /supply - Create new Supply CL
router.post('/', upload.single('file'), async (req, res) => {
    try {
        const body = req.body;
        console.log("POST /supply body:", body);
        const file = req.file;

        if (!body.vendor || !body.no_rsv) {
            if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
            return res.status(400).json({ message: "Vendor and No RSV are required" });
        }

        let fileUrl = "";
        if (file) {
            try {
                // Rename for clear organization
                const vendorSafe = body.vendor.replace(/[^a-z0-9]/gi, '_');
                const newName = `SUPPLY_${vendorSafe}_${body.no_rsv}_${Date.now()}.pdf`;
                fileUrl = await uploadFile(file, newName, SUPPLY_FOLDER_ID);

                // Cleanup
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            } catch (uErr) {
                console.error("Upload failed", uErr);
                return res.status(500).json({ message: "Failed to upload file" });
            }
        }

        const tag_status = 'active';

        // Prepare row A-R (18 columns)
        // Vendor, NoRsv, Checkin, Checkout, Staynight, Meal, D, T, Q, E, DR, TR, QR, ER, Total, Link, Status, IdHotel
        // Prepare row A-R (18 columns)
        // Vendor, NoRsv, IDHotel, Checkin, Checkout, Staynight, Meal, D, T, Q, E, DR, TR, QR, ER, Total, Link, Status
        const newRow = [
            body.vendor,
            body.no_rsv,
            body.id_hotel,   // Col C
            body.checkin,
            body.checkout,
            body.stay_night, // Using fixed key
            body.meal,
            body.double || 0,
            body.triple || 0,
            body.quad || 0,
            body.extra || 0,
            body.double_rates || 0,
            body.triple_rates || 0,
            body.quad_rates || 0,
            body.extra_rates || 0,
            body.total_amount || 0,
            fileUrl,         // Col Q (17th, index 16)
            tag_status       // Col R (18th, index 17)
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "supplier!A:R",
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [newRow] }
        });

        res.json({ message: "Supply CL saved" });

    } catch (err) {
        console.error("Error creating supply:", err);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: "Failed to create supply entry" });
    }
});

// PUT /supply/:id - Update existing Supply CL (Manual Edit)
// ID here refers to the rowIndex or a unique ID if we had one. 
// Since we don't have a unique ID in the sheet (unlike PAY-...), we will rely on 
// identifying the row either by passing the row index from frontend or searching.
// The frontend can pass the `id_row` we sent in GET.
router.put('/:id_row', upload.single('file'), async (req, res) => {
    try {
        const { id_row } = req.params; // Expects 1-based row index (e.g. 2, 3...)
        const body = req.body;
        console.log("PUT /supply body:", body);
        const file = req.file;
        const rowIndex = parseInt(id_row);

        if (isNaN(rowIndex) || rowIndex < 2) {
            return res.status(400).json({ message: "Invalid Row ID" });
        }

        // Fetch existing row to preserve file URL if not updated
        const rowRes = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `supplier!A${rowIndex}:R${rowIndex}`
        });

        const existingRow = (rowRes.data.values && rowRes.data.values[0]) || [];
        if (existingRow.length === 0) {
            return res.status(404).json({ message: "Row not found" });
        }

        // File URL is at index 16 (Col Q)
        let fileUrl = existingRow[16] || "";

        if (file) {
            try {
                const vendorSafe = body.vendor.replace(/[^a-z0-9]/gi, '_');
                const newName = `SUPPLY_${vendorSafe}_${body.no_rsv}_${Date.now()}_UPD.pdf`;
                fileUrl = await uploadFile(file, newName, SUPPLY_FOLDER_ID);
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            } catch (uErr) {
                console.error("Upload update failed", uErr);
                return res.status(500).json({ message: "Failed to upload new file" });
            }
        }

        // Overwrite columns A-R.
        // Vendor, NoRsv, IDHotel, Checkin, Checkout, Staynight, Meal, D, T, Q, E, DR, TR, QR, ER, Total, Link, Status

        const updatedRow = [
            body.vendor,
            body.no_rsv,
            body.id_hotel, // Col C
            body.checkin,
            body.checkout,
            body.stay_night,
            body.meal,
            body.double || 0,
            body.triple || 0,
            body.quad || 0,
            body.extra || 0,
            body.double_rates || 0,
            body.triple_rates || 0,
            body.quad_rates || 0,
            body.extra_rates || 0,
            body.total_amount || 0,
            fileUrl,
            existingRow[17] || 'active' // Preserve status (Col R, idx 17)
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `supplier!A${rowIndex}:R${rowIndex}`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [updatedRow] }
        });

        res.json({ message: "Supply CL updated" });

    } catch (err) {
        console.error("Error updating supply:", err);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: "Failed to update supply" });
    }
});


// DELETE /supply/:id_row
router.delete('/:id_row', async (req, res) => {
    try {
        const { id_row } = req.params;
        const rowIndex = parseInt(id_row);

        if (isNaN(rowIndex) || rowIndex < 2) {
            return res.status(400).json({ message: "Invalid Row ID" });
        }

        // Soft delete at column R (18th column, index 17)
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `supplier!R${rowIndex}`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [['delete']] }
        });

        res.json({ message: "Supply CL deleted" });
    } catch (err) {
        console.error("Error deleting supply:", err);
        res.status(500).json({ message: "Failed to delete" });
    }
});

export default router;
