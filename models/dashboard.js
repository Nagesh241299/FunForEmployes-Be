const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
  name: { type: String, required: true },      // e.g., "Balance", "Loans", "Payments"
  amount: { type: Number, required: true }     // e.g., 12345
});

module.exports = mongoose.model('Dashboard', dashboardSchema);
