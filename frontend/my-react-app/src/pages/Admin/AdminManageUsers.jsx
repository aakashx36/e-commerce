import React, { useState, useEffect } from "react";
import api from "../../utils/axiosInstance";
import {
  FaUserCircle,
  FaToggleOn,
  FaToggleOff,
  FaArrowRight,
  FaSearch,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/admin/users");
      setUsers(res.data.users);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusToggle = (e, userId) => {
    e.stopPropagation(); // Safe side ke liye rakha hai
    api
      .patch(`/api/admin/toggle-status/${userId}`)
      .then((res) => {
        toast.success(res.data.message);
        fetchUsers();
      })
      .catch(() => toast.error("Status update failed"));
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="p-20 font-black animate-pulse text-blue-600">
        SCANNING TERMINALS...
      </div>
    );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase">
            User <span className="text-blue-600">Governance</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
            Manage Buyers & Marketplace Partners
          </p>
        </div>

        <div className="relative group">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl w-full md:w-80 shadow-sm focus:ring-2 focus:ring-blue-600 outline-none font-bold text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            // 🚨 REMOVED onClick FROM HERE (Card level)
            className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm transition-all relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-50 rounded-full"></div>

            <div className="flex items-center gap-5 mb-8 relative z-10">
              <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden border-4 border-gray-50 shadow-inner">
                {user.imageURL && user.imageURL !== "None" ? (
                  <img
                    src={user.imageURL}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-2xl font-black italic">
                    {user.name[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-black italic uppercase tracking-tight text-xl leading-tight">
                  {user.name}
                </h3>
                <div className="flex gap-2 mt-2">
                  <span
                    className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${user.role === "seller" ? "bg-black text-white" : "bg-blue-100 text-blue-600"}`}
                  >
                    {user.role}
                  </span>
                  <span
                    className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${user.status === "active" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 relative z-10">
              <button
                onClick={(e) => handleStatusToggle(e, user._id)}
                className="flex items-center gap-2 group/btn"
              >
                {user.status === "active" ? (
                  <FaToggleOn
                    size={32}
                    className="text-emerald-500 hover:text-emerald-600 transition-colors"
                  />
                ) : (
                  <FaToggleOff
                    size={32}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  />
                )}
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover/btn:text-black">
                  {user.status === "active" ? "Disable" : "Activate"}
                </span>
              </button>

              {/* 🚨 NAVIGATION ONLY ON THIS SECTION 🚨 */}
              <div
                onClick={() => navigate(`/admin/user/${user._id}`)}
                className="flex items-center gap-2 font-black text-[10px] uppercase tracking-tighter text-blue-600 hover:text-blue-800 hover:translate-x-2 transition-all cursor-pointer"
              >
                View Intelligence <FaArrowRight />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageUsers;
