const mongoose = require("mongoose");

const balanceSchema = new mongoose.Schema(
  {
    grandTotal: { type: Number, required: true },
    loanDistributed: { type: Number, required: true },
    limit: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Balance", balanceSchema);
