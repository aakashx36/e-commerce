import React, { useState, useEffect } from "react";
import {
  FaCamera,
  FaPlus,
  FaTrash,
  FaSave,
  FaTimes,
  FaSpinner,
  FaLock,
  FaArrowLeft,
  FaStore,
} from "react-icons/fa";
import { useUser } from "../../context/userContext";
import { uploadToBackend } from "../../utils/uploadToBackend";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const isSeller = user?.role === "seller";

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // For Buyers & Sellers: Add new saved address
  const addAddress = () => {
    const newAddr = {
      label: "Home",
      fullName: user?.name || "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      isDefault: false,
    };
    setUser({
      ...user,
      savedAddresses: [...(user?.savedAddresses || []), newAddr],
    });
  };

  const removeAddress = (idx) => {
    const updated = user.savedAddresses.filter((_, i) => i !== idx);
    setUser({ ...user, savedAddresses: updated });
    toast.error("Address removed locally");
  };

  const handleAddressChange = (idx, e) => {
    const updated = [...user.savedAddresses];
    updated[idx][e.target.name] = e.target.value;
    setUser({ ...user, savedAddresses: updated });
  };

  // For Sellers: Handle Business Address Change
  const handleBusinessAddressChange = (e) => {
    setUser({
      ...user,
      businessAddress: {
        ...user.businessAddress,
        [e.target.name]: e.target.value,
      },
    });
  };

  const saveProfile = async () => {
    // Validation
    if (isSeller) {
      const ba = user.businessAddress || {};
      if (
        !ba.fullName ||
        !ba.phone ||
        !ba.street ||
        !ba.city ||
        !ba.state ||
        !ba.zipCode
      ) {
        return toast.error("Please complete all Business Address fields!");
      }
    }

    // Common validation for saved addresses (both buyer and seller)
    const hasInvalidAddress = (user.savedAddresses || []).some(
      (addr) =>
        !addr.fullName ||
        !addr.phone ||
        !addr.street ||
        !addr.city ||
        !addr.state ||
        !addr.zipCode,
    );

    if (hasInvalidAddress) {
      return toast.error("Complete all Saved Address fields!");
    }

    setIsSaving(true);
    try {
      let finalImg = user?.imageURL;
      if (selectedFile) {
        const urls = await uploadToBackend(selectedFile, "/api/upload");
        finalImg = urls[0];
      }

      // Prepare payload
      const updatedPayload = {
        name: user.name,
        email: user.email,
        imageURL: finalImg,
        savedAddresses: user.savedAddresses || [], // Always send savedAddresses
      };

      // Only sellers send businessAddress
      if (isSeller) {
        updatedPayload.businessAddress = user.businessAddress || {};
      }

      const { data } = await api.put("/api/user/profile", updatedPayload);

      if (data) {
        setUser(data.user || data);
        setIsEditing(false);
        setPreviewUrl(null);
        setSelectedFile(null);
        toast.success("Profile Updated Successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user)
    return (
      <div className="h-screen flex items-center justify-center font-black animate-pulse text-blue-600 tracking-widest">
        VENDORA SYNC...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-3 text-gray-500 hover:text-black transition-colors group font-medium"
        >
          <div className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-2xl group-hover:border-black transition-colors">
            <FaArrowLeft size={18} />
          </div>
          <span className="text-sm uppercase tracking-widest font-black">
            Back to All Products
          </span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto bg-white rounded-[3rem] shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-[#0F172A] p-10 md:p-16 relative flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-40 h-40 rounded-full border-4 border-blue-500/30 p-1.5 bg-slate-800 shadow-2xl relative group">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-700 flex items-center justify-center border-2 border-slate-600">
                {previewUrl || (user?.imageURL && user?.imageURL !== "None") ? (
                  <img
                    src={previewUrl || user?.imageURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-6xl font-black uppercase italic">
                    {user?.name?.[0]}
                  </span>
                )}
              </div>

              {isEditing && (
                <label className="absolute inset-0 bg-blue-600/40 rounded-full flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                  <FaCamera className="text-white text-2xl" />
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </label>
              )}
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
                {user.name}
              </h1>
              <span className="inline-block mt-2 px-4 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">
                {user.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isEditing ? (
              <>
                <button
                  onClick={saveProfile}
                  disabled={isSaving}
                  className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-blue-500 transition-all flex items-center gap-3 active:scale-95"
                >
                  {isSaving ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaSave />
                  )}
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setPreviewUrl(null);
                  }}
                  className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-3.5 rounded-xl font-black text-xs uppercase hover:bg-red-500 hover:text-white transition-all active:scale-95"
                >
                  <FaTimes />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white/10 text-white border border-white/20 px-10 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest backdrop-blur-md hover:bg-white hover:text-slate-900 transition-all shadow-xl active:scale-95"
              >
                Modify Account
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Identity Details */}
            <div className="space-y-10">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] border-b border-slate-100 pb-6 italic">
                Identity Details
              </h3>
              <div className="space-y-6">
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                  <label className="text-[9px] font-black uppercase text-blue-600 mb-2 block tracking-widest">
                    Legal Name
                  </label>
                  <input
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    disabled={!isEditing}
                    className="bg-transparent text-xl font-black uppercase italic w-full outline-none disabled:text-slate-900"
                  />
                </div>

                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex justify-between items-center opacity-80">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 mb-2 block tracking-widest">
                      Verified Email
                    </label>
                    <p className="text-sm font-bold text-slate-500">
                      {user.email}
                    </p>
                  </div>
                  <FaLock className="text-slate-300" />
                </div>
              </div>
            </div>

            {/* Address Sections */}
            <div className="space-y-10">
              {/* 1. Business Address - Only for Seller */}
              {isSeller && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-6">
                    <FaStore className="text-amber-600" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic">
                      Business / Pickup Address
                    </h3>
                  </div>

                  <div
                    className={`p-8 rounded-[2.5rem] border ${isEditing ? "bg-white border-blue-100 shadow-md" : "bg-slate-50 border-slate-100"}`}
                  >
                    {isEditing ? (
                      <div className="space-y-4">
                        <input
                          name="fullName"
                          value={user.businessAddress?.fullName || ""}
                          onChange={handleBusinessAddressChange}
                          className="w-full p-4 bg-slate-50 rounded-xl text-sm font-bold border-none"
                          placeholder="Business Contact Name"
                        />
                        <input
                          name="phone"
                          value={user.businessAddress?.phone || ""}
                          onChange={handleBusinessAddressChange}
                          className="w-full p-4 bg-slate-50 rounded-xl text-sm font-bold border-none"
                          placeholder="Phone Number"
                        />
                        <input
                          name="street"
                          value={user.businessAddress?.street || ""}
                          onChange={handleBusinessAddressChange}
                          className="w-full p-4 bg-slate-50 rounded-xl text-sm font-bold border-none"
                          placeholder="Street / Shop Address"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            name="city"
                            value={user.businessAddress?.city || ""}
                            onChange={handleBusinessAddressChange}
                            className="p-4 bg-slate-50 rounded-xl text-sm font-bold border-none"
                            placeholder="City"
                          />
                          <input
                            name="state"
                            value={user.businessAddress?.state || ""}
                            onChange={handleBusinessAddressChange}
                            className="p-4 bg-slate-50 rounded-xl text-sm font-bold border-none"
                            placeholder="State"
                          />
                        </div>
                        <input
                          name="zipCode"
                          value={user.businessAddress?.zipCode || ""}
                          onChange={handleBusinessAddressChange}
                          className="w-full p-4 bg-slate-50 rounded-xl text-sm font-bold border-none"
                          placeholder="PIN Code"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="font-black uppercase text-slate-900 italic">
                          {user.businessAddress?.fullName}
                        </p>
                        <p className="text-sm text-slate-600 mt-2">
                          {user.businessAddress?.street},{" "}
                          {user.businessAddress?.city} -{" "}
                          {user.businessAddress?.zipCode}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          Phone: {user.businessAddress?.phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. Saved Addresses - Shown for BOTH Buyer and Seller */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic">
                    Saved Addresses
                  </h3>

                  {isEditing && (
                    <button
                      onClick={addAddress}
                      className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    >
                      <FaPlus size={14} />
                    </button>
                  )}
                </div>

                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {(user?.savedAddresses || []).map((addr, idx) => (
                    <div
                      key={idx}
                      className={`p-8 rounded-[2.5rem] transition-all duration-300 border ${
                        isEditing
                          ? "bg-white border-blue-100 shadow-md"
                          : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            name="fullName"
                            value={addr.fullName}
                            onChange={(e) => handleAddressChange(idx, e)}
                            className="col-span-2 p-4 bg-slate-50 rounded-xl text-xs font-bold border-none"
                            placeholder="Full Name"
                          />
                          <input
                            name="street"
                            value={addr.street}
                            onChange={(e) => handleAddressChange(idx, e)}
                            className="col-span-2 p-4 bg-slate-50 rounded-xl text-xs font-bold border-none"
                            placeholder="Street Address"
                          />
                          <input
                            name="city"
                            value={addr.city}
                            onChange={(e) => handleAddressChange(idx, e)}
                            className="p-4 bg-slate-50 rounded-xl text-xs font-bold border-none"
                            placeholder="City"
                          />
                          <input
                            name="zipCode"
                            value={addr.zipCode}
                            onChange={(e) => handleAddressChange(idx, e)}
                            className="p-4 bg-slate-50 rounded-xl text-xs font-bold border-none"
                            placeholder="Zip"
                          />
                          <button
                            onClick={() => removeAddress(idx)}
                            className="col-span-2 text-[10px] font-black text-red-500 uppercase tracking-widest pt-2 hover:underline"
                          >
                            Remove This Address
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[8px] font-black uppercase bg-blue-600 text-white px-3 py-1 rounded-lg tracking-widest">
                            {addr.label}
                          </span>
                          <p className="mt-4 font-black uppercase text-slate-900 italic">
                            {addr.fullName}
                          </p>
                          <p className="text-xs font-bold text-slate-500 mt-1">
                            {addr.street}, {addr.city} - {addr.zipCode}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
