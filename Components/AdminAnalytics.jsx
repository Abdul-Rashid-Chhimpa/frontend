import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart3,
  Package,
  Tags,
  Users,
  AlertTriangle,
  XCircle,
  Boxes,
  IndianRupee,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

const API_BASE = "https://backend-3-axez.onrender.com/api";

// ======================================================
// DESIGN TOKENS — shared with the storefront + admin console
// ======================================================
const INK = "#15181C";
const MUTED = "#6B7280";
const BORDER = "#E6E8EB";
const SURFACE = "#FFFFFF";
const BG = "#F5F6F4";
const STEEL = "#2B4A5E";
const SUCCESS = "#1D7A43";
const SUCCESS_BG = "#E4F3E9";
const WARNING = "#B4691F";
const WARNING_BG = "#FBF1E4";
const DANGER = "#B4302F";
const DANGER_BG = "#FBEEEE";

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      setError("");

      // Timestamp parameter URL me add karke browser caching prevent ki gayi hai
      const { data: res } = await axios.get(
        `${API_BASE}/analytics?t=${new Date().getTime()}`
      );

      if (res.success) {
        setData(res.analytics);
      } else {
        setError(res.message || "Failed to load analytics");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Analytics load nahi ho paya"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Auto Refresh har 5 second me (Jaise hi Order Deliver click ho live update ho jaye)
    const interval = setInterval(() => {
      fetchAnalytics(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ======================================================
  // LOADING
  // ======================================================
  if (loading) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8" style={{ background: BG }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl shimmer" style={{ background: BORDER }} />
            <div>
              <div className="h-6 w-32 rounded-lg shimmer" style={{ background: BORDER }} />
              <div className="h-3 w-44 rounded-md shimmer mt-2" style={{ background: BORDER }} />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border p-4 sm:p-5" style={{ background: SURFACE, borderColor: BORDER }}>
                <div className="w-9 h-9 rounded-xl shimmer mb-3" style={{ background: BG }} />
                <div className="h-3 w-3/4 rounded-md shimmer" style={{ background: BORDER }} />
                <div className="h-6 w-1/2 rounded-md shimmer mt-2" style={{ background: BORDER }} />
              </div>
            ))}
          </div>
        </div>
        <style>{`
          .shimmer { position: relative; overflow: hidden; }
          .shimmer::after {
            content: "";
            position: absolute;
            inset: 0;
            transform: translateX(-100%);
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%);
            animation: shimmer-sweep 1.6s infinite;
          }
          @keyframes shimmer-sweep { 100% { transform: translateX(100%); } }
          @media (prefers-reduced-motion: reduce) { .shimmer::after { animation: none; } }
        `}</style>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: BG }}>
        <div className="rounded-2xl p-8 border text-center max-w-md" style={{ background: SURFACE, borderColor: BORDER }}>
          <XCircle className="mx-auto mb-3" size={40} style={{ color: DANGER }} />
          <p className="font-medium" style={{ color: INK }}>{error || "No data"}</p>
          <button
            onClick={() => fetchAnalytics(false)}
            className="mt-4 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ background: STEEL }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { overview } = data;
  const maxCatCount = Math.max(
    ...(data.productsByCategory?.map((c) => c.count) || [1]),
    1
  );

  // Neutral metrics use the steel brand chip; stock-health metrics carry real
  // semantic meaning (green/amber/red) instead of a rainbow of gradients.
  const statCards = [
    { label: "Total products", value: overview.totalProducts || 0, icon: Package, tone: "steel" },
    { label: "Categories", value: overview.totalCategories || 0, icon: Tags, tone: "steel" },
    { label: "Users", value: overview.totalUsers || 0, icon: Users, tone: "steel" },
    { label: "Total stock units", value: (overview.totalStock || 0).toLocaleString("en-IN"), icon: Boxes, tone: "steel" },
    { label: "Inventory value", value: `₹${(overview.inventoryValue || 0).toLocaleString("en-IN")}`, icon: IndianRupee, tone: "steel" },
    { label: "In stock", value: overview.inStock || 0, icon: TrendingUp, tone: "success" },
    { label: "Low stock (≤20)", value: overview.lowStock || 0, icon: AlertTriangle, tone: "warning" },
    { label: "Out of stock", value: overview.outOfStock || 0, icon: XCircle, tone: "danger" },
  ];

  const toneStyles = {
    steel: { bg: "#EDF1F3", fg: STEEL },
    success: { bg: SUCCESS_BG, fg: SUCCESS },
    warning: { bg: WARNING_BG, fg: WARNING },
    danger: { bg: DANGER_BG, fg: DANGER },
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8" style={{ background: BG }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ background: STEEL }}>
              <BarChart3 className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight" style={{ color: INK }}>
                Analytics
              </h1>
              <p className="text-xs sm:text-sm" style={{ color: MUTED }}>
                Live products, stock & inventory overview
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchAnalytics(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition self-start"
            style={{ background: SURFACE, borderColor: BORDER, color: INK }}
          >
            <RefreshCw size={16} style={{ color: STEEL }} />
            Refresh
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            const tone = toneStyles[card.tone];
            return (
              <div
                key={card.label}
                className="rounded-2xl border p-4 sm:p-5"
                style={{ background: SURFACE, borderColor: BORDER }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: tone.bg }}
                >
                  <Icon size={18} style={{ color: tone.fg }} />
                </div>
                <p className="text-[11px] sm:text-xs font-medium" style={{ color: MUTED }}>
                  {card.label}
                </p>
                <p className="text-xl sm:text-2xl font-bold mt-1" style={{ color: INK }}>
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mb-6">
          {/* Products by Category */}
          <div className="rounded-2xl border p-5" style={{ background: SURFACE, borderColor: BORDER }}>
            <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: INK }}>
              <Tags size={18} style={{ color: STEEL }} />
              Products by category
            </h2>
            {!data.productsByCategory || data.productsByCategory.length === 0 ? (
              <p className="text-sm" style={{ color: MUTED }}>No data</p>
            ) : (
              <div className="space-y-3">
                {data.productsByCategory.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium truncate max-w-[60%]" style={{ color: INK }}>
                        {cat.name}
                      </span>
                      <span style={{ color: MUTED }}>
                        {cat.count} products · {cat.stock} units
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: BG }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(cat.count / maxCatCount) * 100}%`,
                          background: STEEL,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Products by Brand */}
          <div className="rounded-2xl border p-5" style={{ background: SURFACE, borderColor: BORDER }}>
            <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: INK }}>
              <Package size={18} style={{ color: STEEL }} />
              Products by brand
            </h2>
            {!data.productsByBrand || data.productsByBrand.length === 0 ? (
              <p className="text-sm" style={{ color: MUTED }}>No data</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.productsByBrand.map((b) => (
                  <div
                    key={b.name}
                    className="px-3 py-2 rounded-xl border text-sm"
                    style={{ background: BG, borderColor: BORDER }}
                  >
                    <span className="font-semibold" style={{ color: INK }}>
                      {b.name}
                    </span>
                    <span className="ml-1.5" style={{ color: MUTED }}>
                      ({b.count})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mb-6">
          {/* Low stock */}
          <div className="rounded-2xl border p-5" style={{ background: SURFACE, borderColor: BORDER }}>
            <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: INK }}>
              <AlertTriangle size={18} style={{ color: WARNING }} />
              Low stock products (≤20)
            </h2>
            {!data.lowStockProducts || data.lowStockProducts.length === 0 ? (
              <p className="text-sm" style={{ color: MUTED }}>No low stock items</p>
            ) : (
              <div className="space-y-2">
                {data.lowStockProducts.map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                    style={{ borderColor: BG }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: INK }}>
                        {p.name}
                      </p>
                      <p className="text-xs" style={{ color: MUTED }}>
                        {p.category?.name || p.category} · {p.brand || "—"}
                      </p>
                    </div>
                    <span
                      className="shrink-0 ml-2 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: WARNING_BG, color: WARNING }}
                    >
                      {p.stock ?? p.countInStock ?? 0} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Out of stock */}
          <div className="rounded-2xl border p-5" style={{ background: SURFACE, borderColor: BORDER }}>
            <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ color: INK }}>
              <XCircle size={18} style={{ color: DANGER }} />
              Out of stock
            </h2>
            {!data.outOfStockProducts || data.outOfStockProducts.length === 0 ? (
              <p className="text-sm" style={{ color: MUTED }}>All products in stock</p>
            ) : (
              <div className="space-y-2">
                {data.outOfStockProducts.map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                    style={{ borderColor: BG }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: INK }}>
                        {p.name}
                      </p>
                      <p className="text-xs" style={{ color: MUTED }}>
                        {p.category?.name || p.category} · {p.brand || "—"}
                      </p>
                    </div>
                    <span
                      className="shrink-0 ml-2 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: DANGER_BG, color: DANGER }}
                    >
                      0
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent products */}
        <div className="rounded-2xl border p-5" style={{ background: SURFACE, borderColor: BORDER }}>
          <h2 className="font-semibold mb-4" style={{ color: INK }}>Recent products stock status</h2>
          {!data.recentProducts || data.recentProducts.length === 0 ? (
            <p className="text-sm" style={{ color: MUTED }}>No products yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs border-b" style={{ color: MUTED, borderColor: BORDER }}>
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium hidden sm:table-cell">Category</th>
                    <th className="pb-3 font-medium">Stock</th>
                    <th className="pb-3 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentProducts.map((p) => {
                    const currentStock = p.stock ?? p.countInStock ?? 0;
                    const stockColor =
                      currentStock === 0 ? DANGER : currentStock <= 20 ? WARNING : SUCCESS;
                    return (
                      <tr key={p._id} className="border-b last:border-0" style={{ borderColor: BG }}>
                        <td className="py-3 font-medium" style={{ color: INK }}>{p.name}</td>
                        <td className="py-3 hidden sm:table-cell" style={{ color: MUTED }}>
                          {p.category?.name || p.category || "—"}
                        </td>
                        <td className="py-3">
                          <span className="font-semibold" style={{ color: stockColor }}>
                            {currentStock}
                          </span>
                        </td>
                        <td className="py-3 font-semibold" style={{ color: STEEL }}>₹{p.price}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
