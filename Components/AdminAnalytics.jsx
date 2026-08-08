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

const API_BASE = "https://backend-3-axez.onrender.com/api/products";

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium text-sm">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center max-w-md">
          <XCircle className="mx-auto text-red-400 mb-3" size={40} />
          <p className="text-gray-700 font-medium">{error || "No data"}</p>
          <button
            onClick={() => fetchAnalytics(false)}
            className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
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

  const statCards = [
    {
      label: "Total Products",
      value: overview.totalProducts || 0,
      icon: Package,
      color: "from-indigo-500 to-purple-600",
    },
    {
      label: "Categories",
      value: overview.totalCategories || 0,
      icon: Tags,
      color: "from-violet-500 to-fuchsia-600",
    },
    {
      label: "Users",
      value: overview.totalUsers || 0,
      icon: Users,
      color: "from-blue-500 to-cyan-600",
    },
    {
      label: "Total Stock Units",
      value: (overview.totalStock || 0).toLocaleString("en-IN"),
      icon: Boxes,
      color: "from-emerald-500 to-teal-600",
    },
    {
      label: "Inventory Value",
      value: `₹${(overview.inventoryValue || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "from-amber-500 to-orange-600",
    },
    {
      label: "In Stock",
      value: overview.inStock || 0,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-600",
    },
    {
      label: "Low Stock (≤20)",
      value: overview.lowStock || 0,
      icon: AlertTriangle,
      color: "from-yellow-500 to-amber-600",
    },
    {
      label: "Out of Stock",
      value: overview.outOfStock || 0,
      icon: XCircle,
      color: "from-red-500 to-rose-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <BarChart3 className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800">
                Analytics
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Live products, stock & inventory overview
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchAnalytics(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-indigo-50 transition shadow-sm self-start"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5"
              >
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}
                >
                  <Icon size={18} className="text-white" />
                </div>
                <p className="text-[11px] sm:text-xs text-gray-500 font-medium uppercase tracking-wide">
                  {card.label}
                </p>
                <p className="text-xl sm:text-2xl font-extrabold text-gray-800 mt-1">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mb-6">
          {/* Products by Category */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Tags size={18} className="text-indigo-600" />
              Products by Category
            </h2>
            {!data.productsByCategory || data.productsByCategory.length === 0 ? (
              <p className="text-sm text-gray-400">No data</p>
            ) : (
              <div className="space-y-3">
                {data.productsByCategory.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 truncate max-w-[60%]">
                        {cat.name}
                      </span>
                      <span className="text-gray-500">
                        {cat.count} products · {cat.stock} units
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                        style={{
                          width: `${(cat.count / maxCatCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Products by Brand */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={18} className="text-indigo-600" />
              Products by Brand
            </h2>
            {!data.productsByBrand || data.productsByBrand.length === 0 ? (
              <p className="text-sm text-gray-400">No data</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.productsByBrand.map((b) => (
                  <div
                    key={b.name}
                    className="px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-sm"
                  >
                    <span className="font-semibold text-indigo-700">
                      {b.name}
                    </span>
                    <span className="text-indigo-400 ml-1.5">
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              Low Stock Products (≤20)
            </h2>
            {!data.lowStockProducts || data.lowStockProducts.length === 0 ? (
              <p className="text-sm text-gray-400">No low stock items 🎉</p>
            ) : (
              <div className="space-y-2">
                {data.lowStockProducts.map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {p.category?.name || p.category} · {p.brand || "—"}
                      </p>
                    </div>
                    <span className="shrink-0 ml-2 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                      {p.stock ?? p.countInStock ?? 0} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Out of stock */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <XCircle size={18} className="text-red-500" />
              Out of Stock
            </h2>
            {!data.outOfStockProducts || data.outOfStockProducts.length === 0 ? (
              <p className="text-sm text-gray-400">All products in stock 🎉</p>
            ) : (
              <div className="space-y-2">
                {data.outOfStockProducts.map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {p.category?.name || p.category} · {p.brand || "—"}
                      </p>
                    </div>
                    <span className="shrink-0 ml-2 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold">
                      0
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-4">Recent Products Stock Status</h2>
          {!data.recentProducts || data.recentProducts.length === 0 ? (
            <p className="text-sm text-gray-400">No products yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100">
                    <th className="pb-3 font-semibold">Product</th>
                    <th className="pb-3 font-semibold hidden sm:table-cell">Category</th>
                    <th className="pb-3 font-semibold">Stock</th>
                    <th className="pb-3 font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentProducts.map((p) => {
                    const currentStock = p.stock ?? p.countInStock ?? 0;
                    return (
                      <tr key={p._id} className="border-b border-gray-50 last:border-0">
                        <td className="py-3 font-medium text-gray-800">{p.name}</td>
                        <td className="py-3 text-gray-500 hidden sm:table-cell">
                          {p.category?.name || p.category || "—"}
                        </td>
                        <td className="py-3">
                          <span
                            className={`font-semibold ${
                              currentStock === 0
                                ? "text-red-500"
                                : currentStock <= 20
                                ? "text-amber-600"
                                : "text-emerald-600"
                            }`}
                          >
                            {currentStock}
                          </span>
                        </td>
                        <td className="py-3 font-semibold text-indigo-700">₹{p.price}</td>
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
