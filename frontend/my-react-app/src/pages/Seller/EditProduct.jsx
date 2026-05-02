import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaSave,
  FaTrash,
  FaCloudUploadAlt,
  FaSpinner,
  FaArrowLeft,
} from "react-icons/fa";
import api from "../../utils/axiosInstance";
import { uploadToBackend } from "../../utils/uploadToBackend";
import toast from "react-hot-toast";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "Electronics",
    stock: "",
    isActive: true, // ← New: Active status
  });

  const [specifications, setSpecifications] = useState([]);

  // Fetch existing product data
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        const product = data.data;

        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          discountPrice: product.discountPrice,
          category: product.category,
          stock: product.stock,
          isActive: product.isActive !== undefined ? product.isActive : true,
        });

        setExistingImages(product.images || []);
        setSpecifications(product.specifications || []);
      } catch (err) {
        toast.error("Could not retrieve asset data");
        navigate("/seller/inventory");
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id, navigate]);

  // Image Handlers
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (existingImages.length + imageFiles.length + files.length > 5) {
      return toast.error("Maximum 5 assets allowed");
    }
    setImageFiles([...imageFiles, ...files]);
  };

  const removeExisting = (url) =>
    setExistingImages(existingImages.filter((img) => img !== url));

  const removeNew = (index) =>
    setImageFiles(imageFiles.filter((_, i) => i !== index));

  // Update Operation
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      let finalImages = [...existingImages];

      if (imageFiles.length > 0) {
        const uploadedUrls = await uploadToBackend(imageFiles, "/api/upload");
        finalImages = [...finalImages, ...uploadedUrls];
      }

      const updatedPayload = {
        ...formData,
        images: finalImages,
        specifications: specifications.filter((s) => s.key && s.value),
      };

      await api.put(`/api/products/${id}`, updatedPayload);

      toast.success("Product Updated Successfully! 🚀");
      navigate("/seller/inventory");
    } catch (err) {
      toast.error(err.response?.data?.message || "Modification failed");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-black animate-pulse text-blue-600 italic">
        DECRYPTING PRODUCT SPECS...
      </div>
    );

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
            Edit <span className="text-blue-600">Product</span>
          </h1>

          <div className="w-10" />
        </div>

        <form
          onSubmit={handleUpdate}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10"
        >
          {/* LEFT - Media */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg">Product Images</h3>
                <p className="text-sm text-gray-500">
                  {existingImages.length + imageFiles.length}/5
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Existing Images */}
                {existingImages.map((url, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-200"
                  >
                    <img
                      src={url}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                    <button
                      type="button"
                      onClick={() => removeExisting(url)}
                      className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                ))}

                {/* New Selected Images */}
                {imageFiles.map((file, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-2xl overflow-hidden border-2 border-blue-200"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                    <button
                      type="button"
                      onClick={() => removeNew(i)}
                      className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-xl"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                ))}

                {/* Upload Box */}
                {existingImages.length + imageFiles.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/50 transition-all">
                    <FaCloudUploadAlt className="text-4xl text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-500">
                      Add Images
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT - Product Details + Toggle */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 sticky top-8">
              <h3 className="text-lg font-semibold mb-8">
                Product Information
              </h3>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 tracking-widest">
                    PRODUCT TITLE
                  </label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-400 text-lg font-medium"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 tracking-widest">
                    DESCRIPTION
                  </label>
                  <textarea
                    required
                    rows="5"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-6 py-5 bg-gray-50 border border-gray-200 rounded-3xl focus:outline-none focus:border-blue-400 resize-none"
                  />
                </div>

                {/* Price & Discount */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 tracking-widest">
                      PRICE (₹)
                    </label>
                    <input
                      required
                      type="number"
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

                {/* Category & Stock */}
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
                      ].map((c) => (
                        <option key={c} value={c}>
                          {c}
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
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      className="w-full px-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* === NEW: Active / Inactive Toggle === */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-700">
                      Product Status
                    </p>
                    <p className="text-xs text-gray-500">
                      Make this product visible to customers
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {formData.isActive ? "Active" : "Inactive"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUpdating}
                className="mt-12 w-full py-7 bg-black hover:bg-blue-600 text-white rounded-3xl font-bold text-lg tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {isUpdating ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    UPDATING PRODUCT...
                  </>
                ) : (
                  <>
                    <FaSave />
                    SAVE CHANGES
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

export default EditProduct;
