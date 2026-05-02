import React from "react";
import { useNavigate } from "react-router-dom"; // 🔥 Redirection ke liye zaroori
import { FaShoppingBag, FaRupeeSign, FaCheck, FaEye } from "react-icons/fa";

const ProductCard = ({ item, isAdded, onAddToCart }) => {
  const navigate = useNavigate(); // 🔥 Hook initialization

  const noImage =
    "https://placehold.co/600x400/F3F5F4/A1A1A1?text=No+Image+Available";

  // Discount Logic using your Product Model
  const hasDiscount = item.discountPrice > 0 && item.discountPrice < item.price;
  const discountPercent = hasDiscount
    ? Math.round(((item.price - item.discountPrice) / item.price) * 100)
    : 0;

  // 🔥 Helper function for navigation
  const handleProductClick = () => {
    navigate(`/product/${item._id}`);
  };

  return (
    <div className="group bg-white rounded-[3rem] p-5 border border-gray-50 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 relative flex flex-col h-full">
      {/* Category Badge */}
      <div className="absolute top-8 left-8 z-20 bg-white/90 backdrop-blur-md text-blue-600 text-[9px] font-black px-4 py-2 rounded-xl shadow-sm uppercase tracking-widest border border-blue-50">
        {item.category}
      </div>

      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-8 right-8 z-20 bg-red-600 text-white text-[9px] font-black px-4 py-2 rounded-xl shadow-lg uppercase tracking-[0.15em] animate-pulse">
          {discountPercent}% OFF
        </div>
      )}

      {/* 🔥 Clickable Image Section */}
      <div
        onClick={handleProductClick}
        className="aspect-square bg-[#F3F5F4] rounded-[2.5rem] overflow-hidden mb-6 border-4 border-white cursor-pointer relative group/img"
      >
        <img
          src={item.images?.[0] || noImage}
          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-1000 ease-in-out"
          alt={item.name}
        />
        {/* Hover View Overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-full scale-50 group-hover/img:scale-100 transition-all duration-500">
            <FaEye className="text-black" />
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="px-3 flex-1 flex flex-col">
        {/* 🔥 Clickable Title */}
        <h3
          onClick={handleProductClick}
          className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors truncate mb-3 uppercase italic cursor-pointer tracking-tighter"
        >
          {item.name}
        </h3>

        {/* Pricing Layout */}
        <div className="flex items-center gap-4 mt-auto">
          {hasDiscount ? (
            <>
              <p className="text-3xl font-black text-gray-900 tracking-tighter flex items-center italic">
                <FaRupeeSign size={18} className="text-blue-600" />
                {item.discountPrice.toLocaleString()}
              </p>
              <p className="text-sm font-bold text-gray-300 line-through opacity-80 flex items-center">
                ₹{item.price.toLocaleString()}
              </p>
            </>
          ) : (
            <p className="text-3xl font-black text-gray-900 tracking-tighter flex items-center italic">
              <FaRupeeSign size={18} className="text-blue-600" />
              {item.price.toLocaleString()}
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Navigation trigger se bachane ke liye
            onAddToCart(item._id);
          }}
          disabled={item.stock <= 0}
          className={`w-full mt-8 py-5 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all duration-500 ${
            isAdded
              ? "bg-emerald-500 text-white shadow-[0_15px_30px_-5px_rgba(16,185,129,0.4)]"
              : "bg-black text-white hover:bg-blue-600 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:-translate-y-1"
          } disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none`}
        >
          {item.stock <= 0 ? (
            "Archive Sold"
          ) : isAdded ? (
            <>
              <FaCheck size={14} /> In Cart
            </>
          ) : (
            <>
              <FaShoppingBag size={14} /> Add to Bag
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
