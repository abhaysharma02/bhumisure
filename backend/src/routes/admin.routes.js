const express = require("express");
const router = express.Router();
const { parseAndSeedPDF } = require("../utils/pdfParser");

// Mock endpoint to trigger PDF Parsing
router.post("/parse-pdf", async (req, res) => {
    try {
        // In a real app, you'd use multer to handle file uploads
        // Here we'll just parse the local file for MVP purposes
        const result = await parseAndSeedPDF("../2025-2026-Gwalior-hi gidline.pdf");
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
