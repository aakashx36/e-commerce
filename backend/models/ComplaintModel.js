const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // --- 🔍 CRITICAL ADDITIONS ---

    // Kaunsa item kharab hai?
    orderItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },

    subject: {
      type: String,
      required: true,
      enum: [
        "Damaged Product",
        "Wrong Item",
        "Late Delivery",
        "Refund Issue",
        "Other",
      ],
    },

    message: { type: String, required: true },

    // Evidence images (Cloudinary URLs)
    evidenceImages: [{ type: String }],

    status: {
      type: String,
      enum: ["pending", "under-review", "resolved", "refunded"],
      default: "pending",
    },

    // Admin's final decision or reply
    adminResolution: {
      note: String,
      resolvedAt: Date,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Complaint", complaintSchema);
