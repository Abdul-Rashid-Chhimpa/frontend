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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. Fetch Products from Backend
  const fetchProductsData = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const { data } = await axios.get(`${API_BASE}/products`);
      
      // MongoDB Response format handling (whether array or wrapped in { products: [...] })
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else if (data.data && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Fetch Products Error:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Products load nahi ho paye",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsData();
  }, []);

  // 2. Group Products by Category & Compute Total Stock
  const categoriesWithStock = useMemo(() => {
    const categoryMap = {};

    products.forEach((prod) => {
      // Get category name safely (handles object or string)
      let catName = "Uncategorized";
      if (typeof prod.category === "string" && prod.category.trim()) {
        catName = prod.category.trim();
      } else if (prod.category && prod.category.name) {
        catName = prod.category.name.trim();
      }

      // Read stock value (handles stock, countInStock, quantity fields)
      const stockVal = Number(
        prod.stock ?? prod.countInStock ?? prod.quantity ?? 0
      );

      if (!categoryMap[catName]) {
        categoryMap[catName] = {
          name: catName,
          productCount: 0,
          stockLeft: 0,
          sampleImage: prod.image || prod.images?.[0] || "",
        };
      }

      categoryMap[catName].productCount += 1;
      categoryMap[catName].stockLeft += stockVal;
    });

    return Object.values(categoryMap);
  }, [products]);

  // 3. Search Filter
  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return categoriesWithStock;
    return categoriesWithStock.filter((cat) =>
      cat.name.toLowerCase().includes(q)
    );
  }, [categoriesWithStock, search]);

  // Total Items & Total Stock Summary
  const totalStockInInventory = useMemo(() => {
    return categoriesWithStock.reduce((acc, c) => acc + c.stockLeft, 0);
  }, [categoriesWithStock]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium text-sm">
            Fetching categories & stock from products...
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
                Categories & Live Stock
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Backend products se Auto-generated Categories aur remaining stock
              </p>
            </div>
          </div>

          <button
            onClick={fetchProductsData}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-indigo-50 transition shadow-sm"
          >
            <RefreshCw size={16} />
            <span>Refresh Stock Data</span>
          </button>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-red-50 border border-red-200 text-red-700">
            <AlertTriangle size={18} />
            {message.text}
          </div>
        )}

        {/* Inventory Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-medium">Categories Found</p>
            <p className="text-2xl font-extrabold text-gray-800 mt-1">
              {categoriesWithStock.length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-medium">Total Products</p>
            <p className="text-2xl font-extrabold text-purple-600 mt-1">
              {products.length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm col-span-2 sm:col-span-1">
            <p className="text-xs text-gray-500 uppercase font-medium">Total Items Stock</p>
            <p className="text-2xl font-extrabold text-indigo-600 mt-1">
              {totalStockInInventory}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4 mb-5">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search category by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No categories/products found in backend</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((cat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-gray-800 text-lg truncate">
                      {cat.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Auto-grouped from live backend products
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Products Type</p>
                      <p className="text-sm font-bold text-gray-700">
                        {cat.productCount} items
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-medium">Stock Left</p>
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
