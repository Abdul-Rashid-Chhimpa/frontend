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
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CartContext } from "../Components/Context";

// ======================================================
// COMPONENT
// ======================================================
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
  const [showMobileFilter, setShowMobileFilter] = useState(false);

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
  // CATEGORY LIST
  // ======================================================
  const categories = [
    ...new Set(
      products.map((item) => item.category || item.name).filter(Boolean)
    ),
  ];

  // ======================================================
  // CATEGORY ICONS
  // ======================================================
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

  // ======================================================
  // HANDLERS
  // ======================================================
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
      const scrollAmount = 220;
      categoryScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // ======================================================
  // LOADING
  // ======================================================
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="mt-5 text-xl font-semibold text-gray-700">
            Loading Products...
          </h2>
        </div>
      </div>
    );
  }

  // ======================================================
  // FILTER SIDEBAR CONTENT
  // ======================================================
  const FilterContent = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter size={22} className="text-white" />
          <h2 className="text-2xl font-bold text-white">Filters</h2>
        </div>
        <button
          onClick={() => setShowMobileFilter(false)}
          className="lg:hidden p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition"
        >
          <X size={18} className="text-white" />
        </button>
      </div>

      {/* Shop By Category */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white/90">
            Shop By Category
          </h3>
          <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full">
            {categories.length}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 mb-3">
          <button
            onClick={() => scrollCategories("left")}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scrollCategories("right")}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div
          ref={categoryScrollRef}
          className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((category) => {
            const Icon = getCategoryIcon(category);
            const active = selectedCategory.includes(category);
            const totalProducts = products.filter(
              (item) => (item.category || item.name) === category
            ).length;

            return (
              <button
                key={category}
                onClick={() => handleCategory(category)}
                className={`snap-start flex-shrink-0 w-24 sm:w-28 rounded-2xl p-3.5 transition-all duration-300 border ${
                  active
                    ? "bg-white text-indigo-700 border-white shadow-xl scale-105"
                    : "bg-white/15 text-white border-white/30 hover:bg-white/25 hover:scale-105"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-full mx-auto flex items-center justify-center ${
                    active ? "bg-indigo-100" : "bg-white/20"
                  }`}
                >
                  <Icon
                    size={20}
                    className={active ? "text-indigo-700" : "text-white"}
                  />
                </div>
                <h4 className="mt-2.5 text-[11px] sm:text-xs font-semibold text-center truncate">
                  {category}
                </h4>
                <p
                  className={`mt-1 text-[10px] text-center ${
                    active ? "text-indigo-500" : "text-white/70"
                  }`}
                >
                  {totalProducts} item{totalProducts !== 1 ? "s" : ""}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-white/90">
            Maximum Price
          </h3>
          <span className="bg-white text-indigo-700 font-bold px-3 py-1 rounded-full text-sm shadow">
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
          className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
        />
        <div className="flex justify-between mt-2 text-xs text-white/70">
          <span>₹0</span>
          <span>₹5000+</span>
        </div>
      </div>

      {(selectedCategory.length > 0 || maxPrice < 5000) && (
        <button
          onClick={() => {
            setSelectedCategory([]);
            setMaxPrice(5000);
          }}
          className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold transition border border-white/30"
        >
          Clear All Filters
        </button>
      )}
    </>
  );

  // ======================================================
  // MAIN RENDER
  // ======================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-indigo-700 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Our Products
          </h1>
          <p className="text-gray-500 mt-3 text-sm sm:text-base">
            Browse our latest collection of quality tools & hardware
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6 flex justify-between items-center">
          <button
            onClick={() => setShowMobileFilter(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg"
          >
            <Filter size={18} />
            Filters
            {(selectedCategory.length > 0 || maxPrice < 5000) && (
              <span className="ml-1 bg-white text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {selectedCategory.length + (maxPrice < 5000 ? 1 : 0)}
              </span>
            )}
          </button>
          <p className="text-sm text-gray-500">
            {filteredProducts.length} products
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-6 min-h-[480px]">
                <FilterContent />
              </div>
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {showMobileFilter && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowMobileFilter(false)}
              />
              <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-6 shadow-2xl animate-slide-up">
                <FilterContent />
              </div>
            </div>
          )}

          {/* Products */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="h-[450px] flex flex-col justify-center items-center bg-white rounded-3xl shadow-sm border border-gray-100">
                <Package size={72} className="text-gray-300" />
                <h2 className="mt-5 text-2xl font-bold text-gray-700">
                  No Products Found
                </h2>
                <p className="text-gray-500 mt-2 text-center px-4">
                  No products match your current filters.
                  <br />
                  Try changing category or price range.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory([]);
                    setMaxPrice(5000);
                    setShowMobileFilter(false);
                  }}
                  className="mt-8 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6">
                  {filteredProducts.slice(0, visibleProducts).map((product) => {
                    const lowestPrice = getLowestPrice(product);
                    const finalPrice =
                      lowestPrice || Number(product.price) || 0;

                    return (
                      <div
                        key={product._id}
                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm 
                                   hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-200 
                                   transition-all duration-300 overflow-hidden cursor-pointer"
                      >
                        {/* Image */}
                        <div className="relative h-52 sm:h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                          <img
                            src={product.images?.[0] || "/no-image.png"}
                            alt={product.name}
                            className="w-full h-full object-contain p-5 group-hover:scale-110 transition duration-500"
                            onError={(e) => {
                              e.target.src = "/no-image.png";
                            }}
                          />

                          {product.offer > 0 && (
                            <span className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                              {product.offer}% OFF
                            </span>
                          )}

                          <span
                            className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full shadow ${
                              product.stock > 0
                                ? "bg-emerald-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {product.stock > 0 ? "In Stock" : "Out of Stock"}
                          </span>
                        </div>

                        {/* Body */}
                        <div className="p-4 sm:p-5">
                          <h2 className="font-bold text-base sm:text-lg line-clamp-2 text-gray-800 group-hover:text-indigo-700 transition">
                            {product.name}
                          </h2>

                          <div className="mt-2 space-y-0.5">
                            <p className="text-xs sm:text-sm text-gray-500">
                              Brand:{" "}
                              <span className="text-gray-700">
                                {product.brand || "N/A"}
                              </span>
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              Material:{" "}
                              <span className="text-gray-700">
                                {product.material || "N/A"}
                              </span>
                            </p>
                          </div>

                          <div className="flex justify-between items-end mt-4">
                            <div>
                              <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">
                                Price
                              </p>
                              <h3 className="text-xl sm:text-2xl font-extrabold text-indigo-700">
                                ₹{finalPrice}
                              </h3>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide">
                                Stock
                              </p>
                              <h4 className="font-bold text-emerald-600 text-lg">
                                {product.stock ?? 0}
                              </h4>
                            </div>
                          </div>

                          {/* Buttons - Buy Now + Add Cart */}
                          <div className="grid grid-cols-2 gap-2.5 mt-5">
                            <button
                              onClick={() =>
                                navigate(`/product/${product._id}`, {
                                  state: { product },
                                })
                              }
                              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl py-2.5 sm:py-3 text-sm font-semibold transition shadow-sm"
                            >
                              Buy Now
                            </button>

                            <button
                              disabled={product.stock === 0}
                              onClick={() =>
                                addToCart({
                                  ...product,
                                  quantity: 1,
                                  price: finalPrice,
                                })
                              }
                              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl py-2.5 sm:py-3 text-sm font-semibold transition shadow-sm"
                            >
                              Add Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredProducts.length > visibleProducts && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={() => setVisibleProducts((prev) => prev + 8)}
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white font-semibold shadow-xl hover:scale-105 transition"
                    >
                      Load More Products
                    </button>
                  </div>
                )}

                <div className="mt-8 text-center text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-bold text-indigo-600">
                    {Math.min(visibleProducts, filteredProducts.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-indigo-600">
                    {filteredProducts.length}
                  </span>{" "}
                  Products
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Card;
