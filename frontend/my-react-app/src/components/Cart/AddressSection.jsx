import React from "react";
import {
  FaHome,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRegBuilding,
} from "react-icons/fa";

const AddressSection = ({
  savedAddresses,
  selectedAddress,
  setSelectedAddress,
  manualAddress,
  setManualAddress,
  addressMode,
  setAddressMode,
  onSaveManualAddress,
}) => {
  const handleManualChange = (e) =>
    setManualAddress({ ...manualAddress, [e.target.name]: e.target.value });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* Segmented Control for Tabs */}
      <div className="flex p-1 bg-slate-100/80 rounded-xl w-full max-w-sm mx-auto sm:mx-0">
        <button
          type="button"
          onClick={() => setAddressMode("saved")}
          className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
            addressMode === "saved"
              ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Saved Addresses
        </button>
        <button
          type="button"
          onClick={() => setAddressMode("manual")}
          className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
            addressMode === "manual"
              ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Add New Address
        </button>
      </div>

      {addressMode === "saved" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {savedAddresses?.length === 0 ? (
            <div className="col-span-full py-10 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              No saved addresses found. Please add a new one.
            </div>
          ) : (
            savedAddresses?.map((addr) => (
              <div
                key={addr._id}
                onClick={() => setSelectedAddress(addr)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all relative ${
                  selectedAddress?._id === addr._id
                    ? "border-blue-500 bg-blue-50/30 shadow-md"
                    : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm"
                }`}
              >
                {selectedAddress?._id === addr._id && (
                  <div className="absolute top-4 right-4 bg-white rounded-full">
                    <FaCheckCircle className="text-blue-500" size={20} />
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedAddress?._id === addr._id
                        ? "bg-blue-100 text-blue-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {addr.label === "Work" ? (
                      <FaRegBuilding size={16} />
                    ) : (
                      <FaHome size={16} />
                    )}
                  </div>
                  <p className="font-semibold text-slate-900 text-lg">
                    {addr.fullName}
                  </p>
                </div>

                <div className="space-y-1.5 text-slate-600 text-sm">
                  <p className="flex items-start gap-2">
                    <FaMapMarkerAlt
                      className="mt-1 text-slate-400 shrink-0"
                      size={12}
                    />
                    <span>
                      {addr.street}, {addr.city}
                      <br />
                      {addr.state} - {addr.zipCode}
                    </span>
                  </p>
                  <p className="flex items-center gap-2 pt-2 text-slate-500 font-medium">
                    <FaPhoneAlt className="text-slate-400 shrink-0" size={12} />
                    {addr.phone}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <FaMapMarkerAlt className="text-blue-500" size={18} />
            <h3 className="font-semibold text-lg text-slate-800">
              Delivery Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { name: "fullName", label: "Full Name", placeholder: "John Doe" },
              {
                name: "phone",
                label: "Phone Number",
                placeholder: "+91 9876543210",
              },
              {
                name: "street",
                label: "Street Address",
                placeholder: "123 Main St, Apt 4B",
              },
              { name: "city", label: "City", placeholder: "Mumbai" },
              { name: "state", label: "State", placeholder: "Maharashtra" },
              {
                name: "zipCode",
                label: "ZIP / Postal Code",
                placeholder: "400001",
              },
            ].map((field) => (
              <div key={field.name} className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 ml-1">
                  {field.label}
                </label>
                <input
                  name={field.name}
                  value={manualAddress[field.name] || ""}
                  onChange={handleManualChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-800 placeholder-slate-400"
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={onSaveManualAddress}
              disabled={Object.values(manualAddress).some((v) => !v?.trim())}
              className="w-full md:w-auto md:px-10 py-3.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-blue-600 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save & Deliver Here
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSection;
