const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true }, // Snapshotted price
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        isPaidToSeller: { type: Boolean, default: false },
        payoutRef: { type: mongoose.Schema.Types.ObjectId, ref: "Payout" },
      },
    ],
    deliveryStatus: {
      type: String,
      enum: [
        "None",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "None",
    },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    totalAmount: { type: Number, required: true },

    // Razorpay Integration
    razorpay_order_id: { type: String, required: true },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    // Address Snapshot (Corrected Syntax)
    shippingAddress: {
      fullName: { type: String },
      phone: { type: String },
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
