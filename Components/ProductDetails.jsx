import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState, useRef, useMemo } from "react";
import {
  Package,
  ArrowLeft,
  ShoppingCart,
  MapPin,
  CheckCircle2,
  XCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Layers,
  Percent,
  Scale,
  Ruler,
  CreditCard,
  Wallet,
  Building,
  Banknote,
  Zap,
  Check,
} from "lucide-react";
import { CartContext } from "../Components/Context";
import axios from "axios";

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

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!location.state?.product);
  const [error, setError] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // Delivery Pincode Checker States
  const [pincode, setPincode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [checkingPincode, setCheckingPincode] = useState(false);

  // Payment Method & Delivery Option States
  const [selectedPayment, setSelectedPayment] = useState("");
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState("standard");

  const priceScrollRef = useRef(null);
  const activeCardRef = useRef(null);

  // ================= FETCH PRODUCT =================
  useEffect(() => {
    let isMounted = true;

    setSelectedImage(0);
    setQuantity(1);
    setDeliveryStatus(null);

    if (location.state?.product) {
      setProduct(location.state.product);
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(false);

        try {
          const { data } = await axios.get(
            `https://backend-3-axez.onrender.com/api/products/${id}`
          );
          if (isMounted && data.success && data.product) {
            setProduct(data.product);
            setLoading(false);
            return;
          }
        } catch (e) {
          // Fallback to bulk list search if direct ID fails
        }

        const res = await axios.get(
          "https://backend-3-axez.onrender.com/api/products"
        );
        if (!isMounted) return;

        const found = res.data.products?.find((p) => p._id === id);
        if (found) {
          setProduct(found);
        } else {
          setError(true);
        }
      } catch (err) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id, location.state]);

  // Map Backend Payment Methods to Available Methods
  const availablePaymentMethods = useMemo(() => {
    const allMethods = [
      { id: "upi", label: "UPI / Google Pay", desc: "Instant pay via UPI apps", icon: Wallet, backendNames: ["upi", "upi / google pay"] },
      { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay", icon: CreditCard, backendNames: ["card", "credit / debit card", "credit card", "debit card"] },
      { id: "cod", label: "Cash on Delivery", desc: "Pay cash upon arrival", icon: Banknote, backendNames: ["cod", "cash on delivery"] },
      { id: "netbanking", label: "Net Banking", desc: "All major banks supported", icon: Building, backendNames: ["netbanking", "net banking"] },
    ];

    if (!product?.paymentMethods || !Array.isArray(product.paymentMethods) || product.paymentMethods.length === 0) {
      return allMethods; // Fallback to all if backend array is empty
    }

    // Filter based on backend response
    const filtered = allMethods.filter((method) =>
      product.paymentMethods.some((backendMethod) =>
        method.backendNames.includes(String(backendMethod).toLowerCase().trim())
      )
    );

    return filtered.length > 0 ? filtered : allMethods;
  }, [product]);

  // Set initial selected payment method based on available backend options
  useEffect(() => {
    if (availablePaymentMethods.length > 0) {
      setSelectedPayment(availablePaymentMethods[0].id);
    }
  }, [availablePaymentMethods]);

  // ================= PRICING TIERS (Memoized) =================
  const pricingTiers = useMemo(() => {
    if (!product) return [{ minQty: 1, price: 0 }];

    if (product.pricing && product.pricing.length > 0) {
      return [...product.pricing]
        .map((tier) => ({
          minQty: Number(tier.quantity || tier.minQty || 1),
          price: Number(tier.price) || 0,
        }))
        .sort((a, b) => a.minQty - b.minQty);
    }

    return [
      {
        minQty: 1,
        price: Number(product.price) || 0,
      },
    ];
  }, [product]);

  const maxStock = product?.stock ?? 1;

  const unitPrice = useMemo(() => {
    let applicablePrice = pricingTiers[0]?.price || 0;
    for (let i = 0; i < pricingTiers.length; i++) {
      if (quantity >= pricingTiers[i].minQty) {
        applicablePrice = pricingTiers[i].price;
      } else {
        break;
      }
    }
    return applicablePrice;
  }, [quantity, pricingTiers]);

  const totalPrice = unitPrice * quantity;

  // ================= FETCH DELIVERY CHARGE FROM BACKEND =================
  const backendDeliveryCharge = useMemo(() => {
    if (!product) return 0;
    if (typeof product.delivery === "object" && product.delivery?.charge !== undefined) {
      return Number(product.delivery.charge) || 0;
    }
    if (product.deliveryCharge !== undefined) {
      return Number(product.deliveryCharge) || 0;
    }
    return typeof product.delivery === "number" ? product.delivery : 0;
  }, [product]);

  const deliveryCharge = useMemo(() => {
    if (selectedDeliveryMethod === "standard") {
      return backendDeliveryCharge; // Shows backend base delivery charge
    }
    return backendDeliveryCharge + 100; // Express adds extra charge over backend charge
  }, [selectedDeliveryMethod, backendDeliveryCharge]);

  // GST Calculation
  const gstAmount = useMemo(() => {
    const gstPercent = Number(product?.gst) || 0;
    return (totalPrice * gstPercent) / 100;
  }, [totalPrice, product]);

  const grandTotal = totalPrice + gstAmount + deliveryCharge;

  // ================= AUTO SLIDE =================
  const imagesList = useMemo(() => {
    return product?.images?.length > 0 ? product.images : ["/no-image.png"];
  }, [product]);

  useEffect(() => {
    if (imagesList.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setSelectedImage((prevIndex) => (prevIndex + 1) % imagesList.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [imagesList.length, isPaused]);

  // ================= AUTO SCROLL ACTIVE PRICE CARD =================
  useEffect(() => {
    if (activeCardRef.current && priceScrollRef.current) {
      activeCardRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [quantity]);

  // ================= CHECK PINCODE DELIVERY =================
  const handleCheckDelivery = (e) => {
    e.preventDefault();
    if (!pincode || pincode.trim().length !== 6) {
      setDeliveryStatus({
        success: false,
        message: "Please enter a valid 6-digit pincode.",
      });
      return;
    }

    setCheckingPincode(true);
    setTimeout(() => {
      if (/^[1-9][0-9]{5}$/.test(pincode)) {
        const estDays = product?.delivery?.time ? `${product.delivery.time} days` : "3-5 business days";
        setDeliveryStatus({
          success: true,
          message: `Delivery available! Estimated delivery in ${estDays}.`,
        });
      } else {
        setDeliveryStatus({
          success: false,
          message: "Delivery not available for this location.",
        });
      }
      setCheckingPincode(false);
    }, 600);
  };

  // ================= HANDLERS =================
  const handleQuantityChange = (value) => {
    let qty = Number(value);
    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > maxStock) qty = maxStock;
    setQuantity(qty);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      ...product,
      quantity: quantity,
      price: unitPrice,
      paymentMethod: selectedPayment,
      deliveryMethod: selectedDeliveryMethod,
      deliveryCharge: deliveryCharge,
      grandTotal: grandTotal,
      selectedOption: {
        quantity: quantity,
        price: unitPrice,
        label: `${quantity} units`,
      },
    });
  };

  const quickQtys = useMemo(() => {
    return [1, 5, 10, 25, 50, 100, 250, 500, maxStock].filter(
      (q, i, arr) => q <= maxStock && arr.indexOf(q) === i
    );
  }, [maxStock]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: BG }}>
        <div className="text-center">
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 border-4 rounded-full animate-spin mx-auto"
            style={{ borderColor: AMBER_DARK, borderTopColor: "transparent" }}
          ></div>
          <p className="mt-4 font-medium text-sm sm:text-base" style={{ color: MUTED }}>
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: BG }}>
        <Package size={64} className="mb-5 sm:mb-6" style={{ color: "#C7CBCE" }} />
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center" style={{ color: INK }}>
          Product not found
        </h1>
        <p className="mb-6 sm:mb-8 text-center text-sm sm:text-base" style={{ color: MUTED }}>
          This product doesn't exist or was removed.
        </p>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 text-white rounded-xl font-semibold transition text-sm sm:text-base"
          style={{ background: STEEL }}
        >
          <ArrowLeft size={18} />
          Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 md:py-8 px-3 sm:px-4" style={{ background: BG }}>
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 font-medium mb-4 sm:mb-6 transition text-sm sm:text-base"
          style={{ color: STEEL }}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="rounded-2xl sm:rounded-3xl overflow-hidden" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* LEFT - GALLERY */}
            <div
              className="p-4 sm:p-6 md:p-8"
              style={{ background: SURFACE_MUTED }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div
                className="relative rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-5 flex items-center justify-center h-[280px] xs:h-[320px] sm:h-[380px] md:h-[420px] lg:h-[460px] p-1"
                style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
              >
                <img
                  src={imagesList[selectedImage]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-all duration-300"
                  onError={(e) => {
                    e.target.src = "/no-image.png";
                  }}
                />
                {product.offer > 0 && (
                  <span
                    className="absolute top-0 left-3 text-[10px] sm:text-xs font-bold text-white px-2.5 py-1 sm:px-3 sm:py-1.5"
                    style={{
                      background: AMBER_DARK,
                      clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)",
                    }}
                  >
                    {product.offer}% OFF
                  </span>
                )}
              </div>

              {imagesList.length > 1 && (
                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {imagesList.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-xl overflow-hidden border transition-all duration-150"
                      style={{
                        borderColor: selectedImage === index ? AMBER_DARK : BORDER,
                        opacity: selectedImage === index ? 1 : 0.6,
                      }}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-contain"
                        style={{ background: SURFACE }}
                        onError={(e) => {
                          e.target.src = "/no-image.png";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* TRUST BADGES & FEATURES */}
              <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t text-center" style={{ borderColor: BORDER }}>
                <div className="flex flex-col items-center">
                  <Truck size={20} className="mb-1" style={{ color: STEEL }} />
                  <span className="text-[11px] font-medium" style={{ color: INK }}>Fast delivery</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck size={20} className="mb-1" style={{ color: STEEL }} />
                  <span className="text-[11px] font-medium" style={{ color: INK }}>100% authentic</span>
                </div>
                <div className="flex flex-col items-center">
                  <RotateCcw size={20} className="mb-1" style={{ color: STEEL }} />
                  <span className="text-[11px] font-medium" style={{ color: INK }}>Easy returns</span>
                </div>
              </div>
            </div>

            {/* RIGHT - DETAILS */}
            <div className="p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-3 sm:mb-4 leading-snug sm:leading-tight capitalize" style={{ color: INK }}>
                  {product.name}
                </h1>

                {/* SPECIFICATIONS & BADGES */}
                <div className="space-y-2 mb-5 sm:mb-6 text-sm sm:text-base" style={{ color: MUTED }}>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {product.category && (
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: STEEL_TINT, color: STEEL }}
                      >
                        {product.category}
                      </span>
                    )}
                    {product.brand && (
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: AMBER_TINT, color: AMBER_DARK }}
                      >
                        {product.brand}
                      </span>
                    )}
                    {product.variantGroup && (
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                        style={{ background: "#F1F2EF", color: MUTED }}
                      >
                        <Layers size={12} />
                        Group: {product.variantGroup}
                      </span>
                    )}
                  </div>

                  <p>
                    <span className="font-semibold" style={{ color: INK }}>Material:</span>{" "}
                    {product.material || "N/A"}
                  </p>

                  {(product.size || product.weight) && (
                    <div className="flex flex-wrap gap-4 pt-1 text-xs sm:text-sm" style={{ color: INK }}>
                      {product.size && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-md font-medium" style={{ background: SURFACE_MUTED }}>
                          <Ruler size={14} style={{ color: MUTED }} /> Size: {product.size}
                        </span>
                      )}
                      {product.weight && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-md font-medium" style={{ background: SURFACE_MUTED }}>
                          <Scale size={14} style={{ color: MUTED }} /> Weight: {product.weight}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="pt-1">
                    <span className="font-semibold" style={{ color: INK }}>Availability:</span>{" "}
                    <span
                      className="font-semibold"
                      style={{ color: product.stock > 0 ? "#1D7A43" : "#B4302F" }}
                    >
                      {product.stock > 0
                        ? `${product.stock} units in stock`
                        : "Out of stock"}
                    </span>
                  </p>
                </div>

                {/* DELIVERY PINCODE CHECKER */}
                <div className="mb-6 p-4 rounded-2xl" style={{ background: SURFACE_MUTED, border: `1px solid ${BORDER}` }}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <MapPin size={18} style={{ color: STEEL }} />
                    <h3 className="font-semibold text-sm sm:text-base" style={{ color: INK }}>
                      Check delivery & serviceability
                    </h3>
                  </div>
                  <form onSubmit={handleCheckDelivery} className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                      style={{ background: SURFACE, border: `1px solid ${BORDER}`, color: INK }}
                    />
                    <button
                      type="submit"
                      disabled={checkingPincode}
                      className="font-medium px-4 py-2 rounded-xl text-sm transition text-white disabled:opacity-60"
                      style={{ background: STEEL }}
                    >
                      {checkingPincode ? "Checking..." : "Check"}
                    </button>
                  </form>

                  {deliveryStatus && (
                    <div
                      className="mt-3 flex items-center gap-2 text-xs sm:text-sm font-medium"
                      style={{ color: deliveryStatus.success ? "#1D7A43" : "#B4302F" }}
                    >
                      {deliveryStatus.success ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                      <span>{deliveryStatus.message}</span>
                    </div>
                  )}
                </div>

                {/* DYNAMIC BACKEND DELIVERY OPTIONS */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-sm sm:text-base" style={{ color: INK }}>
                    Select delivery option
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedDeliveryMethod("standard")}
                      className="relative p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all"
                      style={
                        selectedDeliveryMethod === "standard"
                          ? { borderColor: AMBER_DARK, background: AMBER_TINT }
                          : { borderColor: BORDER, background: SURFACE }
                      }
                    >
                      <div
                        className="p-2 rounded-lg"
                        style={
                          selectedDeliveryMethod === "standard"
                            ? { background: AMBER_DARK, color: "#FFFFFF" }
                            : { background: SURFACE_MUTED, color: MUTED }
                        }
                      >
                        <Truck size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs sm:text-sm" style={{ color: INK }}>Standard delivery</span>
                          <span className="text-xs font-bold" style={{ color: AMBER_DARK }}>
                            {backendDeliveryCharge === 0 ? "FREE" : `₹${backendDeliveryCharge}`}
                          </span>
                        </div>
                        <p className="text-[11px]" style={{ color: MUTED }}>
                          {product?.delivery?.time ? `Estimated: ${product.delivery.time} days` : "Delivered in 3-5 business days"}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedDeliveryMethod("express")}
                      className="relative p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all"
                      style={
                        selectedDeliveryMethod === "express"
                          ? { borderColor: AMBER_DARK, background: AMBER_TINT }
                          : { borderColor: BORDER, background: SURFACE }
                      }
                    >
                      <div
                        className="p-2 rounded-lg"
                        style={
                          selectedDeliveryMethod === "express"
                            ? { background: AMBER_DARK, color: "#FFFFFF" }
                            : { background: SURFACE_MUTED, color: MUTED }
                        }
                      >
                        <Zap size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs sm:text-sm" style={{ color: INK }}>Express delivery</span>
                          <span className="text-xs font-bold" style={{ color: AMBER_DARK }}>
                            ₹{backendDeliveryCharge + 100}
                          </span>
                        </div>
                        <p className="text-[11px]" style={{ color: MUTED }}>Faster express delivery</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* DYNAMIC BACKEND PAYMENT METHODS */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-sm sm:text-base" style={{ color: INK }}>
                    Select payment method
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    {availablePaymentMethods.map((method) => {
                      const Icon = method.icon;
                      const isSelected = selectedPayment === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedPayment(method.id)}
                          className="p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left"
                          style={
                            isSelected
                              ? { borderColor: AMBER_DARK, background: AMBER_TINT }
                              : { borderColor: BORDER, background: SURFACE }
                          }
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2 rounded-lg"
                              style={
                                isSelected
                                  ? { background: AMBER_DARK, color: "#FFFFFF" }
                                  : { background: SURFACE_MUTED, color: MUTED }
                              }
                            >
                              <Icon size={18} />
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-semibold" style={{ color: INK }}>
                                {method.label}
                              </p>
                              <p className="text-[10px]" style={{ color: MUTED }}>{method.desc}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div
                              className="w-5 h-5 rounded-full text-white flex items-center justify-center flex-shrink-0"
                              style={{ background: AMBER_DARK }}
                            >
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PRICING TIERS */}
                <div className="mb-5 sm:mb-6">
                  <h3 className="font-semibold mb-3 text-sm sm:text-base" style={{ color: INK }}>
                    Quantity-wise pricing
                  </h3>

                  <div
                    ref={priceScrollRef}
                    className="max-w-[320px] sm:max-w-[340px] overflow-x-auto pt-3 pb-4 price-scroll"
                  >
                    <div className="flex gap-3 min-w-max px-1">
                      {pricingTiers.map((tier, index) => {
                        const isActive = unitPrice === tier.price;

                        return (
                          <div
                            key={index}
                            ref={isActive ? activeCardRef : null}
                            className="flex-shrink-0 w-[100px] px-2.5 py-3 rounded-xl border text-center transition-all duration-300"
                            style={
                              isActive
                                ? { borderColor: AMBER_DARK, background: AMBER_TINT, transform: "scale(1.05)" }
                                : { borderColor: BORDER, background: SURFACE_MUTED }
                            }
                          >
                            <p className="text-[10px] mb-1" style={{ color: MUTED }}>
                              {tier.minQty}+ units
                            </p>
                            <p
                              className="text-sm font-bold leading-tight"
                              style={{ color: isActive ? AMBER_DARK : INK }}
                            >
                              ₹{tier.price}
                            </p>
                            <p className="text-[9px] mt-1" style={{ color: MUTED }}>
                              / unit
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* QUANTITY SELECTOR */}
                <div className="mb-5 sm:mb-6">
                  <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                    <p className="text-sm font-medium" style={{ color: INK }}>
                      Select quantity
                    </p>
                    <span className="text-xs sm:text-sm font-bold px-2.5 py-1 rounded-full" style={{ color: AMBER_DARK, background: AMBER_TINT }}>
                      {quantity} units
                    </span>
                  </div>

                  <div className="mb-3 sm:mb-4">
                    <input
                      type="number"
                      min="1"
                      max={maxStock}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-base sm:text-lg font-semibold text-center outline-none transition"
                      style={{ border: `2px solid ${BORDER}`, color: INK }}
                      placeholder="Enter quantity"
                    />
                  </div>

                  <div className="mb-3 sm:mb-4">
                    <input
                      type="range"
                      min="1"
                      max={maxStock}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{ background: "#EAD9B8", accentColor: AMBER_DARK }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {quickQtys.map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuantity(q)}
                        className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition"
                        style={
                          quantity === q
                            ? { background: STEEL, color: "#FFFFFF" }
                            : { background: SURFACE_MUTED, color: INK }
                        }
                      >
                        {q === maxStock ? `Max (${q})` : q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TOTAL PRICE BREAKDOWN */}
                <div className="mb-6 sm:mb-8 p-4 rounded-2xl space-y-2" style={{ background: SURFACE_MUTED, border: `1px solid ${BORDER}` }}>
                  <div className="flex justify-between items-center text-xs sm:text-sm" style={{ color: MUTED }}>
                    <span>
                      Unit price (₹{unitPrice} × {quantity})
                    </span>
                    <span className="font-medium" style={{ color: INK }}>₹{totalPrice.toLocaleString()}</span>
                  </div>

                  {product.gst > 0 && (
                    <div className="flex justify-between items-center text-xs sm:text-sm" style={{ color: STEEL }}>
                      <span className="flex items-center gap-1">
                        <Percent size={13} /> GST ({product.gst}%)
                      </span>
                      <span className="font-medium">+ ₹{gstAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs sm:text-sm" style={{ color: MUTED }}>
                    <span>Delivery charge</span>
                    <span className="font-medium" style={{ color: INK }}>
                      {deliveryCharge === 0 ? "FREE" : `+ ₹${deliveryCharge}`}
                    </span>
                  </div>

                  <div className="border-t pt-2 flex justify-between items-center" style={{ borderColor: BORDER }}>
                    <span className="font-bold text-sm sm:text-base" style={{ color: INK }}>
                      Grand total
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold" style={{ color: AMBER_DARK }}>
                      ₹{grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* DESCRIPTION */}
                {product.description && (
                  <div className="mb-5 sm:mb-6">
                    <h3 className="font-semibold mb-1.5 sm:mb-2 text-base sm:text-lg" style={{ color: INK }}>
                      Description
                    </h3>
                    <p className="leading-relaxed text-sm sm:text-base whitespace-pre-line" style={{ color: MUTED }}>
                      {product.description}
                    </p>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-auto pt-3 sm:pt-4">
                <button
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 md:py-4 rounded-xl font-semibold text-sm sm:text-base md:text-lg transition disabled:cursor-not-allowed"
                  style={
                    product.stock === 0
                      ? { background: SURFACE_MUTED, color: MUTED }
                      : { background: AMBER, color: "#1A1200" }
                  }
                >
                  <ShoppingCart size={18} />
                  Add to cart
                </button>
                <button
                  onClick={() => navigate("/cart")}
                  className="flex-1 text-white py-3 sm:py-3.5 md:py-4 rounded-xl font-semibold text-sm sm:text-base md:text-lg transition"
                  style={{ background: STEEL }}
                >
                  Go to cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .price-scroll::-webkit-scrollbar { height: 4px; }
        .price-scroll::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default ProductDetails;
