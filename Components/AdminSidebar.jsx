import { Link,useNavigate } from "react-router-dom";
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
} from "lucide-react";

const AdminDashboard = () => {
  const menus = [
    {
      title: "Dashboard",
      path: "/",
      icon: <LayoutDashboard size={35} />,
      color: "bg-blue-500",
    },
    {
      title: "Add Product",
      path: "/add-product",
      icon: <PackagePlus size={35} />,
      color: "bg-green-500",
    },
    {
      title: "All Products",
      path: "/get-all-products",
      icon: <Boxes size={35} />,
      color: "bg-purple-500",
    },
    {
      title: "Update Product",
      path: "/get-all-products",
      icon: <Pencil size={35} />,
      color: "bg-yellow-500",
    },
    {
      title: "Orders",
      path: "/admin/orders",
      icon: <ShoppingBag size={35} />,
      color: "bg-red-500",
    },
    {
      title: "Users",
      path: "/users",
      icon: <Users size={35} />,
      color: "bg-cyan-500",
    },
    {
      title: "Categories",
      path: "/categories",
      icon: <Tags size={35} />,
      color: "bg-pink-500",
    },
    {
      title: "Analytics",
      path: "/analytics",
      icon: <BarChart3 size={35} />,
      color: "bg-indigo-500",
    },
    {
      title: "Settings",
      path: "/settings",
      icon: <Settings size={35} />,
      color: "bg-gray-700",
    },
  ];
  const navigate = useNavigate();

const logoutHandler = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("cart");

  navigate("/login", { replace: true });
};

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-10">
          <img
            src="/pedwallogo.png"
            alt="Logo"
            className="h-16 mx-auto"
          />

          <h1 className="text-4xl font-bold mt-4">
            Admin Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your entire store from one place
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {menus.map((item) => (

            <Link
              key={item.title}
              to={item.path}
              className={`${item.color} rounded-2xl shadow-lg p-6 text-white flex flex-col items-center justify-center hover:scale-105 duration-300`}
            >

              {item.icon}

              <h2 className="mt-4 text-lg font-semibold text-center">
                {item.title}
              </h2>

            </Link>

          ))}

        </div>
        <div className="flex justify-center mt-12">
  <button
    onClick={logoutHandler}
    className="flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl shadow-lg transition duration-300"
  >
    <LogOut size={22} />
    Logout
  </button>
</div>

      </div>

    </div>
  );
};

export default AdminDashboard;