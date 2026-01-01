import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { google } from 'googleapis';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Local Storage Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Basic timestamp naming first (as requested)
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `PAYMENT-${timestamp}${ext}`);
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
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// GET /payments - List all payments
router.get('/', async (req, res) => {
    try {
        // Fetch Payments
        const resPay = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "payments!A:Z" });
        const pRows = resPay.data.values || [];
        if (pRows.length > 0) pRows.shift(); // Remove content header

        // Fetch Clients for Name Mapping
        const resClients = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "clients!A:C" });
        const cRows = resClients.data.values || [];
        if (cRows.length > 0 && cRows[0][0] === 'id_client') cRows.shift();

        const clientMap = {};
        cRows.forEach(row => {
            if (row[0]) clientMap[row[0].toString().trim()] = row[1];
        });

        const payments = pRows
            .map(row => ({
                id_payment: row[0],
                id_client: row[1],
                nama_client: clientMap[row[1]?.toString().trim()] || "Unknown",
                amount: row[2],
                detail: row[3],
                date: row[4],
                file_url: row[5],
                no_rsv: row[6],
                tag_status: row[7],
                exchange_rate: row[8] || 1, // Default to 1 if missing
                amount_sar: row[9] || 0
            })).reverse();

        res.json(payments);
    } catch (err) {
        console.error("Error fetching payments:", err);
        res.status(500).json({ message: "Failed to fetch payments" });
    }
});

import { uploadFile } from '../../server/services/googleDrive.js';

// ... (imports remain)

// POST /payments - Create Payment & Upload Proof (Google Drive)
router.post('/', upload.single('file'), async (req, res) => {
    try {
        const { id_client, amount, detail, date, exchange_rate } = req.body;
        const file = req.file;

        if (!id_client || !amount || !file) {
            if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
            return res.status(400).json({ message: "Client, Amount, and File are required" });
        }

        // 1. Fetch Client Name
        let clientName = "Unknown";
        try {
            const resClients = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "clients!A:C" });
            const cRows = resClients.data.values || [];
            const clientRow = cRows.find(r => r[0] && r[0].toString().trim() === id_client.toString().trim());
            if (clientRow && clientRow[1]) {
                clientName = clientRow[1].trim();
            }
        } catch (error) {
            console.error("Error fetching client name:", error);
        }

        // 2. Rename Local File (Temporary)
        const dateObj = date ? new Date(date) : new Date();
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const dateStr = `${day}-${month}-${year}`;

        const safeClientName = clientName.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
        const ext = path.extname(file.originalname);
        const newFilename = `${dateStr}_${safeClientName}${ext}`;
        const newPath = path.join(path.dirname(file.path), newFilename);

        fs.renameSync(file.path, newPath);

        // Update file object path for the drive service
        file.path = newPath;

        // 3. Upload to Google Drive
        let fileUrl = "";
        try {
            fileUrl = await uploadFile(file, newFilename);
        } catch (uploadErr) {
            console.error("Drive upload failed:", uploadErr);
            throw new Error("Failed to upload to Google Drive");
        }

        // 4. Delete Local File (Cleanup)
        if (fs.existsSync(newPath)) {
            fs.unlinkSync(newPath);
        }

        // 5. Calculations
        const rate = Number(exchange_rate) || 1;
        const amt = Number(amount) || 0;
        const amount_sar = (rate > 0) ? (amt / rate).toFixed(2) : 0;

        // 6. Save to Sheet
        const id_payment = "PAY-" + Date.now();
        const valueDate = date || new Date().toISOString().split('T')[0];
        const tag_status = 'new';


        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "payments!A:J",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [[
                    id_payment,
                    id_client,
                    amount,
                    detail || "",
                    valueDate,
                    fileUrl, // Drive Link
                    "",
                    tag_status,
                    rate,
                    amount_sar
                ]]
            }
        });

        res.json({ message: "Payment saved", id_payment, fileUrl });

    } catch (err) {
        console.error("Error creating payment:", err);
        // Clean up
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        const renamedPath = req.file ? path.join(path.dirname(req.file.path), `${Date.now()}`) : null; // Rough fallback, assume it might be renamed
        // Actually, we rely on the logic inside try block to clean up newPath if it exists. 
        res.status(500).json({ message: "Failed to create payment" });
    }
});

// DELETE PAYMENT (Soft Delete)
router.delete("/:id_payment", async (req, res) => {
    try {
        const { id_payment } = req.params;
        const result = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "payments!A:A" });
        const rows = result.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === id_payment);

        if (rowIndex === -1) return res.status(404).json({ message: "Payment not found" });

        const actualRow = rowIndex + 1;

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `payments!H${actualRow}`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [['delete']] }
        });

        res.json({ message: "Payment deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
