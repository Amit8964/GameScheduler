const mongoose = require("mongoose");

const userMatchSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  game_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
    required: true,
  },
  match_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
    required: true,
  },
  role: {
    type: String,
  },
  join_date: {
    type: Date,
    default: Date.now,
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

userMatchSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

userMatchSchema.index({ user_id: 1, match_id: 1 });

const UserMatch = mongoose.model("UserMatch", userMatchSchema);

module.exports = UserMatch;
