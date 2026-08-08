import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Tags,
  Search,
  RefreshCw,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const API_BASE = "https://backend-3-axez.onrender.com/api";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. Fetch Categories & Products from Backend
  const fetchData = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      // Parallel API calls for Categories and Products
      const [catRes, prodRes] = await Promise.all([
        axios.get(`${API_BASE}/categories`),
        axios.get(`${API_BASE}/products`),
      ]);

      if (catRes.data.success) {
        setCategories(catRes.data.categories || []);
      } else {
        setCategories([]);
      }

      if (prodRes.data.success) {
        setProducts(prodRes.data.products || []);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to load data from backend",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Map Stock to Categories
  const categoriesWithStock = useMemo(() => {
    return categories.map((cat) => {
      // Find all products that belong to this category (checking name or ID match)
      const matchingProducts = products.filter(
        (p) =>
          p.category === cat.name ||
          p.category?._id === cat._id ||
          p.categoryId === cat._id
      );

      // Sum up remaining stock of all matching products
      const totalStock = matchingProducts.reduce((acc, p) => {
        const stockVal = Number(p.stock || p.countInStock || p.quantity || 0);
        return acc + stockVal;
      }, 0);

      return {
        ...cat,
        productCount: matchingProducts.length,
        stockLeft: totalStock,
      };
    });
  }, [categories, products]);

  // 3. Search and Status Filtering
  const filtered = useMemo(() => {
    return categoriesWithStock.filter((c) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [categoriesWithStock, search, statusFilter]);

  // Overall Inventory Stats
  const totalStockInInventory = useMemo(() => {
    return categoriesWithStock.reduce((acc, c) => acc + c.stockLeft, 0);
  }, [categoriesWithStock]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium text-sm">
            Loading backend categories & stock...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Tags className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800">
                Categories & Stock
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Live view of product categories and remaining inventory stock
              </p>
            </div>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-indigo-50 transition shadow-sm"
          >
            <RefreshCw size={16} />
            <span>Refresh Stock Data</span>
          </button>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`mb-5 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            <AlertTriangle size={18} />
            {message.text}
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-medium">Categories</p>
            <p className="text-2xl font-extrabold text-gray-800 mt-1">
              {categories.length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-medium">Total Items in Stock</p>
            <p className="text-2xl font-extrabold text-indigo-600 mt-1">
              {totalStockInInventory}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-medium">Active Categories</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {categories.filter((c) => c.status === "active").length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-medium">Inactive</p>
            <p className="text-2xl font-extrabold text-gray-400 mt-1">
              {categories.filter((c) => c.status === "inactive").length}
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4 mb-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search category by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex gap-2">
            {["all", "active", "inactive"].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold capitalize transition ${
                  statusFilter === f
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Categories List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No categories found from backend</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((cat) => (
              <div
                key={cat._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Title & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-800 text-base truncate">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {cat.slug || "No Slug"}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        cat.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {cat.status}
                    </span>
                  </div>

                  {cat.description && (
                    <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                </div>

                {/* Stock Left & Items Section */}
                <div className="mt-5 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Products</p>
                      <p className="text-sm font-bold text-gray-700">
                        {cat.productCount} items
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-medium">Remaining Stock</p>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        {cat.stockLeft === 0 ? (
                          <span className="flex items-center gap-1 text-red-600 font-bold text-sm bg-red-50 px-2 py-0.5 rounded-md">
                            <XCircle size={14} /> Out of Stock
                          </span>
                        ) : cat.stockLeft <= 5 ? (
                          <span className="flex items-center gap-1 text-amber-600 font-bold text-sm bg-amber-50 px-2 py-0.5 rounded-md">
                            <AlertTriangle size={14} /> {cat.stockLeft} left
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded-md">
                            <CheckCircle2 size={14} /> {cat.stockLeft} in stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
