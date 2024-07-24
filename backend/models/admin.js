const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true, // Hashed
  },
  role: {
    type: String,
    enum: ["superadmin", "admin"],
    default: "admin",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

adminSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
