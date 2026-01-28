const express = require("express");
const axios = require("axios");
const cors = require("cors");
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.OPENWEATHER_API_KEY;

const app = express();
app.use(cors());
app.use(express.static("public"));

app.get("/weather", async (req, res) => {
  const { lat, lon, city } = req.query;

  try {
    let url = city
      ? `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    console.error("❌ Weather API error:", err.response?.data || err.message);
    res.status(500).json({ error: "City not found or API key error" });
  }
});

app.get("/forecast", async (req, res) => {
  const { lat, lon } = req.query;

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    console.error("❌ Forecast API error:", err.response?.data || err.message);
    res.status(500).json({ error: "Forecast not found" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
