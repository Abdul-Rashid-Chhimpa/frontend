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

// ======================================================
// DESIGN TOKENS — shared with the rest of the store's UI
// ======================================================
const INK = "#15181C";
const MUTED = "#6B7280";
const BORDER = "#E6E8EB";
const SURFACE = "#FFFFFF";
const SURFACE_MUTED = "#F1F2EF";
const BG = "#F5F6F4";
const AMBER = "#F0A420";
const AMBER_DARK = "#C97F0F";
const AMBER_TINT = "#FEF6E7";
const STEEL = "#2B4A5E";
const STEEL_TINT = "#EAF0F3";

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
    <div className="min-h-screen py-8 px-3 sm:px-6 relative" style={{ background: BG }}>
      {/* EMPTY CART VIEW */}
      {cart.length === 0 && !showOrderPopup ? (
        <div className="max-w-2xl mx-auto py-12">
          <div className="rounded-3xl p-8 sm:p-12 text-center" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: SURFACE_MUTED }}>
              <ShoppingBag size={36} style={{ color: MUTED }} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: INK }}>
              Your cart is empty
            </h2>
            <p className="mt-2 text-sm" style={{ color: MUTED }}>
              Looks like you haven't added anything yet.
            </p>
            <button
              onClick={continueShopping}
              className="mt-6 inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition text-sm"
              style={{ background: STEEL }}
            >
              <ArrowLeft size={18} />
              Continue shopping
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE CART VIEW */
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold" style={{ color: INK }}>
                Shopping cart
              </h1>
              <p className="text-xs sm:text-sm mt-1" style={{ color: MUTED }}>
                {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
              </p>
            </div>
            <button
              onClick={continueShopping}
              className="inline-flex items-center gap-2 font-medium transition text-sm"
              style={{ color: STEEL }}
            >
              <ArrowLeft size={18} />
              Continue shopping
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
                    className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 transition"
                    style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
                  >
                    <div className="w-full sm:w-32 h-32 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: SURFACE_MUTED }}>
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
                      <h2 className="text-base sm:text-lg font-bold line-clamp-2" style={{ color: INK }}>
                        {name}
                      </h2>

                      {item.brand && (
                        <p className="text-xs mt-1" style={{ color: MUTED }}>
                          Brand: {item.brand}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                          style={{ background: STEEL_TINT, color: STEEL }}
                        >
                          <Package size={12} />
                          {optionLabel}
                        </span>
                        <span
                          className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: SURFACE_MUTED, color: MUTED }}
                        >
                          GST: {itemGstRate}%
                        </span>
                      </div>

                      <p className="text-xs mt-2" style={{ color: MUTED }}>
                        Unit price:{" "}
                        <span className="font-medium" style={{ color: INK }}>
                          ₹{unitPrice.toLocaleString()}
                        </span>
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                        <div className="flex items-center rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                          <button
                            onClick={() => decreaseQty(itemId, optionQty)}
                            className="w-8 h-8 flex items-center justify-center transition"
                            style={{ background: SURFACE_MUTED, color: INK }}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center font-bold text-sm" style={{ color: INK }}>
                            {qty}
                          </span>
                          <button
                            onClick={() => increaseQty(itemId, optionQty)}
                            className="w-8 h-8 flex items-center justify-center transition"
                            style={{ background: SURFACE_MUTED, color: INK }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px]" style={{ color: MUTED }}>Total</p>
                          <p className="text-base font-extrabold" style={{ color: AMBER_DARK }}>
                            ₹{lineTotal.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col justify-end items-end pt-2 sm:pt-0 border-t sm:border-t-0" style={{ borderColor: BORDER }}>
                      <button
                        onClick={() => removeFromCart(itemId, optionQty)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition text-xs font-medium"
                        style={{ color: "#B4302F" }}
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
              <div className="rounded-2xl p-5 sticky top-24" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                <h2 className="text-lg font-bold mb-4" style={{ color: INK }}>
                  Order summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between" style={{ color: MUTED }}>
                    <span>Total items</span>
                    <span className="font-semibold" style={{ color: INK }}>
                      {totalItems}
                    </span>
                  </div>

                  <div className="flex justify-between" style={{ color: MUTED }}>
                    <span>Subtotal</span>
                    <span className="font-semibold" style={{ color: INK }}>
                      ₹{subTotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between" style={{ color: MUTED }}>
                    <span>Estimated GST</span>
                    <span className="font-semibold" style={{ color: INK }}>
                      ₹{Math.round(gst).toLocaleString()}
                    </span>
                  </div>
                </div>

                <hr className="my-4" style={{ borderColor: BORDER }} />

                <div className="flex justify-between items-center mb-5">
                  <span className="text-base font-bold" style={{ color: INK }}>
                    Grand total
                  </span>
                  <span className="text-xl font-extrabold" style={{ color: AMBER_DARK }}>
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={checkoutHandler}
                  disabled={loading || cart.length === 0}
                  className="w-full py-3 rounded-xl font-semibold transition text-sm disabled:opacity-50"
                  style={{ background: AMBER, color: "#1A1200" }}
                >
                  {loading ? "Placing order..." : "Proceed to checkout"}
                </button>

                <button
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="w-full mt-2.5 py-2.5 rounded-xl font-semibold transition text-xs disabled:opacity-50"
                  style={{ border: `1px solid #E9C7C6`, color: "#B4302F" }}
                >
                  Clear cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDER CONFIRMED POPUP MODAL */}
      {showOrderPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
          <div className="rounded-3xl max-w-md w-full p-6 text-center relative" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            {/* Close Cross Button */}
            <button
              onClick={() => {
                setShowOrderPopup(false);
                navigate("/");
              }}
              className="absolute top-4 right-4 rounded-full p-1.5 transition"
              style={{ background: SURFACE_MUTED, color: MUTED }}
            >
              <X size={18} />
            </button>

            {/* Success Icon Badge */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#E4F3E9" }}>
              <CheckCircle2 size={48} style={{ color: "#1D7A43" }} />
            </div>

            <h2 className="text-2xl font-extrabold mb-1" style={{ color: INK }}>
              Order confirmed!
            </h2>
            <p className="text-xs mb-6" style={{ color: MUTED }}>
              Thank you for shopping with us. Your order has been placed.
            </p>

            {/* Order Details Card */}
            <div className="rounded-2xl p-4 text-left space-y-3 mb-6" style={{ background: SURFACE_MUTED, border: `1px solid ${BORDER}` }}>
              <div className="flex justify-between items-center text-xs">
                <span style={{ color: MUTED }}>Order ID</span>
                <span className="font-bold" style={{ color: INK }}>
                  #{confirmedOrderData?.orderId}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span style={{ color: MUTED }}>Items ordered</span>
                <span className="font-semibold" style={{ color: INK }}>
                  {confirmedOrderData?.totalItems} item(s)
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span style={{ color: MUTED }}>Amount paid</span>
                <span className="font-bold text-sm" style={{ color: AMBER_DARK }}>
                  ₹{confirmedOrderData?.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t flex items-center gap-2 text-xs font-medium" style={{ borderColor: BORDER, color: STEEL }}>
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
                className="w-full font-semibold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2 text-white"
                style={{ background: STEEL }}
              >
                <BagIcon size={16} /> Continue shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
