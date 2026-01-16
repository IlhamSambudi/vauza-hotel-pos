import express from "express";
import sheets from "../../server/services/googleSheet.js";
import dotenv from "dotenv";
dotenv.config();

console.log("!!! RESERVATIONS_SIMPLE.JS LOADED (MANUAL ID FORCED + ROOM EXTRA) !!!");

const router = express.Router();
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const RANGE_RESERVATIONS = "reservations!A:X"; // Extended to X for note
const RANGE_CLIENTS = "clients!A:C";
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
            // Cols V(21) and W(22) for Extra
            const room_extra = row[21];
            const room_extra_rate = row[22];
            // Col X(23) for Note
            const note = row[23] || '';

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
                room_extra,
                room_extra_rate,
                total_room: row[12],
                total_amount: total,
                deadline_payment: row[14],
                status_booking: row[15],
                status_payment: row[16],
                paid_amount: paid,
                tag_status: (row[20] || '').trim().toLowerCase(),
                note
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
            room_extra: row[21],
            room_extra_rate: row[22],
            total_room: row[12],
            total_amount: total.toLocaleString('en-US'),
            deadline_payment: row[14],
            status_booking: row[15],
            status_payment: row[16],
            paid_amount: paid.toLocaleString('en-US'),
            subtotal: subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            vat: vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            remaining: (total - paid).toLocaleString('en-US'),
            tag_status: row[20],
            note: row[23] || ''
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
        // Handle Extra
        if (Number(row[21]) > 0) rooms.push({ id: 4, room_type: "Extra/Suite", qty: row[21], rate: row[22], meal, total: Number(row[21]) * Number(row[22]) * staynight });

        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE RESERVATION
router.post("/", async (req, res) => {
    console.log("POST /reservations HIT (W/ EXTRA & NOTE). Body:", req.body);
    try {
        const {
            no_rsv: input_no_rsv,
            id_client, id_hotel,
            checkin, checkout,
            meal,
            room_double, room_triple, room_quad, room_extra,
            room_double_rate, room_triple_rate, room_quad_rate, room_extra_rate,
            deadline_payment, status_booking, status_payment,
            note
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
        const qtyExtra = Number(room_extra) || 0;

        const rateDouble = Number(room_double_rate) || 0;
        const rateTriple = Number(room_triple_rate) || 0;
        const rateQuad = Number(room_quad_rate) || 0;
        const rateExtra = Number(room_extra_rate) || 0;

        const totalDouble = qtyDouble * rateDouble * staynight;
        const totalTriple = qtyTriple * rateTriple * staynight;
        const totalQuad = qtyQuad * rateQuad * staynight;
        const totalExtra = qtyExtra * rateExtra * staynight;

        const total_amount = totalDouble + totalTriple + totalQuad + totalExtra;
        const total_room = qtyDouble + qtyTriple + qtyQuad + qtyExtra;

        const paid_amount = 0;
        const tag_status = 'new';

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "reservations!A:X",
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
                    tag_status,
                    qtyExtra, rateExtra,
                    note || '' // Col X(23)
                ]]
            }
        });

        res.json({ message: "Reservation added", no_rsv: final_no_rsv });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// FULL UPDATE (PUT)
router.put("/:no_rsv", async (req, res) => {
    try {
        const { no_rsv } = req.params;
        const body = req.body;

        console.log("PUT /:no_rsv HIT. Body:", body);

        // Fetch current to find row
        const result = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "reservations!A:X" });
        const rows = result.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === no_rsv);

        if (rowIndex === -1) return res.status(404).json({ message: "Reservation not found" });

        // Use existing values if not provided, but mostly standard fields are passed
        const currentRow = rows[rowIndex];
        const actualRow = rowIndex + 1;

        // Extract or fallback
        // Format: [0:ID, 1:Client, 2:Hotel, 3:In, 4:Out, 5:Night, 6:D, 7:T, 8:Q, 9:DR, 10:TR, 11:QR, 12:TotRm, 13:TotAmt, 14:DL, 15:StatBook, 16:StatPay, 17:Paid, 18:Meal, 19:Date, 20:Tag, 21:Ex, 22:ExR, 23:Note]

        const status_booking = body.status_booking || currentRow[15];
        const status_payment = body.status_payment || currentRow[16];
        const note = body.note !== undefined ? body.note : (currentRow[23] || '');

        let currentPaid = Number(currentRow[17] || 0);
        if (body.payment) {
            currentPaid += Number(body.payment);
        }

        // Room updates
        const qD = body.room_double !== undefined ? (Number(body.room_double) || 0) : (Number(currentRow[6]) || 0);
        const qT = body.room_triple !== undefined ? (Number(body.room_triple) || 0) : (Number(currentRow[7]) || 0);
        const qQ = body.room_quad !== undefined ? (Number(body.room_quad) || 0) : (Number(currentRow[8]) || 0);
        const qE = body.room_extra !== undefined ? (Number(body.room_extra) || 0) : (Number(currentRow[21]) || 0);

        const rD = body.room_double_rate !== undefined ? (Number(body.room_double_rate) || 0) : (Number(currentRow[9]) || 0);
        const rT = body.room_triple_rate !== undefined ? (Number(body.room_triple_rate) || 0) : (Number(currentRow[10]) || 0);
        const rQ = body.room_quad_rate !== undefined ? (Number(body.room_quad_rate) || 0) : (Number(currentRow[11]) || 0);
        const rE = body.room_extra_rate !== undefined ? (Number(body.room_extra_rate) || 0) : (Number(currentRow[22]) || 0);

        // Date & Staynight Logic
        let checkin = body.checkin || currentRow[3];
        let checkout = body.checkout || currentRow[4];
        let staynight = Number(currentRow[5]) || 0;

        if (body.checkin || body.checkout) {
            staynight = calcStayNight(checkin, checkout);
            if (staynight < 0) staynight = 0;
        }

        const totalD = qD * rD * staynight;
        const totalT = qT * rT * staynight;
        const totalQ = qQ * rQ * staynight;
        const totalE = qE * rE * staynight;

        const newTotalAmt = totalD + totalT + totalQ + totalE;
        const newTotalRm = qD + qT + qQ + qE;

        // Auto Status Payment update if fully paid
        let finalStatPay = status_payment;
        if (currentPaid >= newTotalAmt && newTotalAmt > 0) finalStatPay = 'full_payment';

        const meal = body.meal || currentRow[18];

        // Mapped Update:
        // D-F (3-5): Checkin, Checkout, Staynight
        // G(6): qD, H(7): qT, I(8): qQ
        // J(9): rD, K(10): rT, L(11): rQ
        // M(12): TotRm, N(13): TotAmt
        // P(15): StatBook, Q(16): StatPay, R(17): Paid, S(18): Meal
        // U(20): Tag ('edited')
        // V(21): Ex, W(22): ExR
        // X(23): Note

        const updates = [
            { range: `reservations!D${actualRow}:F${actualRow}`, values: [[checkin, checkout, staynight]] },
            { range: `reservations!G${actualRow}:I${actualRow}`, values: [[qD, qT, qQ]] },
            { range: `reservations!J${actualRow}:L${actualRow}`, values: [[rD, rT, rQ]] },
            { range: `reservations!M${actualRow}:N${actualRow}`, values: [[newTotalRm, newTotalAmt]] },
            { range: `reservations!P${actualRow}:S${actualRow}`, values: [[status_booking, finalStatPay, currentPaid, meal]] },
            { range: `reservations!U${actualRow}`, values: [['edited']] },
            { range: `reservations!V${actualRow}:W${actualRow}`, values: [[qE, rE]] },
            { range: `reservations!X${actualRow}`, values: [[note]] }
        ];

        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                data: updates,
                valueInputOption: "USER_ENTERED"
            }
        });

        res.json({ message: "Reservation updated successfully", no_rsv });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// UPDATE PAYMENT
router.put("/:no_rsv/payment", async (req, res) => {
    // ... kept for backward compatibility if needed, but PUT /:no_rsv covers it ..
    // For safety, let's keep it as is, or redirect logic.
    // The previous implementation was fine.
    try {
        const { no_rsv } = req.params;
        const { status_booking, status_payment, payment } = req.body;

        const result = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: "reservations!A:A" });
        const rows = result.data.values || [];
        const rowIndex = rows.findIndex(r => r[0] === no_rsv);

        if (rowIndex === -1) return res.status(404).json({ message: "Not found" });
        const actualRow = rowIndex + 1;

        // Get current total/paid
        const dataRes = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `reservations!N${actualRow}:R${actualRow}` });
        const vals = dataRes.data.values ? dataRes.data.values[0] : [];
        const total = Number(vals[0] || 0); // Col N
        const currentPaid = Number(vals[4] || 0); // Col R

        const finalPaid = currentPaid + Number(payment || 0);
        let finalStatPay = status_payment;
        if (finalPaid >= total) finalStatPay = "full_payment";

        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                data: [
                    { range: `reservations!P${actualRow}`, values: [[status_booking]] },
                    { range: `reservations!Q${actualRow}`, values: [[finalStatPay]] },
                    { range: `reservations!R${actualRow}`, values: [[finalPaid]] },
                    { range: `reservations!U${actualRow}`, values: [['edited']] }
                ],
                valueInputOption: "USER_ENTERED"
            }
        });
        res.json({ message: "Payment updated" });
    } catch (err) {
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
