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
  Sparkles,
} from "lucide-react";

// ======================================================
// DESIGN TOKENS
// ======================================================
const GROUP_STYLES = {
  create: {
    dark: "bg-[#F0A420]/15 text-[#F0A420] border-[#F0A420]/30 shadow-[0_0_15px_rgba(240,164,32,0.15)]",
    light: "bg-amber-100/80 text-amber-800 border-amber-300 shadow-sm",
  },
  catalog: {
    dark: "bg-[#2B4A5E]/40 text-[#8EB8D4] border-[#3B6580]/60 shadow-[0_0_15px_rgba(43,74,94,0.2)]",
    light: "bg-slate-200/70 text-[#1E3545] border-slate-300 shadow-sm",
  },
  operate: {
    dark: "bg-white/[0.06] text-slate-200 border-white/15 shadow-[0_0_15px_rgba(255,255,255,0.03)]",
    light: "bg-white text-slate-700 border-slate-200/80 shadow-sm",
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
      className={`min-h-screen w-full relative overflow-hidden font-sans selection:bg-amber-400 selection:text-black px-4 sm:px-8 py-10 transition-colors duration-500 ${
        isDark ? "bg-[#07090E] text-slate-100" : "bg-[#F4F2EC] text-slate-900"
      }`}
    >
      {/* ============ Animated Floating Orbs Background ============ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className={`orb orb-1 ${
            isDark
              ? "bg-gradient-to-tr from-[#F0A420]/25 to-amber-600/10"
              : "bg-gradient-to-tr from-amber-300/40 to-yellow-200/30"
          }`}
        />
        <div
          className={`orb orb-2 ${
            isDark
              ? "bg-gradient-to-tr from-[#2B4A5E]/40 to-cyan-900/20"
              : "bg-gradient-to-tr from-sky-300/40 to-slate-300/40"
          }`}
        />
        <div
          className={`orb orb-3 ${
            isDark
              ? "bg-gradient-to-tr from-emerald-600/15 to-teal-900/20"
              : "bg-gradient-to-tr from-emerald-200/50 to-teal-100/40"
          }`}
        />
        <div
          className={`orb orb-4 ${
            isDark
              ? "bg-gradient-to-tr from-amber-500/15 to-[#2B4A5E]/30"
              : "bg-gradient-to-tr from-amber-200/30 to-blue-200/30"
          }`}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* ============ Header ============ */}
        <div
          className={`flex flex-col md:flex-row items-start md:items-center justify-between p-6 sm:p-7 mb-8 rounded-2xl border backdrop-blur-xl transition-all duration-300 gap-6 ${
            isDark
              ? "bg-white/[0.02] border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
              : "bg-white/70 border-white/80 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl border flex items-center justify-center p-2.5 transition-all duration-300 group ${
                isDark
                  ? "bg-gradient-to-b from-white/[0.08] to-white/[0.02] border-white/15 shadow-inner"
                  : "bg-gradient-to-b from-white to-slate-50 border-slate-200/80 shadow-md"
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
              <Shield size={26} className="text-[#F0A420] hidden" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1
                  className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Admin Console
                </h1>
                <span className="flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Sparkles size={10} /> Pro
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Radio
                  size={12}
                  className="text-[#3FB27F] console-pulse"
                  strokeWidth={2.5}
                />
                <p
                  className={`text-xs sm:text-sm font-medium ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  All systems operational · Management Portal
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-xs transition-all duration-200 active:scale-95 backdrop-blur-md ${
                isDark
                  ? "bg-white/[0.05] border-white/10 text-amber-400 hover:bg-white/[0.1] hover:border-amber-400/30"
                  : "bg-white/80 border-slate-200 text-slate-700 hover:bg-white hover:shadow-md"
              }`}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
              <span>{isDark ? "Light mode" : "Dark mode"}</span>
            </button>

            <button
              onClick={logoutHandler}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 text-xs font-semibold active:scale-95 backdrop-blur-md ${
                isDark
                  ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40"
                  : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:shadow-md"
              }`}
            >
              <LogOut size={15} />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* ============ Module Grid ============ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {menus.map((item) => {
            const chip = GROUP_STYLES[item.group][isDark ? "dark" : "light"];
            return (
              <Link
                key={item.title}
                to={item.path}
                className={`group relative rounded-2xl border p-5 transition-all duration-300 flex flex-col justify-between backdrop-blur-md hover:-translate-y-1.5 ${
                  isDark
                    ? "bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-amber-500/30 hover:shadow-[0_10px_30px_-10px_rgba(240,164,32,0.15)]"
                    : "bg-white/70 border-white/80 hover:bg-white hover:border-slate-300 hover:shadow-xl"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${chip}`}
                    >
                      {item.icon}
                    </div>
                    <span
                      className={`text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full border ${
                        isDark
                          ? "bg-white/[0.03] text-slate-400 border-white/5"
                          : "bg-slate-100/80 text-slate-500 border-slate-200"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  <h3
                    className={`text-[1rem] font-bold tracking-tight transition-colors duration-200 ${
                      isDark
                        ? "text-white group-hover:text-amber-400"
                        : "text-slate-900 group-hover:text-[#2B4A5E]"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-xs mt-1.5 leading-relaxed font-normal ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {item.subtitle}
                  </p>
                </div>

                <div
                  className={`mt-6 pt-3.5 border-t flex items-center justify-between text-xs font-semibold ${
                    isDark ? "border-white/5" : "border-slate-100"
                  }`}
                >
                  <span
                    className={`transition-colors ${
                      isDark
                        ? "text-slate-400 group-hover:text-amber-300"
                        : "text-slate-500 group-hover:text-[#2B4A5E]"
                    }`}
                  >
                    Manage module
                  </span>
                  <ArrowUpRight
                    size={15}
                    className={`transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 ${
                      isDark ? "text-amber-400" : "text-[#2B4A5E]"
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className={`mt-12 text-center text-xs font-medium ${
            isDark ? "text-slate-500" : "text-slate-400"
          }`}
        >
          Pedwal Management Suite · Admin Console v2.5
        </div>
      </div>

      {/* ============ CSS Animations ============ */}
      <style>{`
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.7;
          will-change: transform;
        }

        .orb-1 {
          width: 380px;
          height: 380px;
          top: -5%;
          left: -5%;
          animation: orb-float-1 22s ease-in-out infinite alternate;
        }

        .orb-2 {
          width: 450px;
          height: 450px;
          bottom: -10%;
          right: -5%;
          animation: orb-float-2 28s ease-in-out infinite alternate;
        }

        .orb-3 {
          width: 300px;
          height: 300px;
          top: 40%;
          left: 50%;
          animation: orb-float-3 20s ease-in-out infinite alternate;
        }

        .orb-4 {
          width: 350px;
          height: 350px;
          bottom: 20%;
          left: -10%;
          animation: orb-float-4 25s ease-in-out infinite alternate;
        }

        @keyframes orb-float-1 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(120px, 80px) scale(1.15); }
          100% { transform: translate(60px, 160px) scale(0.9); }
        }

        @keyframes orb-float-2 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-140px, -100px) scale(1.1); }
          100% { transform: translate(-80px, -180px) scale(0.95); }
        }

        @keyframes orb-float-3 {
          0% { transform: translate(-50%, -50%) scale(0.9); }
          50% { transform: translate(-30%, -20%) scale(1.2); }
          100% { transform: translate(-70%, -60%) scale(1); }
        }

        @keyframes orb-float-4 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(100px, -80px) scale(1.1); }
          100% { transform: translate(160px, 40px) scale(0.85); }
        }

        .console-pulse {
          animation: pulse-dot 2.2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }

        @media (prefers-reduced-motion: reduce) {
          .orb, .console-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
