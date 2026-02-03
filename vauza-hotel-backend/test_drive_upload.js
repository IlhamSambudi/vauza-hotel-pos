// test_drive_upload.js
import { google } from "googleapis";
import fs from "fs";
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

console.log("Testing Drive Upload...");
if (!REFRESH_TOKEN) {
    console.error("Missing Refresh Token");
    process.exit(1);
}

const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
auth.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: "v3", auth });

async function testUpload() {
    try {
        console.log("Attempting to get access token...");
        const token = await auth.getAccessToken();
        console.log("Access Token Retrieved:", token.token ? "Yes" : "No");

        // Create dummy file
        fs.writeFileSync("test_upload.txt", "Hello World " + Date.now());

        console.log("Uploading file...");
        const response = await drive.files.create({
            requestBody: {
                name: `TEST-UPLOAD-${Date.now()}.txt`,
                mimeType: "text/plain",
                parents: ['1Ri4Lvt8-xa_p40UCWYK7BQK_HHFVrS7t'] // Using ID from code
            },
            media: {
                mimeType: "text/plain",
                body: fs.createReadStream("test_upload.txt"),
            },
        });

        console.log("Upload Success! File ID:", response.data.id);

        // Cleanup
        fs.unlinkSync("test_upload.txt");

    } catch (error) {
        console.error("Test Failed:", error.message);
        if (error.response) {
            console.error("Response Data:", error.response.data);
        }
    }
}

testUpload();
