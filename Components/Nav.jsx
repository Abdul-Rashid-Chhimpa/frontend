
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "./Context";

import {
  Menu,
  X,
  LogOut,
} from "lucide-react";




const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();
const { cartCount } = useContext(CartContext);
  // ======================
  // LOGOUT
  // ======================

  const logoutHandler = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}

      <nav className="sticky top-0 z-50 bg-white shadow-md">

        <div className="max-w-7xl mx-auto px-5 h-20 flex justify-between items-center">

          {/* Logo */}

          <Link to="/">
            <img
              src="/pedwallogo.png"
              alt="Logo"
              className="h-14 object-contain"
            />
          </Link>

          {/* Desktop Menu */}

          <div className="hidden md:flex items-center gap-8 font-medium">

            <Link
              to="/"
              className="hover:text-blue-600 transition"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="hover:text-blue-600 transition"
            >
              About
            </Link>

            <Link
              to="/contact"
              className="hover:text-blue-600 transition"
            >
              Contact
            </Link>

                  
<Link
  to="/cart"
  className="relative"
>
  <img
    src="/shopping-cart.png" // agar public folder me hai

    // src={cartIcon} // agar assets me hai

    alt="Shopping Cart"
    className="w-8 h-8 object-contain hover:scale-110 transition"
  />

  {cartCount > 0 && (
    <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
      {cartCount}
    </span>
  )}
</Link>
            <button
              onClick={logoutHandler}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full transition"
            >
              <LogOut size={18} />
              Logout
            </button>

          </div>

          {/* Mobile Button */}

          <button
            className="md:hidden"
            onClick={() =>
              setIsOpen(!isOpen)
            }
          >
            {isOpen ? (
              <X size={28} />
            ) : (
              <Menu size={28} />
            )}
          </button>

        </div>

        {/* ================= MOBILE MENU ================= */}

        {isOpen && (

          <div className="md:hidden bg-white shadow-lg border-t">

            <div className="flex flex-col p-5 gap-5">

              <Link
                to="/"
                onClick={() =>
                  setIsOpen(false)
                }
                className="hover:text-blue-600"
              >
                Home
              </Link>

              <Link
                to="/products"
                onClick={() =>
                  setIsOpen(false)
                }
                className="hover:text-blue-600"
              >
                Products
              </Link>

              <Link
                to="/about"
                onClick={() =>
                  setIsOpen(false)
                }
                className="hover:text-blue-600"
              >
                About
              </Link>

              <Link
                to="/contact"
                onClick={() =>
                  setIsOpen(false)
                }
                className="hover:text-blue-600"
              >
                Contact
              </Link>
                    
<Link
  to="/cart"
  onClick={() => setIsOpen(false)}
  className="flex items-center gap-3"
>
  <img
    src="/shopping-cart.png"
    alt="Cart"
    className="w-8 h-8"
  />

  <span className="font-medium">
    Cart ({cartCount})
  </span>
</Link>

                   
              <button
                onClick={logoutHandler}
                className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl flex justify-center items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>

            </div>

          </div>

        )}

      </nav>
    </>
  );
};

export default Nav;
