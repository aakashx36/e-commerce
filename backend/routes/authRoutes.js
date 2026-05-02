const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authControllers");
const { protect } = require("../middleware/authMiddleware");

// 1. Public Routes (No token needed)
router.post("/register", registerUser);
router.post("/login", loginUser);

// Add this to your existing routes
module.exports = router;
