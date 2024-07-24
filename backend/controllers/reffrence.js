const mongoose = require("mongoose");
const User = require("./models/User"); // Adjust the path as necessary
const Wallet = require("./models/Wallet");
const Transaction = require("./models/Transaction");

//mongoose.connect('mongodb://localhost:27017/walletDB', { useNewUrlParser: true, useUnifiedTopology: true });

async function createTransaction(email, amount) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({ email }).session(session);
    if (!user) {
      throw new Error("User not found");
    }

    const wallet = await Wallet.findById(user.wallet_id).session(session);
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const transaction = new Transaction({
      wallet_id: wallet._id,
      type: "credit",
      amount,
      status: "completed",
    });

    await transaction.save({ session });

    wallet.balance += amount;
    wallet.transactions.push({
      transaction_id: transaction._id,
      type: transaction.type,
      amount: transaction.amount,
      timestamp: transaction.timestamp,
      status: transaction.status,
    });

    await wallet.save({ session });

    await session.commitTransaction();
    session.endSession();

    console.log("Transaction completed successfully");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Transaction failed:", error);
  }
}

createTransaction("user@example.com", 100);
