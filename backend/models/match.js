const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  game_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
    required: true,
  },
  match_number: {
    type: String,
    required: true,
  },
  pool_prize: {
    type: Number,
    required: true,
  },
  per_kill_prize: {
    type: Number,
    required: true,
  },
  entry_fees: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  version: {
    type: String,
    required: true,
  },
  map: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["ongoing", "upcoming", "completed"],
    default: "upcoming",
  },
  time_schedule: {
    time: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
  max_players: {
    type: Number,
    required: true,
  },
  current_players: {
    type: Number,
    default: 0,
  },
  rules: {
    type: String,
  },
  description: {
    type: String,
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

matchSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

matchSchema.index({ game_id: 1, status: 1 });

const Match = mongoose.model("Match", matchSchema);

module.exports = Match;
