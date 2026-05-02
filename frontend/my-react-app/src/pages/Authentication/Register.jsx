import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaStore,
  FaShoppingBag,
  FaArrowRight,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import api from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import toast from "react-hot-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
    // Business Address for Seller
    businessAddress: {
      label: "Warehouse",
      fullName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Seller validation
    if (formData.role === "seller") {
      const { label, fullName, phone, street, city, state, zipCode } =
        formData.businessAddress;
      if (
        !fullName ||
        !phone ||
        !street ||
        !city | !label ||
        !state ||
        !zipCode
      ) {
        toast.error("All business address fields are required for sellers");
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.role === "seller" && {
          businessAddress: formData.businessAddress,
        }),
      };

      await api.post(API_PATHS.AUTH.REGISTER, payload);
      toast.success("Account created successfully! Please login.");
      navigate("/"); // After signup, go to Login
    } catch (error) {
      const message =
        error.response?.data?.message || "Registration failed. Try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessAddress = (field, value) => {
    setFormData({
      ...formData,
      businessAddress: {
        ...formData.businessAddress,
        [field]: value,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] px-4 py-10">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-100/40 border border-gray-50">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-blue-600 italic tracking-tighter mb-2">
            VENDORA
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">
            Create your marketplace account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                <FaUser size={14} />
              </span>
              <input
                type="text"
                required
                className="w-full pl-12 pr-5 py-4 bg-[#F3F5F4] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-800"
                placeholder="Ex: Umesh Gupta"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                <FaEnvelope size={14} />
              </span>
              <input
                type="email"
                required
                className="w-full pl-12 pr-5 py-4 bg-[#F3F5F4] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-800"
                placeholder="name@example.com"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                <FaLock size={14} />
              </span>
              <input
                type="password"
                required
                className="w-full pl-12 pr-5 py-4 bg-[#F3F5F4] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-800"
                placeholder="••••••••"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          {/* Role Selection Tabs */}
          <div className="space-y-3">
            <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">
              Choose Role
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`py-4 rounded-2xl font-black text-sm flex flex-col items-center gap-2 border-2 transition-all ${
                  formData.role === "buyer"
                    ? "border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-100"
                    : "border-gray-100 text-gray-400 bg-gray-50 hover:bg-white"
                }`}
                onClick={() => setFormData({ ...formData, role: "buyer" })}
              >
                <FaShoppingBag size={18} />
                Buyer
              </button>
              <button
                type="button"
                className={`py-4 rounded-2xl font-black text-sm flex flex-col items-center gap-2 border-2 transition-all ${
                  formData.role === "seller"
                    ? "border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-100"
                    : "border-gray-100 text-gray-400 bg-gray-50 hover:bg-white"
                }`}
                onClick={() => setFormData({ ...formData, role: "seller" })}
              >
                <FaStore size={18} />
                Seller
              </button>
            </div>
          </div>

          {/* ==================== BUSINESS ADDRESS FIELDS (Only for Seller) ==================== */}
          {formData.role === "seller" && (
            <div className="space-y-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-amber-600" />
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">
                  Business / Pickup Address
                </label>
              </div>
              <p className="text-[10px] text-amber-600 font-medium">
                * All fields are required for sellers
              </p>

              {/* Label */}
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">
                  Shop Name Address Label (Optional)
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-[#F3F5F4] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-800"
                  placeholder="e.g. Main Warehouse"
                  value={formData.businessAddress.label}
                  onChange={(e) =>
                    updateBusinessAddress("label", e.target.value)
                  }
                />
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 bg-[#F3F5F4] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-800"
                  placeholder="Full Name"
                  value={formData.businessAddress.fullName}
                  onChange={(e) =>
                    updateBusinessAddress("fullName", e.target.value)
                  }
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaPhoneAlt size={14} />
                  </span>
                  <input
                    type="tel"
                    required
                    className="w-full pl-12 pr-5 py-4 bg-[#F3F5F4] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-800"
                    placeholder="+91 98765 43210"
                    value={formData.businessAddress.phone}
                    onChange={(e) =>
                      updateBusinessAddress("phone", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Street */}
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 bg-[#F3F5F4] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-800"
                  placeholder="House No, Street Name"
                  value={formData.businessAddress.street}
                  onChange={(e) =>
                    updateBusinessAddress("street", e.target.value)
                  }
                />
              </div>

              {/* City */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-[#F3F5F4] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-800"
                    placeholder="City"
                    value={formData.businessAddress.city}
                    onChange={(e) =>
                      updateBusinessAddress("city", e.target.value)
                    }
                  />
                </div>

                {/* State */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-[#F3F5F4] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-800"
                    placeholder="State"
                    value={formData.businessAddress.state}
                    onChange={(e) =>
                      updateBusinessAddress("state", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Zip Code */}
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">
                  PIN Code / Zip Code
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 bg-[#F3F5F4] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-800"
                  placeholder="110001"
                  value={formData.businessAddress.zipCode}
                  onChange={(e) =>
                    updateBusinessAddress("zipCode", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2D3E35] text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? (
              "Creating Account..."
            ) : (
              <>
                <FaArrowRight /> Join Vendora
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 font-bold text-sm">
            Already a member?
            <Link
              to="/login"
              className="text-blue-600 font-black ml-2 hover:underline"
            >
              Login Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
