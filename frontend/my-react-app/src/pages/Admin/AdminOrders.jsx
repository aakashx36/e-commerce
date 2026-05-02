import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance";
import {
  FaArrowRight,
  FaTruck,
  FaCheckCircle,
  FaSearch,
  FaBox,
  FaClock,
  FaHistory,
  FaShippingFast,
  FaCube,
  FaShieldAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";

const AllOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const statusFlow = ["Processing", "Shipped", "Out for Delivery", "Delivered"];

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/orders/"); // Endpoint as per your route setup
      const activeData = (res.data.orders || []).filter(
        (o) => o.paymentStatus === "paid" && o.deliveryStatus !== "None",
      );
      setOrders(activeData);
    } catch (err) {
      toast.error("Logistics Database Offline");
    } finally {
      setLoading(false);
    }
  };

  const promoteStatus = async (id, currentStatus) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return;
    const nextStatus = statusFlow[currentIndex + 1];

    try {
      await api.patch(`/api/orders/admin/status/${id}`, { status: nextStatus }); // Updated as per your admin controller
      toast.success(`Protocol Advanced: ${nextStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error("Transition Protocol Failed");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter(
    (o) =>
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.buyer?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const processingOrders = filtered.filter(
    (o) => o.deliveryStatus === "Processing",
  );
  const shippedOrders = filtered.filter((o) => o.deliveryStatus === "Shipped");
  const outForDeliveryOrders = filtered.filter(
    (o) => o.deliveryStatus === "Out for Delivery",
  );
  const fulfilledOrders = filtered.filter(
    (o) => o.deliveryStatus === "Delivered",
  );

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-blue-600 uppercase tracking-[0.3em] animate-pulse">
            Syncing Global Logistics...
          </p>
        </div>
      </div>
    );

  const renderOrderBlock = (order, isFulfilled) => {
    const nextStep = statusFlow[statusFlow.indexOf(order.deliveryStatus) + 1];

    return (
      <div
        key={order._id}
        className={`w-full group bg-white rounded-[2.5rem] border border-gray-100 p-8 xl:p-10 flex flex-col xl:flex-row justify-between items-center gap-10 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-blue-200 relative overflow-hidden`}
      >
        {/* Progress Background Overlay */}
        <div
          className={`absolute top-0 left-0 w-1.5 h-full ${isFulfilled ? "bg-emerald-500" : "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]"}`}
        ></div>

        <div className="flex-1 space-y-6 w-full">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="px-5 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-tighter">
              ID: {String(order._id).slice(-12).toUpperCase()}
            </span>
            <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase">
              <FaClock />{" "}
              {new Date(order.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
            <span
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${order.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
            >
              <FaShieldAlt size={10} /> Secure {order.paymentStatus}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-gray-900 group-hover:text-blue-600 transition-colors">
              {order.buyer?.name}
            </h3>
            <p
              className={`text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${isFulfilled ? "text-emerald-500" : "text-blue-600"}`}
            >
              <span
                className={`w-2 h-2 rounded-full animate-ping ${isFulfilled ? "bg-emerald-500" : "bg-blue-600"}`}
              ></span>
              Stage: {order.deliveryStatus}
            </p>
          </div>

          {/* Item Snapshots */}
          <div className="flex flex-wrap gap-3">
            {order.orderItems?.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-gray-50/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-gray-100 hover:bg-white transition-colors group/item"
              >
                <img
                  src={item.image}
                  className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover/item:scale-110 transition-transform"
                  alt=""
                />
                <div className="max-w-[120px]">
                  <p className="text-[10px] font-black uppercase text-gray-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-[9px] font-bold text-blue-500">
                    UNIT: {item.qty}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Center */}
        <div className="flex flex-col md:flex-row items-center gap-10 w-full xl:w-auto shrink-0 border-t xl:border-t-0 xl:border-l border-gray-50 pt-8 xl:pt-0 xl:pl-10">
          <div className="text-center md:text-right space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Global Valuation
            </p>
            <p className="text-4xl font-black italic text-gray-900">
              ₹{order.totalAmount.toLocaleString()}
            </p>
          </div>

          <div className="flex flex-col gap-3 min-w-[280px] w-full">
            {!isFulfilled ? (
              <button
                onClick={() => promoteStatus(order._id, order.deliveryStatus)}
                className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] hover:bg-blue-600 hover:shadow-[0_15px_30px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                Promote to {nextStep}{" "}
                <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
            ) : (
              <div className="w-full py-5 bg-emerald-500 text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-[0_10px_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-3">
                <FaCheckCircle /> Fulfillment Verified
              </div>
            )}
            <button
              onClick={() => navigate(`/admin/user/${order.buyer?._id}`)}
              className="w-full py-4 bg-white border border-gray-200 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest text-gray-500 hover:text-black hover:border-black transition-all shadow-sm"
            >
              Access Buyer Intelligence
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (title, items, icon, colorClass, bgColor) => {
    if (items.length === 0) return null;
    return (
      <section className="space-y-8 pt-10">
        <div className={`flex items-center gap-6 ${colorClass}`}>
          <div className={`p-4 rounded-2xl ${bgColor} shadow-sm`}>{icon}</div>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">
              {title}
            </h2>
            <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.3em] mt-1">
              Pending Authorization: {items.length}
            </p>
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {items.map((o) =>
            renderOrderBlock(o, o.deliveryStatus === "Delivered"),
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#fafafa] pb-32 animate-in fade-in duration-700 max-w-[1800px] mx-auto px-6 lg:px-12 overflow-hidden">
      {/* PROFESSIONAL HEADER */}
      <header className="w-full flex flex-col xl:flex-row justify-between items-center bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] gap-10 sticky top-4 z-40 mt-6">
        <div className="space-y-1">
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">
            Logistics <span className="text-blue-600">Terminal</span>
          </h1>
          <p className="text-[11px] font-black uppercase text-gray-400 tracking-[0.5em] ml-1">
            Marketplace Governance Engine
          </p>
        </div>
        <div className="relative w-full xl:w-[600px] group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
            <FaSearch size={18} />
          </div>
          <input
            type="text"
            placeholder="Search Protocol Stream (ID, Buyer)..."
            className="w-full pl-16 pr-8 py-6 bg-gray-50 border border-transparent rounded-[2rem] font-black text-[12px] uppercase outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all shadow-inner"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* STREAMS */}
      <div className="space-y-16 mt-12">
        {renderSection(
          "Processing Pipeline",
          processingOrders,
          <FaCube size={22} />,
          "text-blue-600",
          "bg-blue-50",
        )}
        {renderSection(
          "Transit Stream",
          shippedOrders,
          <FaTruck size={22} />,
          "text-amber-600",
          "bg-amber-50",
        )}
        {renderSection(
          "Hyper-Local Delivery",
          outForDeliveryOrders,
          <FaShippingFast size={22} />,
          "text-purple-600",
          "bg-purple-50",
        )}
        {renderSection(
          "Fulfillment Archive",
          fulfilledOrders,
          <FaHistory size={22} />,
          "text-emerald-600",
          "bg-emerald-50",
        )}
      </div>

      {/* EMPTY STATE */}
      {filtered.length === 0 && (
        <div className="w-full py-40 text-center flex flex-col items-center justify-center opacity-30">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <FaBox size={40} className="text-gray-400" />
          </div>
          <p className="font-black text-2xl uppercase tracking-[0.4em]">
            Zero Intel Discrepancy
          </p>
        </div>
      )}
    </div>
  );
};

export default AllOrders;
