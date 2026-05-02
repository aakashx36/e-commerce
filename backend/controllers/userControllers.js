const User = require("../models/UserModel");
const asyncHandler = require("express-async-handler");
const Product = require("../models/ProductModel");

// @desc    Get user profile data
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // req.user._id humein 'protect' middleware se milta hai
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      imageURL: user.imageURL,
      savedAddresses: user.savedAddresses,
      businessAddress: user.businessAddress, // Only for Sellers
      status: user.status,
      sellerFinance: user.sellerFinance,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Add new shipping address
// @route   POST /api/users/address
// @access  Private (Buyer/Seller/Admin)
const addAddress = asyncHandler(async (req, res) => {
  const { label, fullName, phone, street, city, state, zipCode } = req.body;

  const user = await User.findById(req.user._id);

  if (user) {
    const newAddress = { label, fullName, phone, street, city, state, zipCode };

    user.savedAddresses.push(newAddress);
    await user.save();

    res.status(201).json({
      message: "Address added successfully",
      addresses: user.savedAddresses,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Delete a specific address
// @route   DELETE /api/users/address/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Filter karke us specific ID wale address ko hata dena
    user.savedAddresses = user.savedAddresses.filter(
      (addr) => addr._id.toString() !== req.params.id,
    );

    await user.save();
    res.json({
      message: "Address removed successfully",
      addresses: user.savedAddresses,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.imageURL = req.body.imageURL || user.imageURL; // 🚨 ADD THIS LINE

    // 1. Saved Addresses Sync
    if (req.body.savedAddresses) {
      user.savedAddresses = req.body.savedAddresses;
    } // <-- Yeh bracket missing tha

    // 2. Business Address handling (Seller)
    if (req.body.businessAddress) {
      user.businessAddress = req.body.businessAddress;
    }

    const updatedUser = await user.save();
    res.json({
      success: true,
      user: updatedUser,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateCart = asyncHandler(async (req, res) => {
  const { productId, qty } = req.body; // qty is the final quantity from frontend
  const user = await User.findById(req.user._id);

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check if item already exists in cart
  const itemIndex = user.cart.findIndex(
    (item) => item.product.toString() === productId,
  );

  if (itemIndex > -1) {
    // 🟢 Update or Remove
    if (qty <= 0) {
      user.cart.splice(itemIndex, 1); // Delete if 0
    } else {
      if (qty > product.stock) {
        res.status(400);
        throw new Error("Out of stock limit");
      }
      user.cart[itemIndex].quantity = qty; // Overwrite with new quantity
    }
  } else if (qty > 0) {
    // 🔵 Add new item
    user.cart.push({
      product: productId,
      quantity: qty,
      seller: product.seller,
    });
  }

  await user.save();
  res.json(user.cart);
});

const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "cart.product",
    select: "name images price discountPrice stock seller",
  });

  if (user) {
    res.json(user.cart);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const removeFromCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.cart = user.cart.filter(
    (item) => item.product.toString() !== req.params.id,
  );

  await user.save();
  res.json({ message: "Item removed", cart: user.cart });
});

const getUserAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json(user.savedAddresses);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
// Export mein add karna na bhoolein
module.exports = {
  getUserProfile,
  addAddress,
  deleteAddress,
  updateCart,
  getCart,
  removeFromCart,
  updateUserProfile,
  getUserAddresses,
};
