const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");

// 🔑 Helper: Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @route   POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, businessAddress } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // If seller, ensure businessAddress is provided
  if (role === "seller" && !businessAddress) {
    res.status(400);
    throw new Error("Sellers must provide a business address for pickups");
  }

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "buyer",
    businessAddress: role === "seller" ? businessAddress : undefined,
    isVerified: role === "admin" ? true : false, // Admins auto-verify, others wait
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      _id: user._id,
      businessAddress: user.businessAddress, // 👈 Seller ke liye business address
      cart: user.cart, // 👈 Cart sync karne ke liye
      imageURL: user.imageURL, // Mandatory for Navbar
      savedAddresses: user.savedAddresses, // Mandatory for Checkout
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    // Check if user is suspended
    if (user.status === "suspended") {
      res.status(403);
      throw new Error("Your account has been suspended by the Admin");
    }
    console.log("login Successfully");
    console.log(user);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      _id: user._id,
      businessAddress: user.businessAddress, // 👈 Seller ke liye business address
      cart: user.cart, // 👈 Cart sync karne ke liye
      imageURL: user.imageURL, // Mandatory for Navbar
      savedAddresses: user.savedAddresses, // Mandatory for Checkout
      token: generateToken(user._id),
    });
  } else {
    console.log("invalid");
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

module.exports = { registerUser, loginUser };
