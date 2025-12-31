import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEY_FILE_PATH = path.join(__dirname, "../../credentials/google-service-account.json");

const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });

/**
 * Upload a file to Google Drive
 * @param {Object} fileObject Multer file object
 * @returns {Promise<string>} Web View Link
 */
export async function uploadFile(fileObject) {
    try {
        const response = await drive.files.create({
            requestBody: {
                name: `PAYMENT-${Date.now()}-${fileObject.originalname}`,
                mimeType: fileObject.mimetype,
                parents: ['1Ri4Lvt8-xa_p40UCWYK7BQK_HHFVrS7t'] // Upload to shared folder
            },
            media: {
                mimeType: fileObject.mimetype,
                body: fs.createReadStream(fileObject.path),
            },
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
