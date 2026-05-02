import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../context/userContext"; //

// Apne teeno Navbars yahan import karein
import BuyerNavbar from "./BuyerNavbar";
import SellerNavbar from "./SellerNavbar";

const GlobalNavbar = ({ isSellerMode, setIsSellerMode }) => {
  const { user } = useUser();
  const location = useLocation(); // 📍 URL path track karne ke liye
  const navigate = useNavigate();

  // 1. LANDING PAGE LOGIC: Agar URL '/' ya '/home' hai
  // Role chahe jo bhi ho, HomeNavbar hi dikhega
  if (location.pathname === "/home") {
    return null;
  }

  // 2. AUTH CHECK: Agar user login nahi hai (Guest)
  if (!user || user.role === "admin") return null;

  // 3. SWITCH LOGIC: Mode toggle handle karne wala function
  const handleModeToggle = () => {
    if (isSellerMode) {
      // Seller Dashboard se Buyer View mein jaana
      setIsSellerMode(false);
      navigate("/products"); // Shopping gallery par bhej do
    } else {
      // Buyer View se wapas Seller Dashboard mein jaana
      setIsSellerMode(true);
      navigate("/seller/dashboard"); // Dashboard par bhej do
    }
  };

  // 4. BUYER ROLE: Agar user database mein sirf 'buyer' hai
  if (user.role === "buyer") {
    return <BuyerNavbar user={user} />;
  }

  // 5. SELLER ROLE: Agar user 'seller' hai, toh current view ke basis par Navbar dikhao
  // isSellerMode true = Business UI (SellerNavbar)
  // isSellerMode false = Consumer UI (BuyerNavbar)
  return isSellerMode ? (
    <SellerNavbar user={user} onSwitch={handleModeToggle} />
  ) : (
    <BuyerNavbar
      user={user}
      isSeller={true} // Prop pass kiya taaki BuyerNavbar mein 'Switch' button dikhe
      onSwitch={handleModeToggle}
    />
  );
};

export default GlobalNavbar;
