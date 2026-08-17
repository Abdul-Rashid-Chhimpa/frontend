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
} from "lucide-react";
import { CartContext } from "../Components/Context";
import axios from "axios";

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
  const [deliveryStatus, setDeliveryStatus] = useState(null); // null | { success: boolean, message: string }
  const [checkingPincode, setCheckingPincode] = useState(false);

  // New States: Payment Method & Delivery Option
  const [selectedPayment, setSelectedPayment] = useState("upi");
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
      } font-medium
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

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

  // Delivery Charges
  const deliveryCharge = useMemo(() => {
    return selectedDeliveryMethod === "express" ? 150 : 0;
  }, [selectedDeliveryMethod]);

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
        setDeliveryStatus({
          success: true,
          message: "Delivery available! Estimated delivery in 3-5 business days.",
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium text-sm sm:text-base">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
        <Package size={64} className="text-gray-300 mb-5 sm:mb-6" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
          Product Not Found
        </h1>
        <p className="text-gray-500 mb-6 sm:mb-8 text-center text-sm sm:text-base">
          This product doesn't exist or was removed.
        </p>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition text-sm sm:text-base"
        >
          <ArrowLeft size={18} />
          Back To Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-4 sm:mb-6 transition text-sm sm:text-base"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* LEFT - GALLERY */}
            <div
              className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden mb-4 sm:mb-5 flex items-center justify-center h-[280px] xs:h-[320px] sm:h-[380px] md:h-[420px] lg:h-[460px] p-1">
                <img
                  src={imagesList[selectedImage]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-all duration-300"
                  onError={(e) => {
                    e.target.src = "/no-image.png";
                  }}
                />
                {product.offer > 0 && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full shadow">
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
                      className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-xl overflow-hidden border transition-all duration-150 ${
                        selectedImage === index
                          ? "border-indigo-600 opacity-100"
                          : "border-gray-200 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-contain bg-white"
                        onError={(e) => {
                          e.target.src = "/no-image.png";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* TRUST BADGES & FEATURES */}
              <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-gray-200/80 text-center">
                <div className="flex flex-col items-center">
                  <Truck size={20} className="text-indigo-600 mb-1" />
                  <span className="text-[11px] font-medium text-gray-700">Fast Delivery</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck size={20} className="text-emerald-600 mb-1" />
                  <span className="text-[11px] font-medium text-gray-700">100% Authentic</span>
                </div>
                <div className="flex flex-col items-center">
                  <RotateCcw size={20} className="text-purple-600 mb-1" />
                  <span className="text-[11px] font-medium text-gray-700">Easy Returns</span>
                </div>
              </div>
            </div>

            {/* RIGHT - DETAILS */}
            <div className="p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 sm:mb-4 leading-snug sm:leading-tight">
                  {product.name}
                </h1>

                {/* SPECIFICATIONS & BADGES */}
                <div className="space-y-2 text-gray-600 mb-5 sm:mb-6 text-sm sm:text-base">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {product.category && (
                      <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {product.category}
                      </span>
                    )}
                    {product.brand && (
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {product.brand}
                      </span>
                    )}
                    {product.variantGroup && (
                      <span className="bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Layers size={12} />
                        Group: {product.variantGroup}
                      </span>
                    )}
                  </div>

                  <p>
                    <span className="font-semibold text-gray-800">Material:</span>{" "}
                    {product.material || "N/A"}
                  </p>

                  {(product.size || product.weight) && (
                    <div className="flex flex-wrap gap-4 pt-1 text-xs sm:text-sm text-gray-700">
                      {product.size && (
                        <span className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-md font-medium">
                          <Ruler size={14} className="text-gray-500" /> Size: {product.size}
                        </span>
                      )}
                      {product.weight && (
                        <span className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-md font-medium">
                          <Scale size={14} className="text-gray-500" /> Weight: {product.weight}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="pt-1">
                    <span className="font-semibold text-gray-800">Availability:</span>{" "}
                    <span
                      className={
                        product.stock > 0
                          ? "text-emerald-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {product.stock > 0
                        ? `${product.stock} units in stock`
                        : "Out of Stock"}
                    </span>
                  </p>
                </div>

                {/* DELIVERY PINCODE CHECKER */}
                <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2.5">
                    <MapPin size={18} className="text-indigo-600" />
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                      Check Delivery & Serviceability
                    </h3>
                  </div>
                  <form onSubmit={handleCheckDelivery} className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 6-digit Pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={checkingPincode}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium px-4 py-2 rounded-xl text-sm transition"
                    >
                      {checkingPincode ? "Checking..." : "Check"}
                    </button>
                  </form>

                  {deliveryStatus && (
                    <div
                      className={`mt-3 flex items-center gap-2 text-xs sm:text-sm font-medium ${
                        deliveryStatus.success ? "text-emerald-700" : "text-red-600"
                      }`}
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

                {/* DELIVERY OPTIONS */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">
                    Select Delivery Option
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedDeliveryMethod("standard")}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition ${
                        selectedDeliveryMethod === "standard"
                          ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs sm:text-sm text-gray-800 flex items-center gap-1.5">
                          <Truck size={16} className="text-indigo-600" /> Standard
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                          FREE
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500">Delivered in 3-5 Business Days</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedDeliveryMethod("express")}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition ${
                        selectedDeliveryMethod === "express"
                          ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs sm:text-sm text-gray-800 flex items-center gap-1.5">
                          <Zap size={16} className="text-amber-500" /> Express
                        </span>
                        <span className="text-xs font-bold text-gray-800">₹150</span>
                      </div>
                      <p className="text-[11px] text-gray-500">Delivered in 1-2 Business Days</p>
                    </button>
                  </div>
                </div>

                {/* PAYMENT METHODS */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">
                    Select Payment Method
                  </h3>
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    {[
                      { id: "upi", label: "UPI / Google Pay", icon: Wallet },
                      { id: "card", label: "Credit / Debit Card", icon: CreditCard },
                      { id: "cod", label: "Cash on Delivery", icon: Banknote },
                      { id: "netbanking", label: "Net Banking", icon: Building },
                    ].map((method) => {
                      const Icon = method.icon;
                      const isSelected = selectedPayment === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedPayment(method.id)}
                          className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-2.5 transition text-left ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50/80 text-indigo-900 font-semibold ring-2 ring-indigo-500/20"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <Icon size={18} className={isSelected ? "text-indigo-600" : "text-gray-400"} />
                          <span className="text-xs sm:text-sm">{method.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PRICING TIERS */}
                <div className="mb-5 sm:mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">
                    Quantity Wise Pricing
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
                            className={`flex-shrink-0 w-[100px] px-2.5 py-3 rounded-xl border text-center transition-all duration-300 ${
                              isActive
                                ? "border-indigo-500 bg-indigo-50 shadow-md scale-105"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <p className="text-[10px] text-gray-500 mb-1">
                              {tier.minQty}+ units
                            </p>
                            <p
                              className={`text-sm font-bold leading-tight ${
                                isActive ? "text-indigo-700" : "text-gray-800"
                              }`}
                            >
                              ₹{tier.price}
                            </p>
                            <p className="text-[9px] text-gray-400 mt-1">
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
                    <p className="text-sm font-medium text-gray-700">
                      Select Quantity
                    </p>
                    <span className="text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
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
                      className="w-full border-2 border-gray-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-base sm:text-lg font-semibold text-center outline-none transition"
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
                      className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {quickQtys.map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuantity(q)}
                        className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                          quantity === q
                            ? "bg-indigo-600 text-white shadow"
                            : "bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700"
                        }`}
                      >
                        {q === maxStock ? `Max (${q})` : q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TOTAL PRICE BREAKDOWN (WITH GST & DELIVERY) */}
                <div className="mb-6 sm:mb-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 space-y-2">
                  <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600">
                    <span>
                      Unit Price (₹{unitPrice} × {quantity})
                    </span>
                    <span className="font-medium">₹{totalPrice.toLocaleString()}</span>
                  </div>

                  {product.gst > 0 && (
                    <div className="flex justify-between items-center text-xs sm:text-sm text-indigo-700">
                      <span className="flex items-center gap-1">
                        <Percent size={13} /> GST ({product.gst}%)
                      </span>
                      <span className="font-medium">+ ₹{gstAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600">
                    <span>Delivery Charge</span>
                    <span className="font-medium">
                      {deliveryCharge === 0 ? "FREE" : `+ ₹${deliveryCharge}`}
                    </span>
                  </div>

                  <div className="border-t border-indigo-200/60 pt-2 flex justify-between items-center">
                    <span className="text-gray-800 font-bold text-sm sm:text-base">
                      Grand Total
                    </span>
                    <span className="text-xl sm:text-2xl font-extrabold text-indigo-700">
                      ₹{grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* DESCRIPTION */}
                {product.description && (
                  <div className="mb-5 sm:mb-6">
                    <h3 className="font-semibold text-gray-800 mb-1.5 sm:mb-2 text-base sm:text-lg">
                      Description
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
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
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 sm:py-3.5 md:py-4 rounded-xl font-semibold text-sm sm:text-base md:text-lg transition shadow-lg"
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>
                <button
                  onClick={() => navigate("/cart")}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 sm:py-3.5 md:py-4 rounded-xl font-semibold text-sm sm:text-base md:text-lg transition shadow-lg"
                >
                  Go to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
