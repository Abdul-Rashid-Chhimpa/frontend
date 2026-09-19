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
// DESIGN TOKENS
// ======================================================
const INK = "#15181C";
const MUTED = "#6B7280";
const BORDER = "#E6E8EB";
const SURFACE = "#FFFFFF";
const BG = "#F5F6F4";
const AMBER = "#F0A420";
const AMBER_DARK = "#C97F0F";
const STEEL = "#2B4A5E";
const STEEL_DARK = "#17303E";

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
  // SKELETON LOADER
  // ======================================================
  const renderSkeletonCard = (key) => (
    <div
      key={key}
      className="relative rounded-xl sm:rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255, 255, 255, 0.45)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        boxShadow: "0 8px 24px rgba(21, 24, 28, 0.06)",
      }}
    >
      <div
        className="relative h-44 sm:h-52 md:h-56 overflow-hidden shimmer"
        style={{ background: "rgba(230, 232, 235, 0.6)" }}
      />
      <div className="p-3.5 sm:p-4 md:p-5">
        <div
          className="h-4 sm:h-5 w-3/4 rounded-md shimmer"
          style={{ background: "rgba(230, 232, 235, 0.7)" }}
        />
        <div
          className="h-3 w-1/2 rounded-md shimmer mt-2.5"
          style={{ background: "rgba(230, 232, 235, 0.6)" }}
        />
        <div
          className="h-3 w-2/5 rounded-md shimmer mt-1.5"
          style={{ background: "rgba(230, 232, 235, 0.6)" }}
        />

        <div className="flex justify-between items-end mt-4 sm:mt-5">
          <div
            className="h-6 sm:h-7 w-16 sm:w-20 rounded-md shimmer"
            style={{ background: "rgba(230, 232, 235, 0.7)" }}
          />
          <div
            className="h-6 sm:h-7 w-10 rounded-md shimmer"
            style={{ background: "rgba(230, 232, 235, 0.6)" }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mt-4 sm:mt-5">
          <div
            className="h-9 sm:h-10 rounded-lg sm:rounded-xl shimmer"
            style={{ background: "rgba(230, 232, 235, 0.7)" }}
          />
          <div
            className="h-9 sm:h-10 rounded-lg sm:rounded-xl shimmer"
            style={{ background: "rgba(230, 232, 235, 0.6)" }}
          />
        </div>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="h-screen overflow-hidden flex flex-col" style={{ background: BG }}>
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 py-4 flex-1 flex flex-col">
        <div className="mb-4">
          <div
            className="h-7 sm:h-9 w-40 sm:w-52 rounded-lg shimmer"
            style={{ background: "rgba(230, 232, 235, 0.7)" }}
          />
          <div className="w-10 h-1 rounded-full mt-2 mb-2" style={{ background: AMBER }} />
        </div>

        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 flex-1 overflow-hidden">
          <div className="hidden lg:block lg:col-span-1 h-full">
            <div
              className="rounded-2xl xl:rounded-3xl p-5 xl:p-6 h-full"
              style={{
                background: "rgba(43, 74, 94, 0.55)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Filter size={20} className="text-white/70" />
                <div
                  className="h-5 w-20 rounded-md shimmer"
                  style={{ background: "rgba(255,255,255,0.25)" }}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 h-full overflow-y-auto pr-2">
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => renderSkeletonCard(i))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return renderLoadingState();
  }

  // ======================================================
  // FILTER SECTION
  // ======================================================
  const renderFilterSection = () => (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar pr-1">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div className="flex items-center gap-2">
          <Filter size={20} className="sm:w-[22px] sm:h-[22px] text-white" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">Filters</h2>
        </div>
        <button
          onClick={() => setShowMobileFilter(false)}
          className="lg:hidden p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition"
        >
          <X size={18} className="text-white" />
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base font-semibold text-white/80">
            Shop by category
          </h3>
          <span className="text-xs bg-white/15 text-white px-2.5 py-1 rounded-full">
            {categories.length}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => scrollCategories("left")}
            className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition active:scale-95"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scrollCategories("right")}
            className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition active:scale-95"
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
                className="flex-shrink-0 w-20 sm:w-24 md:w-28 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 transition-all duration-200 border"
                style={
                  active
                    ? { background: AMBER, color: "#1A1200", borderColor: AMBER }
                    : { background: "rgba(255,255,255,0.08)", color: "#FFFFFF", borderColor: "rgba(255,255,255,0.18)" }
                }
              >
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full mx-auto flex items-center justify-center"
                  style={{ background: active ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.12)" }}
                >
                  <Icon size={18} color={active ? "#1A1200" : "#FFFFFF"} />
                </div>
                <h4 className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] md:text-xs font-semibold text-center truncate px-0.5">
                  {category}
                </h4>
                <p
                  className="mt-0.5 text-[9px] sm:text-[10px] text-center"
                  style={{ color: active ? "rgba(26,18,0,0.7)" : "rgba(255,255,255,0.65)" }}
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
          <h3 className="text-sm sm:text-base font-semibold text-white/80">
            Maximum price
          </h3>
          <span
            className="font-bold px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
            style={{ background: AMBER, color: "#1A1200" }}
          >
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
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{ background: "rgba(255,255,255,0.25)", accentColor: AMBER }}
        />
        <div className="flex justify-between mt-2 text-[10px] sm:text-xs text-white/60">
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
          className="w-full py-2.5 sm:py-3 rounded-xl text-white font-semibold text-sm sm:text-base transition border mt-auto"
          style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }}
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  // ======================================================
  // MAIN RENDER
  // ======================================================
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: BG }}>
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 py-4 flex flex-col h-full">
        
        {/* Header Section */}
        <div className="mb-4 flex-shrink-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: INK }}>
            Our products
          </h1>
          <div className="w-10 h-1 rounded-full mt-2 mb-2" style={{ background: AMBER }} />
          <p className="text-xs sm:text-sm md:text-base" style={{ color: MUTED }}>
            Browse the current collection of tools & hardware
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4 flex-shrink-0 flex justify-between items-center gap-3">
          <button
            onClick={() => setShowMobileFilter(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm"
            style={{ background: STEEL }}
          >
            <Filter size={16} />
            Filters
            {(selectedCategory.length > 0 || maxPrice < 5000) && (
              <span
                className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: AMBER, color: "#1A1200" }}
              >
                {selectedCategory.length + (maxPrice < 5000 ? 1 : 0)}
              </span>
            )}
          </button>
          <p className="text-xs sm:text-sm shrink-0" style={{ color: MUTED }}>
            {filteredProducts.length} products
          </p>
        </div>

        {/* Main Layout Grid */}
        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 flex-1 overflow-hidden min-h-0">
          
          {/* Desktop Fixed/Sticky Sidebar */}
          <div className="hidden lg:block lg:col-span-1 h-full overflow-hidden">
            <div className="h-full rounded-2xl xl:rounded-3xl overflow-hidden shadow-sm">
              <div
                className="p-5 xl:p-6 h-full flex flex-col"
                style={{ background: `linear-gradient(160deg, ${STEEL} 0%, ${STEEL_DARK} 100%)` }}
              >
                {renderFilterSection()}
              </div>
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {showMobileFilter && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowMobileFilter(false)}
              />
              <div
                className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-t-3xl p-5 sm:p-6 shadow-2xl animate-slide-up"
                style={{ background: `linear-gradient(160deg, ${STEEL} 0%, ${STEEL_DARK} 100%)` }}
              >
                {renderFilterSection()}
              </div>
            </div>
          )}

          {/* Scrollable Products Grid Container */}
          <div className="lg:col-span-3 h-full overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
            {filteredProducts.length === 0 ? (
              <div
                className="h-[320px] sm:h-[400px] flex flex-col justify-center items-center rounded-2xl sm:rounded-3xl px-4"
                style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
              >
                <Package size={56} style={{ color: "#C7CBCE" }} />
                <h2 className="mt-4 text-xl sm:text-2xl font-bold text-center" style={{ color: INK }}>
                  No products found
                </h2>
                <p className="mt-2 text-sm text-center" style={{ color: MUTED }}>
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
                  className="mt-6 px-6 py-2.5 rounded-xl text-white font-semibold text-sm"
                  style={{ background: STEEL }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 pb-6">
                  {filteredProducts
                    .slice(0, visibleProducts)
                    .map((product) => {
                      const lowestPrice = getLowestPrice(product);
                      const finalPrice = lowestPrice || Number(product.price) || 0;
                      const inStock = product.stock > 0;

                      return (
                        <div
                          key={product._id}
                          className="group rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                          style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                        >
                          <div>
                            <div className="relative h-44 sm:h-52 md:h-56 overflow-hidden" style={{ background: "#F1F2EF" }}>
                              <img
                                src={product.images?.[0] || "/no-image.png"}
                                alt={product.name}
                                className="w-full h-full object-contain p-4 sm:p-5 group-hover:scale-105 transition duration-500"
                                onError={(e) => {
                                  e.target.src = "/no-image.png";
                                }}
                              />

                              {product.offer > 0 && (
                                <span
                                  className="absolute top-2 left-0 text-[10px] sm:text-xs font-bold text-white pl-2.5 pr-2 py-1"
                                  style={{
                                    background: AMBER_DARK,
                                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 8px 100%, 0 60%)",
                                  }}
                                >
                                  {product.offer}% OFF
                                </span>
                              )}

                              <span
                                className="absolute top-2 right-2 sm:top-3 sm:right-3 text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full"
                                style={
                                  inStock
                                    ? { background: "#E4F3E9", color: "#1D7A43" }
                                    : { background: "#FBE7E7", color: "#B4302F" }
                                }
                              >
                                {inStock ? "In stock" : "Out of stock"}
                              </span>
                            </div>

                            <div className="p-3.5 sm:p-4 md:p-5">
                              <h2
                                className="font-bold text-sm sm:text-base md:text-lg line-clamp-2"
                                style={{ color: INK }}
                              >
                                {product.name}
                              </h2>

                              <div className="mt-1.5 sm:mt-2 space-y-0.5">
                                <p className="text-[11px] sm:text-xs md:text-sm" style={{ color: MUTED }}>
                                  Brand: <span style={{ color: INK }}>{product.brand || "N/A"}</span>
                                </p>
                                <p className="text-[11px] sm:text-xs md:text-sm" style={{ color: MUTED }}>
                                  Material: <span style={{ color: INK }}>{product.material || "N/A"}</span>
                                </p>
                              </div>

                              <div className="flex justify-between items-end mt-3 sm:mt-4">
                                <div>
                                  <p className="text-[9px] sm:text-[10px] md:text-xs" style={{ color: MUTED }}>
                                    Price
                                  </p>
                                  <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold" style={{ color: INK }}>
                                    ₹{finalPrice}
                                  </h3>
                                </div>
                                <div className="text-right">
                                  <p className="text-[9px] sm:text-[10px] md:text-xs" style={{ color: MUTED }}>
                                    Stock
                                  </p>
                                  <h4 className="font-bold text-base sm:text-lg" style={{ color: "#1D7A43" }}>
                                    {product.stock ?? 0}
                                  </h4>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-3.5 sm:p-4 md:p-5 pt-0">
                            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                              <button
                                onClick={() =>
                                  navigate(`/product/${product._id}`, {
                                    state: { product },
                                  })
                                }
                                className="text-white rounded-lg sm:rounded-xl py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition"
                                style={{ background: STEEL }}
                              >
                                Buy now
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
                                className="rounded-lg sm:rounded-xl py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition disabled:cursor-not-allowed"
                                style={
                                  product.stock === 0
                                    ? { background: "#F1F2EF", color: MUTED }
                                    : { background: AMBER, color: "#1A1200" }
                                }
                              >
                                Add to cart
                              </button>
                            </div>

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
                                  className="w-full mt-2 py-2 rounded-lg border font-semibold text-xs sm:text-sm transition"
                                  style={{ borderColor: BORDER, color: STEEL }}
                                >
                                  View more varieties
                                </button>
                              )}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Load More */}
                {filteredProducts.length > visibleProducts && (
                  <div className="flex justify-center my-6">
                    <button
                      onClick={() => setVisibleProducts((prev) => prev + 8)}
                      className="px-6 sm:px-8 py-3 rounded-xl sm:rounded-2xl text-white font-semibold text-sm sm:text-base transition"
                      style={{ background: STEEL }}
                    >
                      Load more products
                    </button>
                  </div>
                )}

                <div className="mb-6 text-center text-xs sm:text-sm" style={{ color: MUTED }}>
                  Showing{" "}
                  <span className="font-bold" style={{ color: INK }}>
                    {Math.min(visibleProducts, filteredProducts.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold" style={{ color: INK }}>
                    {filteredProducts.length}
                  </span>{" "}
                  products
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
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
