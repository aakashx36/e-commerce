import React, { useState, useEffect } from "react";
import { FaUsers, FaUserTie, FaShoppingBag, FaWallet } from "react-icons/fa";
import api from "../../utils/axiosInstance";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/api/admin/dashboard-stats");
        setData(res.data.stats);
      } catch (err) {
        console.error("Dashboard Stats Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="p-10 font-black animate-pulse">LOADING ANALYTICS...</div>
    );

  return (
    <div className="space-y-8">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col gap-1">
        <h2 className="text-4xl font-black italic tracking-tighter uppercase">
          Marketplace <span className="text-blue-600">Pulse</span>
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
          Real-time Platform Metrics
        </p>
      </div>

      {/* ─── STATS CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatItem
          label="Platform Users"
          value={data?.totalUsers}
          icon={<FaUsers />}
          color="bg-blue-600"
        />
        <StatItem
          label="Verified Sellers"
          value={data?.verifiedSellers}
          icon={<FaUserTie />}
          color="bg-black"
        />
        <StatItem
          label=" Sellers"
          value={data?.activeSellers}
          icon={<FaUserTie />}
          color="bg-black"
        />
        <StatItem
          label="Total Sales (GMV)"
          value={`₹${data?.totalGMV?.toLocaleString()}`}
          icon={<FaShoppingBag />}
          color="bg-emerald-500"
        />
        <StatItem
          label="Our Profit (10%)"
          value={`₹${data?.platformCommission?.toLocaleString()}`}
          icon={<FaWallet />}
          color="bg-orange-500"
        />
      </div>

      {/* ─── NEXT TASK: SELLER APPROVAL PREVIEW ─── */}
      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm mt-10">
        <h3 className="font-black italic uppercase text-lg mb-4">
          Quick Insights
        </h3>
        <p className="text-sm text-gray-500 font-bold">
          Currently, your platform is taking 10% commission on every
          transaction. Total platform earnings are calculated from successful
          payments only.
        </p>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, icon, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group border-b-4 border-b-transparent hover:border-b-blue-600">
    <div className="flex items-center justify-between">
      <div
        className={`${color} text-white p-4 rounded-2xl shadow-lg group-hover:rotate-12 transition-transform`}
      >
        {icon}
      </div>
      <div className="text-right">
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
          {label}
        </p>
        <h4 className="text-2xl font-black italic">{value}</h4>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
