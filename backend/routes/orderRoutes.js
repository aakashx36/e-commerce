const express = require("express");
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  getAllOrders,
  getMyOrders,
  getOrderById, // Added for single order details
  getSellerSales,
  deleteOrder,
  updateOrderItemStatus,
} = require("../controllers/orderControllers"); // Check spelling: 'orderController' vs 'orderControllers'
const { protect, authorize } = require("../middleware/authMiddleware");

// --- BUYER ROUTES ---
router.get("/", protect, authorize("admin"), getAllOrders);
// 1. Checkout: Razorpay Order ID generate karna
router.post(
  "/checkout",
  protect,
  authorize("buyer", "seller"),
  createRazorpayOrder,
);

// 2. Verification: Payment confirm karke DB mein save karna
router.post("/verify", protect, authorize("buyer", "seller"), verifyPayment);

// 3. Buyer History: "Maine kya kharida?"
router.get("/my-orders", protect, getMyOrders);

// 4. Single Order Detail: Receipt dekhne ke liye

// --- SELLER & ADMIN ROUTES ---

// 5. Seller History: "Mera kya bika?"
router.get("/seller-sales", protect, authorize("seller"), getSellerSales);
router.get("/:id", protect, getOrderById);

router.route("/:id").delete(protect, authorize("buyer", "seller"), deleteOrder);
// 6. Status Update: Seller ya Admin item ko "Shipped" ya "Delivered" mark karega
router.patch(
  "/status/:id",
  protect,
  authorize("seller", "admin"),
  updateOrderItemStatus,
);

module.exports = router;
