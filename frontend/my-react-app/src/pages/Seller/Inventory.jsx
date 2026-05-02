import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaBoxOpen,
  FaSearch,
  FaSync,
  FaExclamationCircle,
} from "react-icons/fa";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const Inventory = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetching logic - Token automatically goes in headers via axiosInstance
  const fetchInventory = async () => {
    try {
      setLoading(true);

      // axiosInstance automatically adds the Token from localStorage
      const response = await api.get("/api/products/seller/inventory");

      // Postman response ke mutabiq data extraction
      // response.data ke andar 'products' key hai
      if (response.data && response.data.success) {
        setProducts(response.data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      // Agar status 500 hai, toh backend terminal check karein
      // 401 hone par axiosInstance khud login par bhej dega
      const errorMsg = err.response?.data?.message || "Internal Server Error";
      toast.error(`Sync Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchInventory();
  }, []);

  // 2. Delete Handler - Backend checks seller ownership via Token
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure? This item will be removed from the marketplace.",
      )
    )
      return;

    try {
      await api.delete(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Asset deleted successfully.");
    } catch (err) {
      toast.error("Deletion unauthorized or failed.");
    }
  };

  // 3. Search Filter
  const filteredProducts = (products || []).filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center font-semibold text-slate-600">
        <FaSync className="animate-spin text-5xl mb-6" />
        <p className="text-lg tracking-wide">Syncing inventory data...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 pt-12 pb-20 px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-12">
          <div className="space-y-1">
            <h1 className="text-5xl font-semibold text-slate-900 tracking-tight">
              Stock <span className="text-blue-600">Vault</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Management Portal • {products.length} Active Listings
            </p>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-96">
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search inventory..."
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => navigate("/seller/add-product")}
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-semibold text-sm flex items-center gap-2 hover:bg-blue-600 transition-all shadow-md active:scale-95"
            >
              <FaPlus size={16} /> New Asset
            </button>
          </div>
        </header>

        {/* Inventory List */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl border border-slate-100 text-center shadow-sm">
            <FaBoxOpen className="mx-auto text-6xl text-slate-200 mb-6" />
            <p className="text-base font-medium text-slate-400">
              No products registered in this session
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all flex items-center justify-between"
              >
                {/* Product Identity */}
                <div className="flex items-center gap-8">
                  <img
                    src={product.images?.[0] || "https://placehold.co/200"}
                    className="w-28 h-28 rounded-2xl object-cover border border-slate-100 shadow-sm"
                    alt={product.name}
                  />
                  <div>
                    <h3 className="text-2xl font-semibold text-slate-900 leading-tight">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-4">
                      <span className="bg-slate-100 text-slate-600 px-5 py-1 rounded-2xl text-xs font-semibold uppercase tracking-widest">
                        {product.category}
                      </span>
                      <span
                        className={`text-sm font-semibold flex items-center gap-2 ${
                          product.stock > 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {product.stock > 0 ? (
                          `In Stock: ${product.stock}`
                        ) : (
                          <>
                            <FaExclamationCircle /> Out of Stock
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Commercials & Actions */}
                <div className="flex items-center gap-12">
                  <div className="text-right">
                    <p className="text-3xl font-semibold text-slate-900">
                      ₹{product.discountPrice?.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400 line-through mt-1">
                      MRP ₹{product.price?.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        navigate(`/seller/edit-product/${product._id}`)
                      }
                      className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center"
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
