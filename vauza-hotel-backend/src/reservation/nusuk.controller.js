import sheets from '../../server/services/googleSheet.js';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'nusuk_agreement';

export const getAll = async (req, res) => {
    try {
        const result = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:C`,
        });

        const rows = result.data.values || [];
        // headers: Nusuk No, No RSV, Status
        // skip header if exists? Assume row 0 is header?
        // Let's return raw rows for now, frontend can map.
        // Or map here:
        const data = rows.slice(1).map(row => ({
            nusuk_no: row[0] || '',
            no_rsv: row[1] || '',
            status: row[2] || 'blank'
        }));

        res.json(data);
    } catch (error) {
        console.error("Error fetching Nusuk data:", error);
        res.status(500).json({ message: "Failed to fetch Nusuk data" });
    }
};

export const update = async (req, res) => {
    const { no_rsv, nusuk_no, status } = req.body;

    if (!no_rsv) {
        return res.status(400).json({ message: "No RSV required" });
    }

    try {
        // 1. Get current data to find row index
        const result = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:C`,
        });

        const rows = result.data.values || [];
        let rowIndex = -1;

        // Find row by no_rsv (Col B -> index 1)
        for (let i = 0; i < rows.length; i++) {
            if (rows[i][1] === no_rsv) {
                rowIndex = i;
                break;
            }
        }

        if (rowIndex !== -1) {
            // Update existing row
            // Sheet row is 1-based, array is 0-based.
            // Row 1 is index 0. So Sheet Row = rowIndex + 1.
            const range = `${SHEET_NAME}!A${rowIndex + 1}:C${rowIndex + 1}`;
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: range,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [[nusuk_no, no_rsv, status]]
                }
            });
        } else {
            // Append new row
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A:C`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [[nusuk_no, no_rsv, status]]
                }
            });
        }

        res.json({ message: "Nusuk data updated" });

    } catch (error) {
        console.error("Error updating Nusuk data:", error);
        res.status(500).json({ message: "Failed to update Nusuk data" });
    }
};
