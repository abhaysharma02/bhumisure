const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");

const fs = require("fs");
const multer = require("multer");
const csvParser = require("csv-parser");

const upload = multer({ dest: "uploads/" });

// Get all wards
router.get("/wards", async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT DISTINCT ward FROM rates ORDER BY ward");
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
        const { location, location_id, ward } = req.query;

        if (location_id) {
            const { rows } = await pool.query("SELECT * FROM rates WHERE id = $1", [location_id]);
            return res.json({ success: true, data: rows[0] || null });
        }

        let sql = "SELECT * FROM rates WHERE 1=1";
        const params = [];

        if (ward) {
            params.push(ward);
            sql += ` AND ward = $${params.length}`;
        }

        if (location) {
            params.push(`%${location}%`);
            sql += ` AND LOWER(location) LIKE LOWER($${params.length})`;
        }

        // Apply a larger limit so we can pull all locations for a given ward
        sql += " LIMIT 200";

        const { rows } = await pool.query(sql, params);
        return res.json({ success: true, data: rows });
    } catch (err) {
        console.error("Search Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Import guidelines from CSV
router.post("/import-guidelines", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const parseNumber = (val) => {
        if (!val) return 0;
        const cleaned = String(val).replace(/,/g, "").trim();
        const parsed = parseInt(cleaned, 10);
        return isNaN(parsed) ? 0 : parsed;
    };

    let currentCity = "Gwalior";
    let currentWard = "Unknown";
    let rowsToInsert = [];
    let rowsInserted = 0;
    let rowsSkipped = 0;

    const BATCH_SIZE = 500;

    const flushBatch = async (batch) => {
        if (batch.length === 0) return;

        try {
            await pool.query("BEGIN TRANSACTION");

            for (const row of batch) {
                const sql = `
                    INSERT INTO rates (
                        city, ward, location, plot_residential, plot_commercial, plot_industrial, 
                        building_rcc, building_rbc, building_tin, shop, office, godown, 
                        agri_irrigated, agri_unirrigated, year
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                `;
                const params = [
                    row.city, row.ward, row.location, row.plot_residential, row.plot_commercial, row.plot_industrial,
                    row.building_rcc, row.building_rbc, row.building_tin, row.shop, row.office, row.godown,
                    row.agri_irrigated, row.agri_unirrigated, 2025
                ];
                await pool.query(sql, params);
            }

            await pool.query("COMMIT");
            rowsInserted += batch.length;
        } catch (err) {
            await pool.query("ROLLBACK");
            console.error("Error inserting batch:", err);
            rowsSkipped += batch.length;
        }
    };

    fs.createReadStream(req.file.path)
        .pipe(csvParser({ headers: false }))
        .on("data", async (data) => {
            const col0 = data[0] ? String(data[0]).trim() : "";
            const col1 = data[1] ? String(data[1]).trim() : "";

            // Check if it's a Ward Definition row
            if (col0 && col0.includes("Urban Local Body")) {
                const wardMatch = col0.match(/Ward\s*:\s*([^,]+)/i);
                if (wardMatch) {
                    currentWard = wardMatch[1].trim();
                }
                return; // Skip inserting this row
            }

            // Skip header and empty rows. A valid row typically has an S.No. (a number) in data[0] 
            // or has valid rate numbers in other columns. Let's rely on data[1] (location) having substance.
            if (!col1 || col1.toLowerCase().includes("guideline place") || col1 === "-2") {
                rowsSkipped++;
                return;
            }

            // Sometimes the row is just an empty marker row
            if (col1 === "" && col0 === "") {
                rowsSkipped++;
                return;
            }

            // Valid data row
            const rowData = {
                city: currentCity,
                ward: currentWard,
                location: col1,
                plot_residential: parseNumber(data[2]),
                plot_commercial: parseNumber(data[3]),
                plot_industrial: parseNumber(data[4]),
                building_rcc: parseNumber(data[5]),
                building_rbc: parseNumber(data[6]),
                building_tin: parseNumber(data[7]),
                shop: parseNumber(data[9]),
                office: parseNumber(data[10]),
                godown: parseNumber(data[11]),
                agri_irrigated: parseNumber(data[14]),
                agri_unirrigated: parseNumber(data[15])
            };

            // Assuming we ignore empty location rows 
            if (rowData.location !== "") {
                rowsToInsert.push(rowData);
            } else {
                rowsSkipped++;
            }
        })
        .on("end", async () => {
            // Insert in batches of 500
            for (let i = 0; i < rowsToInsert.length; i += BATCH_SIZE) {
                const batch = rowsToInsert.slice(i, i + BATCH_SIZE);
                await flushBatch(batch);
            }

            // Clean up uploaded file
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Error deleting file:", err);
            });

            console.log(`Import Complete: ${rowsInserted} inserted, ${rowsSkipped} skipped`);
            res.json({
                success: true,
                rowsInserted,
                rowsSkipped
            });
        })
        .on("error", (error) => {
            console.error("CSV Parsing Error:", error);
            res.status(500).json({ success: false, message: "Error processing file", error: error.message });
        });
});

module.exports = router;
