import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaRupeeSign,
  FaStar,
  FaShieldAlt,
  FaTruck,
  FaStore,
  FaBoxOpen,
  FaChevronRight,
  FaChevronLeft,
  FaShoppingCart,
  FaCheck,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEdit,
} from "react-icons/fa";
import api from "../../utils/axiosInstance";
import { useUser } from "../../context/userContext";
import BuyerNavbar from "../../components/Navbar/BuyerNavbar";
import SellerNavbar from "../../components/Navbar/SellerNavbar";
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
        productId: product._id, // location.state.productId ban jayega
        productName: product.name, // location.state.productName ban jayega
        productImage: product.images[0], // location.state.productImage ban jayega
      },
    }); // Change this route if your review form page is different
  };

  // Safe values
  const currentImage = product?.images?.[activeImage] || "";
  const hasImages = product?.images?.length > 0;
  const avgRating = product?.rating || 0;
  const totalReviews = product?.numReviews || reviews.length;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center font-black animate-pulse text-black uppercase italic tracking-widest">
        VENDORA PROTOCOL: LOADING PRODUCT...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-2xl font-bold text-red-500">
        Product Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {user?.role === "seller" ? (
        <SellerNavbar user={user} />
      ) : (
        <BuyerNavbar user={user} />
      )}

      <main className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* ==================== BIG IMAGE GALLERY ==================== */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/5] max-h-[650px] rounded-[3.5rem] overflow-hidden border-8 border-white shadow-2xl bg-gray-50 group">
              <img
                src={
                  currentImage || "https://placehold.co/800x800?text=No+Image"
                }
                alt={product.name}
                className="w-full h-full object-contain p-12 transition-transform duration-700 group-hover:scale-105"
              />

              {hasImages && product.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImage((prev) =>
                        prev === 0 ? product.images.length - 1 : prev - 1,
                      )
                    }
                    className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-5 rounded-full shadow-xl transition-all hover:scale-110 z-10"
                  >
                    <FaChevronLeft size={28} />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImage((prev) =>
                        prev === product.images.length - 1 ? 0 : prev + 1,
                      )
                    }
                    className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-5 rounded-full shadow-xl transition-all hover:scale-110 z-10"
                  >
                    <FaChevronRight size={28} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {hasImages && (
              <div className="flex gap-4 mt-8 overflow-x-auto pb-4 no-scrollbar">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all ${
                      activeImage === i
                        ? "border-black scale-105 shadow-lg"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ==================== PRODUCT INFO ==================== */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <span className="bg-black text-white px-5 py-2 rounded-full text-xs font-black tracking-widest">
                  {product.category}
                </span>
                {avgRating > 0 && (
                  <div className="flex items-center gap-2 text-amber-500 font-bold text-lg">
                    <FaStar /> {avgRating.toFixed(1)} • {totalReviews} reviews
                  </div>
                )}
              </div>

              <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none mb-6 text-gray-900">
                {product.name}
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Pricing */}
            <div className="flex items-end gap-12 py-8 border-y border-gray-100">
              <div>
                <p className="text-7xl font-black tracking-tighter text-black flex items-center">
                  <FaRupeeSign className="text-4xl mr-1" />
                  {(product.discountPrice || product.price)?.toLocaleString() ||
                    "0"}
                </p>
                {product.discountPrice > 0 && (
                  <p className="text-2xl text-gray-400 line-through">
                    ₹{product.price?.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="text-emerald-600 font-bold text-xl">
                {product.stock > 0
                  ? `In Stock (${product.stock})`
                  : "Out of Stock"}
              </div>
            </div>

            {/* Specifications */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.3em] font-black text-gray-400 mb-6">
                SPECIFICATIONS
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {product.specifications?.map((spec, i) => (
                  <div
                    key={i}
                    className="bg-white p-8 rounded-3xl border border-gray-100"
                  >
                    <p className="text-xs uppercase text-gray-400 font-bold tracking-widest">
                      {spec.key}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 mt-2">
                      {spec.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Seller Details with Business Address */}
            {product.seller && (
              <div className="bg-[#1A1A1A] text-white p-10 rounded-[3rem] relative overflow-hidden">
                <FaStore className="absolute -right-10 -bottom-10 text-[12rem] opacity-5" />
                <div className="relative z-10">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">
                    DISPATCH FROM
                  </h4>

                  <h2 className="text-3xl font-bold mb-1">
                    {product.seller.name}
                  </h2>

                  {product.seller.businessAddress && (
                    <div className="mt-6 space-y-3 text-sm">
                      <p className="flex items-start gap-3">
                        <FaMapMarkerAlt className="text-blue-400 mt-1" />
                        <span>
                          {product.seller.businessAddress.street},<br />
                          {product.seller.businessAddress.city},{" "}
                          {product.seller.businessAddress.state}
                        </span>
                      </p>
                      <p className="flex items-center gap-3">
                        <FaPhoneAlt className="text-blue-400" />
                        {product.seller.businessAddress.phone}
                      </p>
                      {product.seller.businessAddress.label && (
                        <p className="text-xs uppercase tracking-widest text-gray-400">
                          {product.seller.businessAddress.label}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || isAdded}
                className={`w-full py-8 rounded-[2.75rem] font-black text-xl tracking-widest transition-all duration-500 shadow-2xl ${
                  isAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-black text-white hover:bg-blue-700 hover:-translate-y-1"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isAdded ? "✓ Added to Cart" : "Add to Cart"}
              </button>

              <button
                onClick={handleWriteReview}
                className="w-full py-6 rounded-[2.75rem] border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 font-bold text-lg flex items-center justify-center gap-3 transition-all"
              >
                <FaEdit /> Write a Review
              </button>
            </div>
          </div>
        </div>

        {/* ==================== REVIEWS SECTION (Full Width Cards) ==================== */}
        <div className="mt-24">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">
              Customer Reviews
            </h2>
            <span className="text-gray-500">({totalReviews} reviews)</span>
          </div>

          {/* Full Width Cards */}
          <div className="grid grid-cols-1 gap-8">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white p-8 rounded-3xl border border-gray-100"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={i < review.rating ? "" : "text-gray-200"}
                        />
                      ))}
                    </div>
                    <span className="font-medium">
                      {review.buyer?.name || "Customer"}
                    </span>
                  </div>
                  <p className="italic text-gray-700 leading-relaxed">
                    "{review.comment}"
                  </p>
                  {review.isVerifiedPurchase ? (
                    <p className="text-xs text-emerald-600 mt-4 flex items-center gap-1 font-bold">
                      ✓ Verified Purchase
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-4 italic font-medium">
                      General Community Review
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white p-8 rounded-3xl border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <span className="font-medium">Rahul Sharma</span>
                </div>
                <p className="italic text-gray-700 leading-relaxed">
                  "Excellent quality and fast delivery. The product is exactly
                  as described. Highly recommended!"
                </p>
                <p className="text-xs text-emerald-600 mt-4">
                  ✓ Verified Purchase
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;
