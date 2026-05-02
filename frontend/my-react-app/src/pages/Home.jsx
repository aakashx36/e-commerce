import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import {
  FaShoppingBag,
  FaSignOutAlt,
  FaHeart,
  FaArrowRight,
  FaShippingFast,
  FaShieldAlt,
  FaHeadset,
  FaRocket,
  FaFire,
  FaInstagram,
  FaTwitter,
  FaFacebook,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaUser,
} from "react-icons/fa";
import toast from "react-hot-toast";

const Home = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged out from Vendora");
  };

  const handleProtectedAction = (targetPath, category = null) => {
    if (!user) {
      navigate("/");
      return;
    }
    if (category) {
      navigate(`/products?category=${category.toLowerCase()}`);
    } else {
      navigate(targetPath);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] font-sans antialiased overflow-x-hidden">
      {/* ─── NAVBAR (Search Box Removed) ─── */}
      <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-8 py-4 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/home"
            className="text-3xl font-black text-blue-600 italic tracking-tighter"
          >
            VENDORA
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-6">
            {!user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/"
                  className="font-black text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                >
                  Join Free
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <FaHeart
                  className="text-gray-400 hover:text-red-500 cursor-pointer transition-all"
                  size={20}
                />
                <div className="h-6 w-[1px] bg-gray-200"></div>

                {/* Dynamic Profile Image */}
                <Link
                  to="/profile"
                  className="w-11 h-11 bg-[#1A1A1A] border-4 border-gray-50 rounded-2xl flex items-center justify-center text-white font-black text-sm hover:rotate-6 hover:bg-blue-600 transition-all shadow-lg overflow-hidden relative"
                >
                  {user?.imageURL &&
                  user.imageURL !== "None" &&
                  user.imageURL !== "" ? (
                    <img
                      src={user.imageURL}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="uppercase tracking-tighter">
                      {user?.name ? user.name[0] : <FaUser size={14} />}
                    </span>
                  )}
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <FaSignOutAlt size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-12 lg:pb-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <div className="flex items-center gap-2 bg-orange-50 text-orange-600 w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
            <FaFire className="animate-bounce" /> New Collection 2026
          </div>
          <h1 className="text-6xl lg:text-[90px] font-black leading-[0.9] tracking-tighter">
            Style <br /> Without <span className="text-blue-600">Limits.</span>
          </h1>
          <p className="text-gray-500 text-lg font-medium max-w-md opacity-80 leading-relaxed">
            From high-tech electronics to the latest fashion trends. Discover
            everything in one place.
          </p>
          <button
            onClick={() => handleProtectedAction("/products")}
            className="bg-[#1A1A1A] text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-blue-100 active:scale-95"
          >
            Shop Now <FaArrowRight />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[3rem] overflow-hidden h-[450px] shadow-2xl border-8 border-white">
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800"
              className="w-full h-full object-cover"
              alt="Sneakers"
            />
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div
              className="rounded-[2.5rem] overflow-hidden h-[220px] shadow-xl border-4 border-white cursor-pointer group"
              onClick={() => handleProtectedAction("/products", "fashion")}
            >
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt="Fashion"
              />
            </div>
            <div className="bg-blue-600 rounded-[2.5rem] p-8 h-[220px] text-white flex flex-col justify-end shadow-xl">
              <FaRocket size={20} className="mb-4 text-blue-200" />
              <h3 className="text-xl font-black leading-none uppercase italic tracking-tighter">
                Express <br /> Delivery
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORY GRID ─── */}
      <section className="max-w-[1400px] mx-auto px-6 pt-0 pb-20">
        <div className="mb-12">
          <h2 className="text-5xl font-black tracking-tighter">
            Top Categories
          </h2>
          <div className="w-16 h-1.5 bg-blue-600 rounded-full mt-2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BigCategoryCard
            onClick={() => handleProtectedAction("/products", "fashion")}
            title="Fashion Trends"
            desc="Latest apparel and luxury streetwear collection"
            img="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800"
            color="bg-rose-50"
          />
          <BigCategoryCard
            onClick={() => handleProtectedAction("/products", "electronics")}
            title="Modern Electronics"
            desc="Top tier gadgets, audio, and smart devices"
            img="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800"
            color="bg-indigo-50"
          />
        </div>
      </section>

      {/* ─── PROFESSIONAL BLACK FOOTER ─── */}
      <footer className="bg-[#111111] text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-3xl font-black italic tracking-tighter text-blue-500">
              VENDORA
            </h3>
            <p className="text-gray-400 font-medium leading-relaxed">
              The ultimate marketplace for fashion, tech, and lifestyle. Delhi's
              favorite hub for premium style.
            </p>
          </div>
          <div>
            <h4 className="font-black text-sm mb-6 uppercase tracking-widest text-gray-300">
              Quick Links
            </h4>
            <ul className="space-y-3 text-gray-500 font-bold text-sm">
              <li
                className="hover:text-white cursor-pointer transition-all"
                onClick={() => handleProtectedAction("/products", "fashion")}
              >
                Fashion
              </li>
              <li
                className="hover:text-white cursor-pointer transition-all"
                onClick={() =>
                  handleProtectedAction("/products", "electronics")
                }
              >
                Electronics
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-sm mb-6 uppercase tracking-widest text-gray-300">
              Contact
            </h4>
            <ul className="space-y-4 text-gray-500 font-bold text-sm">
              <li className="flex items-center gap-3">
                <FaEnvelope size={14} className="text-blue-500" />{" "}
                support@vendora.com
              </li>
              <li className="flex items-center gap-3">
                <FaMapMarkerAlt size={14} className="text-blue-500" /> Delhi,
                India
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-sm mb-6 uppercase tracking-widest text-gray-300">
              Stay Updated
            </h4>
            <div className="flex bg-[#1A1A1A] p-2 rounded-xl border border-gray-800">
              <input
                type="email"
                placeholder="Email"
                className="bg-transparent border-none focus:ring-0 w-full text-white text-xs font-bold"
              />
              <button className="bg-blue-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="text-center border-t border-gray-900 pt-8 text-[10px] font-black text-gray-600 uppercase tracking-widest">
          © 2026 VENDORA MARKETPLACE. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
};

// Sub-components
const BigCategoryCard = ({ title, desc, img, color, onClick }) => (
  <div
    onClick={onClick}
    className={`${color} rounded-[3.5rem] p-10 flex flex-col md:flex-row justify-between items-center group border border-transparent hover:border-white hover:shadow-2xl transition-all duration-700 cursor-pointer`}
  >
    <div className="mb-6 md:mb-0 md:w-1/2 space-y-4">
      <h3 className="text-4xl font-black text-gray-900 leading-tight">
        {title}
      </h3>
      <p className="text-gray-500 font-bold text-sm leading-relaxed">{desc}</p>
      <button className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-blue-600 group-hover:gap-4 transition-all">
        Discover Now <FaArrowRight />
      </button>
    </div>
    <div className="md:w-1/2 flex justify-center">
      <img
        src={img}
        className="w-60 h-60 object-cover rounded-[2.5rem] shadow-xl group-hover:scale-105 transition-transform duration-700"
        alt={title}
      />
    </div>
  </div>
);

export default Home;
