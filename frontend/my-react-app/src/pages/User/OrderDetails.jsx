import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaBox,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCreditCard,
  FaHeadset,
  FaArrowLeft,
  FaReceipt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaTruck,
  FaTrashAlt,
  FaSpinner,
  FaEdit,
  FaRegDotCircle,
} from "react-icons/fa";
import api from "../../utils/axiosInstance";
import { useUser } from "../../context/userContext";
import toast from "react-hot-toast";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [myComplaints, setMyComplaints] = useState([]);

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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: orderData } = await api.get(`/api/orders/${id}`);
      setOrder(orderData);

      const { data: compData } = await api.get("/api/complaints/my");
      const filtered = (compData?.data || []).filter(
        (c) => (c.order?._id || c.order) === id,
      );
      setMyComplaints(filtered);
    } catch (err) {
      toast.error("Order session sync failed");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProcessPayment = async () => {
    if (!order || order.paymentStatus !== "pending") return;

    setIsProcessingPayment(true);
    const isScriptLoaded = await loadRazorpayScript();

    if (!isScriptLoaded) {
      toast.error("Razorpay SDK failed to load");
      setIsProcessingPayment(false);
      return;
    }

    const options = {
      key: "rzp_test_SaxwJqs3onwzcO", // Replace with your key in production
      amount: order.totalAmount * 100,
      currency: "INR",
      name: "VENDORA",
      order_id: order.razorpay_order_id,
      handler: async (response) => {
        const loadingToast = toast.loading("Verifying payment...");
        try {
          const { data } = await api.post("/api/orders/verify", response);
          if (data.success) {
            toast.success("Payment Successful!", { id: loadingToast });
            setTimeout(() => navigate("/orders"), 1500);
          }
        } catch (err) {
          toast.error("Payment verification failed", { id: loadingToast });
        } finally {
          setIsProcessingPayment(false);
        }
      },
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
      },
      theme: { color: "#2563eb" },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

    razorpay.on("payment.failed", () => {
      toast.error("Payment cancelled or failed");
      setIsProcessingPayment(false);
    });
  };

  const handleDeleteOrder = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel and delete this pending order?",
      )
    )
      return;

    setIsDeleting(true);
    try {
      await api.delete(`/api/orders/${id}`);
      toast.success("Order cancelled successfully");
      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete order");
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper for progress bar logic
  const steps = ["Processing", "Shipped", "Delivered"];
  const currentStepIndex = order?.isDelivered
    ? 2
    : steps.indexOf(order?.deliveryStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-10 animate-pulse">
        <div className="max-w-6xl mx-auto px-6">
          <div className="w-32 h-6 bg-slate-200 rounded-md mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-6">
              <div className="w-full h-40 bg-slate-200 rounded-3xl"></div>
              <div className="w-full h-32 bg-slate-200 rounded-3xl"></div>
              <div className="w-full h-32 bg-slate-200 rounded-3xl"></div>
            </div>
            <div className="lg:col-span-4">
              <div className="w-full h-[400px] bg-slate-200 rounded-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-10">
      <div className="max-w-6xl mx-auto px-6">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/orders")}
            className="group flex items-center gap-2 text-slate-500 font-medium text-sm hover:text-blue-600 transition-colors w-fit"
          >
            <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 group-hover:border-blue-200 transition-colors">
              <FaArrowLeft
                size={12}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
            </div>
            Back to Orders
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT COLUMN - Order Progress & Items */}
          <div className="lg:col-span-8 space-y-8">
            {/* Live Tracking Status */}
            {order.paymentStatus === "paid" && (
              <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Order Status
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Order ID: #{order._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <span className="bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider w-fit">
                    {order.deliveryStatus}
                  </span>
                </div>

                {/* Progress Stepper */}
                <div className="relative pt-4 pb-2">
                  <div className="absolute top-9 left-[10%] right-[10%] h-1 bg-slate-100 rounded-full -z-10" />
                  <div
                    className="absolute top-9 left-[10%] h-1 bg-blue-600 rounded-full -z-10 transition-all duration-500"
                    style={{
                      width: `${currentStepIndex >= 0 ? (currentStepIndex / 2) * 80 : 0}%`,
                    }}
                  />

                  <div className="flex justify-between relative z-10 px-4 sm:px-12">
                    {steps.map((step, i) => {
                      const isCompleted = i <= currentStepIndex;
                      const isCurrent = i === currentStepIndex;

                      return (
                        <div
                          key={i}
                          className="flex flex-col items-center gap-3"
                        >
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all duration-300 ${
                              isCompleted
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-400"
                            } ${isCurrent ? "ring-4 ring-blue-100" : ""}`}
                          >
                            {step === "Processing" && <FaBox size={16} />}
                            {step === "Shipped" && <FaTruck size={16} />}
                            {step === "Delivered" && (
                              <FaCheckCircle size={18} />
                            )}
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              isCompleted ? "text-slate-900" : "text-slate-400"
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Package Details */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-2 mb-2">
                Items in this order
              </h3>

              {order.orderItems.map((item) => {
                const itemComp = myComplaints.find(
                  (c) => (c.orderItem?._id || c.orderItem) === item.product,
                );

                return (
                  <div
                    key={item._id}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-5 w-full sm:w-auto">
                      <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                        <img
                          src={item.image}
                          className="w-full h-full object-cover mix-blend-multiply p-1"
                          alt={item.name}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-lg line-clamp-1">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-blue-600 font-bold">
                            ₹{item.price.toLocaleString()}
                          </p>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500 font-medium text-sm">
                            Qty: {item.qty}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Area */}
                    <div className="flex flex-col items-start sm:items-end gap-3 w-full sm:w-auto">
                      {itemComp && (
                        <div className="flex flex-col items-start sm:items-end gap-2">
                          <span className="bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 font-semibold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
                            <FaExclamationTriangle size={10} />{" "}
                            {itemComp.status}
                          </span>
                          <button
                            onClick={() =>
                              navigate(`/complaints/product/${item.product}`)
                            }
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            View Complaint
                          </button>
                        </div>
                      )}

                      {order.paymentStatus === "paid" && (
                        <button
                          onClick={() =>
                            navigate("/review", {
                              state: {
                                productId: item.product,
                                orderId: order._id,
                                productName: item.name,
                                productImage: item.image,
                              },
                            })
                          }
                          className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
                        >
                          <FaEdit size={14} className="text-slate-400" /> Write
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>
          </div>

          {/* RIGHT COLUMN - Sticky Order Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
              <FaReceipt className="absolute -top-4 -right-4 text-slate-50 text-8xl -z-0" />

              <div className="relative z-10">
                <h3 className="text-lg font-bold text-slate-900 mb-6">
                  Order Summary
                </h3>

                {/* Shipping Details Card */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-8">
                  <div className="flex items-center gap-2 text-blue-600 mb-3 font-semibold text-xs uppercase tracking-wider">
                    <FaMapMarkerAlt size={14} /> Shipping To
                  </div>
                  <p className="text-slate-900 font-bold mb-1">
                    {order.shippingAddress?.fullName}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">
                    {order.shippingAddress?.street}, <br />
                    {order.shippingAddress?.city}
                  </p>
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <FaPhoneAlt size={12} /> +91 {order.shippingAddress?.phone}
                  </div>
                </div>

                {/* Pricing Block */}
                <div className="border-t border-slate-100 pt-6 mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-slate-500 font-medium">Subtotal</p>
                    <p className="text-slate-900 font-semibold">
                      ₹{order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-slate-500 font-medium">Shipping</p>
                    <p className="text-emerald-600 font-semibold">Free</p>
                  </div>
                  <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                    <p className="text-slate-900 font-bold">Total</p>
                    <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                      ₹{order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="space-y-3">
                  {order.paymentStatus === "pending" ? (
                    <>
                      <button
                        onClick={handleProcessPayment}
                        disabled={isProcessingPayment}
                        className="w-full py-4 bg-blue-600 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isProcessingPayment ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <>
                            <FaCreditCard /> Complete Payment
                          </>
                        )}
                      </button>

                      <button
                        disabled={isDeleting}
                        onClick={handleDeleteOrder}
                        className="w-full py-4 bg-white border border-rose-200 text-rose-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-50 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTrashAlt size={14} />
                        )}
                        Cancel Order
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => navigate(`/complaint/post/${order._id}`)}
                      className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-slate-800 transition-all"
                    >
                      <FaHeadset /> Help & Support
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
