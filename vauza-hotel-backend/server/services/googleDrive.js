import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

if (!REFRESH_TOKEN) {
    console.error("ERROR: GOOGLE_REFRESH_TOKEN is missing in environment variables!");
} else {
    console.log("Drive Service: Refresh Token loaded.");
}

const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
auth.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: "v3", auth });

/**
 * Upload a file to Google Drive
 * @param {Object} fileObject Multer file object
 * @returns {Promise<string>} Web View Link
 */
export async function uploadFile(fileObject, customName = null, folderId = null) {
    try {
        const response = await drive.files.create({
            requestBody: {
                name: customName || `PAYMENT-${Date.now()}-${fileObject.originalname}`,
                mimeType: fileObject.mimetype,
                parents: [folderId || '1Ri4Lvt8-xa_p40UCWYK7BQK_HHFVrS7t'] // Upload to shared folder or custom folder
            },
            media: {
                mimeType: fileObject.mimetype,
                body: fs.createReadStream(fileObject.path),
            },
            supportsAllDrives: true,
        });

        const fileId = response.data.id;

        // Make public (Optional: or just return ID if service account owns it)
        // For simplicity, we make it reader-available to anyone with link or just return ID
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: "reader",
                type: "anyone",
            },
        });

        // Get Web View Link
        const result = await drive.files.get({
            fileId: fileId,
            fields: "webViewLink, webContentLink",
        });

        return result.data.webViewLink;
    } catch (error) {
        console.error("Drive Upload Error:", error);
        throw error;
    }
}

export default drive;
