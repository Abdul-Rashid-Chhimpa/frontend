import { useState } from "react";
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
  Sparkles,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);

  const menus = [
    {
      title: "Dashboard Overview",
      subtitle: "Main metrics & activity monitor",
      path: "/",
      icon: <LayoutDashboard size={20} />,
      badge: "Analytics",
      glowColor: "group-hover:shadow-blue-500/10 border-blue-500/30",
      accent: "from-blue-500 to-indigo-600",
      iconBgDark: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      iconBgLight: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      title: "Add New Product",
      subtitle: "Create catalog items & variants",
      path: "/add-product",
      icon: <PackagePlus size={20} />,
      badge: "Catalog",
      glowColor: "group-hover:shadow-emerald-500/10 border-emerald-500/30",
      accent: "from-emerald-500 to-teal-600",
      iconBgDark: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      iconBgLight: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    {
      title: "All Inventory",
      subtitle: "Manage stock & item details",
      path: "/get-all-products",
      icon: <Boxes size={20} />,
      badge: "Stock",
      glowColor: "group-hover:shadow-purple-500/10 border-purple-500/30",
      accent: "from-purple-500 to-pink-600",
      iconBgDark: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      iconBgLight: "bg-purple-50 text-purple-600 border-purple-200",
    },
    {
      title: "Update Products",
      subtitle: "Modify existing product info",
      path: "/get-all-products",
      icon: <Pencil size={20} />,
      badge: "Edit",
      glowColor: "group-hover:shadow-amber-500/10 border-amber-500/30",
      accent: "from-amber-400 to-orange-500",
      iconBgDark: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      iconBgLight: "bg-amber-50 text-amber-600 border-amber-200",
    },
    {
      title: "Customer Orders",
      subtitle: "Track, process & fulfill orders",
      path: "/admin/orders",
      icon: <ShoppingBag size={20} />,
      badge: "Sales",
      glowColor: "group-hover:shadow-rose-500/10 border-rose-500/30",
      accent: "from-rose-500 to-red-600",
      iconBgDark: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      iconBgLight: "bg-rose-50 text-rose-600 border-rose-200",
    },
    {
      title: "Bills & Invoices",
      subtitle: "Financial records & tax receipts",
      path: "/admin/bills",
      icon: <ReceiptText size={20} />,
      badge: "Finance",
      glowColor: "group-hover:shadow-teal-500/10 border-teal-500/30",
      accent: "from-teal-400 to-emerald-600",
      iconBgDark: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      iconBgLight: "bg-teal-50 text-teal-600 border-teal-200",
    },
    {
      title: "User Management",
      subtitle: "Customer accounts & permissions",
      path: "/admin/users",
      icon: <Users size={20} />,
      badge: "Accounts",
      glowColor: "group-hover:shadow-cyan-500/10 border-cyan-500/30",
      accent: "from-cyan-400 to-blue-600",
      iconBgDark: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      iconBgLight: "bg-cyan-50 text-cyan-600 border-cyan-200",
    },
    {
      title: "Categories",
      subtitle: "Organize catalog taxonomy",
      path: "/admin/categories",
      icon: <Tags size={20} />,
      badge: "Structure",
      glowColor: "group-hover:shadow-pink-500/10 border-pink-500/30",
      accent: "from-pink-500 to-rose-600",
      iconBgDark: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      iconBgLight: "bg-pink-50 text-pink-600 border-pink-200",
    },
    {
      title: "Store Analytics",
      subtitle: "Revenue stats & growth trends",
      path: "/admin/analytics",
      icon: <BarChart3 size={20} />,
      badge: "Insights",
      glowColor: "group-hover:shadow-indigo-500/10 border-indigo-500/30",
      accent: "from-indigo-500 to-purple-600",
      iconBgDark: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      iconBgLight: "bg-indigo-50 text-indigo-600 border-indigo-200",
    },
    {
      title: "System Settings",
      subtitle: "Store preferences & configuration",
      path: "/admin/settings",
      icon: <Settings size={20} />,
      badge: "Config",
      glowColor: "group-hover:shadow-slate-500/10 border-slate-500/30",
      accent: "from-slate-500 to-slate-700",
      iconBgDark: "bg-slate-500/10 text-slate-400 border-slate-500/20",
      iconBgLight: "bg-slate-100 text-slate-600 border-slate-200",
    },
  ];

  const logoutHandler = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    navigate("/login", { replace: true });
  };

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white px-4 sm:px-8 py-10 ${
        isDark ? "bg-[#080b12] text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Dynamic Ambient Blur Highlights */}
      {isDark ? (
        <>
          <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[128px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-[128px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-100/60 rounded-full blur-[140px] pointer-events-none" />
        </>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div
          className={`flex flex-col md:flex-row items-start md:items-center justify-between pb-8 mb-8 border-b transition-colors gap-6 ${
            isDark ? "border-slate-800/80" : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl border flex items-center justify-center p-2.5 shadow-xl transition-all ${
                isDark
                  ? "bg-slate-900/80 border-slate-800 shadow-indigo-950/40"
                  : "bg-white border-slate-200 shadow-slate-200"
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
              <Shield size={26} className="text-indigo-500 hidden" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Admin Workspace
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    isDark
                      ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
                      : "bg-indigo-50 border border-indigo-200 text-indigo-600"
                  }`}
                >
                  <Sparkles size={12} /> Live
                </span>
              </div>
              <p
                className={`text-xs sm:text-sm mt-0.5 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Store management portal & control operations.
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border font-medium text-xs transition-all active:scale-95 ${
                isDark
                  ? "bg-slate-900/80 border-slate-800 text-amber-400 hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
              }`}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>

            <button
              onClick={logoutHandler}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-xs font-semibold active:scale-95 ${
                isDark
                  ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                  : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
              }`}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Modern Modernized Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {menus.map((item) => (
            <Link
              key={item.title}
              to={item.path}
              className={`group relative rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden shadow-lg ${
                isDark
                  ? `bg-slate-900/40 backdrop-blur-2xl border-slate-800/80 hover:bg-slate-900/80 ${item.glowColor}`
                  : `bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xl ${item.glowColor}`
              }`}
            >
              {/* Top Accent Gradient Border Bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${item.accent} opacity-80 group-hover:opacity-100 transition-opacity`}
              />

              <div>
                {/* Header inside Card */}
                <div className="flex items-start justify-between mb-5">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm ${
                      isDark ? item.iconBgDark : item.iconBgLight
                    }`}
                  >
                    {item.icon}
                  </div>

                  <span
                    className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md border ${
                      isDark
                        ? "bg-slate-800/60 border-slate-700/60 text-slate-400"
                        : "bg-slate-100 border-slate-200 text-slate-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>

                {/* Card Title & Description */}
                <h3
                  className={`text-base font-bold tracking-tight transition-colors ${
                    isDark
                      ? "text-white group-hover:text-indigo-300"
                      : "text-slate-900 group-hover:text-indigo-600"
                  }`}
                >
                  {item.title}
                </h3>

                <p
                  className={`text-xs mt-1.5 leading-relaxed ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {item.subtitle}
                </p>
              </div>

              {/* Action Link Footer */}
              <div className="mt-6 pt-4 border-t border-slate-800/20 flex items-center justify-between text-xs font-semibold">
                <span
                  className={`transition-colors ${
                    isDark
                      ? "text-slate-400 group-hover:text-slate-200"
                      : "text-slate-500 group-hover:text-slate-900"
                  }`}
                >
                  Open module
                </span>
                <div
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                    isDark
                      ? "bg-slate-800/50 border-slate-700 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500"
                      : "bg-slate-100 border-slate-200 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600"
                  }`}
                >
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* System Status Footer */}
        <div
          className={`mt-12 text-center text-xs ${
            isDark ? "text-slate-500" : "text-slate-400"
          }`}
        >
          Pedwal Management Suite &middot; Enterprise Admin v2.4
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
