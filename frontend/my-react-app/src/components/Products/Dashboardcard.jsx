import React from "react";

const DashboardCard = ({ title, desc, value, icon: Icon, color }) => {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-50/50 transition-all group cursor-pointer text-left relative overflow-hidden">
      {/* Background Decorative Circle */}
      <div
        className={`absolute -right-4 -top-4 w-24 h-24 ${color} opacity-5 rounded-full group-hover:scale-150 transition-transform duration-500`}
      ></div>

      {/* Icon Section */}
      <div
        className={`w-14 h-14 ${color} rounded-2xl mb-6 flex items-center justify-center text-white shadow-lg shadow-gray-200 group-hover:rotate-12 transition-transform`}
      >
        {Icon && <Icon size={28} strokeWidth={2.5} />}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="font-black text-xl text-gray-800 mb-1">{title}</h3>
        <p className="text-gray-400 font-medium text-sm mb-4">{desc}</p>

        {/* Value (If any, like "12 Orders" or "₹500") */}
        {value && (
          <p className="text-2xl font-black text-blue-600 mt-2 tracking-tight">
            {value}
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
