import React from "react";
import { Link } from "react-router-dom";
import {
  FaRupeeSign,
  FaChevronRight,
  FaCreditCard,
  FaTruck,
  FaCalendarAlt,
} from "react-icons/fa";

const OrderCard = ({ order, isPending, onVerify }) => {
  return (
    <div
      className={`group bg-white rounded-[2.5rem] p-8 border-2 transition-all duration-500 ${
        isPending
          ? "border-amber-50 hover:border-amber-200"
          : "border-gray-50 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-50/50"
      }`}
    >
      <div className="flex flex-col lg:flex-row justify-between gap-8">
        {/* Left: Info & Images */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`p-3 rounded-2xl ${isPending ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}
            >
              {isPending ? <FaCreditCard size={20} /> : <FaTruck size={20} />}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">
                {isPending ? "Action Required" : "Shipment Status"}
              </p>
              <p
                className={`text-sm font-black uppercase italic ${isPending ? "text-amber-600" : "text-emerald-600"}`}
              >
                {order.deliveryStatus}
              </p>
            </div>
          </div>

          <div className="flex -space-x-4 mb-6 group-hover:space-x-2 transition-all duration-500">
            {order.orderItems.map((item, i) => (
              <img
                key={i}
                src={item.image}
                className="w-20 h-20 rounded-[1.5rem] object-cover border-4 border-white shadow-lg z-[1]"
                alt="product"
              />
            ))}
          </div>

          <div className="flex items-center gap-4 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <FaCalendarAlt /> {new Date(order.createdAt).toDateString()}
            </span>
            <span>•</span>
            <span>ID: #{order.razorpay_order_id.slice(-10).toUpperCase()}</span>
          </div>
        </div>

        {/* Right: Pricing & Actions */}
        <div className="flex flex-col justify-between items-end text-right min-w-[200px]">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Total Bill
            </p>
            <p className="text-4xl font-black italic text-gray-900 tracking-tighter flex items-center justify-end">
              <FaRupeeSign size={24} />
              {order.totalAmount.toLocaleString()}
            </p>
          </div>

          <div className="flex gap-3 w-full lg:w-auto">
            {isPending && order.paymentStatus === "pending" && (
              <button
                onClick={() => onVerify(order.razorpay_order_id)}
                className="flex-1 lg:flex-none bg-amber-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-amber-100 hover:bg-black transition-all transform hover:-translate-y-1"
              >
                Verify Payment
              </button>
            )}
            <Link
              to={`/order/${order._id}`}
              className="flex items-center justify-center w-14 h-14 bg-gray-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg transform hover:-translate-y-1"
            >
              <FaChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
