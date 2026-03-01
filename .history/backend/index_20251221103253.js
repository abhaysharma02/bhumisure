require("dotenv").config();
const app = require("./src/app");

const PORT = process.env.PORT || 4000;

app.listen({ port: PORT }, () => {
  console.log(`🚀 BhumiSure backend running on port ${PORT}`);
});
