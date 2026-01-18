import { uploadFile } from './server/services/googleDrive.js';
import fs from 'fs';
import path from 'path';

// Create a dummy file
const dummyPath = path.resolve('test-upload.txt');
fs.writeFileSync(dummyPath, 'This is a test file for Drive upload.');

const fileObj = {
    path: dummyPath,
    originalname: 'test-upload.txt',
    mimetype: 'text/plain'
};

console.log("Starting upload test with OAuth2...");

try {
    const link = await uploadFile(fileObj, 'TEST-SA-UPLOAD.txt');
    console.log("Upload SUCCESS!");
    console.log("Link:", link);
} catch (error) {
    console.error("Upload FAILED:", error);
} finally {
    if (fs.existsSync(dummyPath)) fs.unlinkSync(dummyPath);
    process.exit(0);
}
