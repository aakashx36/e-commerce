const Complaint = require("../models/ComplaintModel"); // Model check kar lena
const asyncHandler = require("express-async-handler");
const Order = require("../models/OrderModel");
// @desc    1. Post a new complaint (Buyer Only)
// @route   POST /api/complaints
// @access  Private
// @desc    Post Complaint (Flexible for any user role who placed the order)
const postComplaint = asyncHandler(async (req, res) => {
  const { order, orderItem, subject, message, evidenceImages } = req.body;

  // 1. Basic Check
  if (!order || !orderItem || !subject || !message) {
    res.status(400);
    throw new Error("Missing required fields.");
  }

  // 2. Database se Order fetch karein
  const orderDetails = await Order.findById(order);

  if (!orderDetails) {
    res.status(404);
    throw new Error("Order not found.");
  }

  // 3. Logic: Kya request karne wala wahi hai jisne Order place kiya tha?
  // req.user._id authentication middleware se aayega
  if (orderDetails.buyer.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error(
      "Unauthorized! You can only complain about items you purchased.",
    );
  }

  // 4. Find the Seller of this specific item from Order
  const item = orderDetails.orderItems.find(
    (i) => i.product.toString() === orderItem.toString(),
  );

  if (!item) {
    res.status(404);
    throw new Error("This product is not part of the order.");
  }

  // 5. Create Complaint
  const complaint = await Complaint.create({
    buyer: req.user._id, // Jisne kharida (Current logged-in user)
    seller: item.seller, // Jisne becha
    order,
    orderItem,
    subject,
    message,
    evidenceImages: evidenceImages || [],
    status: "pending",
  });

  res.status(201).json({
    success: true,
    message: "Complaint filed successfully!",
    data: complaint,
  });
});
// @desc    2. Get logged-in user's complaints (My Complaints)
// @route   GET /api/complaints/my
// @access  Private
const getMyComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ buyer: req.user._id })
    .populate("seller", "name shopName")
    .populate("order", "razorpay_order_id totalAmount")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: complaints.length,
    data: complaints,
  });
});

// @desc    3. Get all complaints (Admin Only)
// @route   GET /api/complaints
// @access  Private/Admin
const getAllComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({})
    .populate("buyer", "name email")
    .populate("seller", "name ")
    .populate("order", "razorpay_order_id")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: complaints.length,
    data: complaints,
  });
});

// @desc    Get single complaint details (with Seller's Business Address)
// @route   GET /api/complaints/:id
// @access  Private (Buyer, Seller of that item, or Admin)
const getComplaint = asyncHandler(async (req, res) => {
  console.log(req.params.id);
  const complaint = await Complaint.findById(req.params.id)
    .populate("buyer", "name email imageURL")
    .populate("seller", "name email imageURL businessAddress"); // businessAddress ko include kiya

  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  // Authorization: Buyer, Seller (jisne item becha tha), ya Admin
  const isBuyer = complaint.buyer?._id?.toString() === req.user._id.toString();
  const isSeller =
    complaint.seller?._id?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isBuyer && !isSeller && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to view this complaint");
  }

  res.status(200).json({
    success: true,
    data: complaint,
  });
});

// @desc    5. Resolve/Update Complaint status (Admin Only)
// @route   PATCH /api/complaints/:id/resolve
// @access  Private/Admin
const resolveComplaint = asyncHandler(async (req, res) => {
  const { status, note } = req.body; // status: 'under-review', 'resolved', 'refunded'

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  complaint.status = status || complaint.status;
  complaint.adminResolution = {
    note: note,
    resolvedAt: Date.now(),
  };

  const updatedComplaint = await complaint.save();

  res.status(200).json({
    success: true,
    message: `Complaint marked as ${status}`,
    data: updatedComplaint,
  });
});
// @desc    Get all complaints for a specific product
const mongoose = require("mongoose");

const getProductComplaints = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  console.log("✅ Backend called with productId:", productId);

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400);
    throw new Error("Invalid Product ID format.");
  }

  try {
    const complaints = await Complaint.find({
      orderItem: productId, // Complaint schema mein orderItem field hai
      buyer: req.user._id,
    })
      .populate("seller", "name email imageURL businessAddress ")
      .sort("-createdAt"); // Seller se name, email, image le rahe hain

    console.log(
      `Found ${complaints.length} complaints for product: ${productId}`,
    );

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    console.error("Error fetching product complaints:", error);
    res.status(500);
    throw new Error("Failed to fetch complaint history");
  }
});
// @desc    Update complaint status to Under Review
// @route   PATCH /api/complaints/:id/review
const setUnderReview = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error("Complaint not found");
  }

  complaint.status = "under-review";
  await complaint.save();

  res.status(200).json({
    success: true,
    message: "Complaint is now under investigation",
    data: complaint,
  });
});

// module.exports mein setUnderReview add karein
module.exports = {
  setUnderReview,
  getProductComplaints,
  postComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaint,
  resolveComplaint,
};
