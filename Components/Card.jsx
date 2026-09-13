// ======================================================
// IMPORTS
// ======================================================
import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Hammer,
  Wrench,
  Drill,
  Shield,
  Ruler,
  Cog,
  Settings,
  Package,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
} from "lucide-react";
import { CartContext } from "../Components/Context";

// ======================================================
// DESIGN TOKENS
// ======================================================
const INK = "#15181C";
const MUTED = "#6B7280";
const BORDER = "#E6E8EB";
const SURFACE = "#FFFFFF";
const BG = "#F8F9FA";
const AMBER = "#F0A420";
const AMBER_DARK = "#C97F0F";
const STEEL = "#2B4A5E";

const Card = () => {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const categoryScrollRef = useRef(null);

  // ======================================================
  // STATES
  // ======================================================
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // ======================================================
  // FETCH PRODUCTS
  // ======================================================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        "https://backend-3-axez.onrender.com/api/products"
      );
      if (data.success) {
        setProducts(data.products || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ======================================================
  // CATEGORIES & HELPERS
  // ======================================================
  const categories = [
    ...new Set(
      products.map((item) => item.category || item.name).filter(Boolean)
    ),
  ];

  const categoryIcons = {
    Hammer: Hammer,
    Hammers: Hammer,
    Wrench: Wrench,
    Wrenches: Wrench,
    Drill: Drill,
    Drills: Drill,
    Safety: Shield,
    Measuring: Ruler,
    Hardware: Cog,
    Accessories: Settings,
    Package: Package,
  };

  const getCategoryIcon = (category) => {
    if (!category) return Package;
    return categoryIcons[category] || Package;
  };

  const handleCategory = (category) => {
    setSelectedCategory((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const getLowestPrice = (product) => {
    if (product.pricing && product.pricing.length > 0) {
      return Math.min(
        ...product.pricing.map((item) => Number(item.price) || 0)
      );
    }
    return Number(product.price || 0);
  };

  const filteredProducts = products.filter((product) => {
    const productCategory = product.category || product.name;
    const categoryMatch =
      selectedCategory.length === 0 ||
      selectedCategory.includes(productCategory);
    const priceMatch = getLowestPrice(product) <= maxPrice;
    return categoryMatch && priceMatch;
  });

  useEffect(() => {
    setVisibleProducts(8);
  }, [selectedCategory, maxPrice]);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = 240;
      categoryScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const activeFiltersCount =
    selectedCategory.length + (maxPrice < 5000 ? 1 : 0);

  // ======================================================
  // LOADING SKELETON
  // ======================================================
  if (loading) {
    return (
      <div className="min-h-screen py-8" style={{ background: BG }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-8 w-48 rounded-lg shimmer mb-6" style={{ background: BORDER }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl shimmer" style={{ background: SURFACE }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16" style={{ background: BG }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: INK }}>
              Explore Collection
            </h1>
            <p className="text-sm mt-1" style={{ color: MUTED }}>
              Premium industrial tools & hardware equipment
            </p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {filteredProducts.length} Items Available
          </p>
        </div>

        {/* MODERN CONTROL BAR: Horizontal Scroll Categories + Filter Drawer Button */}
        <div className="sticky top-4 z-30 mb-8 p-2.5 rounded-2xl shadow-sm border backdrop-blur-md bg-white/80 flex items-center gap-3">
          
          {/* Main Filter Drawer Trigger Button */}
          <button
            onClick={() => setShowFilterDrawer(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-white font-medium text-sm transition-all shrink-0 hover:opacity-95 active:scale-95"
            style={{ background: STEEL }}
          >
            <SlidersHorizontal size={16} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span
                className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ml-1"
                style={{ background: AMBER, color: "#1A1200" }}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="h-6 w-[1px] bg-gray-200 shrink-0" />

          {/* Horizontal Category Scroll Bar */}
          <div className="relative flex-1 overflow-hidden flex items-center">
            <button
              onClick={() => scrollCategories("left")}
              className="hidden md:flex p-1 rounded-full hover:bg-gray-100 text-gray-600 shrink-0 mr-1"
            >
              <ChevronLeft size={18} />
            </button>

            <div
              ref={categoryScrollRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide py-1 scroll-smooth w-full"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <button
                onClick={() => setSelectedCategory([])}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory.length === 0
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                All Products
              </button>

              {categories.map((category) => {
                const active = selectedCategory.includes(category);
                const Icon = getCategoryIcon(category);
                return (
                  <button
                    key={category}
                    onClick={() => handleCategory(category)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                      active
                        ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{category}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => scrollCategories("right")}
              className="hidden md:flex p-1 rounded-full hover:bg-gray-100 text-gray-600 shrink-0 ml-1"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* ACTIVE FILTER TAG CHIPS */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-semibold text-gray-400 mr-1">Active:</span>
            {selectedCategory.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-900 border border-amber-200"
              >
                {cat}
                <X
                  size={12}
                  className="cursor-pointer hover:opacity-75"
                  onClick={() => handleCategory(cat)}
                />
              </span>
            ))}
            {maxPrice < 5000 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                Under ₹{maxPrice}
                <X
                  size={12}
                  className="cursor-pointer hover:opacity-75"
                  onClick={() => setMaxPrice(5000)}
                />
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCategory([]);
                setMaxPrice(5000);
              }}
              className="text-xs text-rose-600 font-semibold hover:underline flex items-center gap-1 ml-2"
            >
              <RotateCcw size={12} /> Clear all
            </button>
          </div>
        )}

        {/* PRODUCT GRID */}
        {filteredProducts.length === 0 ? (
          <div
            className="h-80 flex flex-col justify-center items-center rounded-3xl border bg-white text-center p-6"
          >
            <Package size={48} className="text-gray-300 mb-3" />
            <h3 className="text-lg font-bold" style={{ color: INK }}>
              No matches found
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4">
              Try removing some of your active filter selections to view available catalog products.
            </p>
            <button
              onClick={() => {
                setSelectedCategory([]);
                setMaxPrice(5000);
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.slice(0, visibleProducts).map((product) => {
              const finalPrice = getLowestPrice(product) || Number(product.price) || 0;
              const inStock = product.stock > 0;

              return (
                <div
                  key={product._id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 bg-gray-50 flex items-center justify-center p-4">
                      <img
                        src={product.images?.[0] || "/no-image.png"}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          e.target.src = "/no-image.png";
                        }}
                      />
                      {product.offer > 0 && (
                        <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md">
                          {product.offer}% OFF
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h2 className="font-bold text-sm text-gray-900 line-clamp-1">
                        {product.name}
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {product.brand || "Industrial Grade"}
                      </p>
                      <div className="flex items-baseline gap-2 mt-3">
                        <span className="text-lg font-black text-gray-900">
                          ₹{finalPrice}
                        </span>
                        <span className={`text-[10px] font-bold ${inStock ? "text-emerald-600" : "text-rose-500"}`}>
                          {inStock ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        navigate(`/product/${product._id}`, { state: { product } })
                      }
                      className="py-2 rounded-xl text-xs font-semibold text-slate-700 bg-gray-100 hover:bg-gray-200 transition"
                    >
                      Details
                    </button>
                    <button
                      disabled={!inStock}
                      onClick={() =>
                        addToCart({
                          ...product,
                          quantity: 1,
                          price: finalPrice,
                        })
                      }
                      className="py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {filteredProducts.length > visibleProducts && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setVisibleProducts((prev) => prev + 8)}
              className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-xs transition hover:bg-slate-800"
            >
              Load More Products
            </button>
          </div>
        )}
      </div>

      {/* MODERN OVERLAY FILTER DRAWER */}
      {showFilterDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowFilterDrawer(false)}
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-slide-left">
            {/* Drawer Header */}
            <div className="p-5 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-slate-900" />
                <h2 className="font-bold text-base text-slate-900">Filter Options</h2>
              </div>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Category Checkboxes */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const isChecked = selectedCategory.includes(category);
                    return (
                      <label
                        key={category}
                        onClick={() => handleCategory(category)}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                      >
                        <span className="text-xs font-semibold text-slate-700">
                          {category}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                            isChecked
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check size={10} />}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Max Price
                  </h3>
                  <span className="text-xs font-extrabold text-slate-900 bg-amber-100 px-2 py-0.5 rounded-md">
                    ₹{maxPrice}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>₹0</span>
                  <span>₹5000</span>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setSelectedCategory([]);
                  setMaxPrice(5000);
                }}
                className="w-1/3 py-3 rounded-xl border border-gray-200 bg-white text-xs font-bold text-slate-700 hover:bg-gray-100 transition"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="w-2/3 py-3 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes slide-left {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-left { animation: slide-left 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default Card;
