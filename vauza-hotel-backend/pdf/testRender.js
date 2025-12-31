const fs = require("fs");
const path = require("path");

const templatePath = path.join(__dirname, 'templates', 'confirmation-letter.html');

console.log(`Reading template from: ${templatePath}`);
const template = fs.readFileSync(templatePath, "utf8");

const filled = template
    .replace("{{date}}", "24 December 2025")
    .replace("{{client}}", "Payung Madinah")
    .replace("{{reservation_no}}", "RSV-2825")
    .replace("{{hotel}}", "Anjum Hotel")
    .replace("{{checkin}}", "29 December 2025")
    .replace("{{checkout}}", "04 January 2026")
    .replace("{{nights}}", "6")
    .replace("{{rooms}}", `
    <tr><td>Double</td><td>1</td><td>1,300</td><td>7,800</td></tr>
    <tr><td>Triple</td><td>1</td><td>1,400</td><td>8,400</td></tr>
  `)
    .replace("{{subtotal}}", "14,086.96")
    .replace("{{vat}}", "2,113.04")
    .replace("{{total}}", "16,200.00")
    .replace("{{paid}}", "16,200.00")
    .replace("{{balance}}", "0.00");

const outputPath = path.join(__dirname, 'preview.html');
fs.writeFileSync(outputPath, filled);
console.log(`Preview generated: ${outputPath}`);
