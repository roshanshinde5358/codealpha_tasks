const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: String,
  content: String,
  likes: Number
});

module.exports = mongoose.model("Post", postSchema);