import React, { useState, useEffect } from "react";
import api from "../../utils/axiosInstance";
import {
  FaRupeeSign,
  FaBox,
  FaCreditCard,
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        const { data } = await api.get("/api/orders/seller-sales");
        setOrders(data.data || []);
      } catch (err) {
        console.error("Orders load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSellerOrders();
  }, []);

  // Frontend-only calculations (no backend changes)
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0,
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Shipped":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-3xl shadow-sm">
            <div className="w-5 h-5 border-4 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
            <p className="font-black uppercase tracking-widest text-sm text-gray-500">
              Loading Sales Ledger...
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Professional Header */}
        <header className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl lg:text-6xl font-black uppercase italic tracking-tighter text-gray-900">
              Sales <span className="text-blue-600">Ledger</span>
            </h1>
            <p className="text-sm font-semibold text-gray-500 mt-2 tracking-widest">
              Complete order history • Real-time financial overview
            </p>
          </div>

          {/* Summary Stats */}
          <div className="flex items-center gap-8 bg-white px-8 py-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="text-center">
              <p className="text-xs font-black uppercase text-gray-400 tracking-widest">
                Total Orders
              </p>
              <p className="text-4xl font-black text-gray-900 mt-1">
                {orders.length}
              </p>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-xs font-black uppercase text-gray-400 tracking-widest">
                Total Revenue
              </p>
              <p className="text-4xl font-black flex items-center justify-center text-emerald-600 mt-1">
                <FaRupeeSign className="text-2xl mr-1" />
                {totalRevenue.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </header>

        {/* Orders List */}
        <div className="space-y-8">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-gray-200 py-20 text-center">
              <FaBox className="mx-auto text-6xl text-gray-200 mb-6" />
              <p className="font-black text-xl text-gray-300 uppercase tracking-widest">
                No sales records yet
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Your completed orders will appear here
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Header Bar */}
                <div className="px-8 py-6 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-6">
                  <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
                    {/* Transaction ID */}
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-px">
                        Order ID
                      </p>
                      <p className="font-mono text-sm font-bold text-gray-800">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>

                    {/* Buyer */}
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-px">
                        Buyer
                      </p>
                      <div className="flex items-center gap-2 text-gray-700">
                        <FaUser className="text-gray-400" size={13} />
                        <span className="font-semibold">
                          {order.buyer?.name || "Verified Buyer"}
                        </span>
                      </div>
                    </div>

                    {/* Razorpay Reference */}
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-px">
                        Payment Reference
                      </p>
                      <p className="font-mono text-xs font-medium text-blue-600">
                        {order.razorpay_payment_id
                          ? `#${order.razorpay_payment_id.slice(-8)}`
                          : "PENDING"}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div
                    className={`px-6 py-2 text-xs font-black uppercase tracking-widest rounded-2xl border ${getStatusColor(
                      order.deliveryStatus,
                    )}`}
                  >
                    {order.deliveryStatus}
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-8">
                  <div className="space-y-8">
                    {order.orderItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-6 group border-b border-gray-100 last:border-none pb-8 last:pb-0"
                      >
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.image || "https://placehold.co/100"}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-2xl shadow-sm group-hover:shadow-md transition-shadow"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg leading-tight text-gray-900 mb-3 line-clamp-2">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="bg-gray-100 text-gray-700 px-4 py-1 rounded-2xl text-xs font-semibold">
                              QTY × {item.qty}
                            </div>
                            <div className="text-gray-500">
                              ₹{item.price.toLocaleString("en-IN")} each
                            </div>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-xs font-medium text-gray-400 mb-1">
                            ITEM TOTAL
                          </p>
                          <p className="text-2xl font-semibold text-gray-900">
                            ₹{(item.price * item.qty).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Summary */}
                <div className="bg-gray-50 px-8 py-7 flex items-center justify-between border-t border-gray-100">
                  <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
                    <FaCalendarAlt />
                    <span>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Revenue Box */}
                  <div className="bg-white shadow-inner border border-gray-200 rounded-3xl px-8 py-5 flex items-center gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                        Your Revenue
                      </p>
                      <div className="flex items-baseline gap-1">
                        <FaRupeeSign className="text-emerald-600" />
                        <span className="text-4xl font-black text-gray-900 tracking-tighter">
                          {order.totalAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerOrders;
