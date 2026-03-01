const Guideline = require("../models/Guideline");

const getDutyRate = (areaType, buyerType) => {
  if (areaType === "Urban") {
    return buyerType === "Female" ? 0.105 : 0.125;
  }
  if (areaType === "Rural") {
    return buyerType === "Female" ? 0.075 : 0.095;
  }
  return 0;
};

const calculateStampDuty = async ({
  areaType,
  buyerType,
  propertyType,
  ward,
  tehsil,
  village,
  areaSqm
}) => {
  const query = {
    areaType,
    propertyType
  };

  if (areaType === "Urban") query.ward = ward;
  if (areaType === "Rural") {
    query.tehsil = tehsil;
    query.village = village;
  }

  const guideline = await Guideline.findOne(query);

  if (!guideline) {
    throw new Error("Guideline rate not found for selected location");
  }

  const propertyValue = areaSqm * guideline.ratePerSqm;
  const dutyRate = getDutyRate(areaType, buyerType);
  const stampDuty = Math.round(propertyValue * dutyRate);

  return {
    ratePerSqm: guideline.ratePerSqm,
    propertyValue,
    dutyRate: dutyRate * 100,
    stampDuty
  };
};

module.exports = { calculateStampDuty };
