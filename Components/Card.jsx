// ======================================================
// IMPORTS
// ======================================================
import { useState, useEffect, useContext, useRef, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Hammer,
  Wrench,
  Drill,
  Shield,
  ShieldCheck,
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
  Search,
  Zap,
  Award,
} from "lucide-react";
import { CartContext } from "../Components/Context";

// ======================================================
// CONFIG
// ======================================================
const API_BASE = "https://backend-3-axez.onrender.com";

// /uploads/xyz.jpg -> full backend URL (http links aur frontend assets jaise hain waise rehte hain)
const getImageUrl = (img) => {
  if (!img || typeof img !== "string") return "/no-image.png";
  if (img.startsWith("http") || img.startsWith("data:")) return img;
  if (img.startsWith("/uploads/")) return `${API_BASE}${img}`;
  if (img.startsWith("uploads/")) return `${API_BASE}/${img}`;
  return img;
};

const getProductImage = (product) => {
  const first = Array.isArray(product.images) ? product.images[0] : null;
  const raw =
    (typeof first === "string" ? first : first?.url) ||
    product.image ||
    product.imageUrl ||
    "";
  return getImageUrl(raw);
};

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

// Desktop par dono columns ki same height (viewport ke hisaab se)
const PANEL_HEIGHT = "lg:h-[calc(100vh-7rem)] lg:min-h-[540px]";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "priceLow", label: "Price: Low to High" },
  { value: "priceHigh", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
];

const WHY_POINTS = [
  { icon: ShieldCheck, title: "Quality Guaranteed", note: "Built for long life" },
  { icon: Wrench, title: "Drop Forged Steel", note: "Maximum strength structure" },
  { icon: Zap, title: "Induction Hardened", note: "Precision cutting edges" },
  { icon: Award, title: "Ergonomic Grip", note: "Slip-resistant comfort" },
];

// ======================================================
// STAR RATING
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
        <span className="ml-1 text-[10px] sm:text-xs font-semibold" style={{ color: MUTED }}>
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
  const productsScrollRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [maxPrice, setMaxPrice] = useState(null); // null = koi limit nahi (auto max)
  const [showOnlyOffers, setShowOnlyOffers] = useState(false);
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [visibleProducts, setVisibleProducts] = useState(8);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // --- 1. FETCH PRODUCTS (x-user-id header ke saath) ---
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setFetchError("");

      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      const userId = localStorage.getItem("userId") || storedUser?._id || "";

      const { data } = await axios.get(`${API_BASE}/api/products`, {
        timeout: 60000, // Render free plan jaagne me 30-50 sec leta hai
        headers: {
          "x-user-id": userId,
        },
        params: {
          userId: userId, // Query param fallback
        },
      });

      if (!Array.isArray(data) && data?.success === false) {
        throw new Error(data.message || "Server ne products nahi diye");
      }

      // Dono format support: [ ... ] ya { success, products: [ ... ] }
      const list = Array.isArray(data) ? data : data?.products || data?.data || [];
      setProducts(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      const status = error.response?.status;
      setFetchError(
        status
          ? `Server error (Status ${status}): ${error.response?.data?.message || "koi message nahi"}`
          : `Server se connect nahi ho paya (${error.message}). Ye CORS ya internet ki wajah se ho sakta hai.`
      );
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

  // Base / Lowest Price Calculator
  const getLowestPrice = (product) => {
    if (product.pricing && product.pricing.length > 0) {
      return Math.min(
        ...product.pricing.map((item) => Number(item.price) || 0)
      );
    }
    return Number(product.price || 0);
  };

  // --- 2. CALCULATE FINAL DISCOUNTED PRICE ---
  const getCalculatedPrice = (product) => {
    const basePrice = getLowestPrice(product);
    const discountPercent = Number(product.discountPercent || product.offer || 0);

    if (discountPercent > 0) {
      const discountAmount = (basePrice * discountPercent) / 100;
      return Math.round(basePrice - discountAmount);
    }
    return basePrice;
  };

  const getRating = (product) => {
    return (
      Number(product.rating) ||
      Number(product.averageRating) ||
      Number(product.ratings) ||
      0
    );
  };

  // Price slider ka max: sabse mehnge product ke hisaab se
  const priceLimit = useMemo(() => {
    const highest = products.reduce(
      (max, p) => Math.max(max, getCalculatedPrice(p)),
      0
    );
    return Math.max(500, Math.ceil(highest / 100) * 100);
  }, [products]);

  const effectiveMax = maxPrice === null ? priceLimit : Math.min(maxPrice, priceLimit);

  // ---------- Filter + Search + Sort ----------
  const searchQuery = search.trim().toLowerCase();

  const filteredProducts = products
    .filter((product) => {
      const productCategory = product.category || product.name;
      const categoryMatch =
        selectedCategory.length === 0 ||
        selectedCategory.includes(productCategory);

      const priceMatch = getCalculatedPrice(product) <= effectiveMax;

      const discountPercentage = product.discountPercent || product.offer || 0;
      const offerMatch = !showOnlyOffers || discountPercentage > 0;
      const newArrivalMatch = !showOnlyNew || Boolean(product.isNewProduct);

      const searchMatch =
        !searchQuery ||
        [product.name, product.brand, product.category, product.material]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(searchQuery));

      return categoryMatch && priceMatch && offerMatch && newArrivalMatch && searchMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "priceLow":
          return getCalculatedPrice(a) - getCalculatedPrice(b);
        case "priceHigh":
          return getCalculatedPrice(b) - getCalculatedPrice(a);
        case "name":
          return String(a.name || "").localeCompare(String(b.name || ""));
        default:
          return 0;
      }
    });

  // Filter / search / sort badalne par list upar se start ho
  useEffect(() => {
    setVisibleProducts(8);
    productsScrollRef.current?.scrollTo({ top: 0 });
  }, [selectedCategory, maxPrice, showOnlyOffers, showOnlyNew, search, sortBy]);

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
    setMaxPrice(null);
    setShowOnlyOffers(false);
    setShowOnlyNew(false);
    setSearch("");
    setSortBy("featured");
    setShowMobileFilter(false);
  };

  const activeFilterCount =
    selectedCategory.length +
    (effectiveMax < priceLimit ? 1 : 0) +
    (showOnlyOffers ? 1 : 0) +
    (showOnlyNew ? 1 : 0) +
    (searchQuery ? 1 : 0);

  // Left sidebar ke "Store at a glance" ke liye live ginti
  const offersCount = products.filter((p) => (p.discountPercent || p.offer || 0) > 0).length;
  const inStockCount = products.filter((p) => p.stock > 0).length;
  const glanceStats = [
    { label: "Products", value: products.length },
    { label: "Categories", value: categories.length },
    { label: "On offer", value: offersCount },
    { label: "In stock", value: inStockCount },
  ];

  // ======================================================
  // SKELETON
  // ======================================================
  const renderSkeletonCard = (key) => (
    <div
      key={key}
      className="relative rounded-xl sm:rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255, 255, 255, 0.45)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        boxShadow: "0 8px 24px rgba(21, 24, 28, 0.06)",
      }}
    >
      <div
        className="relative h-44 sm:h-52 overflow-hidden shimmer"
        style={{ background: "rgba(230, 232, 235, 0.6)" }}
      />
      <div className="p-3.5 sm:p-4">
        <div className="h-4 w-3/4 rounded-md shimmer" style={{ background: "rgba(230, 232, 235, 0.7)" }} />
        <div className="h-3 w-1/2 rounded-md shimmer mt-2.5" style={{ background: "rgba(230, 232, 235, 0.6)" }} />
        <div className="flex justify-between mt-4">
          <div className="h-6 w-16 rounded-md shimmer" style={{ background: "rgba(230, 232, 235, 0.7)" }} />
          <div className="h-6 w-10 rounded-md shimmer" style={{ background: "rgba(230, 232, 235, 0.6)" }} />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="h-9 rounded-xl shimmer" style={{ background: "rgba(230, 232, 235, 0.7)" }} />
          <div className="h-9 rounded-xl shimmer" style={{ background: "rgba(230, 232, 235, 0.6)" }} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ background: BG }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6">
          <div className="h-8 w-48 rounded-lg shimmer mb-6" style={{ background: "rgba(230,232,235,0.7)" }} />
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="hidden lg:block" />
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => renderSkeletonCard(i))}
            </div>
          </div>
          <p className="text-center text-xs mt-6" style={{ color: MUTED }}>
            Products load ho rahe hain... (server pehli baar 30-50 second le sakta hai)
          </p>
        </div>
        <style>{`
          .shimmer { position: relative; overflow: hidden; }
          .shimmer::after {
            content: "";
            position: absolute;
            inset: 0;
            transform: translateX(-100%);
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%);
            animation: shimmer-bar 1.6s infinite;
          }
          @keyframes shimmer-bar { 100% { transform: translateX(100%); } }
        `}</style>
      </div>
    );
  }

  // ======================================================
  // FILTER SECTION
  // ======================================================
  const renderFilterSection = () => (
    <>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-white" />
          <h2 className="text-xl font-bold text-white">Filters</h2>
        </div>
        <button
          onClick={() => setShowMobileFilter(false)}
          className="lg:hidden p-1.5 rounded-full bg-white/15 hover:bg-white/25"
        >
          <X size={18} className="text-white" />
        </button>
      </div>

      {/* Special Filters */}
      <div className="mb-6 border-b border-white/10 pb-5">
        <h3 className="text-sm font-semibold text-white/80 mb-3">Special Filters</h3>
        <div className="space-y-2.5">
          <button
            onClick={() => setShowOnlyOffers((p) => !p)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium border transition ${
              !showOnlyOffers ? "offer-blink" : ""
            }`}
            style={
              showOnlyOffers
                ? { background: AMBER, color: "#1A1200", borderColor: AMBER }
                : {
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.18)",
                  }
            }
          >
            <span className="flex items-center gap-2">
              <Tag size={16} /> Discount Offers
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20">
              {offersCount}
            </span>
          </button>

          <button
            onClick={() => setShowOnlyNew((p) => !p)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium border transition"
            style={
              showOnlyNew
                ? { background: "#059669", color: "#fff", borderColor: "#059669" }
                : {
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
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

      {/* Categories */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white/80">Shop by category</h3>
          <span className="text-xs bg-white/15 text-white px-2.5 py-1 rounded-full">
            {categories.length}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => scrollCategories("left")}
            className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scrollCategories("right")}
            className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div
          ref={categoryScrollRef}
          className="flex gap-2.5 overflow-x-auto py-2 px-1 scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {categories.map((category) => {
            const Icon = getCategoryIcon(category);
            const active = selectedCategory.includes(category);
            const total = products.filter(
              (item) => (item.category || item.name) === category
            ).length;
            return (
              <button
                key={category}
                onClick={() => handleCategory(category)}
                className="flex-shrink-0 w-24 rounded-2xl p-3 border transition"
                style={
                  active
                    ? { background: AMBER, color: "#1A1200", borderColor: AMBER }
                    : {
                        background: "rgba(255,255,255,0.08)",
                        color: "#fff",
                        borderColor: "rgba(255,255,255,0.18)",
                      }
                }
              >
                <div
                  className="w-10 h-10 rounded-full mx-auto flex items-center justify-center"
                  style={{
                    background: active ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.12)",
                  }}
                >
                  <Icon size={18} color={active ? "#1A1200" : "#fff"} />
                </div>
                <h4 className="mt-2 text-[11px] font-semibold text-center truncate">
                  {category}
                </h4>
                <p
                  className="mt-0.5 text-[10px] text-center"
                  style={{ color: active ? "rgba(26,18,0,0.7)" : "rgba(255,255,255,0.65)" }}
                >
                  {total} item{total !== 1 ? "s" : ""}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white/80">Maximum price</h3>
          <span
            className="font-bold px-3 py-1 rounded-full text-sm"
            style={{ background: AMBER, color: "#1A1200" }}
          >
            ₹{effectiveMax}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max={priceLimit}
          step="100"
          value={effectiveMax}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={{ background: "rgba(255,255,255,0.25)", accentColor: AMBER }}
        />
        <div className="flex justify-between mt-2 text-xs text-white/60">
          <span>₹0</span>
          <span>₹{priceLimit}</span>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={handleClearFilters}
          className="w-full py-2.5 rounded-xl text-white font-semibold text-sm border hover:bg-white/20 transition"
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
  const hasResults = products.length > 0 && filteredProducts.length > 0;

  return (
    <div className="flex flex-col" style={{ background: BG }}>
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 py-5 sm:py-6 flex flex-col flex-1">
        {/* Header */}
        <div className="shrink-0 mb-4 sm:mb-5">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: INK }}
          >
            Our products
          </h1>
          <div className="w-10 h-1 rounded-full mt-2 mb-2" style={{ background: AMBER }} />
          <p className="text-xs sm:text-sm" style={{ color: MUTED }}>
            Browse the current collection of tools & hardware
          </p>
        </div>

        {/* Mobile filter button */}
        <div className="lg:hidden shrink-0 mb-4 flex justify-between items-center">
          <button
            onClick={() => setShowMobileFilter(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm shadow"
            style={{ background: STEEL }}
          >
            <Filter size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: AMBER, color: "#1A1200" }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
          <p className="text-xs" style={{ color: MUTED }}>
            {filteredProducts.length} products
          </p>
        </div>

        {/* LAYOUT */}
        <div className="flex-1 grid lg:grid-cols-4 gap-5 lg:gap-6">
          {/* ================= LEFT SIDEBAR (desktop) ================= */}
          <aside
            className={`hidden lg:flex lg:col-span-1 flex-col gap-4 overflow-y-auto scrollbar-hide ${PANEL_HEIGHT}`}
          >
            {/* Filter card */}
            <div className="shrink-0 rounded-2xl xl:rounded-3xl overflow-hidden shadow-md">
              <div
                className="p-5 xl:p-6"
                style={{
                  background: `linear-gradient(160deg, ${STEEL} 0%, ${STEEL_DARK} 100%)`,
                }}
              >
                {renderFilterSection()}
              </div>
            </div>

            {/* Store at a glance */}
            <div
              className="shrink-0 rounded-2xl p-4"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
            >
              <h3 className="text-sm font-bold" style={{ color: INK }}>
                Store at a glance
              </h3>
              <div className="grid grid-cols-2 gap-2.5 mt-3">
                {glanceStats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl px-3 py-2.5"
                    style={{ background: BG }}
                  >
                    <p className="text-xl font-extrabold leading-none" style={{ color: STEEL }}>
                      {s.value}
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: MUTED }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Pedwal (bachi hui jagah tak failta hai) */}
            <div
              className="flex-1 min-h-[170px] rounded-2xl p-4 flex flex-col"
              style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
            >
              <div className="flex items-center gap-2">
                <span className="w-1 h-4 rounded-full" style={{ background: AMBER }} />
                <h3 className="text-sm font-bold" style={{ color: INK }}>
                  Why Pedwal Tools
                </h3>
              </div>

              <div className="flex-1 flex flex-col justify-around gap-3 mt-3">
                {WHY_POINTS.map(({ icon: Icon, title, note }) => (
                  <div key={title} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white"
                      style={{ background: STEEL }}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: INK }}>
                        {title}
                      </p>
                      <p className="text-[11px] truncate" style={{ color: MUTED }}>
                        {note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Mobile filter drawer */}
          {showMobileFilter && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowMobileFilter(false)}
              />
              <div
                className="absolute top-0 left-0 bottom-0 w-[85%] max-w-[320px] overflow-y-auto p-5 shadow-2xl animate-slide-left"
                style={{
                  background: `linear-gradient(160deg, ${STEEL} 0%, ${STEEL_DARK} 100%)`,
                }}
              >
                {renderFilterSection()}
              </div>
            </div>
          )}

          {/* ================= RIGHT: PRODUCTS PANEL ================= */}
          <div className={`lg:col-span-3 flex flex-col ${PANEL_HEIGHT}`}>
            {/* Toolbar (fixed): search + sort */}
            <div className="shrink-0 flex flex-col sm:flex-row gap-2.5 mb-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: MUTED }}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search product, brand ya material..."
                  className="w-full rounded-xl pl-10 pr-9 py-2.5 text-sm outline-none transition"
                  style={{
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                    color: INK,
                  }}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100"
                    style={{ color: MUTED }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl px-3.5 py-2.5 text-sm outline-none cursor-pointer sm:w-52"
                style={{
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                  color: INK,
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Scroll area: sirf product cards yahan scroll hote hain (desktop par) */}
            <div
              ref={productsScrollRef}
              className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-2 pt-1 pb-2 products-scroll"
            >
              {fetchError && products.length === 0 ? (
                <div
                  className="py-14 px-4 flex flex-col justify-center items-center text-center rounded-2xl"
                  style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                >
                  <Package size={52} style={{ color: "#C7CBCE" }} />
                  <h2 className="mt-4 text-xl font-bold" style={{ color: "#B4302F" }}>
                    Products load nahi ho paye
                  </h2>
                  <p className="mt-2 text-sm max-w-md" style={{ color: MUTED }}>
                    {fetchError}
                  </p>
                  <button
                    onClick={fetchProducts}
                    className="mt-6 px-6 py-2.5 rounded-xl text-white font-semibold text-sm active:scale-95 transition"
                    style={{ background: STEEL }}
                  >
                    Dobara try karein
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div
                  className="py-14 px-4 flex flex-col justify-center items-center text-center rounded-2xl"
                  style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                >
                  <Package size={52} style={{ color: "#C7CBCE" }} />
                  <h2 className="mt-4 text-xl font-bold" style={{ color: INK }}>
                    Abhi koi product available nahi hai
                  </h2>
                  <p className="mt-2 text-sm max-w-md" style={{ color: MUTED }}>
                    Server se khali list aayi hai. Admin se product add karein.
                  </p>
                  <button
                    onClick={fetchProducts}
                    className="mt-6 px-6 py-2.5 rounded-xl text-white font-semibold text-sm active:scale-95 transition"
                    style={{ background: STEEL }}
                  >
                    Refresh
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div
                  className="h-[360px] flex flex-col justify-center items-center rounded-2xl"
                  style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                >
                  <Package size={56} style={{ color: "#C7CBCE" }} />
                  <h2 className="mt-4 text-xl font-bold" style={{ color: INK }}>
                    No products found
                  </h2>
                  <p className="mt-2 text-sm" style={{ color: MUTED }}>
                    No products match your current filters.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-6 px-6 py-2.5 rounded-xl text-white font-semibold text-sm"
                    style={{ background: STEEL }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  {filteredProducts.slice(0, visibleProducts).map((product) => {
                    const basePrice = getLowestPrice(product);
                    const discountPercentage = Number(
                      product.discountPercent || product.offer || 0
                    );
                    const finalPrice = getCalculatedPrice(product);
                    const hasDiscount = discountPercentage > 0;
                    const discountTagNote = product.discountNote || "";
                    const inStock = product.stock > 0;
                    const rating = getRating(product);

                    return (
                      <div
                        key={product._id}
                        className="group rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col"
                        style={{
                          background: SURFACE,
                          border: `1px solid ${BORDER}`,
                        }}
                      >
                        {/* Image */}
                        <div
                          className="relative h-44 sm:h-52 overflow-hidden"
                          style={{ background: "#F1F2EF" }}
                        >
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition duration-500"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "https://placehold.co/400x400?text=No+Image";
                            }}
                          />

                          {/* --- 3. DYNAMIC DISCOUNT BADGE (SPECIAL / GENERAL) --- */}
                          {hasDiscount && (
                            <span
                              className="absolute top-2 left-0 animated-discount-badge text-[10px] sm:text-xs font-bold text-white px-2.5 py-1 flex items-center gap-1 shadow-md z-10"
                              style={{
                                background: `linear-gradient(135deg, ${AMBER_DARK} 0%, #D9381E 100%)`,
                                clipPath: "polygon(0 0, 100% 0, 92% 100%, 0% 100%)",
                              }}
                            >
                              <Sparkles size={12} className="animate-pulse" />
                              {discountTagNote
                                ? `${discountTagNote} (${discountPercentage}% OFF)`
                                : `${discountPercentage}% OFF`}
                            </span>
                          )}

                          {product.isNewProduct && (
                            <span className="absolute bottom-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase text-white bg-emerald-600 shadow">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              New
                            </span>
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

                        {/* Body */}
                        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h2
                              className="font-bold text-sm sm:text-base line-clamp-2"
                              style={{ color: INK }}
                            >
                              {product.name}
                            </h2>

                            <div className="mt-1.5">
                              <StarRating rating={rating} size={13} />
                            </div>

                            <div className="mt-1.5 space-y-0.5">
                              <p className="text-[11px] sm:text-xs" style={{ color: MUTED }}>
                                Brand:{" "}
                                <span style={{ color: INK }}>{product.brand || "N/A"}</span>
                              </p>
                              <p className="text-[11px] sm:text-xs" style={{ color: MUTED }}>
                                Material:{" "}
                                <span style={{ color: INK }}>
                                  {product.material || "N/A"}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-end mt-3">
                              <div>
                                <p className="text-[9px]" style={{ color: MUTED }}>
                                  Price
                                </p>
                                {/* --- 4. DISCOUNTED PRICE VS ORIGINAL PRICE DISPLAY --- */}
                                {hasDiscount ? (
                                  <div className="flex items-baseline gap-1.5">
                                    <h3
                                      className="text-lg sm:text-xl font-extrabold"
                                      style={{ color: "#D9381E" }}
                                    >
                                      ₹{finalPrice}
                                    </h3>
                                    <span className="text-xs text-gray-400 line-through font-medium">
                                      ₹{basePrice}
                                    </span>
                                  </div>
                                ) : (
                                  <h3
                                    className="text-lg sm:text-xl font-extrabold"
                                    style={{ color: INK }}
                                  >
                                    ₹{basePrice}
                                  </h3>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-[9px]" style={{ color: MUTED }}>
                                  Stock
                                </p>
                                <h4 className="font-bold text-base" style={{ color: "#1D7A43" }}>
                                  {product.stock ?? 0}
                                </h4>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-4">
                              <button
                                onClick={() =>
                                  navigate(`/product/${product._id}`, {
                                    state: { product },
                                  })
                                }
                                className="text-white rounded-xl py-2.5 text-xs sm:text-sm font-semibold hover:opacity-90 active:scale-95 transition"
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
                                className="rounded-xl py-2.5 text-xs sm:text-sm font-bold transition disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
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
                                    navigate(`/varieties/${product.variantGroup}`, {
                                      state: {
                                        groupName: product.variantGroup,
                                        productName: product.name,
                                      },
                                    })
                                  }
                                  className="w-full mt-2 py-2 rounded-xl border font-semibold text-xs sm:text-sm hover:bg-gray-50 active:scale-95 transition"
                                  style={{ borderColor: BORDER, color: STEEL }}
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
              )}
            </div>

            {/* Bottom bar (fixed): scroll box ke bahar, list ke saath scroll nahi hota */}
            {hasResults && (
              <div
                className="shrink-0 mt-3 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t"
                style={{ borderColor: BORDER }}
              >
                <p className="text-xs sm:text-sm" style={{ color: MUTED }}>
                  Showing{" "}
                  <span className="font-bold" style={{ color: INK }}>
                    {Math.min(visibleProducts, filteredProducts.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold" style={{ color: INK }}>
                    {filteredProducts.length}
                  </span>{" "}
                  products
                </p>

                {filteredProducts.length > visibleProducts && (
                  <button
                    onClick={() => setVisibleProducts((p) => p + 8)}
                    className="w-full sm:w-auto px-7 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 active:scale-95 transition"
                    style={{ background: STEEL }}
                  >
                    Load more products
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { scrollbar-width: none; }

        /* Products list ka patla scrollbar */
        .products-scroll { scrollbar-width: thin; scrollbar-color: #C7CBCE transparent; }
        .products-scroll::-webkit-scrollbar { width: 6px; }
        .products-scroll::-webkit-scrollbar-track { background: transparent; }
        .products-scroll::-webkit-scrollbar-thumb { background: #C7CBCE; border-radius: 9999px; }
        .products-scroll::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }

        @keyframes slide-left {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-left {
          animation: slide-left 0.3s ease-out;
        }

        /* Discount Offers blink */
        @keyframes offer-blink {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(240, 164, 32, 0.4);
            border-color: rgba(255,255,255,0.18);
          }
          50% {
            box-shadow: 0 0 14px 3px rgba(240, 164, 32, 0.65);
            border-color: ${AMBER};
            background: rgba(240, 164, 32, 0.18) !important;
          }
        }
        .offer-blink {
          animation: offer-blink 1.5s ease-in-out infinite;
        }

        @keyframes shimmer-sweep {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animated-discount-badge {
          background-size: 200% 100% !important;
          animation: shimmer-sweep 3s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default Card;
