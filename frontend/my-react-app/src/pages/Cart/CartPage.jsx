import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/userContext";
import api from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import AddressSection from "../../components/Cart/AddressSection";
import {
  FaTrashAlt,
  FaMinus,
  FaPlus,
  FaArrowLeft,
  FaSearchPlus,
  FaSpinner,
  FaCreditCard,
  FaShoppingBag,
} from "react-icons/fa";
import toast from "react-hot-toast";

const CartPage = () => {
  const navigate = useNavigate();
  const { user, setUser, refreshCartCount } = useUser();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [addressMode, setAddressMode] = useState("saved");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [manualAddress, setManualAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    label: "Home",
  });

  const loadRazorpay = useCallback(() => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const fetchSavedAddresses = useCallback(async () => {
    try {
      const { data } = await api.get("/api/user/address");
      const addresses = data.addresses || data || [];
      setSavedAddresses(addresses);
    } catch (err) {
      console.error("Address fetch failed");
    }
  }, []);

  const fetchCartData = useCallback(async () => {
    try {
      const { data } = await api.get(API_PATHS.USER.GET_CART);
      setCart(data || []);
    } catch (err) {
      console.error("Cart fetch failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCartData();
  }, [fetchCartData]);

  useEffect(() => {
    if (step === 2) {
      fetchSavedAddresses();
    }
  }, [step, fetchSavedAddresses]);

  const handleUpdateQty = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    try {
      await api.post(API_PATHS.USER.UPDATE_CART, { productId, qty: newQty });
      fetchCartData();
      refreshCartCount();
    } catch (err) {
      toast.error("Stock limit reached");
    }
  };

  const handleRemove = async (productId) => {
    try {
      await api.delete(API_PATHS.USER.REMOVE_FROM_CART(productId));
      fetchCartData();
      refreshCartCount();
      toast.success("Item removed");
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleSaveAndUseAddress = async () => {
    if (Object.values(manualAddress).some((val) => !val?.trim()))
      return toast.error("Please fill all fields!");
    try {
      const { data } = await api.post("/api/user/address", manualAddress);
      const updated = data.addresses || [];
      setSavedAddresses(updated);
      setSelectedAddress(updated[updated.length - 1]);
      setAddressMode("saved");
      toast.success("Address saved!");
    } catch (err) {
      toast.error("Failed to save address");
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedAddress)
      return toast.error("Please select a delivery address");
    setIsProcessing(true);

    if (!(await loadRazorpay())) {
      setIsProcessing(false);
      return toast.error("Payment gateway failed to load");
    }

    try {
      const { data } = await api.post("/api/orders/checkout", {
        shippingAddress: selectedAddress,
      });

      const options = {
        key: "rzp_test_SaxwJqs3onwzcO",
        amount: data.razorpayOrder.amount,
        currency: "INR",
        order_id: data.razorpayOrder.id,
        handler: async (response) => {
          try {
            const verifyRes = await api.post("/api/orders/verify", response);
            if (verifyRes.data.success) {
              setCart([]);
              await refreshCartCount();
              toast.success("Order Placed Successfully! 🎉");
              navigate("/orders", { replace: true });
            }
          } catch (err) {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: selectedAddress?.phone,
        },
        theme: { color: "#3B82F6" },
        modal: { ondismiss: () => setIsProcessing(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Checkout initiation failed");
      setIsProcessing(false);
    }
  };

  const totalAmount = cart.reduce(
    (acc, item) =>
      acc + (item.product.discountPrice || item.product.price) * item.quantity,
    0,
  );

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">
            Loading your bag...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <div className="max-w-6xl mx-auto pt-10 px-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
          <button
            onClick={() => (step === 1 ? navigate("/products") : setStep(1))}
            className="group flex items-center gap-2 text-slate-500 font-medium text-sm hover:text-blue-600 transition-colors"
          >
            <FaArrowLeft
              size={12}
              className="group-hover:-translate-x-1 transition-transform"
            />{" "}
            {step === 1 ? "Continue Shopping" : "Back to Cart"}
          </button>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            {step === 1 ? "Your Cart" : "Checkout"}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Content Area */}
          <div className="lg:flex-1">
            {step === 1 ? (
              cart.length === 0 ? (
                <div className="py-32 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-6">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                    <FaShoppingBag size={40} className="text-slate-300" />
                  </div>
                  <p className="font-semibold text-xl text-slate-600">
                    Your bag is empty
                  </p>
                  <p className="text-slate-400 text-sm mb-4">
                    Looks like you haven't added anything yet.
                  </p>
                  <button
                    onClick={() => navigate("/products")}
                    className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item._id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-6 w-full sm:w-auto">
                        <img
                          src={item.product.images?.[0]}
                          className="w-20 h-20 rounded-xl object-cover bg-slate-50"
                          alt={item.product.name}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 text-lg line-clamp-1">
                            {item.product.name}
                          </h3>
                          <p className="font-medium text-blue-600 mt-1">
                            ₹
                            {(
                              item.product.discountPrice || item.product.price
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full">
                          <button
                            onClick={() =>
                              handleUpdateQty(
                                item.product._id,
                                item.quantity,
                                -1,
                              )
                            }
                            className="text-slate-500 hover:text-slate-900 transition-colors p-1"
                          >
                            <FaMinus size={12} />
                          </button>
                          <span className="font-semibold text-slate-800 w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQty(
                                item.product._id,
                                item.quantity,
                                1,
                              )
                            }
                            className="text-slate-500 hover:text-slate-900 transition-colors p-1"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemove(item.product._id)}
                          className="p-3 text-rose-500 bg-rose-50 rounded-full hover:bg-rose-500 hover:text-white transition-colors"
                          title="Remove item"
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <AddressSection
                {...{
                  savedAddresses,
                  selectedAddress,
                  setSelectedAddress,
                  manualAddress,
                  setManualAddress,
                  addressMode,
                  setAddressMode,
                  onSaveManualAddress: handleSaveAndUseAddress,
                }}
              />
            )}
          </div>

          {/* Sidebar / Bill Summary */}
          <div className="lg:w-[380px]">
            <div className="bg-white border border-slate-200 p-8 rounded-3xl sticky top-8 shadow-xl shadow-slate-200/50">
              <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
                Order Summary
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>Delivery Estimate</span>
                  <span className="font-medium text-emerald-600">Free</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-slate-900 font-semibold">Total</span>
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                disabled={cart.length === 0 || isProcessing}
                onClick={() => (step === 1 ? setStep(2) : handleConfirmOrder())}
                className="w-full py-4 bg-blue-600 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaCreditCard />
                )}{" "}
                {step === 1 ? "Proceed to Checkout" : "Confirm & Pay"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
