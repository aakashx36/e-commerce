const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Please add a comment"],
      trim: true,
      maxlength: [500, "Comment cannot be more than 500 characters"],
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    sellerResponse: {
      comment: String,
      respondedAt: Date,
    },
  },
  { timestamps: true },
);

// Prevent duplicate reviews
reviewSchema.index({ product: 1, buyer: 1, order: 1 }, { unique: true });

// Static method to update ratings
reviewSchema.statics.updateRatings = async function (productId) {
  const productStats = await this.aggregate([
    { $match: { product: productId, isVisible: true } },
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  let sellerId;
  if (productStats.length > 0) {
    const updatedProduct = await mongoose
      .model("Product")
      .findByIdAndUpdate(productId, {
        rating: Math.round(productStats[0].avgRating * 10) / 10,
        numReviews: productStats[0].nRating,
      });
    if (updatedProduct) sellerId = updatedProduct.seller;
  }

  if (sellerId) {
    const sellerProducts = await mongoose
      .model("Product")
      .find({ seller: sellerId })
      .select("_id");
    const productIds = sellerProducts.map((p) => p._id);

    const sellerStats = await this.aggregate([
      { $match: { product: { $in: productIds }, isVisible: true } },
      {
        $group: {
          _id: null,
          overallAvg: { $avg: "$rating" },
          totalRev: { $sum: 1 },
        },
      },
    ]);

    if (sellerStats.length > 0) {
      await mongoose.model("User").findByIdAndUpdate(sellerId, {
        "sellerStats.avgRating":
          Math.round(sellerStats[0].overallAvg * 10) / 10,
        "sellerStats.totalReviews": sellerStats[0].totalRev,
      });
    }
  }
};

// Middleware to trigger updates
reviewSchema.post("save", function () {
  this.constructor.updateRatings(this.product);
});

// Use 'findOneAndDelete' or 'deleteOne' instead of 'remove' for modern Mongoose
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) await doc.constructor.updateRatings(doc.product);
});

// 🚨 THE CRITICAL FIX: EXPORT THE MODEL 🚨
const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
