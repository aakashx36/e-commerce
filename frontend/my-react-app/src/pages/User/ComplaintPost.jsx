import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaSpinner,
  FaCamera,
  FaTrash,
  FaShieldAlt,
} from "react-icons/fa";
import api from "../../utils/axiosInstance";
import { uploadToBackend } from "../../utils/uploadToBackend";
import { useUser } from "../../context/userContext";
import toast from "react-hot-toast";

const ComplaintPost = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    orderItem: "",
    subject: "Damaged Product",
    message: "",
    evidenceImages: [],
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/api/orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        toast.error("Order details sync failed");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, navigate]);

  const handleImageChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const urls = await uploadToBackend(files, "/api/upload");

      setFormData((prev) => ({
        ...prev,
        evidenceImages: [...prev.evidenceImages, ...urls],
      }));
      toast.success(`${urls.length} images processed successfully!`);
    } catch (err) {
      console.error("Upload failed");
      toast.error("Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      evidenceImages: prev.evidenceImages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.orderItem) return toast.error("Please select a product.");
    if (formData.evidenceImages.length === 0)
      return toast.error("Please upload at least one evidence image.");

    setIsSubmitting(true);
    try {
      const response = await api.post("/api/complaints", {
        order: orderId,
        orderItem: formData.orderItem,
        subject: formData.subject,
        message: formData.message,
        evidenceImages: formData.evidenceImages,
      });

      if (response.data.success) {
        toast.success("Dispute Filed Successfully! 🛡️");
        setTimeout(() => navigate(`/order/${orderId}`), 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Internal Server Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-10">
      <div className="max-w-4xl mx-auto px-6">
        <header className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-slate-500 font-medium text-sm hover:text-rose-600 transition-colors"
          >
            <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 group-hover:border-rose-200 transition-colors">
              <FaArrowLeft
                size={12}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
            </div>
            Cancel Dispute
          </button>
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-full ring-1 ring-emerald-600/20 shadow-sm">
            <FaShieldAlt size={12} /> Verified Dispute Form
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-4 pt-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Report an <span className="text-blue-600">Issue</span>
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">
              We're sorry you experienced a problem. Please provide clear
              photographic evidence of any damages, defects, or incorrect items
              so our team can resolve this swiftly.
            </p>
          </div>

          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
            >
              {/* Product Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1">
                  Target Product
                </label>
                <select
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  onChange={(e) =>
                    setFormData({ ...formData, orderItem: e.target.value })
                  }
                >
                  <option value="">Choose item from order...</option>
                  {order?.orderItems?.map((item) => (
                    <option key={item.product} value={item.product}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1">
                  Issue Category
                </label>
                <select
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  value={formData.subject}
                >
                  <option value="Damaged Product">Damaged Product</option>
                  <option value="Wrong Item Received">
                    Wrong Item Received
                  </option>
                  <option value="Missing Parts">Missing Parts</option>
                  <option value="Quality Issue">Quality Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Message Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1">
                  Detailed Description
                </label>
                <textarea
                  placeholder="Please describe exactly what went wrong..."
                  rows="4"
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                />
              </div>

              {/* Photographic Evidence */}
              <div className="space-y-3">
                <div className="flex justify-between items-end mb-1">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1">
                    Photographic Evidence
                  </label>
                  <span className="text-xs text-slate-400 font-medium">
                    Required
                  </span>
                </div>

                <div className="flex flex-wrap gap-4">
                  {formData.evidenceImages.map((url, i) => (
                    <div key={i} className="relative w-20 h-20 group">
                      <img
                        src={url}
                        className="w-full h-full object-cover rounded-xl border border-slate-200 shadow-sm"
                        alt="evidence"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-rose-600"
                        title="Remove image"
                      >
                        <FaTrash size={10} />
                      </button>
                    </div>
                  ))}

                  {/* Upload Trigger */}
                  <label className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-all bg-slate-50 group">
                    {isUploading ? (
                      <FaSpinner className="animate-spin text-blue-500" />
                    ) : (
                      <>
                        <FaCamera size={20} className="mb-1" />
                        <span className="text-[10px] font-semibold">
                          Upload
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane size={14} /> Submit Dispute
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintPost;
