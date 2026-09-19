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
  Sparkles,
  Tag,
  Clock,
  Star,
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
// STAR RATING COMPONENT
// ======================================================
const StarRating = ({ rating = 0, size = 14 }) => {
  const value = Math.min(5, Math.max(0, Number(rating) || 0));
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5;

  return (
    <div className="flex items-center gap-0.5" title={`${value.toFixed(1)} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= full || (i === full + 1 && hasHalf);
        return (
          <Star
            key={i}
            size={size}
            className="flex-shrink-0"
            style={{
              color: filled ? AMBER : "#D1D5DB",
              fill: filled ? AMBER : "transparent",
            }}
          />
        );
      })}
      {value > 0 && (
        <span
          className="ml-1 text-[10px] sm:text-xs font-semibold"
          style={{ color: MUTED }}
        >
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

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
  const [showOnlyOffers, setShowOnlyOffers] = useState(false);
  const [showOnlyNew, setShowOnlyNew] = useState(false);
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
  // HANDLERS & LOGIC
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

  const getRating = (product) => {
    return (
      Number(product.rating) ||
      Number(product.averageRating) ||
      Number(product.ratings) ||
      0
    );
  };

  const filteredProducts = products.filter((product) => {
    const productCategory = product.category || product.name;
    const categoryMatch =
      selectedCategory.length === 0 ||
      selectedCategory.includes(productCategory);

    const priceMatch = getLowestPrice(product) <= maxPrice;
    const discountPercentage = product.discountPercent || product.offer || 0;
    const offerMatch = !showOnlyOffers || discountPercentage > 0;
    const newArrivalMatch = !showOnlyNew || Boolean(product.isNewProduct);

    return categoryMatch && priceMatch && offerMatch && newArrivalMatch;
  });

  useEffect(() => {
    setVisibleProducts(8);
  }, [selectedCategory, maxPrice, showOnlyOffers, showOnlyNew]);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = 200;
      categoryScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory([]);
    setMaxPrice(5000);
    setShowOnlyOffers(false);
    setShowOnlyNew(false);
    setShowMobileFilter(false);
  };

  const activeFilterCount =
    selectedCategory.length +
    (maxPrice < 5000 ? 1 : 0) +
    (showOnlyOffers ? 1 : 0) +
    (showOnlyNew ? 1 : 0);

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
    <div className="min-h-screen" style={{ background: BG }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 md:mb-10">
          <div
            className="h-7 sm:h-9 w-40 sm:w-52 rounded-lg shimmer"
            style={{ background: "rgba(230, 232, 235, 0.7)" }}
          />
          <div
            className="w-10 h-1 rounded-full mt-3 mb-3"
            style={{ background: AMBER }}
          />
          <div
            className="h-3.5 sm:h-4 w-56 sm:w-72 rounded-md shimmer"
            style={{ background: "rgba(230, 232, 235, 0.6)" }}
          />
        </div>
        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <div className="hidden lg:block lg:col-span-1">
            <div
              className="sticky top-24 rounded-2xl xl:rounded-3xl overflow-hidden p-5 xl:p-6 min-h-[420px]"
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
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => renderSkeletonCard(i))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return renderLoadingState();

  // ======================================================
  // FILTER COMPONENT
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
          className="lg:hidden p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition"
        >
          <X size={18} className="text-white" />
        </button>
      </div>

      {/* Special Filters — Discount Offers blinks */}
      <div className="mb-6 sm:mb-8 border-b border-white/10 pb-5">
        <h3 className="text-sm sm:text-base font-semibold text-white/80 mb-3">
          Special Filters
        </h3>
        <div className="space-y-2.5">
          <button
            onClick={() => setShowOnlyOffers((prev) => !prev)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition border ${
              showOnlyOffers ? "" : "offer-blink"
            }`}
            style={
              showOnlyOffers
                ? { background: AMBER, color: "#1A1200", borderColor: AMBER }
                : {
                    background: "rgba(255,255,255,0.08)",
                    color: "#FFFFFF",
                    borderColor: "rgba(255,255,255,0.18)",
                  }
            }
          >
            <span className="flex items-center gap-2">
              <Tag size={16} className={showOnlyOffers ? "" : "animate-pulse"} />
              Discount Offers
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20">
              {
                products.filter(
                  (p) => (p.discountPercent || p.offer || 0) > 0
                ).length
              }
            </span>
          </button>

          <button
            onClick={() => setShowOnlyNew((prev) => !prev)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition border"
            style={
              showOnlyNew
                ? {
                    background: "#059669",
                    color: "#FFFFFF",
                    borderColor: "#059669",
                  }
                : {
                    background: "rgba(255,255,255,0.08)",
                    color: "#FFFFFF",
                    borderColor: "rgba(255,255,255,0.18)",
                  }
            }
          >
            <span className="flex items-center gap-2">
              <Clock size={16} /> New Arrivals
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20">
              {products.filter((p) => p.isNewProduct).length}
            </span>
          </button>
        </div>
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
                    ? {
                        background: AMBER,
                        color: "#1A1200",
                        borderColor: AMBER,
                      }
                    : {
                        background: "rgba(255,255,255,0.08)",
                        color: "#FFFFFF",
                        borderColor: "rgba(255,255,255,0.18)",
                      }
                }
              >
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full mx-auto flex items-center justify-center"
                  style={{
                    background: active
                      ? "rgba(0,0,0,0.1)"
                      : "rgba(255,255,255,0.12)",
                  }}
                >
                  <Icon size={18} color={active ? "#1A1200" : "#FFFFFF"} />
                </div>
                <h4 className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] md:text-xs font-semibold text-center truncate px-0.5">
                  {category}
                </h4>
                <p
                  className="mt-0.5 text-[9px] sm:text-[10px] text-center"
                  style={{
                    color: active
                      ? "rgba(26,18,0,0.7)"
                      : "rgba(255,255,255,0.65)",
                  }}
                >
                  {totalProducts} item{totalProducts !== 1 ? "s" : ""}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Max Price Filter */}
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

      {activeFilterCount > 0 && (
        <button
          onClick={handleClearFilters}
          className="w-full py-2.5 sm:py-3 rounded-xl text-white font-semibold text-sm sm:text-base transition border hover:bg-white/20"
          style={{
            background: "rgba(255,255,255,0.1)",
            borderColor: "rgba(255,255,255,0.2)",
          }}
        >
          Clear all filters ({activeFilterCount})
        </button>
      )}
    </>
  );

  // ======================================================
  // MAIN RENDER
  // ======================================================
  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        {/* Sticky Header — stays visible while scrolling products */}
        <div className="sticky top-0 z-30 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 py-4 mb-4 sm:mb-6 backdrop-blur-md"
          style={{ background: "color-mix(in srgb, #F5F6F4 92%, transparent)" }}
        >
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: INK }}
          >
            Our products
          </h1>
          <div
            className="w-10 h-1 rounded-full mt-2.5 mb-2"
            style={{ background: AMBER }}
          />
          <p className="text-xs sm:text-sm md:text-base" style={{ color: MUTED }}>
            Browse the current collection of tools & hardware
          </p>
        </div>

        {/* Mobile Filter Toggle — left aligned */}
        <div className="lg:hidden mb-5 sm:mb-6 flex justify-between items-center gap-3">
          <button
            onClick={() => setShowMobileFilter(true)}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-white font-semibold text-sm sm:text-base shadow-md"
            style={{ background: STEEL }}
          >
            <Filter size={16} className="sm:w-[18px] sm:h-[18px]" />
            Filters
            {activeFilterCount > 0 && (
              <span
                className="ml-1 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full"
                style={{ background: AMBER, color: "#1A1200" }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
          <p className="text-xs sm:text-sm shrink-0" style={{ color: MUTED }}>
            {filteredProducts.length} products
          </p>
        </div>

        {/* Main Grid — Fixed filter + Scrollable cards */}
        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 items-start">
          {/* Desktop Fixed / Sticky Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-hide rounded-2xl xl:rounded-3xl overflow-hidden shadow-md">
              <div
                className="p-5 xl:p-6"
                style={{
                  background: `linear-gradient(160deg, ${STEEL} 0%, ${STEEL_DARK} 100%)`,
                }}
              >
                {renderFilterSection()}
              </div>
            </div>
          </div>

          {/* Mobile Filter — LEFT SIDE drawer */}
          {showMobileFilter && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowMobileFilter(false)}
              />
              <div
                className="absolute top-0 left-0 bottom-0 w-[85%] max-w-[320px] overflow-y-auto p-5 sm:p-6 shadow-2xl animate-slide-left"
                style={{
                  background: `linear-gradient(160deg, ${STEEL} 0%, ${STEEL_DARK} 100%)`,
                }}
              >
                {renderFilterSection()}
              </div>
            </div>
          )}

          {/* Products Grid — independently scrollable area */}
          <div className="lg:col-span-3 min-h-[60vh]">
            {filteredProducts.length === 0 ? (
              <div
                className="h-[320px] sm:h-[400px] md:h-[450px] flex flex-col justify-center items-center rounded-2xl sm:rounded-3xl px-4"
                style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
              >
                <Package
                  size={56}
                  className="sm:w-[72px] sm:h-[72px]"
                  style={{ color: "#C7CBCE" }}
                />
                <h2
                  className="mt-4 sm:mt-5 text-xl sm:text-2xl font-bold text-center"
                  style={{ color: INK }}
                >
                  No products found
                </h2>
                <p
                  className="mt-2 text-sm sm:text-base text-center"
                  style={{ color: MUTED }}
                >
                  No products match your current filters.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-6 sm:mt-8 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-white font-semibold text-sm sm:text-base"
                  style={{ background: STEEL }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                  {filteredProducts.slice(0, visibleProducts).map((product) => {
                    const lowestPrice = getLowestPrice(product);
                    const finalPrice = lowestPrice || Number(product.price) || 0;
                    const inStock = product.stock > 0;
                    const discountPercentage =
                      product.discountPercent || product.offer || 0;
                    const discountTagNote = product.discountNote || "";
                    const rating = getRating(product);

                    return (
                      <div
                        key={product._id}
                        className="group rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl relative flex flex-col justify-between"
                        style={{
                          background: SURFACE,
                          border: `1px solid ${BORDER}`,
                        }}
                      >
                        {/* Image */}
                        <div
                          className="relative h-44 sm:h-52 md:h-56 overflow-hidden"
                          style={{ background: "#F1F2EF" }}
                        >
                          <img
                            src={product.images?.[0] || "/no-image.png"}
                            alt={product.name}
                            className="w-full h-full object-contain p-4 sm:p-5 group-hover:scale-105 transition duration-500"
                            onError={(e) => {
                              e.target.src = "/no-image.png";
                            }}
                          />

                          {discountPercentage > 0 && (
                            <div className="absolute top-2 left-0 flex flex-col items-start gap-1 z-10">
                              <span
                                className="animated-discount-badge text-[10px] sm:text-xs font-bold text-white px-2.5 py-1 flex items-center gap-1 shadow-md"
                                style={{
                                  background: `linear-gradient(135deg, ${AMBER_DARK} 0%, #D9381E 100%)`,
                                  clipPath:
                                    "polygon(0 0, 100% 0, 92% 100%, 0% 100%)",
                                }}
                              >
                                <Sparkles size={12} className="animate-pulse" />
                                {discountTagNote
                                  ? `${discountTagNote} (${discountPercentage}% OFF)`
                                  : `${discountPercentage}% OFF`}
                              </span>
                            </div>
                          )}

                          {product.isNewProduct && (
                            <span className="absolute bottom-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-white bg-emerald-600 shadow-md animate-bounce">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              New
                            </span>
                          )}

                          <span
                            className="absolute top-2 right-2 sm:top-3 sm:right-3 text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full z-10"
                            style={
                              inStock
                                ? { background: "#E4F3E9", color: "#1D7A43" }
                                : { background: "#FBE7E7", color: "#B4302F" }
                            }
                          >
                            {inStock ? "In stock" : "Out of stock"}
                          </span>
                        </div>

                        {/* Body */}
                        <div className="p-3.5 sm:p-4 md:p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h2
                              className="font-bold text-sm sm:text-base md:text-lg line-clamp-2"
                              style={{ color: INK }}
                            >
                              {product.name}
                            </h2>

                            {/* Star Rating */}
                            <div className="mt-1.5 sm:mt-2">
                              <StarRating rating={rating} size={13} />
                            </div>

                            <div className="mt-1.5 sm:mt-2 space-y-0.5">
                              <p
                                className="text-[11px] sm:text-xs md:text-sm"
                                style={{ color: MUTED }}
                              >
                                Brand:{" "}
                                <span style={{ color: INK }}>
                                  {product.brand || "N/A"}
                                </span>
                              </p>
                              <p
                                className="text-[11px] sm:text-xs md:text-sm"
                                style={{ color: MUTED }}
                              >
                                Material:{" "}
                                <span style={{ color: INK }}>
                                  {product.material || "N/A"}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-end mt-3 sm:mt-4">
                              <div>
                                <p
                                  className="text-[9px] sm:text-[10px] md:text-xs"
                                  style={{ color: MUTED }}
                                >
                                  Price
                                </p>
                                <h3
                                  className="text-lg sm:text-xl md:text-2xl font-extrabold"
                                  style={{ color: INK }}
                                >
                                  ₹{finalPrice}
                                </h3>
                              </div>
                              <div className="text-right">
                                <p
                                  className="text-[9px] sm:text-[10px] md:text-xs"
                                  style={{ color: MUTED }}
                                >
                                  Stock
                                </p>
                                <h4
                                  className="font-bold text-base sm:text-lg"
                                  style={{ color: "#1D7A43" }}
                                >
                                  {product.stock ?? 0}
                                </h4>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mt-4 sm:mt-5">
                              <button
                                onClick={() =>
                                  navigate(`/product/${product._id}`, {
                                    state: { product },
                                  })
                                }
                                className="text-white rounded-lg sm:rounded-xl py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-semibold transition hover:opacity-90 active:scale-95"
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
                                className="rounded-lg sm:rounded-xl py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm font-bold transition disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
                                style={
                                  product.stock === 0
                                    ? {
                                        background: "#F1F2EF",
                                        color: MUTED,
                                      }
                                    : {
                                        background: AMBER,
                                        color: "#1A1200",
                                      }
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
                                  className="w-full mt-2 sm:mt-2.5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border font-semibold text-xs sm:text-sm transition hover:bg-gray-50 active:scale-95"
                                  style={{
                                    borderColor: BORDER,
                                    color: STEEL,
                                  }}
                                >
                                  View more varieties
                                </button>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredProducts.length > visibleProducts && (
                  <div className="flex justify-center mt-8 sm:mt-10">
                    <button
                      onClick={() => setVisibleProducts((prev) => prev + 8)}
                      className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-white font-semibold text-sm sm:text-base transition hover:opacity-90 active:scale-95"
                      style={{ background: STEEL }}
                    >
                      Load more products
                    </button>
                  </div>
                )}

                <div
                  className="mt-6 sm:mt-8 text-center text-xs sm:text-sm"
                  style={{ color: MUTED }}
                >
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

        /* Mobile filter slides from LEFT */
        @keyframes slide-left {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-left {
          animation: slide-left 0.3s ease-out;
        }

        /* Discount Offers continuous blink */
        @keyframes offer-blink {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(240, 164, 32, 0.5);
            border-color: rgba(255,255,255,0.18);
          }
          50% {
            box-shadow: 0 0 12px 2px rgba(240, 164, 32, 0.7);
            border-color: ${AMBER};
            background: rgba(240, 164, 32, 0.2) !important;
          }
        }
        .offer-blink {
          animation: offer-blink 1.6s ease-in-out infinite;
        }

        @keyframes shimmer-sweep {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animated-discount-badge {
          background-size: 200% 100% !important;
          animation: shimmer-sweep 3s infinite linear;
        }

        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.55) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer-sweep-bar 1.6s infinite;
        }
        @keyframes shimmer-sweep-bar {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Card;
