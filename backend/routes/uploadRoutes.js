const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadImagesMiddleware"); // Your middleware
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, upload.array("images"), (req, res) => {
  const urls = req.files.map((file) => file.path);
  res.status(200).json({ images: urls });
});

module.exports = router;
