const mongoose = require("mongoose");

const winnerSchema = new mongoose.Schema({
  match_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
    required: true,
  },
  winners: [
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      prize: {
        type: Number,
        required: true,
      },
    },
  ],
  runnerups: [
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      kills: {
        type: Number,
        required: true,
      },
      prize: {
        type: Number,
        required: true,
      },
    },
  ],
  full_result: [
    {
      user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      score: {
        type: Number,
      },
      kills: {
        type: Number,
        required: true,
      },
      assists: {
        type: Number,
      },
      damage: {
        type: Number,
      },
    },
  ],
  special_notes: {
    type: String,
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

winnerSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

const Winner = mongoose.model("Winner", winnerSchema);

module.exports = Winner;
