// AdminLayout.jsx (Updated for Fixed Sidebar)
import React, { memo } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  FaChartLine,
  FaShoppingBag,
  FaUsers,
  FaStar,
  FaSignOutAlt,
  FaShieldAlt,
} from "react-icons/fa";
import { useUser } from "../../context/userContext";

const AdminLayout = () => {
  const { user, logout } = useUser();
  const location = useLocation();

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: FaChartLine },
    { path: "/admin/users", label: "Manage Users", icon: FaUsers },
    { path: "/admin/orders", label: "All Orders", icon: FaShoppingBag },
    { path: "/admin/complaints", label: "Complaints", icon: FaStar },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen bg-[#FDFDFD] flex overflow-hidden">
      {/* SIDEBAR - Fixed Position */}
      <div className="w-72 bg-white border-r border-gray-100 shadow-xl flex flex-col h-full sticky top-0">
        <div className="px-8 py-8 border-b border-gray-100">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <FaShieldAlt className="text-white" size={20} />
            </div>
            <span className="font-black text-2xl tracking-tighter text-gray-900">
              ADMIN<span className="text-blue-600">.</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                  isActive(item.path)
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-100 mt-auto">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full text-red-600 hover:bg-red-50 px-6 py-4 rounded-2xl transition-colors font-black uppercase text-sm tracking-widest"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* MAIN AREA - Scrollable */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-100 px-10 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <FaShieldAlt className="text-blue-600" size={22} />
            <span className="font-black text-xl tracking-tighter text-gray-900">
              Admin Control Center
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">
              System Active
            </span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
        </header>

        {/* Content goes here */}
        <main className="p-10 bg-[#FDFDFD]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
