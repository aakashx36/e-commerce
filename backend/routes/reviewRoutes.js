const express = require("express");
const router = express.Router();
const {
  postReview,
  getProductReviews,
  deleteReview,
  sellerResponse,
} = require("../controllers/reviewControllers");
const { protect, authorize } = require("../middleware/authMiddleware");

// Routes logic
router.route("/").post(protect, postReview);

// Admin action
router.route("/:id").delete(protect, authorize("admin"), deleteReview);
router
  .route("/:id/response")
  .patch(protect, authorize("seller"), sellerResponse); // Add seller check if needed
router.route("/:productId").get(getProductReviews);

module.exports = router;
