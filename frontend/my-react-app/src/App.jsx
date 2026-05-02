import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { useUser } from "./context/userContext";
import { Toaster } from "react-hot-toast";

// Page Imports
import EditProduct from "./pages/Seller/EditProduct";
import SellerDashboard from "./pages/Seller/SellerDashboard";
import AddProduct from "./pages/Seller/AddProduct";
import Inventory from "./pages/Seller/Inventory";
import GlobalNavbar from "./components/Navbar/GlobalNavbar";
import PostReview from "./pages/Products/PostReview";
import ProductDetails from "./pages/Products/ProductDetails";
import ComplaintDetails from "./pages/User/ComplaintDetails";
import ItemComplaintDetails from "./pages/User/ItemComplaintDetails";
import ComplaintPost from "./pages/User/ComplaintPost";
import CartPage from "./pages/Cart/CartPage";
import OrderDetails from "./pages/User/OrderDetails";
import Login from "./pages/Authentication/Login";
import Register from "./pages/Authentication/Register";
import Home from "./pages/Home";
import OrdersPage from "./pages/User/OrdersPage";
import ProductPage from "./pages/Products/ProductPage";
import UserProfile from "./pages/User/UserProfile";
import SellerOrders from "./pages/Seller/SellerOrders";

// Admin Pages
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminManageUsers from "./pages/Admin/AdminManageUsers";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminComplaints from "./pages/Admin/AdminComplaints";
import UserDetails from "./pages/Admin/UserDetails";

// --- PRIVATE ROUTE WRAPPER ---
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useUser();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

function App() {
  const { user, loading } = useUser();
  const [isSellerMode, setIsSellerMode] = useState(() => {
    const saved = localStorage.getItem("isSellerMode");
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (!user || user.role === "admin") {
      setIsSellerMode(false);
      localStorage.removeItem("isSellerMode");
    } else {
      localStorage.setItem("isSellerMode", JSON.stringify(isSellerMode));
    }
  }, [isSellerMode, user]);

  // Prevent double-page glitches by waiting for auth check
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse">
        VENDORA SECURING CONNECTION...
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-center" />

      {/* Navbar hamesha top par rahega, par login page par hide ho sakta hai agar aap chaho */}
      {user && (
        <GlobalNavbar
          isSellerMode={isSellerMode}
          setIsSellerMode={setIsSellerMode}
        />
      )}

      <Routes>
        {/* --- GUEST LEVEL (Public) --- */}
        {!user ? (
          <>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Catch-all for guests: Redirect to Login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            {/* --- AUTH LEVEL (Protected) --- */}
            {/* Base Redirect */}
            <Route
              path="/"
              element={
                <Navigate
                  to={user.role === "admin" ? "/admin/dashboard" : "/home"}
                  replace
                />
              }
            />

            {/* Buyer Routes */}
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/products"
              element={
                <PrivateRoute>
                  <ProductPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/product/:id"
              element={
                <PrivateRoute>
                  <ProductDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <PrivateRoute>
                  <CartPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <OrdersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/order/:id"
              element={
                <PrivateRoute>
                  <OrderDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/review"
              element={
                <PrivateRoute>
                  <PostReview />
                </PrivateRoute>
              }
            />
            <Route
              path="/complaint/post/:orderId"
              element={
                <PrivateRoute>
                  <ComplaintPost />
                </PrivateRoute>
              }
            />
            <Route
              path="/complaint/:id"
              element={
                <PrivateRoute>
                  <ComplaintDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/complaints/product/:productId"
              element={
                <PrivateRoute>
                  <ItemComplaintDetails />
                </PrivateRoute>
              }
            />

            {/* Seller Routes */}
            <Route
              path="/seller/dashboard"
              element={
                <PrivateRoute allowedRoles={["seller"]}>
                  <SellerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/seller/inventory"
              element={
                <PrivateRoute allowedRoles={["seller"]}>
                  <Inventory />
                </PrivateRoute>
              }
            />
            <Route
              path="/seller/add-product"
              element={
                <PrivateRoute allowedRoles={["seller"]}>
                  <AddProduct />
                </PrivateRoute>
              }
            />
            <Route
              path="/seller/orders"
              element={
                <PrivateRoute allowedRoles={["seller"]}>
                  <SellerOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/seller/edit-product/:id"
              element={
                <PrivateRoute allowedRoles={["seller"]}>
                  <EditProduct />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            {user.role === "admin" && (
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminManageUsers />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/complaints" element={<AdminComplaints />} />
                <Route path="/admin/user/:userId" element={<UserDetails />} />
              </Route>
            )}

            {/* Catch-all for logged-in users: Redirect to Home */}
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
