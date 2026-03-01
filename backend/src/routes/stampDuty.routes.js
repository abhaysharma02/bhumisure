const express = require("express");
const router = express.Router();
const { calculateStampDuty } = require("../services/stampDuty.service");

router.post("/calculate", async (req, res) => {
  try {
    const result = await calculateStampDuty(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;
