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
  ShieldCheck,
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
      subtitle: "Main metrics & real-time monitor",
      path: "/",
      icon: <LayoutDashboard size={20} />,
      badge: "Analytics",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(43,74,94,0.4)]",
      accent: "text-sky-400 border-sky-500/20 bg-sky-500/10",
    },
    {
      title: "Add New Product",
      subtitle: "Create catalog items & variants",
      path: "/add-product",
      icon: <PackagePlus size={20} />,
      badge: "Catalog",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(240,164,32,0.4)]",
      accent: "text-amber-400 border-amber-500/20 bg-amber-500/10",
    },
    {
      title: "All Inventory",
      subtitle: "Manage stock & item details",
      path: "/get-all-products",
      icon: <Boxes size={20} />,
      badge: "Stock",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)]",
      accent: "text-blue-400 border-blue-500/20 bg-blue-500/10",
    },
    {
      title: "Update Products",
      subtitle: "Modify existing product info",
      path: "/get-all-products",
      icon: <Pencil size={20} />,
      badge: "Edit",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)]",
      accent: "text-purple-400 border-purple-500/20 bg-purple-500/10",
    },
    {
      title: "Customer Orders",
      subtitle: "Track, process & fulfill orders",
      path: "/admin/orders",
      icon: <ShoppingBag size={20} />,
      badge: "Sales",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]",
      accent: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    },
    {
      title: "Bills & Invoices",
      subtitle: "Financial records & tax receipts",
      path: "/admin/bills",
      icon: <ReceiptText size={20} />,
      badge: "Finance",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.4)]",
      accent: "text-pink-400 border-pink-500/20 bg-pink-500/10",
    },
    {
      title: "User Management",
      subtitle: "Customer accounts & permissions",
      path: "/admin/users",
      icon: <Users size={20} />,
      badge: "Accounts",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(20,184,166,0.4)]",
      accent: "text-teal-400 border-teal-500/20 bg-teal-500/10",
    },
    {
      title: "Categories",
      subtitle: "Organize catalog taxonomy",
      path: "/admin/categories",
      icon: <Tags size={20} />,
      badge: "Structure",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)]",
      accent: "text-amber-500 border-amber-500/20 bg-amber-500/10",
    },
    {
      title: "Store Analytics",
      subtitle: "Revenue stats & growth trends",
      path: "/admin/analytics",
      icon: <BarChart3 size={20} />,
      badge: "Insights",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.4)]",
      accent: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10",
    },
    {
      title: "System Settings",
      subtitle: "Store preferences & configuration",
      path: "/admin/settings",
      icon: <Settings size={20} />,
      badge: "Config",
      glowColor: "group-hover:shadow-[0_0_30px_-5px_rgba(148,163,184,0.4)]",
      accent: "text-slate-400 border-slate-500/20 bg-slate-500/10",
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
      className={`min-h-screen w-full relative overflow-hidden font-sans selection:bg-amber-400 selection:text-black transition-colors duration-700 ${
        isDark ? "bg-[#06080D] text-slate-100" : "bg-[#F3F4F8] text-slate-900"
      }`}
    >
      {/* ================= BACKGROUND MOVING BALLS / ORBS ================= */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className={`absolute w-[450px] h-[450px] rounded-full blur-[100px] opacity-40 animate-orb-1 ${
            isDark ? "bg-amber-500/20" : "bg-amber-300/40"
          }`}
          style={{ top: "-10%", left: "-5%" }}
        />
        <div
          className={`absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-35 animate-orb-2 ${
            isDark ? "bg-[#2B4A5E]/40" : "bg-sky-200/60"
          }`}
          style={{ bottom: "-10%", right: "-5%" }}
        />
        <div
          className={`absolute w-[350px] h-[350px] rounded-full blur-[90px] opacity-30 animate-orb-3 ${
            isDark ? "bg-emerald-500/20" : "bg-emerald-200/50"
          }`}
          style={{ top: "35%", right: "25%" }}
        />
        <div
          className={`absolute w-[400px] h-[400px] rounded-full blur-[110px] opacity-25 animate-orb-4 ${
            isDark ? "bg-purple-600/20" : "bg-purple-200/40"
          }`}
          style={{ bottom: "20%", left: "15%" }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${
            isDark ? "#ffffff" : "#000000"
          } 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 relative z-10">
        {/* ================= HEADER BAR ================= */}
        <header
          className={`flex flex-col md:flex-row items-stretch md:items-center justify-between p-5 sm:p-6 mb-10 rounded-2xl border backdrop-blur-xl transition-all duration-300 gap-6 ${
            isDark
              ? "bg-white/[0.02] border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:border-white/20"
              : "bg-white/70 border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          }`}
        >
          {/* Left Side Info */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500" />
              <div
                className={`relative w-14 h-14 rounded-2xl border flex items-center justify-center p-2.5 backdrop-blur-md ${
                  isDark
                    ? "bg-[#0B0F17] border-white/10"
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <img
                  src="/pedwallogo.png"
                  alt="Pedwal Logo"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling?.classList.remove("hidden");
                  }}
                />
                <ShieldCheck size={28} className="text-[#F0A420] hidden" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Admin Console
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Sparkles size={10} /> v2.5
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <p
                  className={`text-xs font-medium ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Systems Operational · Pedwal Suite
                </p>
              </div>
            </div>
          </div>

          {/* Right Side Action Buttons */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-300 active:scale-95 backdrop-blur-md ${
                isDark
                  ? "bg-white/[0.05] border-white/10 text-amber-400 hover:bg-white/[0.1] hover:border-amber-400/40 hover:shadow-[0_0_15px_rgba(240,164,32,0.2)]"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:shadow-md"
              }`}
            >
              {isDark ? (
                <Sun size={15} className="text-amber-400" />
              ) : (
                <Moon size={15} className="text-slate-600" />
              )}
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>

            <button
              onClick={logoutHandler}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-300 active:scale-95 backdrop-blur-md ${
                isDark
                  ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
              }`}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* ================= MODULE CARDS GRID ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {menus.map((item) => (
            <Link
              key={item.title}
              to={item.path}
              className={`group relative rounded-2xl border p-5 transition-all duration-500 flex flex-col justify-between backdrop-blur-xl overflow-hidden hover:-translate-y-2 ${
                item.glowColor
              } ${
                isDark
                  ? "bg-white/[0.02] border-white/10 hover:border-white/30 hover:bg-white/[0.05]"
                  : "bg-white/80 border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-2xl"
              }`}
            >
              {/* Subtle top gradient glow inside card */}
              <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl group-hover:bg-amber-500/25 transition-all duration-500" />

              <div>
                {/* Header row in card */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${item.accent}`}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md border backdrop-blur-sm ${
                      isDark
                        ? "bg-white/[0.03] text-slate-400 border-white/10"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>

                {/* Titles */}
                <h3
                  className={`text-base font-bold tracking-tight transition-colors duration-300 ${
                    isDark
                      ? "text-white group-hover:text-amber-300"
                      : "text-slate-900 group-hover:text-[#2B4A5E]"
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

              {/* Action row at bottom */}
              <div
                className={`mt-6 pt-4 border-t flex items-center justify-between text-xs font-semibold transition-colors ${
                  isDark ? "border-white/5" : "border-slate-100"
                }`}
              >
                <span
                  className={
                    isDark
                      ? "text-slate-400 group-hover:text-slate-200"
                      : "text-slate-500 group-hover:text-slate-800"
                  }
                >
                  Open Portal
                </span>
                <div
                  className={`p-1.5 rounded-lg border transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 ${
                    isDark
                      ? "bg-white/[0.03] border-white/10 group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-400"
                      : "bg-slate-50 border-slate-200 group-hover:bg-[#2B4A5E] group-hover:text-white"
                  }`}
                >
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ================= FOOTER ================= */}
        <footer
          className={`mt-14 text-center text-xs font-medium tracking-wide ${
            isDark ? "text-slate-500" : "text-slate-400"
          }`}
        >
          Pedwal Management Suite · Built for high performance
        </footer>
      </div>

      {/* ================= KEYFRAME ANIMATIONS ================= */}
      <style>{`
        @keyframes orb-float-1 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(80px, 60px) scale(1.1); }
          100% { transform: translate(-40px, 100px) scale(0.95); }
        }
        @keyframes orb-float-2 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-90px, -70px) scale(1.15); }
          100% { transform: translate(50px, -120px) scale(0.9); }
        }
        @keyframes orb-float-3 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(70px, -50px) scale(1.2); }
          100% { transform: translate(-60px, 80px) scale(0.85); }
        }
        @keyframes orb-float-4 {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-60px, 80px) scale(1.05); }
          100% { transform: translate(90px, -40px) scale(0.95); }
        }

        .animate-orb-1 { animation: orb-float-1 18s ease-in-out infinite alternate; }
        .animate-orb-2 { animation: orb-float-2 22s ease-in-out infinite alternate; }
        .animate-orb-3 { animation: orb-float-3 20s ease-in-out infinite alternate; }
        .animate-orb-4 { animation: orb-float-4 25s ease-in-out infinite alternate; }

        @media (prefers-reduced-motion: reduce) {
          .animate-orb-1, .animate-orb-2, .animate-orb-3, .animate-orb-4 {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
