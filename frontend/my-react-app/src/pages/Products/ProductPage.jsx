import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "../../context/userContext";
import api from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import ProductCard from "../../components/Products/ProductCard";
import FilterSidebar from "../../components/Products/FilterSideBar";
import { FaSearch, FaSortAmountDown } from "react-icons/fa";
import toast from "react-hot-toast";

const ProductPage = () => {
  const { user, refreshCartCount } = useUser();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

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

  // Cart Sync
  const fetchCart = useCallback(async () => {
    if (user) {
      try {
        const { data } = await api.get(API_PATHS.USER.GET_CART);
        setCartItems(data.map((item) => item.product?._id || item.product));
      } catch (err) {
        console.error("Cart error:", err);
      }
    } else {
      setCartItems([]);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
    window.addEventListener("focus", fetchCart);
    return () => window.removeEventListener("focus", fetchCart);
  }, [fetchCart]);

  // Product Fetch
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
        if (res.data?.products) {
          setProducts(res.data.products);
          setPages(res.data.pages);
        }
      } catch (err) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, searchQuery, appliedPrice, page, sortOrder]);

  const handleAddToCart = async (productId) => {
    if (!user) return toast.error("Please login first! 🔒");
    if (cartItems.includes(productId)) return;

    try {
      const { data } = await api.post(API_PATHS.USER.UPDATE_CART, {
        productId,
        qty: 1,
      });

      if (data) {
        toast.success("Added to cart! 🛍️");
        await refreshCartCount();
        setCartItems((prev) => [...prev, productId]);
      }
    } catch (err) {
      toast.error("Cart error");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans antialiased">
      <main className="flex-1">
        <div className="flex flex-1 w-full max-w-[1500px] mx-auto mt-4 px-4 sm:px-0">
          <FilterSidebar
            categories={categories}
            activeCategory={category}
            setCategory={(cat) => {
              setCategory(cat);
              setPage(1);
            }}
            tempPrice={tempPrice}
            setTempPrice={setTempPrice}
            onApplyPrice={() => {
              setAppliedPrice(tempPrice);
              setPage(1);
            }}
          />

          <div className="flex-1 p-6 lg:p-12 overflow-x-hidden">
            {/* Search Bar + Header */}
            <div className="mb-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                  <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
                    VENDORA{" "}
                    <span className="text-blue-600 italic">#{category}</span>
                  </h1>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em] mt-3 italic">
                    Best Curated Selection in Delhi
                  </p>
                </div>

                {/* Search Bar */}
                <div className="w-full md:w-96">
                  <div className="flex items-center bg-white px-6 py-3.5 rounded-2xl border-2 border-transparent focus-within:border-blue-400 focus-within:bg-white transition-all shadow-inner">
                    <FaSearch className="text-gray-400 mr-3" size={16} />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      className="bg-transparent border-none outline-none text-[15px] font-bold w-full placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Sort Dropdown */}
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
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="py-20 flex justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : products?.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                  {products.map((item) => (
                    <ProductCard
                      key={item._id}
                      item={item}
                      isAdded={cartItems.includes(item._id)}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {pages > 1 && (
                  <div className="mt-20 flex items-center justify-center gap-3">
                    {[...Array(pages).keys()].map((x) => (
                      <button
                        key={x + 1}
                        onClick={() => {
                          setPage(x + 1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`w-12 h-12 rounded-2xl font-black text-xs transition-all ${
                          page === x + 1
                            ? "bg-blue-600 text-white shadow-xl shadow-blue-100"
                            : "bg-white border border-gray-100 text-gray-400 hover:border-blue-200"
                        }`}
                      >
                        {x + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-32 bg-gray-50 rounded-[4rem] border-4 border-dashed border-gray-100">
                <FaSearch size={50} className="mx-auto text-gray-200 mb-6" />
                <h2 className="text-3xl font-black text-gray-300 italic uppercase">
                  No Products Found
                </h2>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductPage;
