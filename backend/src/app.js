const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const stampDutyRoutes = require("./routes/stampDuty.routes");

const app = express();

app.use(cors());
app.use(express.json());

// connect database
connectDB();

app.use("/api/stamp-duty", stampDutyRoutes);
app.use("/api", require("./routes/location.routes"));
app.use("/api/admin", require("./routes/admin.routes"));

app.get("/", (req, res) => {

  res.json({ status: "BhumiSure Backend Running (Express + PG)" });
});

// Start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ BhumiSure API is running on port ${PORT}`);
  });
}

module.exports = app;
