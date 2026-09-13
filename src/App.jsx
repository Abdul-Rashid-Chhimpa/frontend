import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../Components/Home";
import ProductDetails from "../Components/ProductDetails";
import About from "../Components/About";
import Contact from "../Components/Contact";
import AddProcuct from "../Components/AddProduct";
import GetAllProducts from "../Components/GetAllProducts";
import Login from "../Components/Login";
import Register from "../Components/Register";
import ShoppingCart from "../Components/ShoppingCart";
import AdminSidebar from "../Components/AdminSidebar";
import MyOrders from "../Components/MyOrders";
import ResetPassword from "../Components/ResetPassword";

import Profile from "../Components/Profile";


import CartProvider from "../Components/Context";
import { Toaster } from "react-hot-toast";

import AdminOrders from "../Components/AdminOrderPage";

import Varieties from "../Components/Varieties";
import Adminuser from "../Components/Adminuser";
import AdminSettings from "../Components/AdminSettings";
import AdminCategories from "../Components/AdminCategories";
import AdminAnalytics from "../Components/AdminAnalytics";
import AdminBills from "../Components/AdminBills";

import ProtectedRoute from "../Components/ProtectedRoute";
import NotFound from "../Components/NotFound";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Toaster position="top-right" />

        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/varieties/:group" element={<Varieties />} />

          {/* ================= LOGGED-IN USER ROUTES ================= */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <ShoppingCart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />

          {/* ================= ADMIN-ONLY ROUTES ================= */}
          
          <Route
            path="/add-product"
            element={
              <ProtectedRoute adminOnly>
                <AddProcuct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/get-all-products"
            element={
              <ProtectedRoute adminOnly>
                <GetAllProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/adminsidebar"
            element={
              <ProtectedRoute adminOnly>
                <AdminSidebar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute adminOnly>
                <AdminOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <Adminuser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute adminOnly>
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute adminOnly>
                <AdminCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute adminOnly>
                <AdminAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bills"
            element={
              <ProtectedRoute adminOnly>
                <AdminBills />
              </ProtectedRoute>
            }
          />

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
