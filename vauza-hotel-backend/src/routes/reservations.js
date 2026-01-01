import express from "express";
const router = express.Router();

console.log("!!! DUMMY RESERVATIONS.JS LOADED !!!");

router.post("/", (req, res) => {
    console.log("DUMMY POST HIT. BODY:", req.body);
    return res.json({ message: "I AM THE REAL FILE", no_rsv: req.body.no_rsv });
});

export default router;
