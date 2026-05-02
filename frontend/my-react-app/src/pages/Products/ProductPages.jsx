import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "../../context/userContext";
import api from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import BuyerNavbar from "../../components/Navbar/BuyerNavbar";
import SellerNavbar from "../../components/Navbar/SellerNavbar";
import {
  FaFilter,
  FaHeart,
  FaShoppingBag,
  FaSearchPlus,
  FaThLarge,
  FaRupeeSign,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaSortAmountDown,
} from "react-icons/fa";
import toast from "react-hot-toast";

const ProductPages = () => {
  const { user } = useUser();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // --- States ---
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [category, setCategory] = useState(
    queryParams.get("category") || "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [tempPrice, setTempPrice] = useState(100000);
  const [appliedPrice, setAppliedPrice] = useState(100000);
  const [sortOrder, setSortOrder] = useState("newest");

  const categories = [
    "All",
    "Electronics",
    "Fashion",
    "Home",
    "Beauty",
    "Sports",
    "Others",
  ];
  const noImage =
    "https://placehold.co/600x400/F3F5F4/A1A1A1?text=No+Image+Available";

  // 1. Fetch User Cart - Optimized with useCallback
  const fetchCart = useCallback(async () => {
    if (user) {
      try {
        const { data } = await api.get(API_PATHS.USER.GET_CART);
        // Map to get an array of product IDs
        setCartItems(data.map((item) => item.product?._id || item.product));
      } catch (err) {
        console.error("Cart fetch error:", err);
      }
    } else {
      setCartItems([]);
    }
  }, [user]);

  // Sync Cart on mount and when window gets focus (Tab switching)
  useEffect(() => {
    fetchCart();
    window.addEventListener("focus", fetchCart);
    return () => window.removeEventListener("focus", fetchCart);
  }, [fetchCart]);

  // 2. Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get(API_PATHS.PRODUCTS.GET_ALL, {
          params: {
            category: category !== "all" ? category : undefined,
            keyword: searchQuery || undefined,
            maxPrice: appliedPrice,
            pageNumber: page,
            sort: sortOrder,
          },
        });

        if (res.data && res.data.products) {
          setProducts(res.data.products);
          setPages(res.data.pages);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, searchQuery, appliedPrice, page, sortOrder]);

  // 3. Add to Cart Logic
  const handleAddToCart = async (productId) => {
    if (!user) {
      toast.error("Please login first! 🔒");
      return;
    }

    if (cartItems.includes(productId)) return;

    try {
      const { data } = await api.post(API_PATHS.USER.UPDATE_CART, {
        productId,
        qty: 1,
      });

      if (data) {
        toast.success("Added to cart! 🛍️");
        setCartItems((prev) => [...prev, productId]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Cart error");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans antialiased">
      {user?.role === "seller" ? (
        <SellerNavbar user={user} />
      ) : (
        <BuyerNavbar user={user} setSearchQuery={setSearchQuery} />
      )}

      <div className="flex flex-1 w-full max-w-[1500px] mx-auto mt-4 px-4 sm:px-0">
        {/* SIDEBAR */}
        <aside className="w-80 border-r border-gray-100 p-8 sticky top-[88px] h-[calc(100vh-88px)] hidden lg:block bg-white overflow-y-auto shrink-0">
          <div className="flex items-center gap-4 text-gray-900 mb-8 px-2">
            <FaThLarge className="text-blue-600" size={18} />
            <h2 className="font-black uppercase tracking-[0.2em] text-xs">
              Explore
            </h2>
          </div>

          <div className="space-y-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat.toLowerCase());
                  setPage(1);
                }}
                className={`w-full text-left px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  category.toLowerCase() === cat.toLowerCase()
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-100"
                    : "text-gray-400 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="pt-8 border-t border-gray-100 px-2">
            <h2 className="font-black uppercase tracking-[0.2em] text-xs mb-8">
              Price Filter
            </h2>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={tempPrice}
              onChange={(e) => setTempPrice(e.target.value)}
              className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-6"
            />
            <button
              onClick={() => {
                setAppliedPrice(tempPrice);
                setPage(1);
              }}
              className="w-full py-4 bg-[#1A1A1A] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <FaCheck size={10} /> Apply Price
            </button>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 p-6 lg:p-12 overflow-x-hidden">
          <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
                VENDORA{" "}
                <span className="text-blue-600 italic">#{category}</span>
              </h1>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em] mt-3 italic italic">
                Best Curated Selection in Delhi
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white border border-gray-100 px-5 py-3 rounded-2xl shadow-sm">
              <FaSortAmountDown className="text-gray-400" size={14} />
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest outline-none focus:ring-0 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>
          </header>

          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : products?.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                {products.map((item) => {
                  const isAdded = cartItems.includes(item._id);
                  const hasDiscount =
                    item.discountPrice > 0 && item.discountPrice < item.price;
                  const discountPercent = hasDiscount
                    ? Math.round(
                        ((item.price - item.discountPrice) / item.price) * 100,
                      )
                    : 0;

                  return (
                    <div
                      key={item._id}
                      className="group bg-white rounded-[3rem] p-5 border border-gray-50 shadow-sm hover:shadow-2xl transition-all duration-500 relative flex flex-col h-full"
                    >
                      <div className="absolute top-8 left-8 z-10 bg-white/90 backdrop-blur-md text-blue-600 text-[9px] font-black px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-widest border border-blue-50">
                        {item.category}
                      </div>
                      {hasDiscount && (
                        <div className="absolute top-8 right-8 z-10 bg-red-500 text-white text-[9px] font-black px-3 py-1.5 rounded-lg shadow-lg uppercase tracking-[0.1em]">
                          {discountPercent}% OFF
                        </div>
                      )}

                      <div className="aspect-square bg-[#F3F5F4] rounded-[2.5rem] overflow-hidden mb-6 border-4 border-white">
                        <img
                          src={item.images?.[0] || noImage}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          alt={item.name}
                        />
                      </div>

                      <div className="px-2 flex-1 flex flex-col">
                        <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors truncate mb-2 uppercase italic">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-auto">
                          {hasDiscount ? (
                            <>
                              <p className="text-3xl font-black text-gray-900 tracking-tighter flex items-center italic">
                                <FaRupeeSign size={18} />
                                {item.discountPrice.toLocaleString()}
                              </p>
                              <p className="text-sm font-bold text-gray-400 line-through opacity-60 flex items-center">
                                <FaRupeeSign size={12} />
                                {item.price.toLocaleString()}
                              </p>
                            </>
                          ) : (
                            <p className="text-3xl font-black text-gray-900 tracking-tighter flex items-center italic">
                              <FaRupeeSign size={18} />
                              {item.price.toLocaleString()}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleAddToCart(item._id)}
                          disabled={item.stock <= 0}
                          className={`w-full mt-6 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${
                            isAdded
                              ? "bg-emerald-500 text-white shadow-emerald-100"
                              : "bg-[#1A1A1A] text-white hover:bg-blue-600 shadow-xl shadow-gray-200"
                          } disabled:bg-gray-100 disabled:text-gray-300`}
                        >
                          {item.stock <= 0 ? (
                            "Sold Out"
                          ) : isAdded ? (
                            <>
                              <FaCheck size={14} /> Added
                            </>
                          ) : (
                            <>
                              <FaShoppingBag size={14} /> Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION */}
              {pages > 1 && (
                <div className="mt-20 flex items-center justify-center gap-3">
                  {[...Array(pages).keys()].map((x) => (
                    <button
                      key={x + 1}
                      onClick={() => {
                        setPage(x + 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`w-12 h-12 rounded-2xl font-black text-xs transition-all ${page === x + 1 ? "bg-blue-600 text-white shadow-xl shadow-blue-100" : "bg-white border border-gray-100 text-gray-400 hover:border-blue-200"}`}
                    >
                      {x + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-32 bg-gray-50 rounded-[4rem] border-4 border-dashed border-gray-100">
              <FaSearchPlus size={50} className="mx-auto text-gray-200 mb-6" />
              <h2 className="text-3xl font-black text-gray-300 italic uppercase">
                No Products Found
              </h2>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductPages;
