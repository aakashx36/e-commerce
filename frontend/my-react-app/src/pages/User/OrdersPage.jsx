import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRupeeSign,
  FaClock,
  FaCheckCircle,
  FaCreditCard,
  FaChevronRight,
  FaBoxOpen,
  FaArrowLeft,
} from "react-icons/fa";
import api from "../../utils/axiosInstance";
import { useUser } from "../../context/userContext";
import toast from "react-hot-toast";

const OrdersPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchOrders = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const { data } = await api.get("/api/orders/my-orders");
      setOrders(data);
    } catch (err) {
      toast.error("Orders load nahi ho paye");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const pendingOrders = orders.filter((o) => o.paymentStatus === "pending");

  const handleProcessPayment = async (e, order) => {
    e.stopPropagation();
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      toast.error("Razorpay SDK fail to load");
      return;
    }

    const options = {
      key: "rzp_test_SaxwJqs3onwzcO",
      amount: order.totalAmount * 100,
      currency: "INR",
      name: "VENDORA",
      order_id: order.razorpay_order_id,
      handler: async (response) => {
        const loadingToast = toast.loading("Verifying...");
        try {
          const { data } = await api.post("/api/orders/verify", response);
          if (data.success) {
            toast.success("Payment Successful!", { id: loadingToast });
            await fetchOrders(false);
          }
        } catch (err) {
          toast.error("Verification failed", { id: loadingToast });
        }
      },
      prefill: { name: user?.name, email: user?.email },
      theme: { color: "#2563eb" },
    };
    new window.Razorpay(options).open();
  };

  const OrderCard = ({ order, isPending }) => (
    <div
      onClick={() => navigate(`/order/${order._id}`)}
      className="group bg-white rounded-[3rem] p-10 border-2 border-gray-50 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-500 cursor-pointer relative overflow-hidden mb-8"
    >
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
          <div className="flex -space-x-8 group-hover:-space-x-2 transition-all duration-500">
            {order.orderItems.map((item, i) => (
              <img
                key={i}
                src={item.image}
                className="w-24 h-24 rounded-[2rem] object-cover border-4 border-white shadow-xl z-[1]"
                alt="p"
              />
            ))}
          </div>
          <div className="space-y-3">
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                !isPending
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {!isPending ? <FaCheckCircle size={10} /> : <FaClock size={10} />}
              {isPending ? "Payment Pending" : `Paid | ${order.deliveryStatus}`}
            </div>
            <p className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase italic block">
              Order ID: {order.razorpay_order_id.slice(-12).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start xl:items-end w-full xl:w-auto pr-20">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">
            Grand Total
          </p>
          <p className="text-4xl font-black italic text-gray-900 tracking-tighter flex items-center leading-none">
            <FaRupeeSign size={20} className="mr-1" />
            {order.totalAmount.toLocaleString()}
          </p>
          {isPending && (
            <button
              onClick={(e) => handleProcessPayment(e, order)}
              className="mt-6 bg-amber-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-black transition-all flex items-center gap-3"
            >
              <FaCreditCard /> Pay Now
            </button>
          )}
        </div>
      </div>
      <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-0 -translate-x-10 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
        <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl">
          <FaChevronRight size={18} />
        </div>
      </div>
    </div>
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-black italic uppercase text-blue-600">
        Loading History...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto py-20 px-6">
      {/* Back to Products */}
      <div className="mb-12">
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-3 text-gray-500 hover:text-black transition-colors group font-medium"
        >
          <div className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-2xl group-hover:border-black transition-colors">
            <FaArrowLeft size={18} />
          </div>
          <span className="text-sm uppercase tracking-widest font-black">
            Back to All Products
          </span>
        </button>
      </div>

      {/* SECTION 1: Pending Payments */}
      {pendingOrders.length > 0 && (
        <section className="mb-24">
          <header className="mb-10 flex items-center gap-4">
            <div className="h-2 w-2 bg-amber-500 rounded-full animate-ping" />
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">
              Pending <span className="text-amber-500">Actions</span>
            </h2>
          </header>
          {pendingOrders.map((order) => (
            <OrderCard key={order._id} order={order} isPending={true} />
          ))}
        </section>
      )}

      {/* SECTION 2: Confirmed Orders */}
      <section>
        <header className="mb-10">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">
            Confirmed <span className="text-blue-600">Orders</span>
          </h2>
        </header>
        {paidOrders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
            <FaBoxOpen size={40} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold italic uppercase text-xs tracking-widest">
              No history found
            </p>
          </div>
        ) : (
          paidOrders.map((order) => (
            <OrderCard key={order._id} order={order} isPending={false} />
          ))
        )}
      </section>
    </div>
  );
};

export default OrdersPage;
