import React, { useContext, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { load } from "@cashfreepayments/cashfree-js";
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
  Tag,
  Sparkles,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { CartContext } from "./Context";

// ======================================================
// DESIGN TOKENS
// ======================================================
const INK = "#15181C";
const MUTED = "#6B7280";
const BORDER = "#E6E8EB";
const SURFACE = "#FFFFFF";
const SURFACE_MUTED = "#F1F2EF";
const BG = "#F5F6F4";
const AMBER = "#F0A420";
const AMBER_DARK = "#C97F0F";
const STEEL = "#2B4A5E";
const STEEL_TINT = "#EAF0F3";

const ShoppingCart = () => {
  const navigate = useNavigate();
  const { cart, clearCart, increaseQty, decreaseQty, removeFromCart } =
    useContext(CartContext);

  const [loading, setLoading] = useState(false);
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const [confirmedOrderData, setConfirmedOrderData] = useState(null);
  const [cashfree, setCashfree] = useState(null);

  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'new' | 'offers'
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const initCashfree = async () => {
      try {
        const cashfreeInstance = await load({
          mode: "production",
        });
        setCashfree(cashfreeInstance);
      } catch (error) {
        console.error("Failed to initialize Cashfree SDK:", error);
      }
    };
    initCashfree();
  }, []);

  const totalItems = useMemo(() => {
    return cart.reduce((total, item) => total + Number(item.quantity || 1), 0);
  }, [cart]);

  const subTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      return total + price * qty;
    }, 0);
  }, [cart]);

  // GST only when product has gst > 0 (no forced 18%)
  const gst = useMemo(() => {
    return cart.reduce((totalGst, item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      const gstRate =
        item.gst !== undefined && item.gst !== "" && Number(item.gst) > 0
          ? Number(item.gst)
          : 0;
      const itemSubtotal = price * qty;
      return totalGst + (itemSubtotal * gstRate) / 100;
    }, 0);
  }, [cart]);

  const grandTotal = useMemo(
    () => Math.round(subTotal + gst),
    [subTotal, gst]
  );

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

  // ========== FIXED: New product detection ==========
  const isNewProduct = (item) => {
    if (item.isNewProduct || item.isNew || item.isNewArrival) return true;
    if (item.createdAt) {
      const createdDate = new Date(item.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate >= thirtyDaysAgo;
    }
    return false;
  };

  // ========== FIXED: Offer / sale detection ==========
  const getDiscountPercent = (item) => {
    return (
      Number(
        item.discountPercent ||
          item.discountPercentage ||
          item.offer ||
          0
      ) || 0
    );
  };

  const getOfferLabel = (item) => {
    if (item.offerTag) return item.offerTag;
    if (item.discountNote) return String(item.discountNote);

    const discountPct = getDiscountPercent(item);
    if (discountPct > 0) return `${discountPct}% OFF`;

    const original = Number(item.originalPrice || 0);
    const price = Number(item.price || 0);
    if (original > price && price > 0) {
      const discount = Math.round(((original - price) / original) * 100);
      if (discount > 0) return `${discount}% OFF`;
    }

    return null;
  };

  const hasOffer = (item) => Boolean(getOfferLabel(item));

  // Filtered + Sorted cart
  const filteredCartItems = useMemo(() => {
    let list = [...cart];

    if (activeFilter === "new") {
      list = list.filter((item) => isNewProduct(item));
    } else if (activeFilter === "offers") {
      list = list.filter((item) => hasOffer(item));
    }

    if (sortBy === "price-low") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "name") {
      list.sort((a, b) => {
        const nameA = (a.name || a.title || "").toLowerCase();
        const nameB = (b.name || b.title || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }

    return list;
  }, [cart, activeFilter, sortBy]);

  const newCount = useMemo(
    () => cart.filter((item) => isNewProduct(item)).length,
    [cart]
  );

  const offerCount = useMemo(
    () => cart.filter((item) => hasOffer(item)).length,
    [cart]
  );

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
      if (!cashfree) {
        toast.error(
          "Payment gateway initializing. Please try again in a moment."
        );
        return;
      }

      setLoading(true);

      const customerEmail = user.email || "customer@pedwal.in";
      const customerPhone = user.phone || user.mobile || "9999999999";

      const orderData = {
        userId: user._id,
        customerName: user.name || "Valued Customer",
        customerEmail,
        customerPhone,
        items: cart.map((item) => {
          const gstRate =
            item.gst !== undefined && item.gst !== "" && Number(item.gst) > 0
              ? Number(item.gst)
              : 0;
          const lineTotal =
            Number(item.price || 0) * Number(item.quantity || 1);
          const itemGst = (lineTotal * gstRate) / 100;
          return {
            id: String(getItemId(item)),
            title: item.name || item.title || "Product",
            brand: item.brand || "N/A",
            image: getImage(item),
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 1),
            gstRate,
            gstAmount: Math.round(itemGst),
            lineTotal,
            selectedOption: item.selectedOption || null,
          };
        }),
        totalItems,
        subTotal,
        gst: Math.round(gst),
        totalAmount: Number(grandTotal),
      };

      const { data: dbOrderData } = await axios.post(
        "https://backend-3-axez.onrender.com/api/orders/create",
        orderData
      );
      const dbOrderId = dbOrderData?.order?._id || `ORD-${Date.now()}`;

      const { data: paymentSessionRes } = await axios.post(
        "https://backend-3-axez.onrender.com/api/payments/create-session",
        {
          amount: grandTotal,
          customerId: user._id,
          customerName: user.name || "Valued Customer",
          customerEmail,
          customerPhone,
        }
      );

      if (paymentSessionRes.success && paymentSessionRes.payment_session_id) {
        setConfirmedOrderData({
          orderId: paymentSessionRes.order_id || dbOrderId,
          totalAmount: grandTotal,
          totalItems,
        });

        cashfree.checkout({
          paymentSessionId: paymentSessionRes.payment_session_id,
          redirectTarget: "_self",
        });
        clearCart();
      } else {
        toast.error("Could not initiate payment session.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(
        err.response?.data?.message || "Unable to proceed to payment"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen py-8 px-3 sm:px-6 relative"
      style={{ background: BG }}
    >
      {cart.length === 0 && !showOrderPopup ? (
        <div className="max-w-2xl mx-auto py-12">
          <div
            className="rounded-3xl p-8 sm:p-12 text-center"
            style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
          >
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: SURFACE_MUTED }}
            >
              <ShoppingBag size={36} style={{ color: MUTED }} />
            </div>
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: INK }}
            >
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
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1
                className="text-2xl sm:text-4xl font-extrabold"
                style={{ color: INK }}
              >
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

          <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-4">
              {/* FILTER & SORT */}
              <div
                className="sticky top-4 z-20 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                style={{
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-xs font-semibold flex items-center gap-1 mr-1"
                    style={{ color: MUTED }}
                  >
                    <Filter size={14} /> Filter:
                  </span>

                  <button
                    type="button"
                    onClick={() => setActiveFilter("all")}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                    style={{
                      background:
                        activeFilter === "all" ? STEEL : SURFACE_MUTED,
                      color: activeFilter === "all" ? "#FFFFFF" : INK,
                    }}
                  >
                    All ({cart.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFilter("new")}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1"
                    style={{
                      background:
                        activeFilter === "new" ? STEEL : SURFACE_MUTED,
                      color: activeFilter === "new" ? "#FFFFFF" : INK,
                    }}
                  >
                    <Sparkles size={12} /> New Items ({newCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFilter("offers")}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1"
                    style={{
                      background:
                        activeFilter === "offers" ? STEEL : SURFACE_MUTED,
                      color: activeFilter === "offers" ? "#FFFFFF" : INK,
                    }}
                  >
                    <Tag size={12} /> Offers / Sale ({offerCount})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={14} style={{ color: MUTED }} />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs font-medium bg-transparent border rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
                    style={{
                      borderColor: BORDER,
                      color: INK,
                      background: SURFACE_MUTED,
                    }}
                  >
                    <option value="default">Sort by: Default</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>
              </div>

              {/* CART ITEMS */}
              <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1 space-y-4 rounded-2xl custom-scrollbar">
                {filteredCartItems.length === 0 ? (
                  <div
                    className="rounded-2xl p-8 text-center"
                    style={{
                      background: SURFACE,
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <p className="text-sm font-medium" style={{ color: MUTED }}>
                      No items match the selected filter.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveFilter("all")}
                      className="mt-3 text-xs underline font-semibold"
                      style={{ color: STEEL }}
                    >
                      Clear Filter
                    </button>
                  </div>
                ) : (
                  filteredCartItems.map((item, index) => {
                    const itemId = getItemId(item);
                    const image = getImage(item);
                    const name = item.name || item.title || "Product";
                    const optionLabel = getSelectedLabel(item);
                    const optionQty = getOptionQty(item);
                    const unitPrice = Number(item.price || 0);
                    const originalPrice = item.originalPrice
                      ? Number(item.originalPrice)
                      : null;
                    const qty = Number(item.quantity || 1);
                    const lineTotal = unitPrice * qty;
                    const itemGstRate =
                      item.gst !== undefined &&
                      item.gst !== "" &&
                      Number(item.gst) > 0
                        ? Number(item.gst)
                        : 0;
                    const isNew = isNewProduct(item);
                    const offerText = getOfferLabel(item);

                    return (
                      <div
                        key={`${itemId}-${optionQty}-${unitPrice}-${index}`}
                        className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 transition relative overflow-hidden"
                        style={{
                          background: SURFACE,
                          border: `1px solid ${BORDER}`,
                        }}
                      >
                        <div
                          className="w-full sm:w-32 h-32 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden relative"
                          style={{ background: SURFACE_MUTED }}
                        >
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
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            {isNew && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md text-white bg-emerald-600">
                                <Sparkles size={10} />
                                New
                              </span>
                            )}
                            {offerText && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                                <Tag size={10} />
                                {offerText}
                              </span>
                            )}
                          </div>

                          <h2
                            className="text-base sm:text-lg font-bold line-clamp-2"
                            style={{ color: INK }}
                          >
                            {name}
                          </h2>

                          {item.brand && (
                            <p
                              className="text-xs mt-0.5"
                              style={{ color: MUTED }}
                            >
                              Brand: {item.brand}
                            </p>
                          )}

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                              style={{
                                background: STEEL_TINT,
                                color: STEEL,
                              }}
                            >
                              <Package size={12} />
                              {optionLabel}
                            </span>
                            {itemGstRate > 0 && (
                              <span
                                className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full"
                                style={{
                                  background: SURFACE_MUTED,
                                  color: MUTED,
                                }}
                              >
                                GST: {itemGstRate}%
                              </span>
                            )}
                          </div>

                          <p className="text-xs mt-2" style={{ color: MUTED }}>
                            Unit price:{" "}
                            <span
                              className="font-medium"
                              style={{ color: INK }}
                            >
                              ₹{unitPrice.toLocaleString()}
                            </span>
                            {originalPrice && originalPrice > unitPrice && (
                              <span
                                className="line-through text-xs ml-1.5"
                                style={{ color: MUTED }}
                              >
                                ₹{originalPrice.toLocaleString()}
                              </span>
                            )}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                            <div
                              className="flex items-center rounded-xl overflow-hidden"
                              style={{ border: `1px solid ${BORDER}` }}
                            >
                              <button
                                type="button"
                                onClick={() => decreaseQty(itemId, optionQty)}
                                className="w-8 h-8 flex items-center justify-center transition"
                                style={{
                                  background: SURFACE_MUTED,
                                  color: INK,
                                }}
                              >
                                <Minus size={14} />
                              </button>
                              <span
                                className="w-10 text-center font-bold text-sm"
                                style={{ color: INK }}
                              >
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => increaseQty(itemId, optionQty)}
                                className="w-8 h-8 flex items-center justify-center transition"
                                style={{
                                  background: SURFACE_MUTED,
                                  color: INK,
                                }}
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <div className="text-right">
                              <p
                                className="text-[10px]"
                                style={{ color: MUTED }}
                              >
                                Total
                              </p>
                              <p
                                className="text-base font-extrabold"
                                style={{ color: AMBER_DARK }}
                              >
                                ₹{lineTotal.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className="flex sm:flex-col justify-end items-end pt-2 sm:pt-0 border-t sm:border-t-0"
                          style={{ borderColor: BORDER }}
                        >
                          <button
                            type="button"
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
                  })
                )}
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div className="lg:col-span-1 lg:sticky lg:top-4">
              <div
                className="rounded-2xl p-5"
                style={{
                  background: SURFACE,
                  border: `1px solid ${BORDER}`,
                }}
              >
                <h2
                  className="text-lg font-bold mb-4"
                  style={{ color: INK }}
                >
                  Order summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div
                    className="flex justify-between"
                    style={{ color: MUTED }}
                  >
                    <span>Total items</span>
                    <span className="font-semibold" style={{ color: INK }}>
                      {totalItems}
                    </span>
                  </div>
                  <div
                    className="flex justify-between"
                    style={{ color: MUTED }}
                  >
                    <span>Subtotal</span>
                    <span className="font-semibold" style={{ color: INK }}>
                      ₹{subTotal.toLocaleString()}
                    </span>
                  </div>
                  {gst > 0 && (
                    <div
                      className="flex justify-between"
                      style={{ color: MUTED }}
                    >
                      <span>Estimated GST</span>
                      <span className="font-semibold" style={{ color: INK }}>
                        ₹{Math.round(gst).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <hr className="my-4" style={{ borderColor: BORDER }} />

                <div className="flex justify-between items-center mb-5">
                  <span className="text-base font-bold" style={{ color: INK }}>
                    Grand total
                  </span>
                  <span
                    className="text-xl font-extrabold"
                    style={{ color: AMBER_DARK }}
                  >
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={checkoutHandler}
                  disabled={loading || cart.length === 0}
                  className="w-full py-3 rounded-xl font-semibold transition text-sm disabled:opacity-50"
                  style={{ background: AMBER, color: "#1A1200" }}
                >
                  {loading ? "Processing..." : "Pay via Cashfree"}
                </button>

                <button
                  type="button"
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

      {/* ORDER POPUP */}
      {showOrderPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div
            className="rounded-3xl max-w-md w-full p-6 text-center relative"
            style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
          >
            <button
              type="button"
              onClick={() => {
                setShowOrderPopup(false);
                navigate("/");
              }}
              className="absolute top-4 right-4 rounded-full p-1.5 transition"
              style={{ background: SURFACE_MUTED, color: MUTED }}
            >
              <X size={18} />
            </button>

            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#E4F3E9" }}
            >
              <CheckCircle2 size={48} style={{ color: "#1D7A43" }} />
            </div>

            <h2
              className="text-2xl font-extrabold mb-1"
              style={{ color: INK }}
            >
              Order confirmed!
            </h2>
            <p className="text-xs mb-6" style={{ color: MUTED }}>
              Thank you for shopping with us. Your payment has been processed.
            </p>

            <div
              className="rounded-2xl p-4 text-left space-y-3 mb-6"
              style={{
                background: SURFACE_MUTED,
                border: `1px solid ${BORDER}`,
              }}
            >
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
                <span
                  className="font-bold text-sm"
                  style={{ color: AMBER_DARK }}
                >
                  ₹{confirmedOrderData?.totalAmount?.toLocaleString()}
                </span>
              </div>
              <div
                className="pt-2 border-t flex items-center gap-2 text-xs font-medium"
                style={{ borderColor: BORDER, color: STEEL }}
              >
                <Truck size={16} />
                <span>Arriving soon at your doorstep!</span>
              </div>
            </div>

            <button
              type="button"
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
      )}
    </div>
  );
};

export default ShoppingCart;
