const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ MATCH FRONTEND
app.use("/api/user", require("./routes/user"));

app.listen(process.env.PORT || 5000, () => {
  console.log("🚀 Server Running on Port " + (process.env.PORT || 5000));
});