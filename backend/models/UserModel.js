const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  label: { type: String, default: "Home" }, // e.g., "Office", "Warehouse"
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }, // Buyer ke liye kaam aayega checkout par
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    imageURL: { type: String, default: "None" },

    // --- ADDRESS LOGIC ---
    savedAddresses: [addressSchema], // Multi-address for Buyers
    businessAddress: addressSchema, // Fixed Pickup Point for Sellers

    // --- GOVERNANCE & MODERATION ---
    isVerified: { type: Boolean, default: true }, // Default false (Admin verify karega)
    status: { type: String, enum: ["active", "suspended"], default: "active" },

    // --- FINANCIAL WALLET (New Added) ---
    // Isse Admin ko "Scheduled Payout" mein help milegi
    sellerFinance: {
      lockedBalance: { type: Number, default: 0 }, // Items not yet delivered
      availableBalance: { type: Number, default: 0 }, // Ready to be paid by Admin
      totalEarned: { type: Number, default: 0 }, // Lifetime Earnings
    },
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // Reference to fetch latest price
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, "Quantity cannot be less than 1"],
        },
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    sellerStats: {
      avgRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
