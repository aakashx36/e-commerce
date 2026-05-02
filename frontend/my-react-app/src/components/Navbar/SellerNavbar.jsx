import React, { memo } from "react";
import { Link } from "react-router-dom";
import {
  FaBoxOpen,
  FaExclamationTriangle,
  FaExchangeAlt,
  FaPlusSquare,
  FaChartLine,
  FaUser, // ← Added for fallback
} from "react-icons/fa";
import { useUser } from "../../context/userContext";

const SellerNavbarComponent = ({ onSwitch }) => {
  const { user } = useUser();

  // Same image validation logic as BuyerNavbar
  const hasValidImage =
    user?.imageURL &&
    user.imageURL !== "None" &&
    user.imageURL.trim() !== "" &&
    !user.imageURL.toLowerCase().includes("null");

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-10 py-5 shadow-sm">
      <div className="max-w-[1500px] mx-auto flex items-center justify-between">
        <div className="flex-shrink-0 flex items-center gap-4">
          <Link
            to="/seller/dashboard"
            className="text-3xl font-black text-blue-600 italic tracking-tighter"
          >
            VENDORA{" "}
            <span className="text-[10px] bg-blue-600 px-2 py-1 rounded not-italic ml-2 text-white uppercase tracking-widest">
              Seller
            </span>
          </Link>

          {/* Mode Switcher Button */}
          <button
            onClick={onSwitch}
            className="flex items-center gap-2 bg-gray-100 hover:bg-black hover:text-white px-4 py-2 rounded-xl transition-all group"
          >
            <FaExchangeAlt
              size={12}
              className="text-blue-600 group-hover:text-white transition-colors"
            />
            <span className="text-[9px] font-black uppercase tracking-tighter">
              Switch to Buying
            </span>
          </button>
        </div>

        {/* Essential Seller Labels */}
        <div className="flex items-center gap-8">
          <Link
            to="/seller/dashboard"
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <FaChartLine size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">
              Dashboard
            </span>
          </Link>

          <Link
            to="/seller/inventory"
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <FaBoxOpen size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">
              Inventory
            </span>
          </Link>

          <Link
            to="/seller/add-product"
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <FaPlusSquare size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">
              Add Product
            </span>
          </Link>

          {/* Profile Section - Now with Image Support (Same as BuyerNavbar) */}
          <div className="pl-6 border-l border-gray-100 flex items-center gap-3">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">
              {user?.name ? user.name.split(" ")[0] : "Seller"}
            </p>

            {/* Improved Profile Image / Initial Box */}
            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center text-white font-black text-sm hover:bg-blue-600 hover:rotate-6 transition-all shadow-md overflow-hidden border-2 border-gray-100 relative">
              {hasValidImage ? (
                <img
                  src={user.imageURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg">
                  {user?.name ? user.name[0].toUpperCase() : "S"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const SellerNavbar = memo(SellerNavbarComponent);
export default SellerNavbar;
