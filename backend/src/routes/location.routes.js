const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");

// Get all wards
router.get("/wards", async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM wards ORDER BY ward_number");
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get locations (with optional ward_id filter)
router.get("/locations", async (req, res) => {
    try {
        const { ward_id, query } = req.query;
        let sql = "SELECT * FROM locations WHERE 1=1";
        const params = [];

        if (ward_id) {
            params.push(ward_id);
            sql += ` AND ward_id = $${params.length}`;
        }

        if (query) {
            params.push(`%${query}%`);
            sql += ` AND locality_name ILIKE $${params.length}`;
        }

        sql += " ORDER BY locality_name";

        const { rows } = await pool.query(sql, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get rates for a location
router.get("/rates", async (req, res) => {
    try {
        const { location_id } = req.query;
        if (!location_id) {
            return res.status(400).json({ success: false, message: "location_id is required" });
        }

        const { rows } = await pool.query("SELECT * FROM rates WHERE location_id = $1", [location_id]);
        res.json({ success: true, data: rows[0] || null });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
