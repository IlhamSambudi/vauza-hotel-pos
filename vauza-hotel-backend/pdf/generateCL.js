const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

async function generateCLPDF(html, outputPath) {
    const browser = await puppeteer.launch({
        headless: "new",
    });

    const page = await browser.newPage();

    await page.setContent(html, {
        waitUntil: "networkidle0",
    });

    await page.pdf({
        path: outputPath,
        format: "A4",
        printBackground: true,
        margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm",
        },
    });

    await browser.close();
}

module.exports = { generateCLPDF };
