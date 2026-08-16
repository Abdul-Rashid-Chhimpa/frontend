import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Tags,
  Search,
  RefreshCw,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Download,
  Calendar,
} from "lucide-react";

const API_BASE = "https://backend-3-axez.onrender.com/api";

const AdminCategories = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const reportRef = useRef(null);

  // Fetch Products & Orders Data
  const fetchData = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const [prodRes, orderRes] = await Promise.all([
        axios.get(`${API_BASE}/products`),
        axios.get(`${API_BASE}/orders`).catch(() => ({ data: [] })),
      ]);

      // Handle Products Data
      const prodData = prodRes.data;
      if (prodData?.success && Array.isArray(prodData.products)) {
        setProducts(prodData.products);
      } else if (Array.isArray(prodData)) {
        setProducts(prodData);
      } else if (Array.isArray(prodData?.data)) {
        setProducts(prodData.data);
      } else {
        setProducts([]);
      }

      // Handle Orders Data
      const oData = orderRes.data;
      if (oData?.success && Array.isArray(oData.orders)) {
        setOrders(oData.orders);
      } else if (Array.isArray(oData)) {
        setOrders(oData);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Fetch Data Error:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Data load nahi ho paya",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Group Products by Category
  const categoriesWithStock = useMemo(() => {
    const categoryMap = {};

    products.forEach((prod) => {
      let catName = "Uncategorized";
      if (typeof prod.category === "string" && prod.category.trim()) {
        catName = prod.category.trim();
      } else if (prod.category && prod.category.name) {
        catName = prod.category.name.trim();
      }

      const stockVal = Number(
        prod.stock ?? prod.countInStock ?? prod.quantity ?? 0
      );

      if (!categoryMap[catName]) {
        categoryMap[catName] = {
          name: catName,
          productCount: 0,
          stockLeft: 0,
        };
      }

      categoryMap[catName].productCount += 1;
      categoryMap[catName].stockLeft += stockVal;
    });

    return Object.values(categoryMap);
  }, [products]);

  
  // AdminCategories.jsx inside useMemo calculation
const monthlyStats = useMemo(() => {
  let totalUnitsSold = 0;
  let totalRevenue = 0;
  let totalCost = 0;

  const currentFilterMonth = selectedMonth || new Date().toISOString().slice(0, 7);

  orders.forEach((order) => {
    // Only process fulfilled/shipped orders
    const isShippedOrDelivered =
      order.status === "Shipped" || order.status === "Delivered";

    const rawDate = order.createdAt || order.date || order.updatedAt;
    const orderMonth = rawDate ? new Date(rawDate).toISOString().slice(0, 7) : "";

    if (isShippedOrDelivered && orderMonth === currentFilterMonth) {
      const items = order.items || order.orderItems || [];

      items.forEach((item) => {
        const qty = Number(item.quantity || item.qty || 1);
        const price = Number(item.price || item.unitPrice || 0);
        // Cost Price calculation (fallback 70% if cost not specified)
        const cost = Number(item.costPrice || item.product?.costPrice || price * 0.7);

        totalUnitsSold += qty;
        totalRevenue += price * qty;
        totalCost += cost * qty;
      });
    }
  });

  const netProfit = totalRevenue - totalCost;
  const profitMargin =
    totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

  return { totalUnitsSold, totalRevenue, totalCost, netProfit, profitMargin };
}, [orders, selectedMonth]);
  // PDF Export
  const handleDownloadPDF = async () => {
    const element = reportRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Sales_Report_${selectedMonth}.pdf`);
    } catch (error) {
      console.error("PDF Download Error:", error);
    }
  };

  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return categoriesWithStock;
    return categoriesWithStock.filter((cat) =>
      cat.name.toLowerCase().includes(q)
    );
  }, [categoriesWithStock, search]);

  const totalStockInInventory = useMemo(() => {
    return categoriesWithStock.reduce((acc, c) => acc + c.stockLeft, 0);
  }, [categoriesWithStock]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium text-sm">
            Loading Inventory & Sales Data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Tags className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800">
                Categories & Monthly Reports
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Track Stock, Monthly Sales & Generate Profit PDF Reports
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-indigo-50 transition shadow-sm"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow-md"
            >
              <Download size={16} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {message.text && (
          <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-red-50 border border-red-200 text-red-700">
            <AlertTriangle size={18} />
            {message.text}
          </div>
        )}

        {/* PDF Container */}
        <div ref={reportRef} className="p-2 bg-transparent rounded-2xl">
          {/* Logo Section for Report */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl">
                A
              </div>
              <div>
                <h2 className="font-extrabold text-gray-800 text-lg">ADMIN STORE REPORT</h2>
                <p className="text-xs text-gray-400">Monthly Profit & Inventory Analytics</p>
              </div>
            </div>

            <div className="flex items-center gap-2 border border-gray-200 px-3 py-1.5 rounded-xl bg-gray-50">
              <Calendar size={16} className="text-gray-500" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
              />
            </div>
          </div>

          {/* Monthly Sales Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 uppercase font-medium">Units Sold ({selectedMonth})</p>
              <p className="text-2xl font-extrabold text-gray-800 mt-1">
                {monthlyStats.totalUnitsSold} Pcs
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 uppercase font-medium">Monthly Revenue</p>
              <p className="text-2xl font-extrabold text-indigo-600 mt-1">
                ₹{monthlyStats.totalRevenue.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 uppercase font-medium">Net Profit</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                ₹{monthlyStats.netProfit.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 uppercase font-medium flex items-center gap-1">
                <TrendingUp size={14} /> Profit Margin
              </p>
              <p className="text-2xl font-extrabold text-purple-600 mt-1">
                {monthlyStats.profitMargin}%
              </p>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((cat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex flex-col justify-between"
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
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Products Type</p>
                    <p className="text-sm font-bold text-gray-700">{cat.productCount} items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-medium">Stock Left</p>
                    <span className="font-bold text-sm text-emerald-600">{cat.stockLeft} in stock</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
