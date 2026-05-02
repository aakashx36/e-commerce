import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaStore,
  FaPhoneAlt,
  FaImages,
  FaCheckCircle,
  FaHourglassHalf,
  FaReply,
  FaArrowLeft,
} from "react-icons/fa";
import api from "../../utils/axiosInstance";
import { useUser } from "../../context/userContext";

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await api.get(`/api/complaints/${id}`);
        setComplaint(data.data);
      } catch (err) {
        console.error("Fetch failed");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-10 animate-pulse">
        <div className="max-w-6xl mx-auto px-6">
          <div className="w-32 h-6 bg-slate-200 rounded-md mb-10"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-6">
              <div className="w-48 h-8 bg-slate-200 rounded-full mb-4"></div>
              <div className="w-3/4 h-10 bg-slate-200 rounded-xl mb-8"></div>
              <div className="w-full h-40 bg-slate-200 rounded-3xl"></div>
              <div className="w-full h-40 bg-slate-200 rounded-3xl"></div>
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="w-full h-48 bg-slate-200 rounded-3xl"></div>
              <div className="w-full h-64 bg-slate-200 rounded-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const seller = complaint?.seller;
  const bizAddress = seller?.businessAddress;

  const staticSupportMsg = {
    note: "Don't worry, we have received your request. Our team is verifying the evidence with the vendor and we will resolve it as fast as possible. Your satisfaction is our priority.",
    agent: "Support Concierge",
    time: new Date().toLocaleString(),
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 pt-10">
      <div className="max-w-6xl mx-auto px-6">
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
            Back to Dispute History
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-8 space-y-8">
            {/* Subject + Status */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    complaint.status === "pending"
                      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                      : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                  }`}
                >
                  {complaint.status === "pending" ? (
                    <>
                      <FaHourglassHalf size={10} className="animate-pulse" />{" "}
                      Review in Progress
                    </>
                  ) : (
                    <>
                      <FaCheckCircle size={12} /> Case Resolved
                    </>
                  )}
                </span>
                <span className="text-sm font-mono text-slate-400 font-medium">
                  ID: {complaint._id?.toUpperCase().slice(-8)}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {complaint.subject}
              </h1>
            </div>

            {/* Message Body */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-3">
                Customer Statement
              </h4>
              <p className="text-lg leading-relaxed font-medium text-slate-700">
                "{complaint.message}"
              </p>
            </div>

            {/* Evidence Gallery */}
            {complaint.evidenceImages?.length > 0 && (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FaImages size={14} /> Submitted Evidence
                </h4>
                <div className="flex flex-wrap gap-4">
                  {complaint.evidenceImages.map((img, i) => (
                    <a
                      key={i}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-32 h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-sm group block"
                    >
                      <img
                        src={img}
                        alt="Evidence"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Official Response */}
            <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-blue-100/50 pb-3">
                <FaReply className="text-blue-600" size={14} />
                <h4 className="font-bold uppercase text-xs tracking-widest text-blue-600">
                  Official Resolution
                </h4>
              </div>
              <p className="text-base font-medium leading-relaxed text-slate-800">
                {complaint.adminResolution?.note || staticSupportMsg.note}
              </p>
              <div className="mt-6 pt-4 border-t border-blue-100/50 text-xs font-semibold text-slate-500 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <FaCheckCircle size={10} />
                  </div>
                  <span>
                    {complaint.adminResolution
                      ? "Admin Verified"
                      : staticSupportMsg.agent}
                  </span>
                </div>
                <span>
                  {new Date(
                    complaint.adminResolution?.resolvedAt ||
                      staticSupportMsg.time,
                  ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR - VENDOR & STATUS */}
          <div className="lg:col-span-4">
            <div className="sticky top-8 space-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
                <div
                  className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm ${
                    complaint.status === "pending"
                      ? "bg-amber-50 text-amber-500 ring-1 ring-amber-100"
                      : "bg-emerald-50 text-emerald-500 ring-1 ring-emerald-100"
                  }`}
                >
                  {complaint.status === "pending" ? (
                    <FaHourglassHalf className="animate-pulse" />
                  ) : (
                    <FaCheckCircle />
                  )}
                </div>
                <p className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-1">
                  Current Status
                </p>
                <p className="text-xl font-bold capitalize text-slate-900">
                  {complaint.status}
                </p>
              </div>

              {/* Vendor Information */}
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                    <FaStore size={16} />
                  </div>
                  <div>
                    <h4 className="uppercase text-[10px] font-bold tracking-widest text-slate-400">
                      Origin Vendor
                    </h4>
                    <h2 className="text-lg font-bold text-slate-900">
                      {seller?.name || "Private Seller"}
                    </h2>
                  </div>
                </div>

                {bizAddress && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <FaMapMarkerAlt
                        className="text-slate-400 mt-1 shrink-0"
                        size={14}
                      />
                      <div className="text-sm font-medium text-slate-600 leading-relaxed">
                        {bizAddress.street}, {bizAddress.city}
                        <br />
                        {bizAddress.state} - {bizAddress.zipCode}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <FaPhoneAlt
                        className="text-slate-400 shrink-0"
                        size={14}
                      />
                      <div className="text-sm font-medium text-slate-600">
                        {bizAddress.phone}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
