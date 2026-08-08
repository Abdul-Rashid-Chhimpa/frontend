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
import AdminSettings from"../Components/AdminSettings";
<Route
  path="/admin/orders"
  element={<AdminOrders />}
/>

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Toaster position="top-right" />

        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/product/:id" element={<ProductDetails />} /> */}
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
              <Route path="/profile" element={<Profile />} />
          <Route path="/add-product" element={<AddProcuct />} />
          <Route path="/get-all-products" element={<GetAllProducts />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/orders" element={<AdminOrders />}/> 
          <Route path="/cart" element={<ShoppingCart />} />   
          <Route path="/adminsidebar" element={<AdminSidebar />} />
           <Route path="/orders" element={<MyOrders />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/varieties/:group" element={<Varieties />} />
          <Route path="/admin/users" element={<Adminuser />} />
         <Route path="/admin/settings" element={<AdminSettings />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
