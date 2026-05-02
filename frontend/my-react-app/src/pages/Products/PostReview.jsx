import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaStar,
  FaArrowLeft,
  FaPaperPlane,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import api from "../../utils/axiosInstance";

import { useUser } from "../../context/userContext";
import toast from "react-hot-toast";

const PostReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const { productId, orderId, productName, productImage } =
    location.state || {};

  const [order, setOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (orderId) {
      api
        .get(`/api/orders/${orderId}`)
        .then((res) => setOrder(res.data))
        .catch((err) => console.log(err));
    }

    if (!productId || !productName) {
      toast.error("Invalid access. Redirecting...");
      navigate("/products");
    }
  }, [productId, productName, orderId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.trim().length < 10) {
      return toast.error("Review must be at least 10 characters long.");
    }

    try {
      setSubmitting(true);
      const { data } = await api.post("/api/reviews", {
        product: productId,
        order: orderId || null,
        rating,
        comment,
      });

      if (data.success) {
        toast.success(
          orderId ? "Verified Review Submitted!" : "Review Submitted!",
        );
        navigate(`/product/${productId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-24">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-slate-500 font-medium text-sm hover:text-blue-600 transition-colors w-fit"
          >
            <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 group-hover:border-blue-200 transition-colors">
              <FaArrowLeft
                size={12}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
            </div>
            Back to Product
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT PANEL - Product Preview */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm sticky top-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
                Reviewing Product
              </h3>

              <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-center gap-6 text-center sm:text-left lg:text-center">
                <div className="w-32 h-32 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 p-2">
                  <img
                    src={
                      productImage ||
                      "https://placehold.co/300x300?text=No+Image"
                    }
                    alt={productName}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-3 line-clamp-2">
                    {productName}
                  </h2>

                  <div
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      orderId && order?.isDelivered === true
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                        : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                    }`}
                  >
                    {orderId && order?.isDelivered === true ? (
                      <>
                        <FaCheckCircle size={12} className="text-emerald-500" />
                        Verified Purchase
                      </>
                    ) : (
                      "Community Review"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Review Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
                Share Your Experience
              </h1>
              <p className="text-slate-500 mb-10 text-base">
                Your feedback helps other shoppers make better decisions.
              </p>

              {/* Star Rating */}
              <div className="mb-10">
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  Overall Rating
                </p>
                <div className="flex gap-2 sm:gap-3">
                  {[...Array(5)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onMouseEnter={() => setHover(i + 1)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => setRating(i + 1)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <FaStar
                        className={`text-4xl sm:text-5xl transition-colors duration-200 ${
                          i + 1 <= (hover || rating)
                            ? "text-amber-400 drop-shadow-sm"
                            : "text-slate-200 hover:text-amber-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Textarea */}
              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Detailed Review
                  </label>
                  <span
                    className={`text-xs font-medium ${comment.trim().length >= 10 ? "text-emerald-600" : "text-slate-400"}`}
                  >
                    {comment.trim().length} / 10 min characters
                  </span>
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike? What should others know before buying?"
                  className="w-full h-48 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-base text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-inner"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting || comment.trim().length < 10}
                className={`w-full py-4 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-sm ${
                  submitting || comment.trim().length < 10
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                }`}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <FaPaperPlane
                      size={14}
                      className={
                        comment.trim().length < 10
                          ? "text-slate-400"
                          : "text-white"
                      }
                    />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PostReview;
