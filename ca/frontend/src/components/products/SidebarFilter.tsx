"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

interface SidebarFilterProps {
  search: string;
  setSearch: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  priceRange: string;
  setPriceRange: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
}

export default function SidebarFilter({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy
}: SidebarFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
    { id: "all", label: "All Collections" },
    { id: "Churidhar", label: "Women - Churidhar" },
    { id: "Saree", label: "Women - Saree" },
    { id: "Kurthy", label: "Women - Kurthy" },
    { id: "Abaya", label: "Women - Abaya" },
    { id: "Maxi", label: "Women - Maxi" },
    { id: "Frocks", label: "Kids - Frocks" },
    { id: "Ethnic Wear", label: "Kids - Ethnic Wear" }
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden w-full mb-6">
        <button
          className="btn-secondary w-full flex items-center justify-center gap-2 py-3"
          onClick={() => setIsOpen(true)}
        >
          <SlidersHorizontal size={16} />
          Filters & Sort
        </button>
      </div>

      {/* Sidebar Overlay (Mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:sticky top-0 md:top-24 left-0 h-full md:h-auto w-[280px] md:w-auto bg-dark-950 md:bg-transparent border-r md:border-r-0 border-dark-800 z-40 md:z-10 p-6 md:p-0 transition-transform duration-350 ease-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex md:hidden justify-between items-center mb-6">
          <h3 className="font-serif text-lg text-white">Filters</h3>
          <button className="text-white hover:text-gold-500" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Search filter */}
        <div className="mb-8">
          <div className="relative flex items-center border border-white/10 focus-within:border-gold-500 transition-colors">
            <Search size={16} className="absolute left-3 text-white/30" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm py-3 pl-10 pr-4 w-full outline-none text-white placeholder-white/30"
            />
          </div>
        </div>

        {/* Categories checklist */}
        <div className="mb-8">
          <h4 className="font-serif text-xs uppercase tracking-[2px] text-gold-500 mb-4 border-b border-dark-800 pb-2">
            Categories
          </h4>
          <div className="flex flex-col space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center space-x-3 cursor-pointer group text-sm text-white/70 hover:text-white">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === cat.id}
                  onChange={() => setSelectedCategory(cat.id)}
                  className="accent-gold-500 h-4 w-4 bg-transparent border-white/20"
                />
                <span className="font-light">{cat.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Ranges selection */}
        <div className="mb-8">
          <h4 className="font-serif text-xs uppercase tracking-[2px] text-gold-500 mb-4 border-b border-dark-800 pb-2">
            Price Range
          </h4>
          <div className="flex flex-col space-y-2">
            {[
              { id: "all", label: "All Prices" },
              { id: "under1000", label: "Under ₹1,000" },
              { id: "1000to3000", label: "₹1,000 - ₹3,000" },
              { id: "3000to5000", label: "₹3,000 - ₹5,000" },
              { id: "above5000", label: "Above ₹5,000" }
            ].map((range) => (
              <label key={range.id} className="flex items-center space-x-3 cursor-pointer text-sm text-white/70 hover:text-white">
                <input
                  type="radio"
                  name="price"
                  checked={priceRange === range.id}
                  onChange={() => setPriceRange(range.id)}
                  className="accent-gold-500 h-4 w-4"
                />
                <span className="font-light">{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sorting Dropdown */}
        <div className="mb-8">
          <h4 className="font-serif text-xs uppercase tracking-[2px] text-gold-500 mb-4 border-b border-dark-800 pb-2">
            Sort By
          </h4>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-dark-950 border border-white/10 p-3 text-sm outline-none text-white focus:border-gold-500 transition-colors"
          >
            <option value="recommended">Recommended</option>
            <option value="newest">Newest Arrivals</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
          </select>
        </div>

        {/* Mobile Apply Button */}
        <div className="md:hidden pt-4">
          <button
            className="btn-primary w-full"
            onClick={() => setIsOpen(false)}
          >
            Apply Filters
          </button>
        </div>
      </aside>
    </>
  );
}
