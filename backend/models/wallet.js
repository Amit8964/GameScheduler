const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
  transactions: [
    {
      transaction_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
      type: {
        type: String,
        enum: ["credit", "debit"],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      timestamp: {
        type: Date,
        required: true,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ["pending", "completed"],
        required: true,
      },
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

walletSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
