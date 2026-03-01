require("dotenv").config();
const mongoose = require("mongoose");
const Guideline = require("../models/Guideline");

mongoose.connect(process.env.MONGO_URI);

const seed = async () => {
  await Guideline.deleteMany();

  await Guideline.create({
    areaType: "Urban",
    ward: "Ward 01",
    locationName: "A.B. Road",
    propertyType: "Residential_Plot",
    ratePerSqm: 25000
  });

  console.log("✅ Test guideline data inserted");
  process.exit();
};

seed();
