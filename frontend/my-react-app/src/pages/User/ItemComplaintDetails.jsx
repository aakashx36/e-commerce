import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaShieldAlt,
  FaUser,
  FaImage,
  FaArrowRight,
  FaClipboardList,
} from "react-icons/fa";
import api from "../../utils/axiosInstance";
import { useUser } from "../../context/userContext";
import toast from "react-hot-toast";

const ItemComplaintDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!productId) {
        toast.error("Product ID is missing");
        navigate(-1);
        return;
      }

      try {
        setLoading(true);
        const { data } = await api.get(`/api/complaints/product/${productId}`);
        setComplaints(data.data || []);
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to load complaints");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [productId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-10 animate-pulse">
        <div className="max-w-4xl mx-auto px-6">
          <div className="w-32 h-6 bg-slate-200 rounded-md mb-8"></div>
          <div className="w-48 h-10 bg-slate-200 rounded-lg mb-10"></div>
          <div className="w-full h-48 bg-slate-200 rounded-3xl mb-6"></div>
          <div className="w-full h-48 bg-slate-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-10">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-slate-500 font-medium text-sm hover:text-blue-600 transition-colors w-fit"
          >
            <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 group-hover:border-blue-200 transition-colors">
              <FaArrowLeft
                size={12}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
            </div>
            Back to Order Details
          </button>
        </div>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Dispute History
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <FaShieldAlt className="text-blue-500" />
            Product ID:{" "}
            <span className="font-mono bg-slate-200/60 px-2 py-0.5 rounded text-slate-700">
              {productId}
            </span>
          </div>
        </header>

        {complaints.length === 0 ? (
          <div className="bg-white py-20 px-6 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <FaClipboardList className="text-3xl text-slate-300" />
            </div>
            <p className="text-xl font-bold text-slate-800 mb-2">
              No Disputes Found
            </p>
            <p className="text-slate-500 text-sm">
              There is no recorded complaint history for this specific product.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {complaints.map((comp, index) => (
              <div
                key={comp._id}
                className={`bg-white rounded-3xl p-6 sm:p-8 shadow-sm border transition-all ${
                  index === 0
                    ? "border-blue-200 shadow-md ring-1 ring-blue-500/10"
                    : "border-slate-200"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div
                      className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${
                        comp.status === "resolved"
                          ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                          : "bg-amber-50 text-amber-500 ring-1 ring-amber-100"
                      }`}
                    >
                      {comp.status === "resolved" ? (
                        <FaCheckCircle size={20} />
                      ) : (
                        <FaClock size={20} />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                            index === 0
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {index === 0 ? "Latest Record" : "Previous"}
                        </span>
                        <span className="px-3 py-1 bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-full">
                          {comp.subject}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 leading-relaxed mb-3">
                        "{comp.message}"
                      </h3>

                      {comp.seller && (
                        <p className="text-sm text-slate-600 flex items-center gap-1.5 font-medium">
                          <FaUser className="text-slate-400" size={12} />{" "}
                          Seller:{" "}
                          <span className="text-slate-800">
                            {comp.seller.name}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex md:justify-end">
                    <span
                      className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider h-fit ${
                        comp.status === "resolved"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                          : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                      }`}
                    >
                      {comp.status}
                    </span>
                  </div>
                </div>

                {/* Evidence Images */}
                {comp.evidenceImages?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                      <FaImage /> Attached Evidence
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {comp.evidenceImages.map((img, i) => (
                        <a
                          key={i}
                          href={img}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-20 h-20 sm:w-24 sm:h-24"
                        >
                          <img
                            src={img}
                            alt={`Evidence ${i + 1}`}
                            className="w-full h-full object-cover rounded-xl border border-slate-200 shadow-sm hover:ring-2 hover:ring-blue-500/50 transition-all cursor-zoom-in"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Resolution */}
                {comp.adminResolution?.note && (
                  <div className="mt-6 bg-blue-50/50 border border-blue-100 p-5 rounded-2xl">
                    <p className="uppercase text-blue-600 text-[10px] font-bold tracking-widest mb-2 flex items-center gap-1.5">
                      <FaShieldAlt size={10} /> Official Support Response
                    </p>
                    <p className="text-slate-700 font-medium text-sm leading-relaxed">
                      "{comp.adminResolution.note}"
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-3">
                      Resolved on:{" "}
                      {new Date(
                        comp.adminResolution.resolvedAt,
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}

                {/* View Full Details Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => navigate(`/complaint/${comp._id}`)}
                    className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-sm transition-all bg-white px-4 py-2 border border-blue-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200"
                  >
                    View Details
                    <FaArrowRight
                      size={12}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemComplaintDetails;
