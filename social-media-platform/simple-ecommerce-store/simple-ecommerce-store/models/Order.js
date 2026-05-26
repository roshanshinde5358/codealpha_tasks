const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: String,
  products: Array
});

module.exports = mongoose.model("Order", orderSchema);