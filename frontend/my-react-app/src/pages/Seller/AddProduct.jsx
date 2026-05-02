import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaTrash,
  FaCloudUploadAlt,
  FaSpinner,
  FaArrowLeft,
} from "react-icons/fa";
import api from "../../utils/axiosInstance";
import { uploadToBackend } from "../../utils/uploadToBackend";
import toast from "react-hot-toast";

const AddProduct = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [imageFiles, setImageFiles] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "Electronics",
    stock: "",
  });
  const [specifications, setSpecifications] = useState([
    { key: "", value: "" },
  ]);

  // Image Selection & Preview
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (imageFiles.length + files.length > 5) {
      return toast.error("Maximum 5 images allowed");
    }
    setImageFiles([...imageFiles, ...files]);
  };

  // Final Submit Logic
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageFiles.length === 0) {
      return toast.error("Please upload at least one image");
    }

    setIsSubmitting(true);
    try {
      setIsUploading(true);
      const cloudinaryUrls = await uploadToBackend(imageFiles, "/api/upload");
      setIsUploading(false);

      if (!cloudinaryUrls || cloudinaryUrls.length === 0) {
        return toast.error("Image upload failed. Please try again.");
      }

      const finalPayload = {
        ...formData,
        images: cloudinaryUrls,
        specifications: specifications.filter((s) => s.key && s.value),
      };

      await api.post("/api/products", finalPayload);

      toast.success("Product Published Successfully! 🚀");
      navigate("/seller/inventory");
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 text-gray-500 hover:text-gray-900 transition-colors font-semibold text-sm"
          >
            <FaArrowLeft className="text-lg" />
            <span className="tracking-widest uppercase">Cancel</span>
          </button>
          <h1 className="text-4xl font-black tracking-tighter uppercase">
            Add New <span className="text-blue-600">Product</span>
          </h1>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10"
        >
          {/* LEFT COLUMN - Media & Specifications */}
          <div className="lg:col-span-7 space-y-8">
            {/* Image Upload Section */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Product Images</h3>
                <p className="text-sm text-gray-500">
                  {imageFiles.length}/5 uploaded
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {imageFiles.map((file, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImageFiles(imageFiles.filter((_, i) => i !== index))
                      }
                      className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                ))}

                {/* Upload Box */}
                {imageFiles.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/50 transition-all">
                    <FaCloudUploadAlt className="text-4xl text-gray-400 mb-3" />
                    <span className="text-sm font-semibold text-gray-500">
                      Add Images
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      Max 5 • JPG, PNG
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-lg mb-6">
                Technical Specifications
              </h3>

              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-4 mb-4">
                  <input
                    placeholder="Specification Name"
                    value={spec.key}
                    onChange={(e) => {
                      const updated = [...specifications];
                      updated[index].key = e.target.value;
                      setSpecifications(updated);
                    }}
                    className="flex-1 px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-300"
                  />
                  <input
                    placeholder="Value"
                    value={spec.value}
                    onChange={(e) => {
                      const updated = [...specifications];
                      updated[index].value = e.target.value;
                      setSpecifications(updated);
                    }}
                    className="flex-1 px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (specifications.length > 1) {
                        setSpecifications(
                          specifications.filter((_, i) => i !== index),
                        );
                      }
                    }}
                    className="px-4 text-red-500 hover:text-red-600 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setSpecifications([...specifications, { key: "", value: "" }])
                }
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-2 mt-4"
              >
                <FaPlus /> Add Specification
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN - Product Details */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 sticky top-8">
              <h3 className="text-lg font-semibold mb-8">
                Product Information
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 tracking-widest">
                    PRODUCT TITLE
                  </label>
                  <input
                    required
                    placeholder="Enter product title"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-400 text-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 tracking-widest">
                    DESCRIPTION
                  </label>
                  <textarea
                    required
                    rows="5"
                    placeholder="Describe your product..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-6 py-5 bg-gray-50 border border-gray-200 rounded-3xl focus:outline-none focus:border-blue-400 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 tracking-widest">
                      PRICE (₹)
                    </label>
                    <input
                      required
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 tracking-widest">
                      DISCOUNTED PRICE
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.discountPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountPrice: e.target.value,
                        })
                      }
                      className="w-full px-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 tracking-widest">
                      CATEGORY
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-400"
                    >
                      {[
                        "Electronics",
                        "Fashion",
                        "Home",
                        "Beauty",
                        "Sports",
                        "Others",
                      ].map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 tracking-widest">
                      STOCK
                    </label>
                    <input
                      required
                      type="number"
                      placeholder="0"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      className="w-full px-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="mt-12 w-full py-7 bg-black hover:bg-blue-600 text-white rounded-3xl font-bold text-lg tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {isSubmitting || isUploading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    {isUploading
                      ? "Uploading Images..."
                      : "Publishing Product..."}
                  </>
                ) : (
                  <>
                    <FaPlus />
                    PUBLISH PRODUCT
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
