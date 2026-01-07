import { google } from 'googleapis';
import readline from 'readline';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'; // For Desktop apps

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("ERROR: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in .env");
    console.error("Please add them to your .env file first.");
    process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Crucial for Refresh Token
    scope: SCOPES,
});

console.log('Authorize this app by visiting this url:');
console.log(authUrl);
fs.writeFileSync('auth_url.txt', authUrl);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('Enter the code from that page here: ', async (code) => {
    rl.close();
    try {
        const { tokens } = await oauth2Client.getToken(code);
        console.log('\n--- SUCCESS! ---');
        console.log('Add this REFRESH_TOKEN to your .env file:\n');
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log('\n----------------');
    } catch (err) {
        console.error('Error retrieving access token', err);
    }
});
