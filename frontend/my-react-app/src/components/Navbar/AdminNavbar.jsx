// components/Navbar/AdminNavbar.jsx
import { Link, useNavigate } from "react-router-dom";
import {
  FaUserShield,
  FaUsers,
  FaExclamationTriangle,
  FaSignOutAlt,
} from "react-icons/fa";
import { useUser } from "../../context/userContext"; // Context import karein
import toast from "react-hot-toast";

const AdminNavbar = () => {
  const { user, setUser, logout } = useUser(); // user aur setUser dono lein
  const navigate = useNavigate();

  // components/Navbar/AdminNavbar.jsx update
  const handleLogout = () => {
    try {
      // 1. Context wala logout call karein (jo token bhi clear karta hai)
      // A. Pehle state ko local variable mein clear karein
      const clearSession = () => {
        localStorage.removeItem("token");
        localStorage.clear();
        sessionStorage.clear();
      };

      clearSession();

      // B. Context Logout call karein
      logout();
      setUser(null);

      // C. Hard Redirect (Poora page refresh karke login par phenk do)
      // Isse Memory leak ya state flash hone ka sawal hi paida nahi hota
      window.location.replace("/");
      toast.success("Admin Session Ended");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };
  return (
    <nav className="w-full bg-black border-b-2 border-blue-600 sticky top-0 z-[1000] py-3">
      <div className="max-w-[1440px] mx-auto px-10 flex items-center justify-between">
        {/* Logo */}
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <span className="text-2xl font-black text-white italic tracking-tighter uppercase">
            Vendora <span className="text-blue-600">Admin</span>
          </span>
        </Link>

        {/* Links & Logout */}
        <div className="flex items-center gap-8">
          <Link
            to="/admin/users"
            className="text-gray-400 hover:text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
          >
            <FaUsers /> Manage Users
          </Link>

          <div className="flex items-center gap-4 border-l border-white/10 pl-6">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">
              {user?.name?.[0]}
            </div>

            {/* ✅ Same Logout style as Home.jsx */}
            <button
              onClick={handleLogout}
              className="p-2.5 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
              title="Logout"
            >
              <FaSignOutAlt size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
