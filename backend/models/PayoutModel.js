const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema(
  {
    // Kis Seller ko paisa bheja ja raha hai?
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Total Net Amount (Sellers ka 90% share after 10% commission deduction)
    amount: {
      type: Number,
      required: true,
    },

    // Is payout mein kaun-kaun se Order Items shamil hain?
    // Isse Admin aur Seller dono ko clarity rahegi ki kis product ka paisa mil gaya
    orderItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderItem",
      },
    ],

    // Payout ki current state
    status: {
      type: String,
      enum: ["scheduled", "processing", "completed", "failed"],
      default: "scheduled",
    },

    // --- 💳 BANKING & RAZORPAY DETAILS ---

    // Razorpay Payout ID ya Bank ka UTR Number (Proof of transfer)
    transactionReference: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Payout Method (Direct Bank, UPI, or Razorpay Wallet)
    payoutMethod: {
      type: String,
      default: "Razorpay Payout",
    },

    paidAt: {
      type: Date,
    },

    // Admin agar koi deduction ya extra info dena chahe
    adminNote: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payout", payoutSchema);
