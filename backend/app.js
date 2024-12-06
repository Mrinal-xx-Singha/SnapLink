const express = require("express");
const cors = require("cors");
const dotenvConfig = require("./config/dotenvConfig.js");
const linkRoutes = require("./routes/linkRoutes.js");
const bodyParser = require('body-parser');

dotenvConfig(); //Load environment variables

const app = express();

//Middleware

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

//Routes
app.use("/api/links", linkRoutes);

// 404 Handling for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Generic Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

module.exports = app;
