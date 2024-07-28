const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
  },
  email: {
    type: String,
    unique: true,
    required: true,
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
  is_deleted: {
    type: Boolean,
    default: false,
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
