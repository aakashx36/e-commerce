const Review = require("../models/ReviewModel"); // 👈 FIX 1: Missing Import Added
const Order = require("../models/OrderModel");
const asyncHandler = require("express-async-handler");

// @desc    1. Create a New Review
// @route   POST /api/reviews
// @access  Private
const postReview = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { product, order, rating, comment } = req.body;
  console.log(product, order, rating, comment, req.user._id);
  // 👈 FIX 2: Pre-check missing fields to avoid Mongoose validation errors
  if ((!product && !order) || (!rating && !comment)) {
    res.status(400);
    throw new Error(
      "Missing required fields: product, order, rating, or comment",
    );
  }
  // --- 🔥 FLEXIBLE VERIFICATION LOGIC ---
  let isVerified = false;

  // Agar frontend se orderId aaya hai (from Orders Page)
  if (order) {
    const verifiedOrder = await Order.findOne({
      _id: order,
      buyer: req.user._id,
      "orderItems.product": product,
      deliveryStatus: "Delivered", // Sirf delivered products hi verified maane jayenge
    });

    if (verifiedOrder) {
      isVerified = true;
    }
  }
  // Agar orderId nahi aaya (from Product Page), toh isVerified hamesha 'false' rahega
  const review = await Review.create({
    product,
    buyer: req.user._id,
    order,
    rating: Number(rating), // Ensure it's a number
    comment,
    isVerifiedPurchase: isVerified,
  });

  res.status(201).json({
    success: true,
    message: "Review added successfully",
    data: review,
  });
});

// @desc    2. Get All Reviews for a Product (Public)
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({
    product: req.params.productId,
    isVisible: true,
  })
    .populate("buyer", "name") // Buyer ka sirf name dikhane ke liye
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

// @desc    3. Delete/Hide Review (Admin Only)
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review) {
    // Review ko hide karna better hai bajaye permanent delete ke
    review.isVisible = false;
    await review.save();
    res.json({ success: true, message: "Review removed by admin" });
  } else {
    res.status(404);
    throw new Error("Review not found");
  }
});

// @desc    4. Seller Response to Review
// @route   PATCH /api/reviews/:id/response
// @access  Private (Seller)
const sellerResponse = asyncHandler(async (req, res) => {
  const { comment } = req.body;

  if (!comment) {
    res.status(400);
    throw new Error("Please add a response comment");
  }

  const review = await Review.findById(req.params.id);

  if (review) {
    review.sellerResponse = {
      comment,
      respondedAt: Date.now(),
    };
    await review.save();
    res.json({ success: true, data: review });
  } else {
    res.status(404);
    throw new Error("Review not found");
  }
});

module.exports = {
  postReview,
  getProductReviews,
  deleteReview,
  sellerResponse,
};
