const express = require("express");
const router = express.Router();
const {
  getProductComplaints,
  getAllComplaints,
  getComplaint,
  getMyComplaints,
  postComplaint,
  setUnderReview,
  resolveComplaint,
} = require("../controllers/complaintControllers");
const { protect, authorize } = require("../middleware/authMiddleware");
router.get("/product/:productId", protect, getProductComplaints);
// 1. /api/complaints -> Sab dekhna aur Nayi complaint banana
router
  .route("/")
  .post(protect, postComplaint) // Sirf logged-in user complaint kar sakta hai
  .get(protect, authorize("admin"), getAllComplaints); // Logged-in user apni dekhega, Admin saari dekhega
// 2./api/complaints/my/:id all  complaints ny specific user

router.get("/my", protect, getMyComplaints);

// 3. /api/complaints/:id -> Ek specific complaint ka detail dekhna
router.route("/:id").get(protect, getComplaint); // Security: Controller mein check karein ki ye usi user ki hai ya nahi
router.patch("/:id/review", protect, authorize("admin"), setUnderReview); //// 4. /api/complaints/:id/resolve -> Admin ka action
router
  .route("/:id/resolve")
  .patch(protect, authorize("admin"), resolveComplaint); // 👈 Sirf ADMIN hi resolve/refund kar sakta hai
module.exports = router;
