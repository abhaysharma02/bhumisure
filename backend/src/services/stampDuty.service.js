const { pool } = require("../config/db");

// Madhya Pradesh Stamp Duty Rules approximation
// Registration Fee: 3.0%
const getDutyRate = (buyerType) => {
  const registrationFee = 0.030;
  let stampDuty;

  if (buyerType === "Male") {
    stampDuty = 0.125; // 12.5%
  } else if (buyerType === "Female") {
    stampDuty = 0.105; // 10.5%
  } else if (buyerType === "Joint") {
    stampDuty = 0.115; // 11.5% as an average for Joint
  } else {
    stampDuty = 0.125; // Default fallback
  }

  return { stampDuty, registrationFee, total: stampDuty + registrationFee };
};

const calculateStampDuty = async ({
  location_id,
  propertyType, // e.g., 'residential_plot_rate', 'commercial_plot_rate', 'agricultural_irrigated_rate'
  buyerType,
  area // area in sq.m or hectares depending on property type
}) => {
  if (!location_id || !propertyType || !area) {
    throw new Error("Missing required parameters: location_id, propertyType, area");
  }

  // 1. Fetch rates
  const { rows } = await pool.query("SELECT * FROM rates WHERE location_id = $1", [location_id]);
  const rates = rows[0];

  if (!rates) {
    throw new Error("Rates not found for the selected location");
  }

  // 2. Identify the rate based on property type selected
  const ratePerUnit = Number(rates[propertyType]);
  if (!ratePerUnit) {
    throw new Error(`Invalid property type or rate unavailable for ${propertyType}`);
  }

  // 3. Calculate Base Value
  const propertyValue = Math.round(area * ratePerUnit);

  // 4. Calculate Duty
  const { stampDuty, registrationFee, total } = getDutyRate(buyerType);

  const stampDutyAmount = Math.round(propertyValue * stampDuty);
  const registrationAmount = Math.round(propertyValue * registrationFee);
  const totalPayableAmount = stampDutyAmount + registrationAmount;

  return {
    propertyValue,
    ratePerUnit,
    stampDutyPercentage: (stampDuty * 100).toFixed(1) + "%",
    registrationPercentage: (registrationFee * 100).toFixed(1) + "%",
    stampDutyAmount,
    registrationAmount,
    totalPayableAmount
  };
};

module.exports = { calculateStampDuty };

