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
  Radio,
} from "lucide-react";

// ======================================================
// DESIGN TOKENS — shared language with the storefront
// (steel + amber), reframed as a console/control-panel
// ======================================================
const AMBER = "#F0A420";
const AMBER_DARK = "#C97F0F";
const STEEL = "#2B4A5E";
const SUCCESS = "#3FB27F";

// group -> chip styling, dark & light variants
const GROUP_STYLES = {
  create: {
    dark: "bg-[#F0A420]/12 text-[#F0A420] border-[#F0A420]/25",
    light: "bg-amber-50 text-amber-700 border-amber-200",
  },
  catalog: {
    dark: "bg-[#2B4A5E]/25 text-[#7FA8C0] border-[#2B4A5E]/50",
    light: "bg-slate-100 text-[#2B4A5E] border-slate-200",
  },
  operate: {
    dark: "bg-white/[0.04] text-slate-300 border-white/10",
    light: "bg-white text-slate-600 border-slate-200",
  },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);

  const menus = [
    {
      title: "Dashboard overview",
      subtitle: "Main metrics & activity monitor",
      path: "/",
      icon: <LayoutDashboard size={19} />,
      group: "catalog",
      label: "Analytics",
    },
    {
      title: "Add new product",
      subtitle: "Create catalog items & variants",
      path: "/add-product",
      icon: <PackagePlus size={19} />,
      group: "create",
      label: "Catalog",
    },
    {
      title: "All inventory",
      subtitle: "Manage stock & item details",
      path: "/get-all-products",
      icon: <Boxes size={19} />,
      group: "catalog",
      label: "Stock",
    },
    {
      title: "Update products",
      subtitle: "Modify existing product info",
      path: "/get-all-products",
      icon: <Pencil size={19} />,
      group: "catalog",
      label: "Edit",
    },
    {
      title: "Customer orders",
      subtitle: "Track, process & fulfill orders",
      path: "/admin/orders",
      icon: <ShoppingBag size={19} />,
      group: "operate",
      label: "Sales",
    },
    {
      title: "Bills & invoices",
      subtitle: "Financial records & tax receipts",
      path: "/admin/bills",
      icon: <ReceiptText size={19} />,
      group: "operate",
      label: "Finance",
    },
    {
      title: "User management",
      subtitle: "Customer accounts & permissions",
      path: "/admin/users",
      icon: <Users size={19} />,
      group: "operate",
      label: "Accounts",
    },
    {
      title: "Categories",
      subtitle: "Organize catalog taxonomy",
      path: "/admin/categories",
      icon: <Tags size={19} />,
      group: "catalog",
      label: "Structure",
    },
    {
      title: "Store analytics",
      subtitle: "Revenue stats & growth trends",
      path: "/admin/analytics",
      icon: <BarChart3 size={19} />,
      group: "operate",
      label: "Insights",
    },
    {
      title: "System settings",
      subtitle: "Store preferences & configuration",
      path: "/admin/settings",
      icon: <Settings size={19} />,
      group: "operate",
      label: "Config",
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
      className={`min-h-screen w-full relative overflow-hidden font-sans selection:bg-amber-400 selection:text-black px-4 sm:px-8 py-10 transition-colors duration-300 ${
        isDark ? "bg-[#0B0D0E] text-slate-100" : "bg-[#F3F1EC] text-slate-900"
      }`}
    >
      {/* ============ Animated console backdrop ============ */}
      <div
        className="console-grid"
        style={{
          opacity: isDark ? 0.35 : 0.5,
          "--line-color": isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(21,24,28,0.05)",
        }}
      />
      <div
        className="console-scan"
        style={{
          background: isDark
            ? "linear-gradient(180deg, rgba(240,164,32,0) 0%, rgba(240,164,32,0.06) 50%, rgba(240,164,32,0) 100%)"
            : "linear-gradient(180deg, rgba(43,74,94,0) 0%, rgba(43,74,94,0.05) 50%, rgba(43,74,94,0) 100%)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ============ Header ============ */}
        <div
          className={`flex flex-col md:flex-row items-start md:items-center justify-between pb-7 mb-7 border-b gap-6 ${
            isDark ? "border-white/10" : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-13 h-13 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center p-2.5 ${
                isDark
                  ? "bg-white/[0.03] border-white/10"
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
              <Shield size={24} className="text-[#F0A420] hidden" />
            </div>

            <div>
              <h1
                className={`text-2xl sm:text-[1.7rem] font-semibold tracking-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Admin console
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <Radio
                  size={12}
                  className="text-[#3FB27F] console-pulse"
                  strokeWidth={2.5}
                />
                <p
                  className={`text-xs sm:text-sm ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  All systems operational · store management portal
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border font-medium text-xs transition-colors active:scale-95 ${
                isDark
                  ? "bg-white/[0.03] border-white/10 text-amber-400 hover:bg-white/[0.06]"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
              }`}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
              <span>{isDark ? "Light mode" : "Dark mode"}</span>
            </button>

            <button
              onClick={logoutHandler}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border transition-colors text-xs font-semibold active:scale-95 ${
                isDark
                  ? "bg-red-500/[0.08] border-red-500/20 text-red-400 hover:bg-red-500/[0.14]"
                  : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
              }`}
            >
              <LogOut size={14} />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* ============ Module grid ============ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {menus.map((item) => {
            const chip = GROUP_STYLES[item.group][isDark ? "dark" : "light"];
            return (
              <Link
                key={item.title}
                to={item.path}
                className={`group relative rounded-xl border p-5 transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                  isDark
                    ? "bg-white/[0.025] border-white/10 hover:bg-white/[0.05] hover:border-white/20"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${chip}`}
                    >
                      {item.icon}
                    </div>
                    <span
                      className={`text-[10px] font-medium px-2 py-1 rounded-md ${
                        isDark
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  <h3
                    className={`text-[0.95rem] font-semibold tracking-tight ${
                      isDark
                        ? "text-white group-hover:text-amber-300"
                        : "text-slate-900 group-hover:text-[#2B4A5E]"
                    } transition-colors`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-[0.8rem] mt-1 leading-relaxed ${
                      isDark ? "text-slate-500" : "text-slate-500"
                    }`}
                  >
                    {item.subtitle}
                  </p>
                </div>

                <div
                  className={`mt-5 pt-4 border-t flex items-center justify-between text-xs font-medium ${
                    isDark ? "border-white/[0.06]" : "border-slate-100"
                  }`}
                >
                  <span
                    className={
                      isDark
                        ? "text-slate-500 group-hover:text-slate-300"
                        : "text-slate-400 group-hover:text-slate-700"
                    }
                  >
                    Open
                  </span>
                  <ArrowUpRight
                    size={14}
                    className={`transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                      isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className={`mt-10 text-center text-[0.7rem] ${
            isDark ? "text-slate-600" : "text-slate-400"
          }`}
        >
          Pedwal management suite · Admin console v2.5
        </div>
      </div>

      <style>{`
        .console-grid {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background-image:
            linear-gradient(var(--line-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--line-color) 1px, transparent 1px);
          background-size: 42px 42px;
          animation: grid-drift 26s linear infinite;
        }
        .console-scan {
          position: fixed;
          left: 0;
          right: 0;
          height: 40vh;
          pointer-events: none;
          z-index: 0;
          animation: scan-sweep 9s ease-in-out infinite;
        }
        @keyframes grid-drift {
          from { background-position: 0 0, 0 0; }
          to { background-position: 42px 42px, 42px 42px; }
        }
        @keyframes scan-sweep {
          0% { top: -40vh; }
          50% { top: 100vh; }
          100% { top: -40vh; }
        }
        .console-pulse {
          animation: pulse-dot 2.2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @media (prefers-reduced-motion: reduce) {
          .console-grid, .console-scan, .console-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard; 
