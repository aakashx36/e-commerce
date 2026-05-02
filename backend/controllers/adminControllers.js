const Payout = require("../models/PayoutModel");
const User = require("../models/UserModel");
const Product = require("../models/ProductModel");
const asyncHandler = require("express-async-handler");
const Order = require("../models/OrderModel");
const mongoose = require("mongoose");
// --- USER GOVERNANCE ---

// @desc    Get all users (Buyer & Sellers)
// @route   GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  // $ne (Not Equal) use karke admin ko list se hata denge
  const users = await User.find({ _id: { $ne: req.user._id } }).select(
    "-password",
  );
  res.json({ success: true, users });
});

const getBuyerOrderHistory = asyncHandler(async (req, res) => {
  const { buyerId } = req.params;
  const orders = await Order.find({ buyer: buyerId }).populate(
    "orderItems.product",
  );
  res.json({ success: true, orders });
});

// @desc    Get Buyer Spending Chart Data
// @route   GET /api/admin/buyer-spending/:buyerId
const getBuyerSpendingChart = asyncHandler(async (req, res) => {
  const { buyerId } = req.params;

  const spendingData = await Order.aggregate([
    {
      // 1. Sirf us buyer ke orders pakdo jo 'Paid' hain
      $match: {
        buyer: new mongoose.Types.ObjectId(buyerId),
        paymentStatus: "paid",
      },
    },
    {
      // 2. Month nikalne ke liye data ko group karo
      $group: {
        _id: { $month: "$createdAt" }, // 1 = Jan, 2 = Feb...
        totalAmount: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } }, // Month wise sort (Jan to Dec)
  ]);

  res.json({ success: true, spendingData });
});
// Existing toggleUserStatus...
const toggleUserStatus = asyncHandler(async (req, res) => {
  // 1. Database se user ko dhoondo
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // 2. Status ko ulta (toggle) kardo
  // Agar active hai toh suspended, agar suspended hai toh active
  const newStatus = user.status === "active" ? "suspended" : "active";
  user.status = newStatus;
  await user.save();

  // 3. Chain Reaction: Selrler ke products ko hide/show karna
  // Agar seller block hua, toh products 'isAdminHidden: true' ho jayenge
  const shouldHide = newStatus === "suspended";

  await Product.updateMany({ seller: user._id }, { isAdminHidden: shouldHide });

  res.json({
    success: true,
    message: `User is now ${newStatus}`,
    status: newStatus,
  });
});

// @desc    Get Seller Sales Chart Data for Admin
// @route   GET /api/admin/seller-sales/:sellerId
const getSellerSalesChart = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;

  const salesStats = await Order.aggregate([
    {
      // 1. Sirf is seller ke orders pakdo jo 'Paid' ho chuke hain
      $match: {
        "orderItems.seller": new mongoose.Types.ObjectId(sellerId),
        paymentStatus: "paid",
      },
    },
    {
      // 2. Data ko Month ke hisaab se group karo
      $group: {
        _id: { $month: "$createdAt" }, // 1=Jan, 2=Feb...
        totalSales: { $sum: "$totalAmount" },
        count: { $sum: 1 }, // Total orders in that month
      },
    },
    { $sort: { _id: 1 } }, // Months ko sequence mein lagao
  ]);

  res.json({ success: true, salesStats });
});

// adminControllers.js

const getSellerSalesHistory = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;

  // 1. Un orders ko dhoondo jisme ye seller involved hai aur payment ho chuki hai
  const orders = await Order.find({
    "orderItems.seller": new mongoose.Types.ObjectId(String(sellerId)),
    paymentStatus: "paid",
  }).populate("buyer", "name email"); // Buyer details populate karein

  // 2. Data transform karein taaki frontend par list professionally dikhe
  const salesHistory = orders.map((order) => {
    // Sirf is seller ke items nikalein
    const sellerItems = order.orderItems.filter(
      (item) => item.seller.toString() === sellerId.toString(),
    );

    return {
      _id: order._id,
      createdAt: order.createdAt,
      deliveryStatus: order.deliveryStatus,
      paymentStatus: order.paymentStatus,
      orderItems: sellerItems, // Ye wahi array hai jo hum frontend pe map karenge
      totalForSeller: sellerItems.reduce(
        (acc, item) => acc + item.price * item.qty,
        0,
      ),
    };
  });

  res.json({
    success: true,
    count: salesHistory.length,
    salesHistory, // Frontend stats state mein yahi jayega
  });
});
// --- PAYOUT SECTION ---
// @desc    Get all delivered items that are not yet paid to sellers
const getPendingPayouts = asyncHandler(async (req, res) => {
  const pendingItems = await Order.aggregate([
    { $unwind: "$orderItems" }, // Array ko individual items mein tod do
    {
      $match: {
        deliveryStatus: "Delivered", // Pura order deliver hona chahiye
        "orderItems.isPaidToSeller": false, // Lekin item paid nahi hona chahiye
      },
    },
    {
      $lookup: {
        from: "users", // Seller ki details nikalne ke liye
        localField: "orderItems.seller",
        foreignField: "_id",
        as: "sellerDetails",
      },
    },
    { $unwind: "$sellerDetails" },
    {
      $project: {
        orderId: "$_id",
        productName: "$orderItems.name",
        productId: "$orderItems.product",
        qty: "$orderItems.qty",
        price: "$orderItems.price",
        sellerName: "$sellerDetails.name",
        sellerId: "$sellerDetails._id",
        paymentStatus: "$paymentStatus",
      },
    },
  ]);

  res.json({ success: true, count: pendingItems.length, pendingItems });
});
const processPayout = asyncHandler(async (req, res) => {
  const { sellerId, orderId, productId, amount, transactionReference } =
    req.body;

  // 1. Payout Record Create Karein
  const payout = await Payout.create({
    seller: sellerId,
    amount,
    transactionReference,
    status: "completed",
    paidAt: Date.now(),
  });

  // 2. Order ke andar specific Item ko "Paid" mark karein
  // Hum arrayFilters use karenge taaki sahi product update ho
  await Order.updateOne(
    { _id: orderId },
    {
      $set: {
        "orderItems.$[elem].isPaidToSeller": true,
        "orderItems.$[elem].payoutRef": payout._id,
      },
    },
    { arrayFilters: [{ "elem.product": productId }] },
  );

  // 3. Seller Finance Update (Very Important)
  await User.findByIdAndUpdate(sellerId, {
    $inc: {
      "sellerFinance.availableBalance": -amount, // Wallet se paise nikle
      "sellerFinance.totalEarned": amount, // Lifetime earnings badhi
    },
  });

  res.status(201).json({
    success: true,
    message: "Payout processed and wallet updated",
    payout,
  });
});

// @route   GET /api/admin/dashboard-stats
const getAdminDashboardStats = asyncHandler(async (req, res) => {
  // 1. Total Users Count (Excluding Admin)
  const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });

  // 2. Active Sellers Count (Role: seller & isApproved: true)
  const activeSellers = await User.countDocuments({
    role: "seller",
    status: "active",
  });
  const verifiedSellers = await User.countDocuments({
    role: "seller",
    isVerified: true,
  });

  // 3. Platform Financials (Only for 'Paid' orders)
  const financialStats = await Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
        orderCount: { $sum: 1 },
      },
    },
  ]);

  const revenue =
    financialStats.length > 0 ? financialStats[0].totalRevenue : 0;
  const orderCount =
    financialStats.length > 0 ? financialStats[0].orderCount : 0;

  res.json({
    success: true,
    stats: {
      totalUsers,
      verifiedSellers,
      activeSellers,
      totalOrders: orderCount,
      totalGMV: revenue,
      platformCommission: revenue * 0.1, // 10% Commission logic
    },
  });
});
module.exports = {
  getAllUsers,
  getAdminDashboardStats, // Added
  toggleUserStatus,
  getSellerSalesHistory,
  getBuyerOrderHistory,
  getBuyerSpendingChart,
  getSellerSalesChart,
  getPendingPayouts,
  processPayout,
};
