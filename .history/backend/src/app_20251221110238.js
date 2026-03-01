const fastify = require("fastify")({ logger: true });
const cors = require("fastify-cors");
const connectDB = require("./config/db");
const stampDutyRoutes = require("./routes/stampDuty.routes");

fastify.register(cors, { origin: true });

// connect database
connectDB();

fastify.get("/", async () => {
  return { status: "BhumiSure Backend Running" };
});

module.exports = fastify;
