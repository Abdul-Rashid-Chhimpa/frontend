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
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const menus = [
    {
      title: "Dashboard",
      path: "/",
      icon: <LayoutDashboard size={28} />,
      gradient: "from-blue-500 to-blue-700",
      shadow: "shadow-blue-200",
    },
    {
      title: "Add Product",
      path: "/add-product",
      icon: <PackagePlus size={28} />,
      gradient: "from-emerald-500 to-green-600",
      shadow: "shadow-emerald-200",
    },
    {
      title: "All Products",
      path: "/get-all-products",
      icon: <Boxes size={28} />,
      gradient: "from-purple-500 to-violet-700",
      shadow: "shadow-purple-200",
    },
    {
      title: "Update Product",
      path: "/get-all-products",
      icon: <Pencil size={28} />,
      gradient: "from-amber-400 to-orange-500",
      shadow: "shadow-amber-200",
    },
    {
      title: "Orders",
      path: "/admin/orders",
      icon: <ShoppingBag size={28} />,
      gradient: "from-rose-500 to-red-600",
      shadow: "shadow-rose-200",
    },
    {
      title: "Users",
      path: "/users",
      icon: <Users size={28} />,
      gradient: "from-cyan-500 to-teal-600",
      shadow: "shadow-cyan-200",
    },
    {
      title: "Categories",
      path: "/categories",
      icon: <Tags size={28} />,
      gradient: "from-pink-500 to-fuchsia-600",
      shadow: "shadow-pink-200",
    },
    {
      title: "Analytics",
      path: "/analytics",
      icon: <BarChart3 size={28} />,
      gradient: "from-indigo-500 to-blue-700",
      shadow: "shadow-indigo-200",
    },
    {
      title: "Settings",
      path: "/settings",
      icon: <Settings size={28} />,
      gradient: "from-slate-600 to-gray-800",
      shadow: "shadow-slate-200",
    },
  ];

  const logoutHandler = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-lg border border-gray-100 mb-5">
            <img
              src="/pedwallogo.png"
              alt="Logo"
              className="h-10 sm:h-12 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling?.classList.remove("hidden");
              }}
            />
            <Shield size={32} className="text-indigo-600 hidden" />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-indigo-700 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-2 sm:mt-3 text-sm sm:text-base max-w-md mx-auto">
            Manage your entire store from one place
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {menus.map((item) => (
            <Link
              key={item.title}
              to={item.path}
              className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br ${item.gradient} p-5 sm:p-6 text-white shadow-lg ${item.shadow} hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
            >
              {/* Decorative circle */}
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500" />
              <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full bg-white/10" />

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h2 className="text-sm sm:text-base font-semibold leading-tight">
                  {item.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <div className="flex justify-center mt-10 sm:mt-14">
          <button
            onClick={logoutHandler}
            className="flex items-center gap-2.5 bg-white border-2 border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 px-8 py-3.5 rounded-2xl font-semibold shadow-md hover:shadow-lg transition-all duration-300"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Admin Panel • Secure Access Only
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
