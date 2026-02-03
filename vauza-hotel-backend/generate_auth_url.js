// generate_auth_url.js
import { google } from "googleapis";
import dotenv from 'dotenv';
dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

const scopes = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets'
];

const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Critical for refresh token
    scope: scopes,
    prompt: 'consent' // Force new refresh token
});

console.log("Visit this URL to authorize:");
console.log(url);
console.log("\nAfter authorizing, copy the authorization code.");
