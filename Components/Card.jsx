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
} from "lucide-react";
import { CartContext } from "../Components/Context";

const INK = "#15181C";
const MUTED = "#6B7280";
const BORDER = "#E6E8EB";
const SURFACE = "#FFFFFF";
const BG = "#F5F6F4";
const AMBER = "#F0A420";
const AMBER_DARK = "#C97F0F";
const STEEL = "#2B4A5E";
const STEEL_DARK = "#17303E";

const Card = () => {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const categoryScrollRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [showOnlyOffers, setShowOnlyOffers] = useState(false);
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

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

      {/* Special Filters */}
      <div className="mb-6 sm:mb-8 border-b border-white/10 pb-5">
        <h3 className="text-sm sm:text-base font-semibold text-white/80 mb-3">
          Special Filters
        </h3>
        <div className="space-y-2.5">
          <button
            onClick={() => setShowOnlyOffers((prev) => !prev)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition border"
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
              <Tag size={16} /> Discount Offers
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20">
              {products.filter((p) => (p.discountPercent || p.offer || 0) > 0).length}
            </span>
          </button>

          <button
            onClick={() => setShowOnlyNew((prev) => !prev)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition border"
            style={
              showOnlyNew
                ? { background: "#059669", color: "#FFFFFF", borderColor: "#059669" }
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

      {/* Categories Filter */}
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
                    background: active ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.12)",
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
                    color: active ? "rgba(26,18,0,0.7)" : "rgba(255,255,255,0.65)",
                  }}
                >
                  {totalProducts} item{totalProducts !== 1 ? "s" : ""}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Max Price Slider */}
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <p className="text-lg font-semibold" style={{ color: STEEL }}>Loading Products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: BG }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: INK }}>
            Our products
          </h1>
          <div className="w-10 h-1 rounded-full mt-2.5 mb-3" style={{ background: AMBER }} />
          <p className="text-xs sm:text-sm md:text-base" style={{ color: MUTED }}>
            Browse the current collection of tools & hardware
          </p>
        </div>

        {/* Floating Mobile Filter Trigger Button (RIGHT SIDE FIXED) */}
        <div className="lg:hidden fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowMobileFilter(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-full text-white font-bold text-sm shadow-2xl active:scale-95 transition-all"
            style={{
              background: `linear-gradient(135deg, ${STEEL} 0%, ${STEEL_DARK} 100%)`,
              boxShadow: "0 10px 25px rgba(23, 48, 62, 0.4)",
            }}
          >
            <Filter size={18} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span
                className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                style={{ background: AMBER, color: "#1A1200" }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Main Section Grid */}
        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8 items-start">
          
          {/* 1. Desktop Fixed Sticky Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-20 h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide pr-1">
            <div className="rounded-3xl overflow-hidden shadow-lg border border-black/5" style={{ background: STEEL }}>
              <div
                className="p-6"
                style={{
                  background: `linear-gradient(160deg, ${STEEL} 0%, ${STEEL_DARK} 100%)`,
                }}
              >
                {renderFilterSection()}
              </div>
            </div>
          </aside>

          {/* 2. Mobile Filter Sidebar Drawer (LEFT ALIGNED) */}
          {showMobileFilter && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => setShowMobileFilter(false)}
              />
              <div
                className="absolute inset-y-0 left-0 w-[82vw] max-w-xs h-full overflow-y-auto p-5 shadow-2xl animate-slide-right"
                style={{
                  background: `linear-gradient(160deg, ${STEEL} 0%, ${STEEL_DARK} 100%)`,
                }}
              >
                {renderFilterSection()}
              </div>
            </div>
          )}

          {/* 3. Independent Scrollable Product Card Grid */}
          <main className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div
                className="h-[350px] flex flex-col justify-center items-center rounded-3xl p-6"
                style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
              >
                <Package size={64} style={{ color: "#C7CBCE" }} />
                <h2 className="mt-4 text-xl font-bold" style={{ color: INK }}>
                  No products found
                </h2>
                <button
                  onClick={handleClearFilters}
                  className="mt-6 px-6 py-2.5 rounded-xl text-white font-semibold text-sm"
                  style={{ background: STEEL }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                  {filteredProducts.slice(0, visibleProducts).map((product) => {
                    const lowestPrice = getLowestPrice(product);
                    const finalPrice = lowestPrice || Number(product.price) || 0;
                    const inStock = product.stock > 0;
                    const discountPercentage = product.discountPercent || product.offer || 0;
                    const discountTagNote = product.discountNote || "";

                    return (
                      <div
                        key={product._id}
                        className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl relative flex flex-col justify-between"
                        style={{
                          background: SURFACE,
                          border: `1px solid ${BORDER}`,
                        }}
                      >
                        {/* Image Header */}
                        <div
                          className="relative h-48 sm:h-52 overflow-hidden"
                          style={{ background: "#F1F2EF" }}
                        >
                          <img
                            src={product.images?.[0] || "/no-image.png"}
                            alt={product.name}
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition duration-500"
                            onError={(e) => {
                              e.target.src = "/no-image.png";
                            }}
                          />

                          {discountPercentage > 0 && (
                            <div className="absolute top-2 left-0 z-10">
                              <span
                                className="text-[10px] font-bold text-white px-2.5 py-1 flex items-center gap-1 shadow-md"
                                style={{
                                  background: `linear-gradient(135deg, ${AMBER_DARK} 0%, #D9381E 100%)`,
                                  clipPath: "polygon(0 0, 100% 0, 92% 100%, 0% 100%)",
                                }}
                              >
                                <Sparkles size={11} />
                                {discountTagNote
                                  ? `${discountTagNote} (${discountPercentage}% OFF)`
                                  : `${discountPercentage}% OFF`}
                              </span>
                            </div>
                          )}

                          <span
                            className="absolute top-2 right-2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full z-10"
                            style={
                              inStock
                                ? { background: "#E4F3E9", color: "#1D7A43" }
                                : { background: "#FBE7E7", color: "#B4302F" }
                            }
                          >
                            {inStock ? "In stock" : "Out of stock"}
                          </span>
                        </div>

                        {/* Card Info */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h2 className="font-bold text-sm sm:text-base line-clamp-2" style={{ color: INK }}>
                              {product.name}
                            </h2>
                            <div className="mt-1.5 space-y-0.5 text-xs" style={{ color: MUTED }}>
                              <p>Brand: <span style={{ color: INK }}>{product.brand || "N/A"}</span></p>
                              <p>Material: <span style={{ color: INK }}>{product.material || "N/A"}</span></p>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-end mt-4">
                              <div>
                                <p className="text-[10px]" style={{ color: MUTED }}>Price</p>
                                <h3 className="text-lg font-extrabold" style={{ color: INK }}>₹{finalPrice}</h3>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px]" style={{ color: MUTED }}>Stock</p>
                                <h4 className="font-bold text-sm" style={{ color: "#1D7A43" }}>{product.stock ?? 0}</h4>
                              </div>
                            </div>

                            {/* Buttons */}
                            <div className="grid grid-cols-2 gap-2 mt-4">
                              <button
                                onClick={() => navigate(`/product/${product._id}`, { state: { product } })}
                                className="text-white rounded-xl py-2.5 text-xs font-semibold transition hover:opacity-90 active:scale-95"
                                style={{ background: STEEL }}
                              >
                                Buy now
                              </button>
                              <button
                                disabled={product.stock === 0}
                                onClick={() => addToCart({ ...product, quantity: 1, price: finalPrice })}
                                className="rounded-xl py-2.5 text-xs font-bold transition disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
                                style={
                                  product.stock === 0
                                    ? { background: "#F1F2EF", color: MUTED }
                                    : { background: AMBER, color: "#1A1200" }
                                }
                              >
                                Add to cart
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {filteredProducts.length > visibleProducts && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => setVisibleProducts((prev) => prev + 8)}
                      className="px-8 py-3 rounded-2xl text-white font-semibold text-sm transition hover:opacity-90 active:scale-95"
                      style={{ background: STEEL }}
                    >
                      Load more products
                    </button>
                  </div>
                )}
              </>
            )}
          </main>

        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes slide-right {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-right { animation: slide-right 0.25s cubic-bezier(0, 0, 0.2, 1); }
      `}</style>
    </div>
  );
};

export default Card;
