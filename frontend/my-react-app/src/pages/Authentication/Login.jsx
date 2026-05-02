import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../../context/userContext";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [btnLoading, setBtnLoading] = useState(false); // ✅ Correct state name
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true); // ✅ Fixed: used btnLoading instead of setLoading

    const result = await login(email, password);
    setBtnLoading(false); // ✅ Fixed

    if (result.success) {
      // ✅ Role Based Navigation with correct absolute paths
      if (result.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        // Buyer aur Seller dono ko filhal /home par bhej rahe hain
        // kyunki Home page par role-based logic laga hua hai
        navigate("/products");
        toast.success(`Welcome back, ${result.role}!`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-100/40 border border-gray-50">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-blue-600 italic tracking-tighter mb-2">
            VENDORA
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest italic">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                <FaEnvelope size={14} />
              </span>
              <input
                type="email"
                required
                className="w-full pl-12 pr-5 py-4 bg-[#F3F5F4] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest italic">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                <FaLock size={14} />
              </span>
              <input
                type="password"
                required
                className="w-full pl-12 pr-5 py-4 bg-[#F3F5F4] border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={btnLoading}
            className="w-full bg-[#2D3E35] text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {btnLoading ? (
              "Authenticating..."
            ) : (
              <>
                <FaArrowRight /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 font-bold text-sm">
            New to Vendora?
            <Link
              to="/register" // ✅ Fixed: Pointing to register instead of login
              className="text-blue-600 font-black ml-2 hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
