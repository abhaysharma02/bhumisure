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

module.exports = app;
