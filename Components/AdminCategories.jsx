import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Tags,
  Search,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Download,
  Calendar,
  Loader2,
  ChevronDown,
  Package,
} from "lucide-react";

const API_BASE = "https://backend-3-axez.onrender.com/api";

const AdminCategories = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // Fetch Products & Orders Data
  const fetchData = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });

      const [prodRes, orderRes] = await Promise.all([
        axios.get(`${API_BASE}/products`),
        axios
          .get(`${API_BASE}/orders/all`)
          .catch(() =>
            axios.get(`${API_BASE}/orders`).catch(() => ({ data: [] }))
          ),
      ]);

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

  // Shipped Orders map for calculation
  const shippedUnitsMap = useMemo(() => {
    const map = {};
    orders.forEach((order) => {
      const status = (order.status || "").toLowerCase();
      // Shipped/Delivered order state validation
      const isShipped = status === "shipped" || status === "delivered";

      if (isShipped) {
        const itemsList = order.items || order.orderItems || order.products || [];
        itemsList.forEach((item) => {
          const prodId = item.product?._id || item.product || item._id;
          const qty = Number(item.quantity ?? item.qty ?? item.count ?? 1);
          if (prodId) {
            map[prodId] = (map[prodId] || 0) + qty;
          }
        });
      }
    });
    return map;
  }, [orders]);

  // Group Products by Category with Actual Shipped Stock Deduction
  const categoriesWithStock = useMemo(() => {
    const categoryMap = {};

    products.forEach((prod) => {
      let catName = "Uncategorized";
      if (typeof prod.category === "string" && prod.category.trim()) {
        catName = prod.category.trim();
      } else if (prod.category && prod.category.name) {
        catName = prod.category.name.trim();
      }

      const initialStock = Number(
        prod.stock ?? prod.countInStock ?? prod.quantity ?? 0
      );
      const soldQty = shippedUnitsMap[prod._id] || 0;
      const netRemainingStock = Math.max(0, initialStock - soldQty);

      if (!categoryMap[catName]) {
        categoryMap[catName] = {
          name: catName,
          productCount: 0,
          stockLeft: 0,
        };
      }

      categoryMap[catName].productCount += 1;
      categoryMap[catName].stockLeft += netRemainingStock;
    });

    return Object.values(categoryMap);
  }, [products, shippedUnitsMap]);

  // Monthly Product Sales Stats for PDF Report
  const productMonthlySales = useMemo(() => {
    const prodStatsMap = {};
    const filterMonth = selectedMonth || new Date().toISOString().slice(0, 7);

    orders.forEach((order) => {
      const status = (order.status || "").toLowerCase();
      const isValid = status === "shipped" || status === "delivered" || order.isPaid;

      const rawDate = order.createdAt || order.date || order.orderDate || order.updatedAt;
      let orderMonth = "";
      if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          orderMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        }
      }

      if (isValid && (!orderMonth || orderMonth === filterMonth)) {
        const itemsList = order.items || order.orderItems || order.products || [];
        itemsList.forEach((item) => {
          const name = item.name || item.product?.name || "Standard Item";
          const qty = Number(item.quantity ?? item.qty ?? item.count ?? 1);
          const price = Number(item.price ?? item.unitPrice ?? item.product?.price ?? 0);
          const cost = Number(item.costPrice ?? item.product?.costPrice ?? price * 0.7);

          if (!prodStatsMap[name]) {
            prodStatsMap[name] = {
              name,
              unitsSold: 0,
              costPrice: cost,
              revenue: 0,
              profit: 0,
            };
          }

          prodStatsMap[name].unitsSold += qty;
          prodStatsMap[name].revenue += price * qty;
          prodStatsMap[name].profit += (price - cost) * qty;
        });
      }
    });

    return Object.values(prodStatsMap).sort((a, b) => b.unitsSold - a.unitsSold);
  }, [orders, selectedMonth]);

  // Overall Monthly Analytics Calculation
  const monthlyStats = useMemo(() => {
    let totalUnitsSold = 0;
    let totalRevenue = 0;
    let totalCost = 0;

    productMonthlySales.forEach((p) => {
      totalUnitsSold += p.unitsSold;
      totalRevenue += p.revenue;
      totalCost += p.revenue - p.profit;
    });

    const netProfit = totalRevenue - totalCost;
    const profitMargin =
      totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

    return { totalUnitsSold, totalRevenue, totalCost, netProfit, profitMargin };
  }, [productMonthlySales]);

  // Optimized PDF Generator Function
  const handleDownloadPDF = () => {
    try {
      setDownloadingPdf(true);
      const doc = new jsPDF("p", "pt", "a4");

      // Header Gradient Box background
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 595, 80, "F");

      // Company Branding Text
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("PEDWAL LIFE CREATION", 40, 42);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Official Inventory & Sales Analysis Report", 40, 58);

      // Business Details Info Panel
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(9);
      
      const currentTime = new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      doc.text(`GSTIN: 07AAAAA0000A1Z5`, 40, 105);
      doc.text(`Mobile: +91 9876543210`, 40, 118);
      doc.text(`Email: support@pedwallife.com`, 40, 131);

      doc.text(`Report Month: ${selectedMonth}`, 380, 105);
      doc.text(`Generated On: ${currentTime}`, 380, 118);
      doc.text(`Address: Main Market, New Delhi, India`, 380, 131);

      // Horizontal Line Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(40, 145, 555, 145);

      // Top Selling / Sold Items Table
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("Monthly Sold Products Breakdown", 40, 165);

      const tableData = productMonthlySales.map((item, index) => [
        index + 1,
        item.name,
        `${item.unitsSold} Pcs`,
        `Rs. ${item.costPrice.toLocaleString("en-IN")}`,
        `Rs. ${item.revenue.toLocaleString("en-IN")}`,
        `Rs. ${item.profit.toLocaleString("en-IN")}`,
      ]);

      autoTable(doc, {
        startY: 175,
        head: [["S.No", "Product Name", "Units Sold", "Cost Price", "Revenue", "Profit"]],
        body: tableData.length > 0 ? tableData : [["-", "No Sales Found This Month", "-", "-", "-", "-"]],
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
        styles: { fontSize: 9, cellPadding: 5 },
      });

      // Overall Summary Section
      const finalY = doc.lastAutoTable.finalY + 25;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Monthly Summary Overview", 40, finalY);

      autoTable(doc, {
        startY: finalY + 10,
        head: [["Total Units Sold", "Total Revenue", "Net Profit", "Profit Margin"]],
        body: [[
          `${monthlyStats.totalUnitsSold} Pcs`,
          `Rs. ${monthlyStats.totalRevenue.toLocaleString("en-IN")}`,
          `Rs. ${monthlyStats.netProfit.toLocaleString("en-IN")}`,
          `${monthlyStats.profitMargin}%`
        ]],
        theme: "grid",
        headStyles: { fillColor: [30, 41, 59] },
        styles: { fontSize: 9, cellPadding: 6, halign: "center" },
      });

      doc.save(`Sales_Report_${selectedMonth}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("PDF generate karne mein problem aayi.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return categoriesWithStock;
    return categoriesWithStock.filter((cat) =>
      cat.name.toLowerCase().includes(q)
    );
  }, [categoriesWithStock, search]);

  const displayedCategories = useMemo(() => {
    return filteredCategories.slice(0, visibleCount);
  }, [filteredCategories, visibleCount]);

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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Tags size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Categories & Monthly Reports
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Track Stock, Monthly Sales & Generate Simple PDF Reports
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition shadow-md"
            >
              {downloadingPdf ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {message.text && (
          <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-red-50 border border-red-200 text-red-700">
            <AlertTriangle size={18} />
            {message.text}
          </div>
        )}

        {/* Search & Filter Header */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search category name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(6);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-gray-200 px-3 py-1.5 rounded-xl bg-white shadow-sm">
              <Calendar size={16} className="text-gray-500" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
              />
            </div>
            <div className="text-xs text-gray-500 font-semibold bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm">
              Total: {filteredCategories.length}
            </div>
          </div>
        </div>

        {/* Key Analytics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-medium">
              Units Sold ({selectedMonth})
            </p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {monthlyStats.totalUnitsSold} Pcs
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-medium">
              Monthly Revenue
            </p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">
              ₹{monthlyStats.totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-medium">
              Net Profit
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              ₹{monthlyStats.netProfit.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-medium flex items-center gap-1">
              <TrendingUp size={14} /> Profit Margin
            </p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {monthlyStats.profitMargin}%
            </p>
          </div>
        </div>

        {/* Categories Grid List (Initially Max 6 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedCategories.length === 0 ? (
            <div className="col-span-full bg-white p-8 rounded-2xl text-center text-gray-400 font-medium border border-gray-200">
              No categories found matching "{search}".
            </div>
          ) : (
            displayedCategories.map((cat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-gray-800 text-lg truncate">
                      {cat.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                      Active
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">
                      Products Type
                    </p>
                    <p className="text-sm font-bold text-gray-700">
                      {cat.productCount} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-medium flex items-center justify-end gap-1">
                      <Package size={12} /> Remaining Stock
                    </p>
                    <span className="font-bold text-sm text-emerald-600">
                      {cat.stockLeft} in stock
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {visibleCount < filteredCategories.length && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 shadow-sm transition"
            >
              <span>Load More</span>
              <ChevronDown size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
