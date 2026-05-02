import React, { createContext, useContext, useState, useCallback } from "react";
import api from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Global fetch function for products with filters
  const fetchGlobalProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const res = await api.get(API_PATHS.PRODUCTS.GET_ALL, {
        params: {
          category: params.category !== "all" ? params.category : undefined,
          keyword: params.searchQuery || undefined,
          maxPrice: params.appliedPrice,
          pageNumber: params.page || 1,
          sort: params.sortOrder || "newest",
        },
      });

      if (res.data?.products) {
        setProducts(res.data.products);
        setPages(res.data.pages);
      }
    } catch (err) {
      console.error("Global Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ProductContext.Provider
      value={{ products, pages, loading, fetchGlobalProducts }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
