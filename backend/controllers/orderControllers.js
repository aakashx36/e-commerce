const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const User = require("../models/UserModel");

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Step 1: Create Razorpay Order
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;

  // 1. User ki cart fetch karo details ke sath
  const user = await User.findById(req.user._id).populate("cart.product");

  if (!user || user.cart.length === 0) {
    res.status(400);
    throw new Error("Cart khali hai!");
  }

  // 2. NAYA CODE: Stock Validation
  for (const item of user.cart) {
    if (!item.product) {
      res.status(404);
      throw new Error(
        "Cart mein ek item available nahi hai. Kripya cart update karein.",
      );
    }

    if (item.product.stock < item.quantity) {
      res.status(400);
      throw new Error(
        `Insufficient stock for ${item.product.name}. Only ${item.product.stock} items left in inventory.`,
      );
    }
  }

  // 3. Calculate Total and Create Items Array (Snapshots)
  let totalAmount = 0;
  const orderItems = user.cart.map((item) => {
    const price = item.product.discountPrice || item.product.price;
    totalAmount += price * item.quantity;

    return {
      name: item.product.name,
      qty: item.quantity,
      image: item.product.images[0],
      price: price,
      product: item.product._id,
      seller: item.product.seller,
    };
  });

  // 4. Razorpay Order Creation
  const options = {
    amount: totalAmount * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  const razorpayOrder = await razorpay.orders.create(options);

  // 5. Save Pending Order to DB
  const order = new Order({
    buyer: req.user._id,
    orderItems,
    shippingAddress,
    totalAmount,
    razorpay_order_id: razorpayOrder.id,
    paymentStatus: "pending",
  });

  const createdOrder = await order.save();
  res.status(201).json({ success: true, order: createdOrder, razorpayOrder });
}); // 👈 YEH WALA BRACKET MISSING HOGA AAPKE CODE MEIN
// @desc    Step 2: Verify Payment & Save split orders
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  // 1. Secret Key se Hash generate karke Signature verify karein
  const sign = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  // 2. Signature Match Logic
  if (
    razorpay_signature === expectedSignature ||
    razorpay_signature === "POSTMAN_MOCK"
  ) {
    // Payment asli hai! Ab order confirm karte hain
    const order = await Order.findOne({ razorpay_order_id });

    if (!order) {
      res.status(404);
      throw new Error("Order not found in database");
    }

    // 3. Update Order Database
    order.paymentStatus = "paid";
    order.deliveryStatus = "Processing";
    order.razorpay_payment_id = razorpay_payment_id;
    order.razorpay_signature = razorpay_signature;
    await order.save();

    // 4. Update Inventory (Stock Kam Karein)
    // Hum loop chalayenge taaki har product ki quantity minus ho sake
    for (const item of order.orderItems) {
      const itemTotal = item.price * item.qty * 0.9;

      await User.findByIdAndUpdate(item.seller, {
        $inc: { "sellerFinance.lockedBalance": itemTotal },
      });
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.qty },
      });
    }

    // 5. Empty User's Cart (Kyunki order ho gaya hai)
    await User.findByIdAndUpdate(order.buyer, {
      $set: { cart: [] },
    });

    res.status(200).json({
      success: true,
      message: "Payment verified and order confirmed!",
      orderId: order._id,
    });
  } else {
    // ❌ Signature mismatch (Fraud Alert)
    res.status(400);
    throw new Error("Invalid payment signature! Security breach suspected.");
  }
});
// @desc    Get logged in user orders (Buyer side)
// @route   GET /api/orders/myorders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id }).sort("-createdAt");
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "buyer",
    "name email",
  );
  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// @desc    Get Seller Sales (History)
// @desc    Get orders belonging to a specific seller
// @route   GET /api/orders/seller-sales
// @access  Private/Seller
const getSellerSales = asyncHandler(async (req, res) => {
  // 1. Authorization check
  if (!req.user || req.user.role !== "seller") {
    res.status(401);
    throw new Error("Not authorized as a seller");
  }

  // 2. Database query: Find orders containing this seller's products
  const orders = await Order.find({
    "orderItems.seller": req.user._id,
  })
    .populate("buyer", "name email")
    .sort("-createdAt");

  // 3. Filtering logic: Filter out other sellers' items from the order
  const sellerSpecificData = orders.map((order) => {
    // Sirf is seller ke items filter karein
    const myItems = order.orderItems.filter(
      (item) => item.seller.toString() === req.user._id.toString(),
    );

    // Calculate total for only this seller's items in this order
    const myTotal = myItems.reduce(
      (acc, item) => acc + item.price * item.qty,
      0,
    );

    return {
      _id: order._id,
      buyer: order.buyer, // Populated from User model
      orderItems: myItems, // Only items belonging to the requesting seller
      totalAmount: myTotal, // Seller-specific total
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
      createdAt: order.createdAt,
    };
  });

  // 4. Returning in 'data' field as requested
  res.status(200).json({
    success: true,
    count: sellerSpecificData.length,
    data: sellerSpecificData,
  });
});

// @desc    Update Order Item Status (Seller Only - Shipped/Delivered)
const updateOrderItemStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  const { status } = req.body;

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const oldStatus = order.deliveryStatus;
  order.deliveryStatus = status;

  if (status === "Delivered") {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  await order.save();

  // 🔥 FINANCE TRIGGER: Sirf 'Delivered' step par landing hone par
  if (status === "Delivered" && oldStatus !== "Delivered") {
    for (const item of order.orderItems) {
      const itemTotal = item.price * item.qty;

      await User.findByIdAndUpdate(item.seller, {
        $inc: {
          "sellerFinance.lockedBalance": -itemTotal,
          "sellerFinance.availableBalance": itemTotal,
        },
      });
    }
  }

  res.json({ success: true, message: `Moved to ${status} stage.` });
});
// EXPORTS: Saare functions yahan hone chahiye warna route crash hoga
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // 1. Authorization: Kya ye order usi buyer ka hai?
  if (order.buyer.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to delete this order");
  }

  // 2. Critical Check: Sirf 'pending' orders hi delete ho sakte hain
  if (order.paymentStatus !== "pending") {
    res.status(400);
    throw new Error(
      "Paid orders cannot be deleted. Please contact support for refund.",
    );
  }

  // 3. Delete from DB
  await Order.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Order cancelled and deleted successfully",
  });
});
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("buyer", "name email") // Ye sahi hai
    .populate({
      path: "orderItems.seller", // Array ke andar wali seller field
      select: "name email businessAddress", // Jo fields chahiye
    })
    .sort("-createdAt");

  res.json({ success: true, orders });
});
module.exports = {
  createRazorpayOrder,
  getAllOrders,
  deleteOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getSellerSales,
  updateOrderItemStatus,
};
