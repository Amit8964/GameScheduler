const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const errorLogSchema = new Schema({
  stack_trace: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ["LOW", "HIGH"],
  },
  functionName: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ErrorLog = mongoose.model("ErrorLog", errorLogSchema);

module.exports = ErrorLog;
