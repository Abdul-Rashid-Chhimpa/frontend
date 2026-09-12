import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "./Context";
import {
  Menu,
  X,
  LogOut,
  LogIn,
  Home,
  Info,
  Phone,
  ShoppingBag,
  Package,
  User
} from "lucide-react";

// Shared with the rest of the store's UI
const INK = "#15181C";
const MUTED = "#6B7280";
const BORDER = "#E6E8EB";
const SURFACE = "#FFFFFF";
const AMBER = "#F0A420";
const AMBER_TINT = "#FEF6E7";
const AMBER_DARK = "#C97F0F";
const STEEL = "#2B4A5E";

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, cart } = useContext(CartContext);

  // Check authentication status on mount & route change
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    setIsLoggedIn(Boolean(token || user));
  }, [location.pathname]);

  // Fallback: agar cartCount nahi hai to cart se calculate karo
  const count =
    cartCount ??
    (cart?.reduce((sum, item) => sum + Number(item.quantity || 1), 0) || 0);

  const logoutHandler = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/", label: "Home", icon: <Home size={18} /> },
    { to: "/about", label: "About", icon: <Info size={18} /> },
    { to: "/contact", label: "Contact", icon: <Phone size={18} /> },
    { to: "/orders", label: "Orders", icon: <Package size={18} /> },
    { to: "/profile", label: "Profile", icon: <User size={18} /> },
  ];

  return (
    <nav
      className="sticky top-0 overflow-hidden z-50 backdrop-blur-md"
      style={{ background: "rgba(255,255,255,0.92)", borderBottom: `1px solid ${BORDER}` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <div className="flex items-center">
            <img
              src="/logowithqoute.png"
              alt="Logo"
              className="h-12 sm:h-14 md:h-16 lg:h-20 xl:h-24 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-xl text-sm font-medium transition"
              style={
                isActive(link.to)
                  ? { background: AMBER_TINT, color: AMBER_DARK }
                  : { color: MUTED }
              }
            >
              {link.icon}
              {link.label}
            </Link>
          ))}

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-xl text-sm font-medium transition"
            style={{ color: MUTED }}
          >
            <ShoppingBag size={18} />
            Cart
            {count > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 text-white text-[11px] rounded-full flex items-center justify-center font-bold"
                style={{ background: "#D64545" }}
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>

          {/* Conditional Login / Logout Button */}
          {isLoggedIn ? (
            <button
              onClick={logoutHandler}
              className="ml-2 flex items-center gap-2 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
              style={{ background: STEEL }}
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="ml-2 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition"
              style={{ background: AMBER, color: "#1A1200" }}
            >
              <LogIn size={16} />
              Login
            </Link>
          )}
        </div>

        {/* Mobile: Cart + Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          <Link to="/cart" className="relative p-2 rounded-xl" style={{ color: INK }}>
            <ShoppingBag size={22} />
            {count > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-white text-[10px] rounded-full flex items-center justify-center font-bold"
                style={{ background: "#D64545" }}
              >
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl"
            style={{ color: INK }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden animate-slide-down" style={{ borderTop: `1px solid ${BORDER}`, background: SURFACE }}>
          <div className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition"
                style={
                  isActive(link.to)
                    ? { background: AMBER_TINT, color: AMBER_DARK }
                    : { color: INK }
                }
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            <Link
              to="/cart"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ color: INK }}
            >
              <ShoppingBag size={18} />
              Cart
              {count > 0 && (
                <span
                  className="ml-auto text-white text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "#D64545" }}
                >
                  {count}
                </span>
              )}
            </Link>

            {/* Mobile Conditional Login / Logout Button */}
            {isLoggedIn ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  logoutHandler();
                }}
                className="mt-2 flex items-center justify-center gap-2 text-white py-3 rounded-xl text-sm font-semibold"
                style={{ background: STEEL }}
              >
                <LogOut size={16} />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
                style={{ background: AMBER, color: "#1A1200" }}
              >
                <LogIn size={16} />
                Login
              </Link>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default Nav;
