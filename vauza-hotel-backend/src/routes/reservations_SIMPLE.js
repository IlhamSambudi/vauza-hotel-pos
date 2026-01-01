import express from "express";
import sheets from "../../server/services/googleSheet.js";
import dotenv from "dotenv";
dotenv.config();

console.log("!!! RESERVATIONS_SIMPLE.JS LOADED (MANUAL ID FORCED) !!!");

const router = express.Router();
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const RANGE_RESERVATIONS = "reservations!A:U";
const RANGE_CLIENTS = "clients!A:D";
const RANGE_HOTELS = "hotels!A:D";

function calcStayNight(checkin, checkout) {
    const inDate = new Date(checkin);
    const outDate = new Date(checkout);
    const diff = (outDate - inDate) / (1000 * 60 * 60 * 24);
    return isNaN(diff) ? 0 : diff;
}

// HELPER: Fetch all data needed for join
async function fetchAllData() {
    const [resReservations, resClients, resHotels] = await Promise.all([
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: RANGE_RESERVATIONS }),
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: RANGE_CLIENTS }),
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: RANGE_HOTELS })
    ]);

    const rRows = resReservations.data.values || [];
    const cRows = resClients.data.values || [];
    const hRows = resHotels.data.values || [];

    if (rRows.length > 0 && rRows[0][0] === 'no_rsv') rRows.shift();
    if (cRows.length > 0 && cRows[0][0] === 'id_client') cRows.shift();
    if (hRows.length > 0 && hRows[0][0] === 'id_hotel') hRows.shift();

    const clientMap = {};
    cRows.forEach(row => {
        if (row[0]) clientMap[row[0].toString().trim()] = row[1];
    });

    const hotelMap = {};
    hRows.forEach(row => hotelMap[row[0]] = row[1]);

    return { rRows, clientMap, hotelMap };
}

// GET ALL RESERVATIONS
router.get("/", async (req, res) => {
    try {
        const { rRows, clientMap, hotelMap } = await fetchAllData();

        const data = rRows.map((row, index) => {
            const total = parseInt(row[13] || 0);
            const paid = parseInt(row[17] || 0);

            return {
                rowIndex: index + 2,
                no_rsv: row[0],
                id_client: row[1],
                nama_client: clientMap[row[1]?.toString().trim()] || "Unknown Client",
                id_hotel: row[2],
                nama_hotel: hotelMap[row[2]] || "Unknown Hotel",
                checkin: row[3],
                checkout: row[4],
                staynight: row[5],
                meal: row[18],
                room_double: row[6],
                room_triple: row[7],
                room_quad: row[8],
                room_double_rate: row[9],
                room_triple_rate: row[10],
                room_quad_rate: row[11],
                total_room: row[12],
                total_amount: total,
                deadline_payment: row[14],
                status_booking: row[15],
                status_payment: row[16],
                paid_amount: paid,
                tag_status: (row[20] || '').trim().toLowerCase()
            };
        }).reverse();

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET DETAIL
router.get("/:no_rsv", async (req, res) => {
    try {
        const { no_rsv } = req.params;
        const { rRows, clientMap, hotelMap } = await fetchAllData();

        const row = rRows.find(r => r[0] === no_rsv);
        if (!row || row[20] === 'delete') return res.status(404).json({ message: "Reservation not found" });

        const total = Number(row[13] || 0);
        const subtotal = total / 1.15;
        const vat = total - subtotal;
        const paid = Number(row[17] || 0);

        const data = {
            no_rsv: row[0],
            id_client: row[1],
            nama_client: clientMap[row[1]?.toString().trim()] || "Unknown",
            id_hotel: row[2],
            nama_hotel: hotelMap[row[2]] || "Unknown",
            checkin: row[3],
            checkout: row[4],
            staynight: row[5],
            meal: row[18],
            room_double: row[6],
            room_triple: row[7],
            room_quad: row[8],
            room_double_rate: row[9],
            room_triple_rate: row[10],
            room_quad_rate: row[11],
            total_room: row[12],
            total_amount: total.toLocaleString('en-US'),
            deadline_payment: row[14],
            status_booking: row[15],
            status_payment: row[16],
            paid_amount: paid.toLocaleString('en-US'),
            subtotal: subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            vat: vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            remaining: (total - paid).toLocaleString('en-US'),
            tag_status: row[20]
        };

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET ROOMS
router.get("/:no_rsv/rooms", async (req, res) => {
    try {
        const { no_rsv } = req.params;
        const { rRows } = await fetchAllData();
        const row = rRows.find(r => r[0] === no_rsv);

        if (!row || row[20] === 'delete') return res.json([]);

        const rooms = [];
        const staynight = Number(row[5] || 0);
        const meal = row[18];

        if (Number(row[6]) > 0) rooms.push({ id: 1, room_type: "Double Room", qty: row[6], rate: row[9], meal, total: Number(row[6]) * Number(row[9]) * staynight });
        if (Number(row[7]) > 0) rooms.push({ id: 2, room_type: "Triple Room", qty: row[7], rate: row[10], meal, total: Number(row[7]) * Number(row[10]) * staynight });
        if (Number(row[8]) > 0) rooms.push({ id: 3, room_type: "Quad Room", qty: row[8], rate: row[11], meal, total: Number(row[8]) * Number(row[11]) * staynight });

        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE RESERVATION (STRICT MANUAL ID)
router.post("/", async (req, res) => {
    console.log("POST /reservations HIT (SIMPLE). Body:", req.body);
    try {
        const {
            no_rsv: input_no_rsv,
            id_client, id_hotel,
            checkin, checkout,
            meal,
            room_double, room_triple, room_quad,
            room_double_rate, room_triple_rate, room_quad_rate,
            deadline_payment, status_booking, status_payment,
        } = req.body;

        if (!input_no_rsv) {
            return res.status(400).json({ message: "Reservation No (ID) is required" });
        }

        const final_no_rsv = String(input_no_rsv).trim();

        let staynight = calcStayNight(checkin, checkout);
        if (isNaN(staynight) || staynight <= 0) {
            staynight = 0;
        }

        const qtyDouble = Number(room_double) || 0;
        const qtyTriple = Number(room_triple) || 0;
        const qtyQuad = Number(room_quad) || 0;
        const rateDouble = Number(room_double_rate) || 0;
        const rateTriple = Number(room_triple_rate) || 0;
        const rateQuad = Number(room_quad_rate) || 0;

        const totalDouble = qtyDouble * rateDouble * staynight;
        const totalTriple = qtyTriple * rateTriple * staynight;
        const totalQuad = qtyQuad * rateQuad * staynight;

        const total_amount = totalDouble + totalTriple + totalQuad;
        const total_room = qtyDouble + qtyTriple + qtyQuad;

        const paid_amount = 0;
        const tag_status = 'new';

        console.log("FINAL INSERTING ID:", final_no_rsv);

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "reservations!A:U",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [[
                    final_no_rsv, id_client, id_hotel, checkin, checkout,
                    staynight,
                    qtyDouble, qtyTriple, qtyQuad,
                    rateDouble, rateTriple, rateQuad,
                    total_room, total_amount,
                    deadline_payment,
                    status_booking || 'Tentative', status_payment || 'unpaid',
                    paid_amount,
                    meal,
                    new Date().toISOString(),
                    tag_status
                ]]
            }
        });

        res.json({ message: "Reservation added", no_rsv: final_no_rsv });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// UPDATE PAYMENT
router.put("/:no_rsv/payment", async (req, res) => {
    try {
        const { no_rsv } = req.params;
        const { status_booking, status_payment, payment } = req.body;

        const result = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "reservations!A:A"
        });
        const rows = result.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === no_rsv);

        if (rowIndex === -1) return res.status(404).json({ message: "Reservation to update not found" });

        const actualRow = rowIndex + 1;
        const dataRange = `reservations!N${actualRow}:R${actualRow}`;
        const dataRes = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: dataRange
        });
        const currentData = dataRes.data.values ? dataRes.data.values[0] : [];

        const total = Number(currentData[0] || 0);
        const currentPaid = Number(currentData[4] || 0);

        const newPayment = Number(payment || 0);
        const finalPaid = currentPaid + newPayment;

        let finalStatusPayment = status_payment;
        if (finalPaid >= total) finalStatusPayment = "full_payment";

        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                data: [
                    { range: `reservations!P${actualRow}`, values: [[status_booking]] },
                    { range: `reservations!Q${actualRow}`, values: [[finalStatusPayment]] },
                    { range: `reservations!R${actualRow}`, values: [[finalPaid]] },
                    { range: `reservations!U${actualRow}`, values: [['edited']] }
                ],
                valueInputOption: "USER_ENTERED"
            }
        });

        res.json({ message: "Payment updated", paid_amount: finalPaid, remaining: total - finalPaid });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE
router.delete("/:no_rsv", async (req, res) => {
    try {
        const { no_rsv } = req.params;
        const result = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "reservations!A:A" });
        const rows = result.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === no_rsv);

        if (rowIndex === -1) return res.status(404).json({ message: "Not found" });

        const actualRow = rowIndex + 1;

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `reservations!U${actualRow}`,
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [['delete']] }
        });

        res.json({ message: "Reservation deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
