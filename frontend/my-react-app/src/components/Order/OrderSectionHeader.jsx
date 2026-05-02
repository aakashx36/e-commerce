import React from "react";

const OrderSectionHeader = ({ icon: Icon, title, count, colorClass }) => (
  <div className="flex items-center gap-4 mb-10">
    <div
      className={`w-12 h-12 ${colorClass} rounded-[1.2rem] flex items-center justify-center shadow-lg`}
    >
      <Icon size={20} />
    </div>
    <div>
      <h2 className="text-2xl font-black uppercase tracking-tight italic text-gray-800 leading-none">
        {title}
      </h2>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
        {count} {count === 1 ? "Transaction" : "Transactions"} Found
      </p>
    </div>
  </div>
);

export default OrderSectionHeader;
