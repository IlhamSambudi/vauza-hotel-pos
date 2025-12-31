require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { buildCLFromReservation } = require("./buildCLFromDB.js");

(async () => {
    try {
        const file = await buildCLFromReservation("RSV-1766545285275");
        console.log("✅ PDF generated:", file);
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
})();
