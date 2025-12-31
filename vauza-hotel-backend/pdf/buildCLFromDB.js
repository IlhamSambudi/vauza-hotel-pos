const fs = require("fs");
const path = require("path");
const db = require("../src/config/db"); // Corrected path for CJS
const { generateCLPDF } = require("./generateCL");

async function buildCLFromReservation(no_rsv) {
  // 1️⃣ Query DB
  const [rows] = await db.promise().query(`
    SELECT
      r.no_rsv,
      r.checkin,
      r.checkout,
      r.staynight,
      r.total_amount,
      r.paid_amount,
      c.nama_client,
      h.nama_hotel
    FROM reservations r
    JOIN clients c ON r.id_client = c.id_client
    JOIN hotels h ON r.id_hotel = h.id_hotel
    WHERE r.no_rsv = ?
  `, [no_rsv]);

  if (rows.length === 0) {
    throw new Error("Reservation not found");
  }

  const r = rows[0];

  // 2️⃣ Load HTML template
  const templatePath = path.resolve(__dirname, "templates/confirmation-letter.html");
  let html = fs.readFileSync(templatePath, "utf8");

  // Format helper
  const fmt = (num) => Number(num).toLocaleString();

  const roomRows = `
    <tr>
      <td>ROOM</td>
      <td>-</td>
      <td>-</td>
      <td>${fmt(r.total_amount)}</td>
    </tr>
  `;

  // 3️⃣ Inject data
  html = html
    .replace("{{date}}", new Date().toLocaleDateString("en-GB"))
    .replace("{{client}}", r.nama_client)
    .replace("{{reservation_no}}", r.no_rsv)
    .replace("{{hotel}}", r.nama_hotel)
    .replace("{{checkin}}", new Date(r.checkin).toLocaleDateString("en-GB"))
    .replace("{{checkout}}", new Date(r.checkout).toLocaleDateString("en-GB"))
    .replace("{{nights}}", r.staynight)
    .replace("{{rooms}}", roomRows)
    .replace("{{subtotal}}", fmt(r.total_amount))
    .replace("{{vat}}", "Included")
    .replace("{{total}}", fmt(r.total_amount))
    .replace("{{paid}}", fmt(r.paid_amount || 0))
    .replace("{{balance}}", fmt(r.total_amount - (r.paid_amount || 0)));

  // 4️⃣ Generate PDF
  const outputPath = path.resolve(__dirname, `CL-${r.no_rsv}.pdf`);
  await generateCLPDF(html, outputPath);

  return outputPath;
}

module.exports = { buildCLFromReservation };
