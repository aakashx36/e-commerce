import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import api from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";
import toast from "react-hot-toast";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const { data } = await api.get(API_PATHS.USER.GET_CART);
      setCartCount(data.length || 0);
    } catch (error) {
      setCartCount(0);
    }
  }, []);

  // 🔥 Synchronized Update Helper: Updates Mongo & LocalStorage together
  const updateUserSync = useCallback((newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      // Unified key 'userInfo' across the app to prevent logic mess
      localStorage.setItem("userInfo", JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem("token");
      const savedUserInfo = localStorage.getItem("userInfo");

      if (!token) {
        setLoading(false);
        return;
      }

      // Instant hydration from storage
      if (savedUserInfo) {
        try {
          setUser(JSON.parse(savedUserInfo));
        } catch (e) {
          localStorage.removeItem("userInfo");
        }
      }

      try {
        const { data } = await api.get(API_PATHS.AUTH.GET_PROFILE);
        setUser(data);
        localStorage.setItem("userInfo", JSON.stringify(data));
        if (data.role === "buyer") refreshCartCount();
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.clear();
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, [refreshCartCount]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      if (data.role === "buyer") refreshCartCount();
      return { success: true, role: data.role };
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed.");
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setCartCount(0);
    window.location.href = "/";
  };

  const value = useMemo(
    () => ({
      user,
      setUser: updateUserSync, // Override with sync logic
      loading,
      cartCount,
      refreshCartCount,
      login,
      logout,
    }),
    [user, loading, cartCount, refreshCartCount, updateUserSync],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
