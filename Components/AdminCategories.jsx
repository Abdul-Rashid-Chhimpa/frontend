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
} from "lucide-react";

const API_BASE = "https://backend-3-axez.onrender.com/api";

const AdminCategories = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
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

  // Monthly Stats Calculation
  const monthlyStats = useMemo(() => {
    let totalUnitsSold = 0;
    let totalRevenue = 0;
    let totalCost = 0;

    const filterMonth = selectedMonth || new Date().toISOString().slice(0, 7);

    orders.forEach((order) => {
      const status = (order.status || "").toLowerCase();
      const isValidStatus =
        status === "shipped" ||
        status === "delivered" ||
        order.isPaid ||
        !order.status;

      const rawDate =
        order.createdAt || order.date || order.orderDate || order.updatedAt;
      let orderMonth = "";

      if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          orderMonth = `${year}-${month}`;
        }
      }

      if (isValidStatus && (!orderMonth || orderMonth === filterMonth)) {
        const itemsList =
          order.items || order.orderItems || order.products || [];

        if (Array.isArray(itemsList) && itemsList.length > 0) {
          itemsList.forEach((item) => {
            const qty = Number(item.quantity ?? item.qty ?? item.count ?? 1);
            const price = Number(
              item.price ?? item.unitPrice ?? item.product?.price ?? 0
            );
            const cost = Number(
              item.costPrice ?? item.product?.costPrice ?? price * 0.7
            );

            totalUnitsSold += qty;
            totalRevenue += price * qty;
            totalCost += cost * qty;
          });
        } else {
          const orderTotal = Number(
            order.totalAmount || order.totalPrice || order.total || 0
          );
          totalRevenue += orderTotal;
          totalCost += orderTotal * 0.7;
          totalUnitsSold += 1;
        }
      }
    });

    const netProfit = totalRevenue - totalCost;
    const profitMargin =
      totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

    return { totalUnitsSold, totalRevenue, totalCost, netProfit, profitMargin };
  }, [orders, selectedMonth]);

  // Clean Direct PDF Generation (No CSS/HTML2Canvas errors)
  const handleDownloadPDF = () => {
    try {
      setDownloadingPdf(true);
      const doc = new jsPDF("p", "pt", "a4");

      // Title & Header
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("ADMIN STORE REPORT", 40, 45);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`Monthly Report Period: ${selectedMonth}`, 40, 62);
      doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 40, 76);

      // Key Analytics Summary Box
      autoTable(doc, {
        startY: 90,
        head: [["Metric", "Value"]],
        body: [
          ["Units Sold", `${monthlyStats.totalUnitsSold} Pcs`],
          ["Monthly Revenue", `Rs. ${monthlyStats.totalRevenue.toLocaleString("en-IN")}`],
          ["Net Profit", `Rs. ${monthlyStats.netProfit.toLocaleString("en-IN")}`],
          ["Profit Margin", `${monthlyStats.profitMargin}%`],
        ],
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 10, cellPadding: 6 },
      });

      // Categories Breakdown Table
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("Category Breakdown", 40, doc.lastAutoTable.finalY + 30);

      const tableData = filteredCategories.map((cat, index) => [
        index + 1,
        cat.name,
        `${cat.productCount} items`,
        `${cat.stockLeft} in stock`,
        "Active",
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 40,
        head: [["S.No", "Category Name", "Product Count", "Stock Left", "Status"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [30, 41, 59] },
        styles: { fontSize: 10, cellPadding: 6 },
      });

      doc.save(`Category_Sales_Report_${selectedMonth}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("PDF Generate karne me problem aayi.");
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

        {/* Search & Stats Header */}
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
              onChange={(e) => setSearch(e.target.value)}
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

        {/* Categories Grid List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.length === 0 ? (
            <div className="col-span-full bg-white p-8 rounded-2xl text-center text-gray-400 font-medium border border-gray-200">
              No categories found matching "{search}".
            </div>
          ) : (
            filteredCategories.map((cat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col justify-between shadow-sm"
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
                    <p className="text-xs text-gray-400 font-medium">
                      Stock Left
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
      </div>
    </div>
  );
};

export default AdminCategories;
