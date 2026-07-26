import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Package,
} from "lucide-react";
import { CartContext } from "./Context";

const ShoppingCart = () => {
  const navigate = useNavigate();
  const {
    cart,
    clearCart,
    increaseQty,
    decreaseQty,
    removeFromCart,
  } = useContext(CartContext);

  const [loading, setLoading] = useState(false);

  // ===============================
  // TOTALS (quantity × price)
  // ===============================
  const totalItems = useMemo(() => {
    return cart.reduce(
      (total, item) => total + Number(item.quantity || 1),
      0
    );
  }, [cart]);

  const subTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      return total + price * qty;
    }, 0);
  }, [cart]);

  const gst = useMemo(() => Math.round(subTotal * 0.18), [subTotal]);
  const grandTotal = useMemo(() => subTotal + gst, [subTotal, gst]);

  // ===============================
  // HELPERS
  // ===============================
  const getItemId = (item) => item._id || item.id;

  const getSelectedLabel = (item) => {
    if (item.selectedOption?.label) return item.selectedOption.label;
    if (item.selectedQty) return `${item.selectedQty} Piece`;
    return "1 unit";
  };

  const getOptionQty = (item) => {
    return item.selectedOption?.quantity || item.selectedQty || 1;
  };

  const getImage = (item) => {
    return (
      item.image ||
      item.images?.[0] ||
      "https://via.placeholder.com/200?text=No+Image"
    );
  };

  const continueShopping = () => navigate("/");

  // ===============================
  // CHECKOUT
  // ===============================
  const checkoutHandler = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        toast.error("Please Login First");
        navigate("/login");
        return;
      }

      if (cart.length === 0) {
        toast.error("Your cart is empty");
        return;
      }

      setLoading(true);

      const orderData = {
        userId: user._id,
        customerName: user.name,
        items: cart.map((item) => ({
          id: String(getItemId(item)),
          title: item.name || item.title,
          image: getImage(item),
          price: Number(item.price),
          quantity: Number(item.quantity || 1),
          lineTotal: Number(item.price || 0) * Number(item.quantity || 1),
          selectedOption: item.selectedOption || null,
        })),
        totalItems,
        subTotal,
        gst,
        totalAmount: Number(grandTotal),
      };

      const { data } = await axios.post(
        "https://backend-3-axez.onrender.com/api/orders/create",
        orderData
      );

      if (data.success) {
        toast.success("Order Placed Successfully");
        clearCart();
        navigate("/orders");
      } else {
        toast.error(data.message || "Order Failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Unable to place order"
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // EMPTY CART
  // ===============================
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={42} className="text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              Your Cart is Empty
            </h2>
            <p className="text-gray-500 mt-3">
              Looks like you haven't added anything yet.
            </p>
            <button
              onClick={continueShopping}
              className="mt-8 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg transition"
            >
              <ArrowLeft size={18} />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===============================
  // MAIN CART
  // ===============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Shopping Cart
            </h1>
            <p className="text-gray-500 mt-1">
              {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
            </p>
          </div>
          <button
            onClick={continueShopping}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition"
          >
            <ArrowLeft size={18} />
            Continue Shopping
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ================= CART ITEMS ================= */}
          <div className="lg:col-span-2 space-y-5">
            {cart.map((item, index) => {
              const itemId = getItemId(item);
              const image = getImage(item);
              const name = item.name || item.title || "Product";
              const optionLabel = getSelectedLabel(item);
              const optionQty = getOptionQty(item);

              const unitPrice = Number(item.price || 0);
              const qty = Number(item.quantity || 1);
              const lineTotal = unitPrice * qty; // ← ye important hai

              return (
                <div
                  key={`${itemId}-${optionQty}-${unitPrice}-${index}`}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col sm:flex-row gap-5 hover:shadow-lg transition"
                >
                  {/* IMAGE */}
                  <div className="w-full sm:w-36 h-36 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/200?text=No+Image";
                      }}
                    />
                  </div>

                  {/* DETAILS */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 line-clamp-2">
                      {name}
                    </h2>

                    {item.brand && (
                      <p className="text-sm text-gray-500 mt-1">
                        Brand: {item.brand}
                      </p>
                    )}

                    {/* Selected Option Badge */}
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                        <Package size={12} />
                        {optionLabel}
                      </span>
                    </div>

                    {/* Unit Price (chhota) */}
                    <p className="text-sm text-gray-500 mt-3">
                      Unit Price:{" "}
                      <span className="font-medium text-gray-700">
                        ₹{unitPrice.toLocaleString()}
                      </span>
                    </p>

                    {/* Quantity + Line Total */}
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => decreaseQty(itemId, optionQty)}
                          className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-14 text-center font-bold text-gray-800 text-lg">
                          {qty}
                        </span>
                        <button
                          onClick={() => increaseQty(itemId, optionQty)}
                          className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Line Total (badi price) */}
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2">
                        <p className="text-xs text-emerald-600 font-medium">
                          Line Total
                        </p>
                        <p className="text-xl font-extrabold text-emerald-700">
                          ₹{lineTotal.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {qty} × ₹{unitPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* REMOVE */}
                  <div className="flex sm:flex-col justify-end items-end">
                    <button
                      onClick={() => removeFromCart(itemId, optionQty)}
                      className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= ORDER SUMMARY ================= */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Total Items</span>
                  <span className="font-semibold text-gray-900">
                    {totalItems}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ₹{subTotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span className="font-semibold text-gray-900">
                    ₹{gst.toLocaleString()}
                  </span>
                </div>
              </div>

              <hr className="my-5 border-gray-100" />

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-gray-900">
                  Grand Total
                </span>
                <span className="text-2xl font-extrabold text-emerald-600">
                  ₹{grandTotal.toLocaleString()}
                </span>
              </div>

              <button
                onClick={checkoutHandler}
                disabled={loading || cart.length === 0}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-4 rounded-xl font-semibold shadow-lg transition"
              >
                {loading ? "Placing Order..." : "Proceed To Checkout"}
              </button>

              <button
                onClick={continueShopping}
                className="w-full mt-3 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white py-3.5 rounded-xl font-semibold transition"
              >
                Continue Shopping
              </button>

              <button
                onClick={clearCart}
                disabled={cart.length === 0}
                className="w-full mt-3 border-2 border-red-400 text-red-500 hover:bg-red-500 hover:text-white py-3.5 rounded-xl font-semibold transition disabled:opacity-50"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
