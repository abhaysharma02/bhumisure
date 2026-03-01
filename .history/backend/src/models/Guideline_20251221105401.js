const mongoose = require("mongoose");

const GuidelineSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: true,
      default: "MP"
    },

    city: {
      type: String,
      required: true,
      default: "Gwalior"
    },

    areaType: {
      type: String,
      enum: ["Urban", "Rural"],
      required: true
    },

    ward: {
      type: String, // Urban ke liye
    },

    tehsil: {
      type: String, // Rural ke liye
    },

    village: {
      type: String, // Rural ke liye
    },

    locationName: {
      type: String, // Colony / Area name (PDF ka "Guideline Sthan")
      required: true
    },

    propertyType: {
      type: String,
      enum: [
        "Residential_Plot",
        "Residential_Building",
        "Commercial",
        "Agricultural"
      ],
      required: true
    },

    ratePerSqm: {
      type: Number,
      required: true
    },

    year: {
      type: String,
      default: "2025-26"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Guideline", GuidelineSchema);
