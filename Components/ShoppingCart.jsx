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
  CheckCircle2,
  X,
  Truck,
  ShoppingBag as BagIcon,
} from "lucide-react";
import { CartContext } from "./Context";

const ShoppingCart = () => {
  const navigate = useNavigate();
  const { cart, clearCart, increaseQty, decreaseQty, removeFromCart } =
    useContext(CartContext);

  const [loading, setLoading] = useState(false);
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [confirmedOrderData, setConfirmedOrderData] = useState(null);

  const totalItems = useMemo(() => {
    return cart.reduce((total, item) => total + Number(item.quantity || 1), 0);
  }, [cart]);

  // Dynamic Subtotal Calculation
  const subTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      return total + price * qty;
    }, 0);
  }, [cart]);

  // Dynamic GST Calculation
  const gst = useMemo(() => {
    return cart.reduce((totalGst, item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      const gstRate =
        item.gst !== undefined && item.gst !== "" ? Number(item.gst) : 18;
      const itemSubtotal = price * qty;
      const itemGst = (itemSubtotal * gstRate) / 100;
      return totalGst + itemGst;
    }, 0);
  }, [cart]);

  const grandTotal = useMemo(() => Math.round(subTotal + gst), [subTotal, gst]);

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
        customerEmail: user.email || "N/A",
        customerPhone: user.phone || "N/A",
        items: cart.map((item) => {
          const gstRate =
            item.gst !== undefined && item.gst !== "" ? Number(item.gst) : 18;
          const lineTotal =
            Number(item.price || 0) * Number(item.quantity || 1);
          const itemGst = (lineTotal * gstRate) / 100;

          return {
            id: String(getItemId(item)),
            title: item.name || item.title,
            brand: item.brand || "N/A",
            image: getImage(item),
            price: Number(item.price),
            quantity: Number(item.quantity || 1),
            gstRate: gstRate,
            gstAmount: Math.round(itemGst),
            lineTotal: lineTotal,
            selectedOption: item.selectedOption || null,
          };
        }),
        totalItems,
        subTotal,
        gst: Math.round(gst),
        totalAmount: Number(grandTotal),
      };

      const { data } = await axios.post(
        "https://backend-3-axez.onrender.com/api/orders/create",
        orderData
      );

      if (data.success || data.order) {
        const orderId =
          data.order?._id || `ORD-${Date.now().toString().slice(-6)}`;

        setConfirmedOrderData({
          orderId,
          totalAmount: grandTotal,
          totalItems,
        });

        // Clear cart & show success popup modal
        clearCart();
        setShowOrderPopup(true);
      } else {
        toast.error(data.message || "Order Failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Unable to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-3 sm:px-6 relative">
      {/* 🛍️ EMPTY CART VIEW */}
      {cart.length === 0 && !showOrderPopup ? (
        <div className="max-w-2xl mx-auto py-12">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={36} className="text-indigo-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Your Cart is Empty
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Looks like you haven't added anything yet.
            </p>
            <button
              onClick={continueShopping}
              className="mt-6 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow transition text-sm"
            >
              <ArrowLeft size={18} />
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        /* 🛒 ACTIVE CART VIEW */
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
                Shopping Cart
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
              </p>
            </div>
            <button
              onClick={continueShopping}
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition text-sm"
            >
              <ArrowLeft size={18} />
              Continue Shopping
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, index) => {
                const itemId = getItemId(item);
                const image = getImage(item);
                const name = item.name || item.title || "Product";
                const optionLabel = getSelectedLabel(item);
                const optionQty = getOptionQty(item);

                const unitPrice = Number(item.price || 0);
                const qty = Number(item.quantity || 1);
                const lineTotal = unitPrice * qty;
                const itemGstRate =
                  item.gst !== undefined && item.gst !== ""
                    ? Number(item.gst)
                    : 18;

                return (
                  <div
                    key={`${itemId}-${optionQty}-${unitPrice}-${index}`}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 hover:shadow-md transition"
                  >
                    <div className="w-full sm:w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
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

                    <div className="flex-1 min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2">
                        {name}
                      </h2>

                      {item.brand && (
                        <p className="text-xs text-gray-500 mt-1">
                          Brand: {item.brand}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full">
                          <Package size={12} />
                          {optionLabel}
                        </span>
                        <span className="inline-flex items-center text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                          GST: {itemGstRate}%
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        Unit Price:{" "}
                        <span className="font-medium text-gray-700">
                          ₹{unitPrice.toLocaleString()}
                        </span>
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => decreaseQty(itemId, optionQty)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center font-bold text-gray-800 text-sm">
                            {qty}
                          </span>
                          <button
                            onClick={() => increaseQty(itemId, optionQty)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-gray-500">Total</p>
                          <p className="text-base font-extrabold text-emerald-600">
                            ₹{lineTotal.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col justify-end items-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <button
                        onClick={() => removeFromCart(itemId, optionQty)}
                        className="flex items-center gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition text-xs font-medium"
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
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
                    <span>Estimated GST</span>
                    <span className="font-semibold text-gray-900">
                      ₹{Math.round(gst).toLocaleString()}
                    </span>
                  </div>
                </div>

                <hr className="my-4 border-gray-100" />

                <div className="flex justify-between items-center mb-5">
                  <span className="text-base font-bold text-gray-900">
                    Grand Total
                  </span>
                  <span className="text-xl font-extrabold text-emerald-600">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={checkoutHandler}
                  disabled={loading || cart.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold shadow transition text-sm"
                >
                  {loading ? "Placing Order..." : "Proceed To Checkout"}
                </button>

                <button
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="w-full mt-2.5 border border-red-300 text-red-500 hover:bg-red-50 py-2.5 rounded-xl font-semibold transition text-xs disabled:opacity-50"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🎉 FLIPKART STYLE ORDER CONFIRMED POPUP MODAL */}
      {showOrderPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-center relative transform transition-all scale-100 border border-gray-100">
            {/* Close Cross Button */}
            <button
              onClick={() => {
                setShowOrderPopup(false);
                navigate("/");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition"
            >
              <X size={18} />
            </button>

            {/* Success Icon Badge */}
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 size={48} className="text-emerald-600" />
            </div>

            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
              Order Confirmed!
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Thank you for shopping with us. Your order has been placed.
            </p>

            {/* Order Details Card */}
            <div className="bg-gray-50 rounded-2xl p-4 text-left border border-gray-100 space-y-3 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Order ID</span>
                <span className="font-bold text-gray-800">
                  #{confirmedOrderData?.orderId}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Items Ordered</span>
                <span className="font-semibold text-gray-800">
                  {confirmedOrderData?.totalItems} Item(s)
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-bold text-emerald-600 text-sm">
                  ₹{confirmedOrderData?.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex items-center gap-2 text-xs text-indigo-600 font-medium">
                <Truck size={16} />
                <span>Arriving soon at your doorstep!</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setShowOrderPopup(false);
                  navigate("/");
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition shadow text-sm flex items-center justify-center gap-2"
              >
                <BagIcon size={16} /> Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
