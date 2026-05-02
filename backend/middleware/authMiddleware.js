const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");

// 1. Protect: Verifies if the user is logged in
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for 'Bearer <token>' in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(" ")[1];

      // Decode the token using your JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB and attach to req.user (excluding password)
      // This allows controllers to access req.user._id, req.user.role, etc.
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }
});

// 2. Authorize: Restricts access to specific roles (RBAC)
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if req.user exists and if their role is in the allowed list
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `User role '${req.user?.role}' is not authorized to access this route`,
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
