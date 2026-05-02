const Product = require("../models/ProductModel");
const asyncHandler = require("express-async-handler");
const Review = require("../models/ReviewModel");

// @desc    Get all products (Public)
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.pageNumber) || 1;
  //  Dynamic Sorting Logic
  let sortOption = { createdAt: -1 }; // Default: Naye products upar

  if (req.query.sort === "priceLow") {
    sortOption = { price: 1 }; // Sasta pehle
  } else if (req.query.sort === "priceHigh") {
    sortOption = { price: -1 }; // Mehenga pehle
  }
  // 1. Search Logic
  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: "i" } }
    : {};

  // 2. Category Logic (Handle "all" correctly)
  const category =
    req.query.category && req.query.category !== "all"
      ? {
          category:
            req.query.category.charAt(0).toUpperCase() +
            req.query.category.slice(1),
        }
      : {};

  // 3. Advanced Price Logic
  // Filter on discountPrice if it exists, otherwise on MRP price
  const maxPrice = req.query.maxPrice
    ? {
        $or: [
          { discountPrice: { $lte: Number(req.query.maxPrice), $gt: 0 } },
          { price: { $lte: Number(req.query.maxPrice) }, discountPrice: 0 },
        ],
      }
    : {};

  const query = {
    ...keyword,
    ...category,
    ...maxPrice,
    isApproved: true,
    isActive: true,
  };

  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort(sortOption);

  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});
// @desc    Create Product (Seller only)
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    discountPrice,
    category,
    stock,
    specifications,
    images,
  } = req.body;
  if (!images || images.length === 0) {
    res.status(400);
    throw new Error("Please provide at least one image URL.");
  }
  const discountPercent = ((price - discountPrice) / price) * 100;
  if (discountPercent > 70) {
    res.status(400);
    throw new Error("Discount cannot exceed 70% of the Base Price.");
  }

  // 4. Handle Specifications (Parse string back to Array)
  let finalSpecs = [];
  if (specifications) {
    finalSpecs =
      typeof specifications === "string"
        ? JSON.parse(specifications)
        : specifications;
  }

  const product = new Product({
    seller: req.user._id,
    name,
    description,
    price,
    discountPrice,
    category,
    stock,
    images: images, // Array of URLs from Cloudinary
    specifications: finalSpecs,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update Product (Seller/Admin)
// @desc    Update Product (Seller/Admin)
// @route   PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // 1. Security Check: Only owner or admin can update
  if (
    product.seller.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(401);
    throw new Error("Not authorized to update this product");
  }

  // 2. Destructure Body Data
  const {
    name,
    description,
    price,
    discountPrice,
    category,
    stock,
    specifications,
    images, // Frontend se aayi hui Cloudinary URL strings ki array
    isActive,
  } = req.body;
  console.log("req.body");

  // 3. Update Basic Fields
  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price || product.price;
  product.discountPrice =
    discountPrice !== undefined ? discountPrice : product.discountPrice;
  product.stock = stock !== undefined ? stock : product.stock;
  product.category = category || product.category;

  // 4. Update Specifications (Handle String/Object conversion)
  if (specifications) {
    product.specifications =
      typeof specifications === "string"
        ? JSON.parse(specifications)
        : specifications;
  }

  // 5. Update Images: Agar frontend se naye URLs aaye hain
  // Ab hum req.files nahi, req.body.images use karenge
  if (images && Array.isArray(images) && images.length > 0) {
    product.images = images;
  }

  // 6. Governance Toggle
  product.isActive = isActive !== undefined ? isActive : product.isActive;

  // 7. Save and Return
  const updatedProduct = await product.save();
  res.status(200).json({
    success: true,
    message: "Product updated in vault",
    data: updatedProduct,
  });
});
// @desc    Delete a product
// @route   DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    // Security: Only owner (seller) or admin can delete
    if (
      product.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(401);
      throw new Error("Not authorized to delete this product");
    }

    await product.deleteOne(); // Mongoose delete command
    res.json({ message: "Product removed successfully" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});
const getSellerProducts = asyncHandler(async (req, res) => {
  console.log("DFSfsfreq.user._id");
  const products = await Product.find({ seller: req.user._id }).sort(
    "-createdAt",
  );

  if (products) {
    res.json({
      success: true,
      count: products.length,
      products,
    });
  } else {
    res.status(404);
    throw new Error("No products found for this seller");
  }
});
// @desc    Get single product details with reviews
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  console.log(req.params);
  console.log("dasfadfadfafd");
  const { id } = req.params;

  // Parallel execution for better performance
  const [product, reviews] = await Promise.all([
    Product.findById(id).populate("seller", "name email businessAddress"),
    Review.find({ product: id, isVisible: true })
      .populate("buyer", "name")
      .sort("-createdAt"),
  ]);

  // 1. Check if product exists
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  /*
  // 2. Governance check (Admin hidden or Inactive)
  if (product.isAdminHidden || !product.isActive) {
    res.status(403);
    throw new Error("This product is currently unavailable");
  }
*/
  // 3. Calculate dynamic rating stats
  const numReviews = reviews.length;
  const avgRating =
    numReviews > 0
      ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews
      : 0;
  console.log("sfasfdasfasdf");
  // 4. Return combined data
  res.json({
    success: true,
    data: {
      ...product.toObject({ virtuals: true }), // Include discountPercentage virtual
      rating: Number(avgRating.toFixed(1)),
      numReviews,
      reviews,
    },
  });
});

// IMPORTANT: Yahan export mein zaroor add karein
module.exports = {
  getSellerProducts,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
};
