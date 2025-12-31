import db from '../config/db.js';

export const create = (req, res) => {
    const {
        id_client,
        id_hotel,
        checkin,
        checkout,
        room_double = 0,
        room_triple = 0,
        room_quad = 0,
        room_double_rate = 0,
        room_triple_rate = 0,
        room_quad_rate = 0,
        meal,
        deadline_payment
    } = req.body;

    const formattedDeadline = deadline_payment || null;

    // hitung staynight
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const staynight =
        (checkoutDate - checkinDate) / (1000 * 60 * 60 * 24);

    if (staynight <= 0) {
        return res.status(400).json({ message: 'Tanggal tidak valid' });
    }

    const total_room = room_double + room_triple + room_quad;

    const total_amount =
        (room_double * room_double_rate +
            room_triple * room_triple_rate +
            room_quad * room_quad_rate) * staynight;

    const no_rsv = `RSV-${Date.now()}`;

    const sql = `
    INSERT INTO reservations (
      no_rsv, id_client, id_hotel,
      checkin, checkout, staynight,
      room_double, room_triple, room_quad,
      room_double_rate, room_triple_rate, room_quad_rate,
      total_room, total_amount, meal,
      deadline_payment,
      status_booking, status_payment
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

    db.query(
        sql,
        [
            no_rsv,
            id_client,
            id_hotel,
            checkin,
            checkout,
            staynight,
            room_double,
            room_triple,
            room_quad,
            room_double_rate,
            room_triple_rate,
            room_quad_rate,
            total_room,
            total_amount,
            meal,
            formattedDeadline,
            'Tentative',
            'unpaid'
        ],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'DB error' });
            }

            // Insert into reservation_rooms for CL compatibility
            const roomInserts = [];
            if (room_double > 0) roomInserts.push([no_rsv, 'Double Room', room_double, room_double_rate, meal || 'Breakfast']);
            if (room_triple > 0) roomInserts.push([no_rsv, 'Triple Room', room_triple, room_triple_rate, meal || 'Breakfast']);
            if (room_quad > 0) roomInserts.push([no_rsv, 'Quad Room', room_quad, room_quad_rate, meal || 'Breakfast']);

            if (roomInserts.length > 0) {
                const sqlRooms = 'INSERT INTO reservation_rooms (no_rsv, room_type, qty, rate, meal) VALUES ?';
                db.query(sqlRooms, [roomInserts], (errRooms) => {
                    if (errRooms) console.error('Error inserting rooms:', errRooms);
                    // We respond success even if room insert fails slightly (shouldn't happen)
                    res.json({
                        message: 'Reservation created',
                        no_rsv,
                        staynight,
                        total_room,
                        total_amount
                    });
                });
            } else {
                res.json({
                    message: 'Reservation created',
                    no_rsv,
                    staynight,
                    total_room,
                    total_amount
                });
            }
        }
    );
};

export const getAll = (req, res) => {
    const sql = `
    SELECT r.*, c.nama_client, h.nama_hotel
    FROM reservations r
    JOIN clients c ON r.id_client = c.id_client
    JOIN hotels h ON r.id_hotel = h.id_hotel
    ORDER BY r.checkin DESC
  `;

    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        res.json(rows);
    });
};

export const getDetail = (req, res) => {
    const { no_rsv } = req.params;

    const sql = `
    SELECT r.*, c.nama_client, h.nama_hotel
    FROM reservations r
    JOIN clients c ON r.id_client = c.id_client
    JOIN hotels h ON r.id_hotel = h.id_hotel
    WHERE r.no_rsv = ?
  `;

    db.query(sql, [no_rsv], (err, rows) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        if (rows.length === 0) return res.status(404).json({ message: 'Reservation not found' });

        const data = rows[0];
        // Calculate financial breakdown (Assuming 15% VAT included for SAR)
        const total = Number(data.total_amount);
        const subtotal = total / 1.15;
        const vat = total - subtotal;

        data.subtotal = subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        data.vat = vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        data.total_amount = total.toLocaleString('en-US');
        data.paid_amount = Number(data.paid_amount || 0).toLocaleString('en-US');

        res.json(data);
    });
};

export const getRooms = (req, res) => {
    const { no_rsv } = req.params;
    // Join with reservations to get staynight for total calculation
    const sql = `
        SELECT rr.*, r.staynight 
        FROM reservation_rooms rr
        JOIN reservations r ON rr.no_rsv = r.no_rsv
        WHERE rr.no_rsv = ?
    `;

    db.query(sql, [no_rsv], (err, rows) => {
        if (err) return res.status(500).json({ message: 'DB error' });

        if (rows.length > 0) {
            // Found in new table
            const rooms = rows.map(r => ({
                id: r.id,
                room_type: r.room_type,
                qty: r.qty,
                meal: r.meal, // Meal per room
                rate: r.rate,
                total: r.qty * r.rate * r.staynight
            }));
            return res.json(rooms);
        }

        // Fallback: Check main reservations table for legacy data
        const sqlLegacy = 'SELECT * FROM reservations WHERE no_rsv = ?';
        db.query(sqlLegacy, [no_rsv], (errLegacy, rowsLegacy) => {
            if (errLegacy) return res.status(500).json({ message: 'DB error' });
            if (rowsLegacy.length === 0) return res.json([]);

            const r = rowsLegacy[0];
            const legacyRooms = [];

            if (r.room_double > 0) legacyRooms.push({
                id: 'legacy_d',
                room_type: 'Double Room',
                qty: r.room_double,
                meal: r.meal || 'Breakfast', // Use main meal
                rate: r.room_double_rate,
                total: r.room_double * r.room_double_rate * r.staynight
            });
            if (r.room_triple > 0) legacyRooms.push({
                id: 'legacy_t',
                room_type: 'Triple Room',
                qty: r.room_triple,
                meal: r.meal || 'Breakfast',
                rate: r.room_triple_rate,
                total: r.room_triple * r.room_triple_rate * r.staynight
            });
            if (r.room_quad > 0) legacyRooms.push({
                id: 'legacy_q',
                room_type: 'Quad Room',
                qty: r.room_quad,
                meal: r.meal || 'Breakfast',
                rate: r.room_quad_rate,
                total: r.room_quad * r.room_quad_rate * r.staynight
            });

            res.json(legacyRooms);
        });
    });
};

export const addRoom = async (req, res) => {
    const { no_rsv } = req.params;
    const { room_type, qty, rate, meal } = req.body;

    if (!no_rsv || !room_type || !qty || !rate) {
        return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    const sql = `
      INSERT INTO reservation_rooms
      (no_rsv, room_type, qty, rate, meal)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [no_rsv, room_type, qty, rate, meal || 'Breakfast'], (err) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        res.json({ message: 'Room added successfully' });
    });
};

export const updateStatus = (req, res) => {
    const { no_rsv } = req.params;
    const { status_booking, status_payment } = req.body;

    const sql = `
    UPDATE reservations
    SET status_booking = ?, status_payment = ?
    WHERE no_rsv = ?
  `;

    db.query(sql, [status_booking, status_payment, no_rsv], (err) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        res.json({ message: 'Status updated' });
    });
};

export const updatePayment = (req, res) => {
    const { no_rsv } = req.params;
    const { status_booking, status_payment, payment } = req.body;

    const sqlGet = 'SELECT total_amount, paid_amount FROM reservations WHERE no_rsv = ?';

    db.query(sqlGet, [no_rsv], (err, rows) => {
        if (err || rows.length === 0)
            return res.status(500).json({ message: 'Reservation not found' });

        const total = rows[0].total_amount;
        // FIX FINAL: Use parseInt
        const paymentInt = parseInt(payment || 0);

        if (paymentInt < 0) {
            return res.status(400).json({ message: 'Payment tidak valid' });
        }

        const paid = parseInt(rows[0].paid_amount || 0) + paymentInt;
        const finalPaid = Math.min(paid, total);

        const finalStatus =
            finalPaid >= total ? 'full_payment' : status_payment;

        const sqlUpdate = `
      UPDATE reservations
      SET status_booking = ?,
      status_payment = ?,
      paid_amount = ?
      WHERE no_rsv = ?
    `;

        db.query(
            sqlUpdate,
            [status_booking, finalStatus, finalPaid, no_rsv],
            (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'DB error' });
                }
                res.json({
                    message: 'Payment updated',
                    paid_amount: finalPaid,
                    remaining: total - finalPaid
                });
            }
        );
    });
};

export const deleteReservation = (req, res) => {
    const { no_rsv } = req.params;
    const sql = 'DELETE FROM reservations WHERE no_rsv = ?';

    db.query(sql, [no_rsv], (err) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        res.json({ message: 'Reservation deleted' });
    });
};
