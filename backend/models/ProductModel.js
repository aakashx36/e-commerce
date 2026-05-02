const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    // --- 💰 ADVANCED PRICING & ADMIN CONTROL ---
    price: { type: Number, required: true }, // MRP (Base Price)
    discountPrice: { type: Number, default: 0 }, // Seller's offered price

    // Admin set limit (e.g., 50 means max 50% discount allowed)
    maxDiscountLimit: { type: Number, default: 70 },
    // productModel.js mein add karein
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    // Admin can toggle this if seller manipulates prices
    isDiscountActive: { type: Boolean, default: true },

    category: {
      type: String,
      required: true,
      enum: ["Electronics", "Fashion", "Home", "Beauty", "Sports", "Others"],
    },
    specifications: [
      {
        key: { type: String, required: true }, // e.g., "Battery", "Material"
        value: { type: String, required: true }, // e.g., "5000mAh", "Genuine Leather"
      },
    ],

    stock: { type: Number, required: true, default: 0 },
    images: [{ type: String }],

    // Governance
    isApproved: { type: Boolean, default: true }, // Overall product approval
    isAdminHidden: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // 🚨 Important: Virtuals ko JSON mein include karne ke liye
    toObject: { virtuals: true },
  },
);

// Virtual field to calculate Discount Percentage on the fly
productSchema.virtual("discountPercentage").get(function () {
  if (this.discountPrice > 0 && this.price > 0) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

module.exports = mongoose.model("Product", productSchema);
