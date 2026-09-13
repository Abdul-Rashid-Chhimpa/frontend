import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PackagePlus,
  Boxes,
  Pencil,
  ShoppingBag,
  Users,
  Tags,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  ReceiptText,
  ArrowUpRight,
  Sun,
  Moon,
  Radio,
  TrendingUp,
  AlertTriangle,
  Layers,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);

  // Grouped Navigation Structure
  const menuSections = [
    {
      category: "Core Operations",
      items: [
        {
          title: "Dashboard Overview",
          subtitle: "Live activity & real-time analytics monitor",
          path: "/",
          icon: <LayoutDashboard size={20} />,
          badge: "Live",
          accentColor: "emerald",
        },
        {
          title: "Customer Orders",
          subtitle: "Track processing status & dispatch fulfillment",
          path: "/admin/orders",
          icon: <ShoppingBag size={20} />,
          badge: "14 Pending",
          accentColor: "amber",
        },
        {
          title: "Bills & Invoices",
          subtitle: "Financial ledgers, tax compliance & receipts",
          path: "/admin/bills",
          icon: <ReceiptText size={20} />,
          badge: null,
          accentColor: "sky",
        },
        {
          title: "Store Analytics",
          subtitle: "Revenue breakdowns & growth trajectory maps",
          path: "/admin/analytics",
          icon: <BarChart3 size={20} />,
          badge: "+18.4%",
          accentColor: "indigo",
        },
      ],
    },
    {
      category: "Catalog & Inventory",
      items: [
        {
          title: "Add New Product",
          subtitle: "Publish fresh items & variants to marketplace",
          path: "/add-product",
          icon: <PackagePlus size={20} />,
          badge: "Create",
          accentColor: "amber",
        },
        {
          title: "All Inventory",
          subtitle: "Global stock quantities, status & warehouses",
          path: "/get-all-products",
          icon: <Boxes size={20} />,
          badge: "284 SKUs",
          accentColor: "slate",
        },
        {
          title: "Batch Update",
          subtitle: "Bulk edit details, pricing & global attributes",
          path: "/get-all-products",
          icon: <Pencil size={20} />,
          badge: null,
          accentColor: "slate",
        },
        {
          title: "Taxonomy & Categories",
          subtitle: "Organize collections & navigation tagging",
          path: "/admin/categories",
          icon: <Tags size={20} />,
          badge: null,
          accentColor: "purple",
        },
      ],
    },
    {
      category: "System & Management",
      items: [
        {
          title: "User Management",
          subtitle: "Customer accounts, security roles & permissions",
          path: "/admin/users",
          icon: <Users size={20} />,
          badge: "1.2k Total",
          accentColor: "blue",
        },
        {
          title: "System Settings",
          subtitle: "Store configuration, APIs & payment gateways",
          path: "/admin/settings",
          icon: <Settings size={20} />,
          badge: "Config",
          accentColor: "slate",
        },
      ],
    },
  ];

  const logoutHandler = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    navigate("/login", { replace: true });
  };

  // Helper function for dynamic pill colors
  const getBadgeStyle = (accent, dark) => {
    const styles = {
      emerald: dark
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : "bg-emerald-50 text-emerald-700 border-emerald-200",
      amber: dark
        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
        : "bg-amber-50 text-amber-700 border-amber-200",
      sky: dark
        ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
        : "bg-sky-50 text-sky-700 border-sky-200",
      indigo: dark
        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
        : "bg-indigo-50 text-indigo-700 border-indigo-200",
      purple: dark
        ? "bg-purple-500/10 text-purple-400 border-purple-400/20"
        : "bg-purple-50 text-purple-700 border-purple-200",
      blue: dark
        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
        : "bg-blue-50 text-blue-700 border-blue-200",
      slate: dark
        ? "bg-slate-800 text-slate-300 border-slate-700"
        : "bg-slate-100 text-slate-700 border-slate-200",
    };
    return styles[accent] || styles.slate;
  };

  return (
    <div
      className={`min-h-screen w-full relative font-sans transition-colors duration-300 ${
        isDark ? "bg-[#090B0E] text-slate-100" : "bg-[#F8FAFC] text-slate-900"
      }`}
    >
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[120px] opacity-20 ${
            isDark ? "bg-amber-500" : "bg-amber-300"
          }`}
        />
        <div
          className={`absolute top-1/3 -right-40 w-96 h-96 rounded-full blur-[140px] opacity-15 ${
            isDark ? "bg-blue-600" : "bg-sky-300"
          }`}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* ============ Top Navbar / Header ============ */}
        <header
          className={`flex flex-col md:flex-row items-start md:items-center justify-between pb-6 mb-8 border-b gap-4 ${
            isDark ? "border-slate-800/80" : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center p-2.5 transition-transform duration-300 hover:scale-105 ${
                isDark
                  ? "bg-slate-900/90 border-slate-700/60 shadow-inner"
                  : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              <img
                src="/pedwallogo.png"
                alt="Logo"
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling?.classList.remove("hidden");
                }}
              />
              <Shield size={22} className="text-amber-500 hidden" />
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Pedwal Operations Console
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  v2.5 Pro
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p
                  className={`text-xs ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  System Node: Active · Regional Server Online
                </p>
              </div>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all duration-200 ${
                isDark
                  ? "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
              }`}
            >
              {isDark ? (
                <Sun size={15} className="text-amber-400" />
              ) : (
                <Moon size={15} className="text-indigo-600" />
              )}
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>

            <button
              onClick={logoutHandler}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all duration-200 active:scale-95 ${
                isDark
                  ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                  : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
              }`}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* ============ Live Quick Stats Banner ============ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isDark
                ? "bg-slate-900/40 border-slate-800/80 backdrop-blur-md"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <div className="flex justify-between items-start">
              <span
                className={`text-xs font-medium ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Today's Revenue
              </span>
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <TrendingUp size={14} />
              </span>
            </div>
            <p className="text-lg sm:text-2xl font-bold mt-2">₹48,250</p>
            <p className="text-[11px] text-emerald-500 mt-1 font-medium">
              +12.4% vs yesterday
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all ${
              isDark
                ? "bg-slate-900/40 border-slate-800/80 backdrop-blur-md"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <div className="flex justify-between items-start">
              <span
                className={`text-xs font-medium ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Active Orders
              </span>
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <ShoppingBag size={14} />
              </span>
            </div>
            <p className="text-lg sm:text-2xl font-bold mt-2">14 Processing</p>
            <p className="text-[11px] text-amber-500 mt-1 font-medium">
              3 Ready to ship
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all ${
              isDark
                ? "bg-slate-900/40 border-slate-800/80 backdrop-blur-md"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <div className="flex justify-between items-start">
              <span
                className={`text-xs font-medium ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Low Stock Alerts
              </span>
              <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                <AlertTriangle size={14} />
              </span>
            </div>
            <p className="text-lg sm:text-2xl font-bold mt-2">6 Items</p>
            <p className="text-[11px] text-rose-500 mt-1 font-medium">
              Action required
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl border transition-all ${
              isDark
                ? "bg-slate-900/40 border-slate-800/80 backdrop-blur-md"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <div className="flex justify-between items-start">
              <span
                className={`text-xs font-medium ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Total Registered Users
              </span>
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                <Users size={14} />
              </span>
            </div>
            <p className="text-lg sm:text-2xl font-bold mt-2">1,280</p>
            <p className="text-[11px] text-blue-500 mt-1 font-medium">
              +24 this week
            </p>
          </div>
        </div>

        {/* ============ Categorized Console Sections ============ */}
        <div className="space-y-10">
          {menuSections.map((section) => (
            <div key={section.category}>
              <div className="flex items-center gap-2 mb-4">
                <Layers size={16} className="text-amber-500" />
                <h2
                  className={`text-sm font-bold uppercase tracking-wider ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {section.category}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {section.items.map((item) => (
                  <Link
                    key={item.title}
                    to={item.path}
                    className={`group relative rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                      isDark
                        ? "bg-slate-900/50 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900 hover:shadow-2xl hover:shadow-amber-500/5"
                        : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50"
                    }`}
                  >
                    {/* Top Row: Icon + Pill */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`p-2.5 rounded-xl border transition-transform duration-300 group-hover:scale-110 ${
                            isDark
                              ? "bg-slate-800/60 border-slate-700/50 text-slate-200 group-hover:border-amber-500/40 group-hover:text-amber-400"
                              : "bg-slate-50 border-slate-200 text-slate-700 group-hover:border-slate-300 group-hover:text-amber-600"
                          }`}
                        >
                          {item.icon}
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(
                              item.accentColor,
                              isDark
                            )}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <h3
                        className={`text-base font-semibold tracking-tight transition-colors ${
                          isDark
                            ? "text-slate-100 group-hover:text-amber-400"
                            : "text-slate-900 group-hover:text-amber-600"
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p
                        className={`text-xs mt-1.5 leading-relaxed line-clamp-2 ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Bottom Trigger Action */}
                    <div
                      className={`mt-6 pt-3 border-t flex items-center justify-between text-xs font-medium transition-colors ${
                        isDark ? "border-slate-800/60" : "border-slate-100"
                      }`}
                    >
                      <span
                        className={`${
                          isDark
                            ? "text-slate-500 group-hover:text-slate-300"
                            : "text-slate-400 group-hover:text-slate-700"
                        }`}
                      >
                        Access Module
                      </span>
                      <div
                        className={`p-1 rounded-lg transition-all duration-300 group-hover:translate-x-1 ${
                          isDark
                            ? "group-hover:bg-amber-500/10 group-hover:text-amber-400 text-slate-500"
                            : "group-hover:bg-amber-50 group-hover:text-amber-600 text-slate-400"
                        }`}
                      >
                        <ArrowUpRight size={15} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer
          className={`mt-14 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${
            isDark
              ? "border-slate-800/60 text-slate-500"
              : "border-slate-200 text-slate-400"
          }`}
        >
          <p>Pedwal Commerce Management Suite · Control Panel v2.5</p>
          <div className="flex items-center gap-4">
            <span className="hover:underline cursor-pointer">Documentation</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">System Logs</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;
