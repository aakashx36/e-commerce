import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaRupeeSign,
  FaStar,
  FaStore,
  FaChevronRight,
  FaChevronLeft,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEdit,
  FaArrowLeft,
  FaRegBuilding,
} from "react-icons/fa";
import api from "../../utils/axiosInstance";
import { useUser } from "../../context/userContext";
import toast from "react-hot-toast";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshCartCount } = useUser();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);

        const [productRes, reviewRes] = await Promise.all([
          api.get(`/api/products/${id}`),
          api.get(`/api/reviews/${id}`).catch(() => ({ data: { data: [] } })),
        ]);

        const productData = productRes.data.data || productRes.data;
        setProduct(productData);
        setReviews(reviewRes.data?.data || []);

        if (user) {
          try {
            const cartRes = await api.get("/api/user/cart");
            const cartItems = cartRes.data?.data || cartRes.data || [];
            const inCart = cartItems.some(
              (item) => (item.product?._id || item.product) === id,
            );
            setIsAdded(inCart);
          } catch (e) {}
        }
      } catch (err) {
        toast.error("Failed to load product details");
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, navigate, user]);

  const handleAddToCart = async () => {
    if (!user) return toast.error("Please login to add to cart!");
    if (isAdded) return;

    try {
      await api.post("/api/user/cart", { productId: id, qty: 1 });
      toast.success("Added to your bag! 🛍️");
      await refreshCartCount();
      setIsAdded(true);
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const handleWriteReview = () => {
    if (!user) {
      toast.error("Please login to write a review!");
      return;
    }
    navigate(`/review`, {
      state: {
        productId: product._id,
        productName: product.name,
        productImage: product.images[0],
      },
    });
  };

  const currentImage = product?.images?.[activeImage] || "";
  const hasImages = product?.images?.length > 0;
  const avgRating = product?.rating || 0;
  const totalReviews = product?.numReviews || reviews.length;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 text-center px-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Product Not Found
        </h2>
        <p className="text-slate-500 mb-6">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/products")}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-24">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/products")}
            className="group flex items-center gap-2 text-slate-500 font-medium text-sm hover:text-blue-600 transition-colors w-fit"
          >
            <FaArrowLeft
              size={12}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to All Products
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* ==================== IMAGE GALLERY ==================== */}
          <div className="lg:w-1/2">
            {/* Main Image Container */}
            <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm group flex items-center justify-center">
              <img
                src={
                  currentImage || "https://placehold.co/800x800?text=No+Image"
                }
                alt={product.name}
                className="max-w-full max-h-full w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105 p-4"
              />

              {hasImages && product.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImage((prev) =>
                        prev === 0 ? product.images.length - 1 : prev - 1,
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 text-slate-700 hover:text-blue-600 hover:bg-white p-3 rounded-full shadow-md ring-1 ring-slate-200/50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                  >
                    <FaChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImage((prev) =>
                        prev === product.images.length - 1 ? 0 : prev + 1,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 text-slate-700 hover:text-blue-600 hover:bg-white p-3 rounded-full shadow-md ring-1 ring-slate-200/50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                  >
                    <FaChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {hasImages && product.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2 no-scrollbar">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-white border-2 transition-all flex items-center justify-center ${
                      activeImage === i
                        ? "border-blue-500 shadow-sm"
                        : "border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover mix-blend-multiply"
                      alt={`Thumbnail ${i + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ==================== PRODUCT INFO ==================== */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {product.category}
                </span>
                {avgRating > 0 && (
                  <div className="flex items-center gap-1.5 text-slate-700 text-sm font-medium bg-amber-50 px-3 py-1 rounded-full">
                    <FaStar className="text-amber-500" size={14} />
                    <span>{avgRating.toFixed(1)}</span>
                    <span className="text-slate-400 mx-1">•</span>
                    <span className="text-slate-500">
                      {totalReviews} reviews
                    </span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4 leading-tight">
                {product.name}
              </h1>

              <p className="text-base text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Pricing & Stock */}
            <div className="flex items-end justify-between py-6 border-y border-slate-200 mb-8">
              <div>
                <p className="text-4xl font-bold text-slate-900 flex items-center tracking-tight">
                  <FaRupeeSign className="text-3xl mr-0.5" />
                  {(product.discountPrice || product.price)?.toLocaleString() ||
                    "0"}
                </p>
                {product.discountPrice > 0 && (
                  <p className="text-lg text-slate-400 line-through mt-1 font-medium">
                    ₹{product.price?.toLocaleString()}
                  </p>
                )}
              </div>

              <div
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  product.stock > 0
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {product.stock > 0
                  ? `In Stock (${product.stock})`
                  : "Out of Stock"}
              </div>
            </div>

            {/* Specifications */}
            {product.specifications?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                  Specifications
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {product.specifications.map((spec, i) => (
                    <div
                      key={i}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
                    >
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        {spec.key}
                      </p>
                      <p className="text-base font-medium text-slate-900 line-clamp-1">
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Details */}
            {product.seller && (
              <div className="bg-white border border-slate-200 p-6 rounded-2xl mb-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                    <FaStore size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                      Sold By
                    </h4>
                    <h2 className="text-lg font-bold text-slate-900">
                      {product.seller.name}
                    </h2>
                  </div>
                </div>

                {product.seller.businessAddress && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5 text-sm text-slate-600">
                    <p className="flex items-start gap-3">
                      <FaMapMarkerAlt className="text-slate-400 mt-1 shrink-0" />
                      <span>
                        {product.seller.businessAddress.street},{" "}
                        {product.seller.businessAddress.city},{" "}
                        {product.seller.businessAddress.state}
                      </span>
                    </p>
                    <p className="flex items-center gap-3">
                      <FaPhoneAlt className="text-slate-400 shrink-0" />
                      {product.seller.businessAddress.phone}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons (Pushed to bottom) */}
            <div className="mt-auto space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || isAdded}
                className={`w-full py-4 rounded-xl font-semibold text-base transition-all shadow-sm ${
                  isAdded
                    ? "bg-emerald-600 text-white shadow-emerald-500/20"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isAdded ? "✓ Added to Cart" : "Add to Cart"}
              </button>

              <button
                onClick={handleWriteReview}
                className="w-full py-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:text-blue-600 text-slate-700 font-semibold text-base flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <FaEdit size={16} /> Write a Review
              </button>
            </div>
          </div>
        </div>

        {/* ==================== REVIEWS SECTION ==================== */}
        <div className="mt-20 pt-10 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Customer Reviews
              </h2>
              <p className="text-slate-500 mt-1">
                Based on {totalReviews} reviews
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 uppercase">
                        {(review.buyer?.name || "C")[0]}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          {review.buyer?.name || "Customer"}
                        </span>
                        <div className="flex text-amber-400 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              size={12}
                              className={
                                i < review.rating ? "" : "text-slate-200"
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    "{review.comment}"
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    {review.isVerifiedPurchase ? (
                      <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                        ✓ Verified Purchase
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium">
                        Community Review
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2 text-center py-12">
                <p className="text-slate-500 text-lg">No reviews yet.</p>
                <p className="text-slate-400 text-sm mt-1">
                  Be the first to review this product!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetails;
