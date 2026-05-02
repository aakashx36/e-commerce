import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  FaArrowLeft,
  FaChartLine,
  FaShoppingCart,
  FaStore,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaTruck,
  FaWallet,
  FaCheckCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState("buyer");
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const userRes = await api.get("/api/admin/users");
      const foundUser = userRes.data.users.find((u) => u._id === userId);
      if (!foundUser) throw new Error("User not found");
      setUser(foundUser);

      const defaultMode = foundUser.role === "seller" ? "seller" : "buyer";
      setViewMode(defaultMode);
      await loadDataForMode(defaultMode);
    } catch (err) {
      toast.error("Terminal Synchronization Failed");
    } finally {
      setLoading(false);
    }
  };

  const loadDataForMode = async (mode) => {
    try {
      const historyRes = await api.get(
        mode === "seller"
          ? `/api/admin/seller-history/${userId}`
          : `/api/admin/buyer-history/${userId}`,
      );
      setStats(
        mode === "seller"
          ? historyRes.data.salesHistory
          : historyRes.data.orders,
      );

      const chartRes = await api.get(
        mode === "seller"
          ? `/api/admin/seller-sales/${userId}`
          : `/api/admin/buyer-spending/${userId}`,
      );

      const rawData =
        mode === "seller"
          ? chartRes.data.salesStats
          : chartRes.data.spendingData;
      const formattedData = (rawData || []).map((item) => ({
        month: months[item._id - 1],
        amount: (item.totalSales || item.totalAmount || 0) / 1000,
        raw: item.totalSales || item.totalAmount || 0,
      }));
      setChartData(formattedData);

      if (mode === "buyer") {
        const compRes = await api.get("/api/complaints");
        setComplaints(
          compRes.data.data?.filter((c) => c.buyer?._id === userId) || [],
        );
      }
    } catch (err) {
      console.error("Critical Load Error", err);
    }
  };

  const handleModeSwitch = (mode) => {
    if (mode === viewMode) return;
    setViewMode(mode);
    setStats([]);
    setChartData([]);
    loadDataForMode(mode);
  };

  if (loading && !user)
    return (
      <div className="h-screen flex items-center justify-center font-black animate-pulse text-blue-600 uppercase tracking-widest">
        Accessing Intelligence...
      </div>
    );

  return (
    // 67% Zoom Feel ke liye humne scale and width ko adjust kiya hai
    <div className="w-full mx-auto space-y-6 pb-20 animate-in fade-in duration-700 max-w-[1800px]">
      {/* ─── HEADER BLOCK (Full Width) ─── */}
      <div className="w-full bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate(-1)}
            className="p-4 bg-gray-900 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">
              User <span className="text-blue-600">Intelligence</span>
            </h1>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2 text-wrap truncate max-w-xs">
              Node: {userId}
            </p>
          </div>
        </div>

        {user?.role === "seller" && (
          <div className="flex bg-gray-100 p-1.5 rounded-2xl border shadow-inner">
            <button
              onClick={() => handleModeSwitch("buyer")}
              className={`px-8 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${viewMode === "buyer" ? "bg-white text-black shadow-md" : "text-gray-400"}`}
            >
              Buyer Pulse
            </button>
            <button
              onClick={() => handleModeSwitch("seller")}
              className={`px-8 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all ${viewMode === "seller" ? "bg-blue-600 text-white shadow-md" : "text-gray-400"}`}
            >
              Seller Pulse
            </button>
          </div>
        )}
      </div>

      {/* ─── IDENTITY BLOCK (Full Width) ─── */}
      <div className="w-full bg-white p-6 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col xl:flex-row items-center gap-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600 opacity-20"></div>
        <div className="w-28 h-28 md:w-40 md:h-40 bg-gray-50 rounded-[2.5rem] flex-shrink-0 flex items-center justify-center border-4 border-white shadow-xl relative z-10">
          {user?.imageURL !== "None" ? (
            <img
              src={user.imageURL}
              className="w-full h-full object-cover rounded-[2.2rem]"
              alt=""
            />
          ) : (
            <span className="text-5xl font-black italic text-blue-600">
              {user?.name[0]}
            </span>
          )}
        </div>
        <div className="flex-1 text-center xl:text-left space-y-3">
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">
            {user?.name}
          </h2>
          <p className="text-gray-400 font-bold text-base truncate">
            {user?.email}
          </p>
          <div className="flex flex-wrap justify-center xl:justify-start gap-3 mt-4">
            <span className="px-5 py-2 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
              {user?.role}
            </span>
            <span
              className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${user?.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"}`}
            >
              {user?.status}
            </span>
          </div>
        </div>
        <div className="bg-black p-8 rounded-[2rem] w-full xl:w-[350px] text-white shadow-2xl">
          <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500 mb-3">
            Location HQ
          </h4>
          <div className="text-xs font-bold leading-relaxed max-h-20 overflow-y-auto custom-scrollbar">
            {viewMode === "seller" ? (
              <p>
                {user?.businessAddress
                  ? `${user.businessAddress.street}, ${user.businessAddress.city}`
                  : "Unmapped"}
              </p>
            ) : (
              <p>
                {user?.savedAddresses?.[0]
                  ? `${user.savedAddresses[0].street}, ${user.savedAddresses[0].city}`
                  : "No Terminal"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── FINANCE STRIP (Full Width) ─── */}
      <div className="w-full bg-gray-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
        <FaWallet className="absolute -right-6 -bottom-6 text-[10rem] opacity-5 transition-all duration-1000" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-blue-400 mb-2">
              Platform Volume
            </p>
            <h4 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none">
              ₹
              {stats
                ?.reduce(
                  (acc, i) => acc + (i.totalForSeller || i.totalAmount || 0),
                  0,
                )
                .toLocaleString()}
            </h4>
          </div>
          <div className="flex gap-10 border-l border-white/10 pl-10">
            <div className="text-center">
              <p className="text-[9px] font-black uppercase text-gray-500">
                Logs
              </p>
              <p className="text-2xl font-black italic">{stats?.length}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black uppercase text-gray-500">
                Node Status
              </p>
              <p className="text-2xl font-black italic text-emerald-500 flex items-center gap-1">
                <FaCheckCircle size={18} /> LIVE
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CHART BLOCK (Full Width) ─── */}
      <div className="w-full bg-white p-6 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm h-[450px]">
        <h3 className="text-lg font-black italic uppercase tracking-widest text-gray-900 mb-8 flex items-center gap-3">
          <FaChartLine className="text-blue-600" />{" "}
          {viewMode === "seller"
            ? "Revenue Index (₹k)"
            : "Spending Velocity (₹k)"}
        </h3>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 900, fill: "#9ca3af" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 900, fill: "#9ca3af" }}
              tickFormatter={(v) => `₹${v}k`}
            />
            <Tooltip
              cursor={{ fill: "#f9fafb" }}
              content={({ active, payload }) =>
                active &&
                payload && (
                  <div className="bg-gray-900 text-white p-4 rounded-xl shadow-2xl border border-gray-700">
                    <p className="text-base font-black italic text-blue-400">
                      ₹{payload[0].payload.raw.toLocaleString()}
                    </p>
                  </div>
                )
              }
            />
            <Bar dataKey="amount" radius={[12, 12, 0, 0]} barSize={50}>
              {chartData.map((e, i) => (
                <Cell
                  key={i}
                  fill={viewMode === "seller" ? "#2563eb" : "#000000"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ─── DATA STREAM / ORDERS (Full Width) ─── */}
      <div className="w-full bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
        <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-black italic uppercase flex items-center gap-3">
            {viewMode === "seller" ? (
              <FaStore className="text-blue-600" />
            ) : (
              <FaShoppingCart className="text-blue-600" />
            )}
            Data Stream{" "}
            <span className="text-blue-600 text-[10px] font-black border-l pl-3 ml-3 border-gray-300">
              SECURE TERMINAL
            </span>
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
          {stats?.length > 0 ? (
            stats.map((order, idx) => (
              <div
                key={idx}
                className="w-full bg-white border border-gray-100 rounded-[2rem] p-8 hover:shadow-xl transition-all group"
              >
                <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-8 gap-5">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black italic text-sm">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="font-black uppercase text-[11px] tracking-widest text-gray-400 truncate max-w-[200px]">
                        Ref: ...{String(order._id).slice(-8)}
                      </h4>
                      <p className="text-[10px] font-black text-gray-900 mt-1">
                        {new Date(order.createdAt).toUTCString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-6 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-sm ${order.deliveryStatus === "Delivered" ? "bg-emerald-500 text-white" : "bg-blue-600 text-white"}`}
                  >
                    <FaTruck className="inline mr-2" />{" "}
                    {order.deliveryStatus || "Processing"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
                  {(viewMode === "seller"
                    ? order.items || order.orderItems
                    : order.orderItems
                  ).map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-transparent group-hover:border-blue-100 transition-all"
                    >
                      <img
                        src={item.image}
                        className="w-16 h-16 rounded-xl object-cover shadow-sm"
                        alt=""
                      />
                      <div className="flex-1 overflow-hidden">
                        <p className="font-black text-[10px] uppercase truncate text-gray-900">
                          {item.name}
                        </p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mt-1">
                          {item.qty} Unit(s) × ₹{item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-50 flex justify-between items-end mt-8">
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-1">
                    <FaCheckCircle /> SECURE ENTRY
                  </p>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase">
                      Valuation
                    </p>
                    <p className="text-3xl font-black italic tracking-tighter leading-none">
                      ₹
                      {(
                        order.totalForSeller || order.totalAmount
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center opacity-30 italic text-sm font-black uppercase tracking-widest">
              No terminal data
            </div>
          )}
        </div>
      </div>

      {/* ─── COMPLAINTS BLOCK (Poori Width Fix) ─── */}
      {viewMode === "buyer" && complaints?.length > 0 && (
        <div className="w-full bg-white p-8 md:p-12 rounded-[2.5rem] border-4 border-red-50 shadow-sm space-y-10">
          <h3 className="text-2xl font-black italic uppercase flex items-center gap-4 text-red-500 leading-none">
            <FaExclamationTriangle /> Grievance Logs ({complaints.length})
          </h3>
          {/* Grid ko w-full kiya taaki poori width le */}
          <div className="w-full flex flex-col gap-6">
            {complaints.map((c) => (
              <div
                key={c._id}
                className="w-full bg-red-50 border border-red-100 rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-red-500 hover:text-white transition-all group"
              >
                <div className="flex-1 space-y-2">
                  <h4 className="font-black uppercase text-base tracking-tight leading-none">
                    {c.subject}
                  </h4>
                  <p className="text-xs font-bold opacity-70 leading-relaxed max-w-4xl">
                    {c.message}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3 mt-4 md:mt-0 min-w-[150px]">
                  <span className="text-[9px] font-black uppercase bg-white/20 px-5 py-2 rounded-full shadow-sm">
                    {c.status}
                  </span>
                  <span className="text-[9px] font-black opacity-40 group-hover:opacity-100 uppercase tracking-widest">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
