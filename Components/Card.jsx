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
      const scrollAmount = 200;
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
      <div className="flex justify-center items-center min-h-[60vh] sm:min-h-[70vh] bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center px-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="mt-4 sm:mt-5 text-lg sm:text-xl font-semibold text-gray-700">
            Loading Products...
          </h2>
        </div>
      </div>
    );
  }

  // ======================================================
  // FILTER SECTION
  // ======================================================
  const renderFilterSection = () => (
    <>
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div className="flex items-center gap-2">
          <Filter size={20} className="sm:w-[22px] sm:h-[22px] text-white" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">Filters</h2>
        </div>
        <button
          onClick={() => setShowMobileFilter(false)}
          className="lg:hidden p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition"
        >
          <X size={18} className="text-white" />
        </button>
      </div>

      {/* Shop By Category */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base font-semibold text-white/90">
            Shop By Category
          </h3>
          <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full">
            {categories.length}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => scrollCategories("left")}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scrollCategories("right")}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div
          ref={categoryScrollRef}
          className="flex gap-2.5 sm:gap-3 overflow-x-auto py-2 sm:py-3 px-1 scrollbar-hide scroll-smooth"
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
                className={`flex-shrink-0 w-20 sm:w-24 md:w-28 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 transition-all duration-300 border ${
                  active
                    ? "bg-white text-indigo-700 border-white shadow-lg ring-2 ring-indigo-300"
                    : "bg-white/15 text-white border-white/30 hover:bg-white/25"
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full mx-auto flex items-center justify-center ${
                    active ? "bg-indigo-100" : "bg-white/20"
                  }`}
                >
                  <Icon
                    size={18}
                    className={active ? "text-indigo-700" : "text-white"}
                  />
                </div>
                <h4 className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] md:text-xs font-semibold text-center truncate px-0.5">
                  {category}
                </h4>
                <p
                  className={`mt-0.5 text-[9px] sm:text-[10px] text-center ${
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
      <div className="mb-5 sm:mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm sm:text-base font-semibold text-white/90">
            Maximum Price
          </h3>
          <span className="bg-white text-indigo-700 font-bold px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm shadow">
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
        <div className="flex justify-between mt-2 text-[10px] sm:text-xs text-white/70">
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
          className="w-full py-2.5 sm:py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-sm sm:text-base transition border border-white/30"
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        {/* Heading */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-indigo-700 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Our Products
          </h1>
          <p className="text-gray-500 mt-2 sm:mt-3 text-xs sm:text-sm md:text-base px-2">
            Browse our latest collection of quality tools & hardware
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-5 sm:mb-6 flex justify-between items-center gap-3">
          <button
            onClick={() => setShowMobileFilter(true)}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm sm:text-base shadow-lg"
          >
            <Filter size={16} className="sm:w-[18px] sm:h-[18px]" />
            Filters
            {(selectedCategory.length > 0 || maxPrice < 5000) && (
              <span className="ml-1 bg-white text-indigo-700 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                {selectedCategory.length + (maxPrice < 5000 ? 1 : 0)}
              </span>
            )}
          </button>
          <p className="text-xs sm:text-sm text-gray-500 shrink-0">
            {filteredProducts.length} products
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20 xl:top-24 rounded-2xl xl:rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-5 xl:p-6 min-h-[420px] xl:min-h-[480px]">
                {renderFilterSection()}
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
              <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-5 sm:p-6 shadow-2xl animate-slide-up">
                {renderFilterSection()}
              </div>
            </div>
          )}

          {/* Products */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="h-[320px] sm:h-[400px] md:h-[450px] flex flex-col justify-center items-center bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 px-4">
                <Package size={56} className="sm:w-[72px] sm:h-[72px] text-gray-300" />
                <h2 className="mt-4 sm:mt-5 text-xl sm:text-2xl font-bold text-gray-700 text-center">
                  No Products Found
                </h2>
                <p className="text-gray-500 mt-2 text-sm sm:text-base text-center">
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
                  className="mt-6 sm:mt-8 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm sm:text-base shadow-lg"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                  {filteredProducts
                    .slice(0, visibleProducts)
                    .map((product) => {
                      const lowestPrice = getLowestPrice(product);
                      const finalPrice =
                        lowestPrice || Number(product.price) || 0;

                      return (
                        <div
                          key={product._id}
                          className="group bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm
                                     hover:shadow-xl hover:-translate-y-1 sm:hover:-translate-y-2 hover:border-indigo-200
                                     transition-all duration-300 overflow-hidden"
                        >
                          {/* Image */}
                          <div className="relative h-44 sm:h-52 md:h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                            <img
                              src={product.images?.[0] || "/no-image.png"}
                              alt={product.name}
                              className="w-full h-full object-contain p-4 sm:p-5 group-hover:scale-105 sm:group-hover:scale-110 transition duration-500"
                              onError={(e) => {
                                e.target.src = "/no-image.png";
                              }}
                            />

                            {product.offer > 0 && (
                              <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow">
                                {product.offer}% OFF
                              </span>
                            )}

                            <span
                              className={`absolute top-2 right-2 sm:top-3 sm:right-3 text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow ${
                                product.stock > 0
                                  ? "bg-emerald-500 text-white"
                                  : "bg-red-500 text-white"
                              }`}
                            >
                              {product.stock > 0 ? "In Stock" : "Out of Stock"}
                            </span>
                          </div>

                          {/* Body */}
                          <div className="p-3.5 sm:p-4 md:p-5">
                            <h2 className="font-bold text-sm sm:text-base md:text-lg line-clamp-2 text-gray-800 group-hover:text-indigo-700 transition">
                              {product.name}
                            </h2>

                            <div className="mt-1.5 sm:mt-2 space-y-0.5">
                              <p className="text-[11px] sm:text-xs md:text-sm text-gray-500">
                                Brand:{" "}
                                <span className="text-gray-700">
                                  {product.brand || "N/A"}
                                </span>
                              </p>
                              <p className="text-[11px] sm:text-xs md:text-sm text-gray-500">
                                Material:{" "}
                                <span className="text-gray-700">
                                  {product.material || "N/A"}
                                </span>
                              </p>
                            </div>

                            <div className="flex justify-between items-end mt-3 sm:mt-4">
                              <div>
                                <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 uppercase tracking-wide">
                                  Price
                                </p>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-indigo-700">
                                  ₹{finalPrice}
                                </h3>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400 uppercase tracking-wide">
                                  Stock
                                </p>
                                <h4 className="font-bold text-emerald-600 text-base sm:text-lg">
                                  {product.stock ?? 0}
                                </h4>
                              </div>
                            </div>

                            {/* Buttons */}
                            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mt-4 sm:mt-5">
                              <button
                                onClick={() =>
                                  navigate(`/product/${product._id}`, {
                                    state: { product },
                                  })
                                }
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg sm:rounded-xl py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-semibold transition shadow-sm"
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
                                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg sm:rounded-xl py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-semibold transition shadow-sm"
                              >
                                Add Cart
                              </button>
                            </div>

                            {/* View More Varieties */}
                            {product.variantGroup &&
                              products.filter(
                                (p) =>
                                  p.variantGroup === product.variantGroup &&
                                  p._id !== product._id
                              ).length > 0 && (
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/varieties/${product.variantGroup}`,
                                      {
                                        state: {
                                          groupName: product.variantGroup,
                                          productName: product.name,
                                        },
                                      }
                                    )
                                  }
                                  className="w-full mt-2 sm:mt-2.5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border-2 border-indigo-200 text-indigo-700 font-semibold text-xs sm:text-sm hover:bg-indigo-50 hover:border-indigo-400 transition"
                                >
                                  View More Varieties
                                </button>
                              )}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Load More */}
                {filteredProducts.length > visibleProducts && (
                  <div className="flex justify-center mt-8 sm:mt-10">
                    <button
                      onClick={() => setVisibleProducts((prev) => prev + 8)}
                      className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white font-semibold text-sm sm:text-base shadow-xl hover:scale-105 transition"
                    >
                      Load More Products
                    </button>
                  </div>
                )}

                <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
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
