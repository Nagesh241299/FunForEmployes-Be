const express = require("express");
const router = express.Router();

router.post("/calculate", (req, res) => {
  const { amount, loanDate, loanType } = req.body;

  if (!amount || !loanDate || !loanType) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const today = new Date();
  const loanDateObj = new Date(loanDate);
  const daysPassed = Math.floor((today - loanDateObj) / (1000 * 60 * 60 * 24));

  let grace = loanType === "standard" ? 15 : 10;
  let rate = loanType === "standard" ? 10 : 20;

  const chargeableDays = Math.max(0, daysPassed - grace);
  const penalty = chargeableDays * rate;
  const total = amount + penalty;

  res.json({
    daysPassed,
    chargeableDays,
    penalty,
    total
  });
});

module.exports = router;
