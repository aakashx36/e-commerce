const express = require("express");
const router = express.Router();

// @route   GET /api/admin/dashboard-st
// Controllers import (Ensure path is correct)
const {
  getAllUsers,
  toggleUserStatus,
  getSellerSalesHistory,
  getBuyerOrderHistory,
  getAdminDashboardStats,
  getBuyerSpendingChart,
  getSellerSalesChart,
  getPendingPayouts,
  processPayout,
} = require("../controllers/adminControllers");

// Middlewares (Admin and Auth check)
const { protect, authorize } = require("../middleware/authMiddleware");

// --- 👥 USER MANAGEMENT ---
// @route   GET /api/admin/users
// adminRoutes.js mein add karein
router.get(
  "/dashboard-stats",
  protect,
  authorize("admin"),
  getAdminDashboardStats,
);
router.get("/users", protect, getAllUsers);

// @route   PATCH /api/admin/toggle-status/:id
router.patch("/toggle-status/:id", toggleUserStatus);

// --- 🛍️ BUYER ANALYTICS ---
// @route   GET /api/admin/buyer-history/:buyerId
router.get("/buyer-history/:buyerId", getBuyerOrderHistory);

// @route   GET /api/admin/buyer-spending/:buyerId
router.get("/buyer-spending/:buyerId", getBuyerSpendingChart);

// --- 📈 SELLER ANALYTICS ---
// @route   GET /api/admin/seller-sales/:sellerId
router.get("/seller-sales/:sellerId", getSellerSalesChart);

// @route   GET /api/admin/seller-history/:sellerId
router.get("/seller-history/:sellerId", getSellerSalesHistory);

// --- 💰 PAYOUT MANAGEMENT ---
// @route   GET /api/admin/payouts/pending
router.get("/payouts/pending", protect, getPendingPayouts);

// @route   POST /api/admin/payouts/process
router.post("/payouts/process", protect, processPayout);

module.exports = router;
