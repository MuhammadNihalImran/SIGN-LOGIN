const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  otp: String,
  email: String,
  isUsed: { type: Boolean, default: false },
  createdOn: { type: Date, default: Date.now },
});
export const otpModel = mongoose.model("Opts", otpSchema);
