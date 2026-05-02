import React from "react";
import { FaThLarge, FaCheck } from "react-icons/fa";

const FilterSidebar = ({
  categories,
  activeCategory,
  setCategory,
  tempPrice,
  setTempPrice,
  onApplyPrice,
}) => {
  return (
    <aside className="w-80 border-r border-gray-100 p-8 sticky top-[88px] h-[calc(100vh-88px)] hidden lg:block bg-white overflow-y-auto shrink-0">
      <div className="flex items-center gap-4 text-gray-900 mb-8 px-2">
        <FaThLarge className="text-blue-600" size={18} />
        <h2 className="font-black uppercase tracking-[0.2em] text-xs">
          Explore
        </h2>
      </div>

      {/* Category List */}
      <div className="space-y-2 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat.toLowerCase())}
            className={`w-full text-left px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              activeCategory.toLowerCase() === cat.toLowerCase()
                ? "bg-blue-600 text-white shadow-xl shadow-blue-100"
                : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Price Slider */}
      <div className="pt-8 border-t border-gray-100 px-2">
        <h2 className="font-black uppercase tracking-[0.2em] text-xs mb-8">
          Price Filter
        </h2>
        <input
          type="range"
          min="0"
          max="100000"
          step="1000"
          value={tempPrice}
          onChange={(e) => setTempPrice(e.target.value)}
          className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-6"
        />
        <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 w-fit mb-8 italic">
          Max: ₹{Number(tempPrice).toLocaleString()}
        </div>
        <button
          onClick={onApplyPrice}
          className="w-full py-4 bg-[#1A1A1A] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <FaCheck size={10} /> Apply Price
        </button>
      </div>
    </aside>
  );
};

export default FilterSidebar;
