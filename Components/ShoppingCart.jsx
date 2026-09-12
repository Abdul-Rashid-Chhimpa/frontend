import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  PackageOpen,
  Check,
  X,
  Truck,
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
const PAPER = "#FBFAF8";
const DASH = "#CDD1CB";
const AMBER = "#F0A420";
const AMBER_DARK = "#C97F0F";
const STEEL = "#2B4A5E";

// A dashed rule with two punched "stub" notches — the visual seam between
// the itemized rows and the totals, like tearing a receipt off a ticket.
const TearLine = () => (
  <div className="relative my-1">
    <div style={{ borderTop: `2px dashed ${DASH}` }} />
    <div
      className="absolute -left-4 sm:-left-6 -top-2.5 w-5 h-5 rounded-full"
      style={{ background: BG, border: `1px solid ${BORDER}` }}
    />
    <div
      className="absolute -right-4 sm:-right-6 -top-2.5 w-5 h-5 rounded-full"
      style={{ background: BG, border: `1px solid ${BORDER}` }}
    />
  </div>
);

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
      {/* EMPTY CART VIEW — a blank order form */}
      {cart.length === 0 && !showOrderPopup ? (
        <div className="max-w-lg mx-auto py-12">
          <div
            className="rounded-2xl p-10 sm:p-14 text-center"
            style={{ background: PAPER, border: `2px dashed ${DASH}` }}
          >
            <PackageOpen size={40} className="mx-auto mb-4" style={{ color: MUTED }} />
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: INK }}>
              No items on this ticket yet
            </h2>
            <p className="mt-2 text-sm" style={{ color: MUTED }}>
              Add a few tools and they'll line up here.
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
        /* ACTIVE CART — one continuous order ticket */
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: INK }}>
                Your order
              </h1>
              <p className="text-xs sm:text-sm mt-1" style={{ color: MUTED }}>
                {totalItems} item{totalItems !== 1 ? "s" : ""} on this ticket
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

          <div className="rounded-2xl overflow-hidden" style={{ background: PAPER, border: `1px solid ${BORDER}` }}>
            {/* Itemized rows */}
            <div className="p-3 sm:p-5 space-y-0">
              {cart.map((item, index) => {
                const itemId = getItemId(item);
                const image = getImage(item);
                const name = item.name || item.title || "Product";
                const optionLabel = getSelectedLabel(item);
                const optionQty = getOptionQty(item);

                const unitPrice = Number(item.price || 0);
                const qty = Number(item.quantity || 1);
                const lineTotal = unitPrice * qty;

                return (
                  <div
                    key={`${itemId}-${optionQty}-${unitPrice}-${index}`}
                    className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4"
                    style={index !== 0 ? { borderTop: `1px solid ${BORDER}` } : undefined}
                  >
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{ background: SURFACE_MUTED }}
                    >
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-contain p-1.5"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/200?text=No+Image";
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm sm:text-base font-bold truncate" style={{ color: INK }}>
                        {name}
                      </h2>
                      <p className="text-[11px] sm:text-xs mt-0.5" style={{ color: MUTED }}>
                        {optionLabel} · ₹{unitPrice.toLocaleString()} / unit
                      </p>
                    </div>

                    <div className="flex items-center rounded-lg overflow-hidden flex-shrink-0" style={{ border: `1px solid ${BORDER}` }}>
                      <button
                        onClick={() => decreaseQty(itemId, optionQty)}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center"
                        style={{ background: SURFACE_MUTED, color: INK }}
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-7 sm:w-9 text-center font-bold text-xs sm:text-sm font-mono" style={{ color: INK }}>
                        {qty}
                      </span>
                      <button
                        onClick={() => increaseQty(itemId, optionQty)}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center"
                        style={{ background: SURFACE_MUTED, color: INK }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <div className="text-right flex-shrink-0 w-16 sm:w-20">
                      <p className="text-sm sm:text-base font-extrabold font-mono" style={{ color: INK }}>
                        ₹{lineTotal.toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(itemId, optionQty)}
                      aria-label="Remove item"
                      className="flex-shrink-0 p-1.5 rounded-lg transition"
                      style={{ color: "#B4302F" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="px-4 sm:px-6">
              <TearLine />
            </div>

            {/* Totals */}
            <div className="p-4 sm:p-6 pt-4 sm:pt-5">
              <div className="space-y-2 text-sm font-mono max-w-xs ml-auto">
                <div className="flex justify-between" style={{ color: MUTED }}>
                  <span className="font-sans">Subtotal</span>
                  <span style={{ color: INK }}>₹{subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between" style={{ color: MUTED }}>
                  <span className="font-sans">GST</span>
                  <span style={{ color: INK }}>₹{Math.round(gst).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
                  <span className="font-sans font-bold text-base" style={{ color: INK }}>Total</span>
                  <span className="text-xl font-extrabold" style={{ color: AMBER_DARK }}>
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-6">
                <button
                  onClick={checkoutHandler}
                  disabled={loading || cart.length === 0}
                  className="flex-1 py-3 rounded-xl font-semibold transition text-sm disabled:opacity-50"
                  style={{ background: AMBER, color: "#1A1200" }}
                >
                  {loading ? "Placing order..." : "Proceed to checkout"}
                </button>
                <button
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="py-3 px-5 rounded-xl font-medium transition text-sm disabled:opacity-50"
                  style={{ color: "#B4302F" }}
                >
                  Clear cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDER CONFIRMED — packing-slip stub with a stamp mark */}
      {showOrderPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="rounded-2xl max-w-sm w-full p-6 sm:p-8 text-center relative" style={{ background: PAPER, border: `1px solid ${BORDER}` }}>
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

            {/* Ink-stamp mark */}
            <div
              className="w-24 h-24 rounded-full flex flex-col items-center justify-center mx-auto mb-5"
              style={{
                border: `3px solid #1D7A43`,
                color: "#1D7A43",
                transform: "rotate(-8deg)",
              }}
            >
              <Check size={26} strokeWidth={3} />
              <span className="text-[9px] font-bold tracking-wide mt-0.5">CONFIRMED</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold mb-1" style={{ color: INK }}>
              Order placed
            </h2>
            <p className="text-xs mb-6" style={{ color: MUTED }}>
              Thanks for shopping with us.
            </p>

            <div className="rounded-xl p-4 text-left space-y-2.5 mb-6 font-mono text-xs" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
              <div className="flex justify-between items-center">
                <span className="font-sans" style={{ color: MUTED }}>Order ID</span>
                <span className="font-bold" style={{ color: INK }}>
                  #{confirmedOrderData?.orderId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-sans" style={{ color: MUTED }}>Items</span>
                <span style={{ color: INK }}>
                  {confirmedOrderData?.totalItems}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-sans" style={{ color: MUTED }}>Amount paid</span>
                <span className="font-bold" style={{ color: AMBER_DARK }}>
                  ₹{confirmedOrderData?.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="pt-2 flex items-center gap-2 font-sans font-medium" style={{ borderTop: `1px solid ${BORDER}`, color: STEEL }}>
                <Truck size={14} />
                <span>Arriving soon at your doorstep</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowOrderPopup(false);
                navigate("/");
              }}
              className="w-full font-semibold py-3 rounded-xl transition text-sm text-white"
              style={{ background: STEEL }}
            >
              Continue shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
