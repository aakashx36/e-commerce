import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axiosInstance";
import {
  FaCheckCircle,
  FaUser,
  FaStore,
  FaClock,
  FaSearch,
  FaHistory,
  FaArrowLeft,
  FaImage,
  FaArchive,
  FaExclamationCircle,
  FaSearchPlus,
} from "react-icons/fa";
import toast from "react-hot-toast";

const AdminComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [adminNote, setAdminNote] = useState("");

  const fetchComplaints = async () => {
    try {
      const res = await api.get("/api/complaints");
      setComplaints(res.data.data || []);
    } catch (err) {
      toast.error("Failed to sync grievance database");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, note = "") => {
    try {
      const endpoint =
        status === "resolved"
          ? `/api/complaints/${id}/resolve`
          : `/api/complaints/${id}/review`;

      const body = status === "resolved" ? { status, note } : {};

      await api.patch(endpoint, body);
      toast.success(`Protocol Updated: ${status.toUpperCase()}`);

      if (status === "resolved") setSelectedComplaint(null);
      fetchComplaints();
    } catch (err) {
      toast.error("Transition failed: Security Protocol Override");
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filtered = complaints.filter(
    (c) =>
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.buyer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.status.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const pendingItems = filtered.filter((c) => c.status === "pending");
  const reviewItems = filtered.filter((c) => c.status === "under-review");
  const resolvedItems = filtered.filter((c) => c.status === "resolved");

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-black animate-pulse text-blue-600 uppercase tracking-widest">
        Accessing Grievance Protocol...
      </div>
    );

  if (selectedComplaint) {
    return (
      <div className="w-full space-y-8 animate-in slide-in-from-right duration-500 pb-20 max-w-[1800px] mx-auto overflow-hidden">
        <button
          onClick={() => setSelectedComplaint(null)}
          className="flex items-center gap-2 font-black uppercase text-[10px] text-gray-400 hover:text-black transition-all"
        >
          <FaArrowLeft /> Back to Terminal
        </button>

        <div className="w-full bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm space-y-12">
          <div className="flex justify-between items-start border-b pb-8">
            <div className="max-w-[70%]">
              <h1 className="text-5xl font-black italic uppercase tracking-tighter text-gray-900 break-words leading-tight">
                {selectedComplaint.subject}
              </h1>
              <p className="text-[10px] font-black text-gray-400 uppercase mt-4 tracking-widest leading-none break-all">
                Protocol ID: {selectedComplaint._id}
              </p>
            </div>
            <div className="flex gap-4">
              {selectedComplaint.status === "pending" && (
                <button
                  onClick={() =>
                    handleStatusUpdate(selectedComplaint._id, "under-review")
                  }
                  className="px-8 py-3 bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-amber-100 transition-all hover:bg-amber-600"
                >
                  Set Under Review
                </button>
              )}
              <span
                className={`px-10 py-3 rounded-2xl text-[10px] font-black uppercase ${selectedComplaint.status === "resolved" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}
              >
                {selectedComplaint.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
            <div className="space-y-10 overflow-hidden">
              <div className="p-10 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                <h4 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">
                  Statement of Fact
                </h4>
                <p className="text-lg font-bold text-gray-600 leading-relaxed italic break-words">
                  "{selectedComplaint.message}"
                </p>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                  <FaImage /> Visual Evidence Analytics
                </h4>
                <div className="flex flex-wrap gap-6">
                  {selectedComplaint.evidenceImages?.length > 0 ? (
                    selectedComplaint.evidenceImages.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        className="w-44 h-44 object-cover rounded-[2rem] border-4 border-white shadow-xl hover:scale-105 transition-transform cursor-pointer"
                        alt="Evidence"
                      />
                    ))
                  ) : (
                    <p className="text-xs italic text-gray-400">
                      No visual metadata found.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-black text-white p-12 rounded-[3.5rem] shadow-2xl space-y-8 h-fit sticky top-24 overflow-hidden">
              <h3 className="text-2xl font-black italic uppercase text-blue-500 tracking-tighter">
                Resolution Console
              </h3>
              {selectedComplaint.status === "resolved" ? (
                <div className="space-y-6 overflow-hidden">
                  <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">
                    Authenticated Response:
                  </p>
                  <div className="max-w-full overflow-hidden">
                    <p className="text-base font-bold text-gray-300 bg-white/5 p-8 rounded-3xl border border-white/10 italic leading-relaxed break-words">
                      {selectedComplaint.adminResolution?.note ||
                        "Case closed successfully."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <textarea
                    className="w-full h-48 bg-white/5 border border-white/10 rounded-[2rem] p-8 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-gray-600 transition-all resize-none"
                    placeholder="Enter final administrative response..."
                    onChange={(e) => setAdminNote(e.target.value)}
                  />
                  <button
                    onClick={() =>
                      handleStatusUpdate(
                        selectedComplaint._id,
                        "resolved",
                        adminNote,
                      )
                    }
                    className="w-full py-6 bg-blue-600 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-xl shadow-blue-500/20"
                  >
                    <FaCheckCircle className="inline mr-2" /> Authorize
                    Resolution
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderSection = (title, items, icon, colorClass) => (
    <div className="w-full space-y-8 pt-10 overflow-hidden">
      <div className="flex items-center gap-4">
        {icon}
        <h2
          className={`text-2xl font-black uppercase italic tracking-widest ${colorClass}`}
        >
          {title} ({items.length})
        </h2>
        <div className="h-[1px] flex-1 bg-gray-100"></div>
      </div>
      <div className="w-full space-y-6">
        {items.map((c) => (
          <div
            key={c._id}
            className="w-full bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col xl:flex-row justify-between items-center gap-10 hover:shadow-xl transition-all group overflow-hidden"
          >
            <div className="flex-1 space-y-4 overflow-hidden max-w-full">
              <div className="flex gap-3 items-center">
                <span
                  className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase ${c.status === "under-review" ? "bg-amber-500" : c.status === "pending" ? "bg-red-500" : "bg-gray-400"} text-white`}
                >
                  {c.status}
                </span>
                <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase leading-none break-all italic font-mono">
                  ID: {String(c._id).slice(-8)}
                </p>
              </div>
              <h4 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none break-words max-w-full">
                {c.subject}
              </h4>
              <div className="flex gap-8 overflow-hidden">
                <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-2 truncate">
                  <FaUser className="text-blue-600" /> {c.buyer?.name}
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-2 shrink-0">
                  <FaClock className="text-blue-600" />{" "}
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex gap-4 shrink-0">
              <button
                onClick={() => setSelectedComplaint(c)}
                className="px-10 py-5 bg-gray-900 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 shadow-lg transition-all"
              >
                {c.status === "resolved"
                  ? "Review Archive"
                  : "Inspect Protocol"}
              </button>
              <button
                onClick={() => navigate(`/admin/user/${c.buyer?._id}`)}
                className="px-10 py-5 bg-gray-50 border rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest text-gray-400 hover:text-black transition-all"
              >
                User Bio
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-12 pb-20 animate-in fade-in duration-700 max-w-[1800px] mx-auto overflow-hidden px-4">
      <header className="w-full flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm gap-8 sticky top-0 z-40">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none text-gray-900">
          Grievance <span className="text-blue-600">Terminal</span>
        </h1>
        <div className="relative w-full md:w-[500px]">
          <FaSearchPlus className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Subject, User or Status..."
            className="w-full pl-14 pr-8 py-5 bg-gray-50 rounded-[1.5rem] font-black text-[11px] uppercase outline-none focus:ring-4 focus:ring-blue-100 border border-gray-100 transition-all shadow-inner"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {renderSection(
        "Action Required",
        pendingItems,
        <FaExclamationCircle className="text-red-500" />,
        "text-red-600",
      )}
      {renderSection(
        "Under Investigation",
        reviewItems,
        <FaClock className="text-amber-500" />,
        "text-amber-600",
      )}
      {renderSection(
        "Closed Archives",
        resolvedItems,
        <FaArchive className="text-gray-400" />,
        "text-gray-400",
      )}
    </div>
  );
};

export default AdminComplaints;
