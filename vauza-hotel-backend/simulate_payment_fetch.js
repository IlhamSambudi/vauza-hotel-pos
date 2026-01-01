const id = 'PAY-1735749372986';

async function run() {
    try {
        console.log("Fetching list...");
        const resList = await fetch('http://localhost:3000/payments');
        const list = await resList.json();

        if (!Array.isArray(list) || list.length === 0) {
            console.log("No payments found.");
            return;
        }

        const targetId = list[0].id_payment;
        console.log(`Found valid ID: ${targetId}`);

        // TEST NEW ROUTE
        console.log(`Fetching details from /payments/detail/${targetId}...`);
        const resDetail = await fetch(`http://localhost:3000/payments/detail/${targetId}`);

        if (resDetail.ok) {
            const data = await resDetail.json();
            console.log("✅ SUCCESS:", data);
        } else {
            console.log(`❌ FAILED (${resDetail.status}):`, await resDetail.text());
        }

    } catch (err) {
        console.error("❌ Network Error:", err.message);
    }
}

run();
