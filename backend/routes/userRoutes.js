const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  addAddress,
  deleteAddress,
  updateUserProfile,
  removeFromCart,
  getCart,
  updateCart,
  getUserAddresses,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

// 2. GET: Saare cart items fetch karna
router.route("/cart").post(protect, updateCart).get(protect, getCart);
router.route("/address").get(protect, getUserAddresses); // 3. DELETE: Direct product ID se remove karna
router.route("/cart/:id").delete(protect, removeFromCart);
// Saare user routes protected hone chahiye
router.get("/profile", protect, getUserProfile);
router.post("/address", protect, addAddress);
router.delete("/address/:id", protect, deleteAddress);
router.put("/profile", protect, updateUserProfile);
module.exports = router;
