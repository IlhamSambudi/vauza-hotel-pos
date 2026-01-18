const axios = require('axios');

async function debug() {
    try {
        // 1. Get all reservations to find a valid ID
        const res = await axios.get('http://localhost:3000/reservations');
        if (res.data.length === 0) {
            console.log("No reservations found.");
            return;
        }

        const rsv = res.data[0];
        console.log("Checking Reservation:", rsv.no_rsv);
        console.log("Main Data:", {
            room_double: rsv.room_double,
            room_triple: rsv.room_triple,
            room_quad: rsv.room_quad
        });

        // 2. Get rooms for this reservation
        const roomsRes = await axios.get(`http://localhost:3000/reservations/${rsv.no_rsv}/rooms`);
        console.log("Rooms Endpoint Response:", JSON.stringify(roomsRes.data, null, 2));

    } catch (e) {
        console.error("Error:", e.message);
        if (e.response) console.log(e.response.data);
    }
}

debug();
