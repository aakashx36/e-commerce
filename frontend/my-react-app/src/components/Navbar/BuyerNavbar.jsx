import React, { memo } from "react";
import { Link } from "react-router-dom";
import {
  FaShoppingBag,
  FaHistory,
  FaUser,
  FaHome,
  FaArrowLeft,
} from "react-icons/fa";
import { useUser } from "../../context/userContext";

const BuyerNavbarComponent = ({ isSeller, onSwitch }) => {
  const { user, cartCount } = useUser();

  const hasValidImage =
    user?.imageURL &&
    user.imageURL !== "None" &&
    user.imageURL.trim() !== "" &&
    !user.imageURL.toLowerCase().includes("null");

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-10 py-5 shadow-sm">
      <div className="max-w-[1500px] mx-auto flex items-center justify-between">
        <div className="flex-shrink-0 flex items-center gap-6">
          <Link
            to="/home"
            className="text-3xl font-black text-blue-600 italic tracking-tighter"
          >
            VENDORA
          </Link>

          {/* Switch Button for Sellers */}
          {isSeller && (
            <button
              onClick={onSwitch}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-black transition-all group shadow-lg shadow-blue-100"
            >
              <FaArrowLeft
                size={10}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span className="text-[9px] font-black uppercase tracking-tighter">
                Back to Seller Panel
              </span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-8">
          <Link
            to="/home"
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <FaHome size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">
              Home
            </span>
          </Link>

          <Link
            to="/orders"
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <FaHistory size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">
              Orders
            </span>
          </Link>

          <Link to="/cart" className="relative group">
            <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-blue-50 transition-all">
              <FaShoppingBag
                className="text-gray-900 group-hover:text-blue-600"
                size={18}
              />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </div>
          </Link>

          <Link
            to="/profile"
            className="flex items-center gap-3 group pl-3 border-l border-gray-100"
          >
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black uppercase text-gray-400 leading-none mb-1 tracking-tighter">
                Verified User
              </p>
              <p className="text-xs font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                {user?.name ? user.name.split(" ")[0] : "Account"}
              </p>
            </div>
            <div className="w-11 h-11 bg-[#1A1A1A] border-4 border-gray-50 rounded-2xl flex items-center justify-center text-white font-black text-sm hover:rotate-6 hover:bg-blue-600 transition-all shadow-lg overflow-hidden relative">
              {hasValidImage ? (
                <img
                  src={user.imageURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl">
                  {user?.name ? (
                    user.name[0].toUpperCase()
                  ) : (
                    <FaUser size={16} />
                  )}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

const BuyerNavbar = memo(BuyerNavbarComponent);
export default BuyerNavbar;
