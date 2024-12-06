const mongoose = require("mongoose")


const LinkSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  clickCount: { type: Number, default: 0 },
  user: { type: String },
})

module.exports = mongoose.model("Link", LinkSchema)