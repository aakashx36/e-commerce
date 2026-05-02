import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaChartLine,
  FaBox,
  FaClipboardList,
  FaExclamationTriangle,
  FaPlus,
  FaArrowRight,
  FaRupeeSign,
  FaWallet,
  FaLock,
  FaSync,
} from "react-icons/fa";
import api from "../../utils/axiosInstance";
import { useUser } from "../../context/userContext";
import toast from "react-hot-toast";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const [stats, setStats] = useState({
    orderCount: 0,
    inventoryCount: 0,
    activeComplaints: 0,
    recentSales: [],
  });
  const [loading, setLoading] = useState(true);

  // --- STEADY SYNC LOGIC ---
  const syncDashboardData = async () => {
    try {
      setLoading(true);

      const profileRes = await api.get("/api/user/profile");
      const updatedUser = profileRes.data;
      setUser(updatedUser);

      const [salesRes, inventoryRes, complaintsRes] = await Promise.all([
        api.get("/api/orders/seller-sales"),
        api.get("/api/products/seller/inventory"),
        api.get("/api/complaints/my"),
      ]);

      const salesData = salesRes.data.data || [];
      const inventoryData = inventoryRes.data.products || [];
      const complaintsData = complaintsRes.data.data || [];

      setStats({
        orderCount: salesData.length,
        inventoryCount: inventoryData.length,
        activeComplaints: complaintsData.filter((c) => c.status === "pending")
          .length,
        recentSales: salesData.slice(0, 5),
      });
    } catch (err) {
      console.error("Sync Error:", err.response?.data || err.message);
      toast.error(`Sync Failed: Data Connectivity Issue`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      syncDashboardData();
    }
  }, []);

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center font-medium text-blue-600 bg-gray-50 tracking-wider">
        <FaSync className="animate-spin mb-4 text-4xl" />
        <p>Syncing Terminal...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20 px-6 lg:px-10 font-sans">
      <div className="max-w-[1500px] mx-auto">
        {/* Header Section */}
        <header className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              Seller Command Center
            </h1>
            <p className="text-sm font-medium text-gray-500 tracking-wide uppercase">
              Terminal ID:{" "}
              <span className="font-semibold text-gray-700">
                {user?._id?.slice(-8).toUpperCase()}
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Locked Balance */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 flex items-center gap-5 shadow-sm min-w-[240px]">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                <FaLock size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  In-Transit Funds
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{user?.sellerFinance?.lockedBalance?.toLocaleString() || 0}
                </p>
              </div>
            </div>

            {/* Available Balance */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg flex items-center gap-5 min-w-[240px]">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <FaWallet size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider mb-1">
                  Available Payout
                </p>
                <p className="text-2xl font-bold">
                  ₹
                  {user?.sellerFinance?.availableBalance?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Global KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <KPICard
            title="Net Revenue"
            value={`₹${((user?.sellerFinance?.availableBalance || 0) + (user?.sellerFinance?.lockedBalance || 0)).toLocaleString()}`}
            icon={<FaChartLine />}
            color="blue"
          />
          <KPICard
            title="Total Orders"
            value={stats.orderCount}
            icon={<FaClipboardList />}
            color="emerald"
          />
          <KPICard
            title="Active Products"
            value={stats.inventoryCount}
            icon={<FaBox />}
            color="indigo"
          />
          <KPICard
            title="Open Disputes"
            value={stats.activeComplaints}
            icon={<FaExclamationTriangle />}
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity Table (Takes up 2 columns on large screens) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-lg text-gray-900">
                Recent Transactions
              </h3>
              <button
                onClick={() => navigate("/seller/orders")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View All
              </button>
            </div>
            <div className="p-6">
              {stats.recentSales.length === 0 ? (
                <div className="py-16 text-center text-gray-400 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  No recent sales activity found.
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentSales.map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-600">
                          <FaRupeeSign size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-xs font-medium text-gray-500 mt-0.5">
                            {order.paymentStatus === "paid"
                              ? "Paid via Razorpay"
                              : "Payment Pending"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          ₹{order.totalAmount.toLocaleString()}
                        </p>
                        <span
                          className={`inline-block mt-1 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                            order.deliveryStatus === "delivered"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.deliveryStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Operations */}
          <div className="space-y-6">
            {/* Deploy Product Card */}
            <div
              className="bg-gradient-to-br from-gray-900 to-black text-white p-8 rounded-3xl shadow-xl relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all"
              onClick={() => navigate("/seller/add-product")}
            >
              <div className="relative z-10">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  Catalog Expansion
                </p>
                <h3 className="text-3xl font-bold mb-8">
                  Add New <br /> Product
                </h3>
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <FaPlus size={20} />
                </div>
              </div>
              <FaBox className="absolute -right-8 -bottom-8 text-[10rem] text-white opacity-5 group-hover:rotate-12 transition-transform duration-700" />
            </div>

            {/* Inventory Vault Card */}
            <div
              className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm group cursor-pointer hover:border-blue-500 hover:shadow-md transition-all flex justify-between items-center"
              onClick={() => navigate("/seller/inventory")}
            >
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500 tracking-widest mb-1">
                  Vault Management
                </p>
                <h3 className="text-xl font-bold text-gray-900">
                  Manage Inventory
                </h3>
              </div>
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FaArrowRight size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon, color }) => {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    indigo: "bg-indigo-50 text-indigo-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colorStyles[color]}`}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default SellerDashboard;
