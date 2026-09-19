import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

// ======================================================
// SAMPLE PRODUCTS DATA
// ======================================================
const INITIAL_PRODUCTS = [
  {
    id: 1,
    title: "Hacksaw frame full size",
    brand: "PEDWAL",
    material: "Carbonated Iron",
    price: 1,
    stock: 9618,
    category: "Hacksaw frame",
    inStock: true,
    image: "https://via.placeholder.com/200?text=Hacksaw+Frame",
  },
  {
    id: 2,
    title: "Junior hacksaw frame with blade",
    brand: "PEDWAL",
    material: "Carbonated Iron",
    price: 20,
    stock: 9735,
    category: "Junior hacksaw",
    inStock: true,
    image: "https://via.placeholder.com/200?text=Junior+Hacksaw",
  },
  {
    id: 3,
    title: "Measuring tape pair 3m+5m",
    brand: "PEDWAL",
    material: "Carbonated Iron",
    price: 80,
    stock: 9998,
    category: "Measuring tape",
    inStock: true,
    image: "https://via.placeholder.com/200?text=Measuring+Tape",
  },
  {
    id: 4,
    title: "Heavy Duty Hammer",
    brand: "PEDWAL",
    material: "Cast Iron",
    price: 150,
    stock: 4500,
    category: "Hammers",
    inStock: true,
    image: "https://via.placeholder.com/200?text=Hammer",
  },
  {
    id: 5,
    title: "40 PC Socket Wrench Set",
    brand: "PEDWAL",
    material: "Chrome Vanadium",
    price: 450,
    stock: 2100,
    category: "Socket set",
    inStock: true,
    image: "https://via.placeholder.com/200?text=Socket+Set",
  },
  {
    id: 6,
    title: "Precision Screwdriver Set",
    brand: "PEDWAL",
    material: "Alloy Steel",
    price: 120,
    stock: 890,
    category: "Screwdrivers",
    inStock: true,
    image: "https://via.placeholder.com/200?text=Screwdriver+Set",
  },
];

const CATEGORIES = [
  { name: "Hacksaw frame", count: 1 },
  { name: "Junior hacksaw", count: 1 },
  { name: "Measuring tape", count: 1 },
  { name: "Hammers", count: 1 },
  { name: "Socket set", count: 1 },
  { name: "Screwdrivers", count: 1 },
];

const ProductListingPage = () => {
  const [maxPrice, setMaxPrice] = useState(5000);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Filter Logic
  const filteredProducts = INITIAL_PRODUCTS.filter((product) => {
    const matchesPrice = product.price <= maxPrice;
    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;
    return matchesPrice && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#F5F6F4] text-[#15181C] py-8 px-4 sm:px-8">
      {/* PAGE HEADER */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Our products
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse the current collection of tools & hardware
        </p>
      </div>

      {/* MAIN CONTAINER (FLEX LAYOUT) */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
        
        {/* ====================================================== */}
        {/* 1. FIXED FILTER SIDEBAR (lg:sticky keeps it fixed on desktop) */}
        {/* ====================================================== */}
        <aside className="w-full lg:w-72 flex-shrink-0 bg-[#213543] text-white p-5 rounded-3xl shadow-sm lg:sticky lg:top-6 transition-all">
          <div className="flex items-center gap-2 mb-6">
            <Filter size={20} className="text-[#F0A420]" />
            <h2 className="text-xl font-bold tracking-wide">Filters</h2>
          </div>

          {/* SHOP BY CATEGORY SECTION */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-gray-300">
                Shop by category
              </span>
              <span className="text-xs bg-slate-700/80 text-gray-300 font-bold px-2 py-0.5 rounded-full">
                {INITIAL_PRODUCTS.length}
              </span>
            </div>

            {/* Category horizontal scroll container */}
            <div className="flex items-center gap-1.5 mb-2">
              <button className="p-1 rounded-full bg-slate-700/50 hover:bg-slate-700 text-gray-300">
                <ChevronLeft size={14} />
              </button>
              <button className="p-1 rounded-full bg-slate-700/50 hover:bg-slate-700 text-gray-300">
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === cat.name ? null : cat.name
                    )
                  }
                  className={`min-w-[100px] p-3 rounded-2xl text-left border transition flex flex-col justify-between ${
                    selectedCategory === cat.name
                      ? "bg-[#F0A420] text-black border-[#F0A420]"
                      : "bg-slate-800/40 text-gray-200 border-slate-700/60 hover:border-slate-500"
                  }`}
                >
                  <span className="text-[11px] font-medium line-clamp-2 leading-tight">
                    {cat.name}
                  </span>
                  <span className="text-[10px] opacity-75 mt-2">
                    {cat.count} item
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* PRICE SLIDER SECTION */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-gray-300">
                Maximum price
              </span>
              <span className="bg-[#F0A420] text-black text-xs font-extrabold px-2.5 py-1 rounded-lg">
                ₹{maxPrice}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="5000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#F0A420]"
            />

            <div className="flex justify-between text-[11px] text-gray-400 mt-2 font-medium">
              <span>₹0</span>
              <span>₹5000+</span>
            </div>
          </div>
        </aside>

        {/* ====================================================== */}
        {/* 2. SCROLLABLE PRODUCT GRID */}
        {/* ====================================================== */}
        <main className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl p-4 border border-[#E6E8EB] flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  {/* Image Container with In Stock Badge */}
                  <div className="relative w-full h-48 bg-[#F1F2EF] rounded-2xl mb-4 overflow-hidden flex items-center justify-center p-4">
                    {product.inStock && (
                      <span className="absolute top-2.5 right-2.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        In stock
                      </span>
                    )}
                    <img
                      src={product.image}
                      alt={product.title}
                      className="max-h-full object-contain"
                    />
                  </div>

                  {/* Title & Specs */}
                  <h3 className="font-bold text-base line-clamp-2 mb-2 text-[#15181C]">
                    {product.title}
                  </h3>
                  <div className="text-xs text-gray-500 space-y-0.5 mb-4">
                    <p>
                      Brand: <span className="font-medium text-gray-700">{product.brand}</span>
                    </p>
                    <p>
                      Material: <span className="font-medium text-gray-700">{product.material}</span>
                    </p>
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Price</span>
                      <span className="text-xl font-extrabold text-[#15181C]">
                        ₹{product.price}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block">Stock</span>
                      <span className="text-sm font-bold text-emerald-600">
                        {product.stock}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button className="bg-[#2B4A5E] hover:bg-[#1f3747] text-white text-xs font-bold py-2.5 rounded-xl transition">
                      Buy now
                    </button>
                    <button className="bg-[#F0A420] hover:bg-[#d99115] text-black text-xs font-bold py-2.5 rounded-xl transition">
                      Add to cart
                    </button>
                  </div>

                  <button className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold py-2 rounded-xl transition">
                    View more varieties
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-gray-200">
              <p className="text-gray-500 font-medium text-sm">
                No products match the selected filters.
              </p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default ProductListingPage;
