const ids = ['2813', '2817', '2825'];

async function run() {
    console.log("Starting Simulation...");

    for (const id of ids) {
        const payload = {
            no_rsv: id,
            id_client: '1', // Dummy ID
            id_hotel: '1',   // Dummy ID
            checkin: '2025-01-01',
            checkout: '2025-01-05',
            meal: 'Breakfast',
            room_double: 1,
            room_double_rate: 500,
            deadline_payment: '2025-01-01'
        };

        try {
            console.log(`Sending ID: ${id}...`);
            const res = await fetch('http://localhost:3000/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                console.log(`✅ Success for ${id}:`, data);
            } else {
                console.log(`❌ Failed for ${id} (Status ${res.status}):`, data);
            }
        } catch (err) {
            console.error(`❌ Network Error for ${id}:`, err.message);
        }
    }
}

run();
