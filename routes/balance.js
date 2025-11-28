const express = require("express");
const router = express.Router();
const Balance = require("../models/Balance");

router.get("/", async (req, res) => {
  try {
    const balance = await Balance.findOne();
    if (!balance) return res.status(404).json({ message: "No balance found" });
    res.json(balance); // <-- Make sure this is returning JSON with correct keys
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
