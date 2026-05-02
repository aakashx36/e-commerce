const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadImagesMiddleware"); // Now exports the base upload object
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  getSellerProducts,
} = require("../controllers/productControllers");
const { protect, authorize } = require("../middleware/authMiddleware");

// --- Public Routes ---
router.get("/", getProducts);
// --- Protected Routes ---

// Use .array() for multiple images. 'images' is the key name from Frontend.
router.post(
  "/",
  protect,
  authorize("seller"),
  upload.array("images", 5),
  createProduct,
);
router.get(
  "/seller/inventory",
  protect,
  authorize("seller"),
  getSellerProducts,
);
router
  .route("/:id")
  .put(
    protect,
    authorize("seller", "admin"),
    upload.array("images", 5),
    updateProduct,
  )
  .delete(protect, authorize("seller", "admin"), deleteProduct);
router.get("/:id", getProductById);

module.exports = router;
