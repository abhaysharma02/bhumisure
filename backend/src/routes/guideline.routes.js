const express = require("express");
const router = express.Router();
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const { pool } = require("../config/db");

// Configure multer to temporarily store uploaded files
const upload = multer({ dest: "uploads/" });

router.post("/import-guidelines", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No CSV file uploaded." });
    }

    const results = [];
    const BATCH_SIZE = 500;
    let insertedRows = 0;

    // Create a robust function to parse integers, handling empty or invalid data
    const parseRate = (val) => {
        if (!val) return 0;
        // removing commas and spaces
        const parsed = parseInt(String(val).replace(/,/g, '').trim(), 10);
        return isNaN(parsed) ? 0 : parsed;
    };

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (data) => {
            // Trim keys based on potential BOM or spaces in header names
            const row = {};
            for (let key in data) {
                row[key.trim().toLowerCase()] = data[key];
            }

            // Ignore empty rows checking city/ward/location
            if (!row.city || !row.ward || !row.location) return;
            if (row.city.trim() === '' || row.ward.trim() === '' || row.location.trim() === '') return;

            results.push({
                city: row.city.trim(),
                ward: row.ward.trim(),
                location: row.location.trim(),
                residential_rate: parseRate(row.residential_rate),
                commercial_rate: parseRate(row.commercial_rate),
                shop_rate: parseRate(row.shop_rate),
                office_rate: parseRate(row.office_rate),
                agriculture_rate: parseRate(row.agriculture_rate),
                year: row.year ? String(row.year).trim() : "2025-26"
            });
        })
        .on("end", async () => {
            try {
                // Ensure db is ready via pool
                const client = await pool.connect();
                await client.query("BEGIN TRANSACTION");

                // Execute in batches to prevent SQL parameter limits
                for (let i = 0; i < results.length; i += BATCH_SIZE) {
                    const batch = results.slice(i, i + BATCH_SIZE);

                    if (batch.length === 0) continue;

                    const placeholders = batch.map((_, index) => {
                        const offset = index * 9;
                        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`;
                    }).join(', ');

                    const values = [];
                    batch.forEach(r => {
                        values.push(
                            r.city, r.ward, r.location,
                            r.residential_rate, r.commercial_rate,
                            r.shop_rate, r.office_rate, r.agriculture_rate, r.year
                        );
                    });

                    const insertQuery = `
                        INSERT INTO guideline_rates 
                        (city, ward, location, residential_rate, commercial_rate, shop_rate, office_rate, agriculture_rate, year) 
                        VALUES ${placeholders}
                    `;

                    await client.query(insertQuery, values);
                    insertedRows += batch.length;
                }

                await client.query("COMMIT");

                // Cleanup file
                fs.unlinkSync(req.file.path);

                return res.status(200).json({
                    success: true,
                    message: "CSV imported successfully.",
                    rows_inserted: insertedRows
                });
            } catch (err) {
                console.error("CSV Import Error:", err);
                // Attempt rollback
                try { await pool.query("ROLLBACK"); } catch (e) { }
                fs.unlinkSync(req.file.path); // Cleanup file on error
                return res.status(500).json({ success: false, message: "Database insertion failed", error: err.message });
            }
        })
        .on("error", (error) => {
            fs.unlinkSync(req.file.path); // Cleanup file on parse error
            return res.status(500).json({ success: false, message: "Error parsing CSV file.", error: error.message });
        });
});

module.exports = router;
