import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Package,
  ArrowLeft,
  ShoppingCart,
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
  Tag,
  Hash,
} from "lucide-react";
import { CartContext } from "../Components/Context";
import axios from "axios";

const API_BASE = "https://backend-3-axez.onrender.com";

const getViewerId = () => {
  try {
    const u = JSON.parse(localStorage.getItem("user")) || {};
    return u._id || u.id || "";
  } catch {
    return "";
  }
};

// ======================================================
// STOCK BATTERY (liquid fill + color by level)
// ======================================================
const StockBattery = ({ stock }) => {
  const qty = Math.max(0, Number(stock) || 0);
  const capacity = 100;
  const fillPercent = qty <= 0 ? 0 : Math.min(100, (qty / capacity) * 100);

  let liquidColor = "#22C55E";
  let glowColor = "rgba(34, 197, 94, 0.45)";
  let labelColor = "text-emerald-600";
  let label = "In stock";

  if (qty <= 0) {
    liquidColor = "#9CA3AF";
    glowColor = "transparent";
    labelColor = "text-red-600";
    label = "Out of Stock";
  } else if (fillPercent <= 20) {
    liquidColor = "#EF4444";
    glowColor = "rgba(239, 68, 68, 0.4)";
    labelColor = "text-red-600";
    label = "Low stock";
  } else if (fillPercent <= 50) {
    liquidColor = "#F59E0B";
    glowColor = "rgba(245, 158, 11, 0.4)";
    labelColor = "text-amber-600";
    label = "Limited stock";
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-0.5">
        <div
          className="relative w-[52px] h-[26px] rounded-md border-2 border-gray-400 bg-gray-100 overflow-hidden"
          title={`${qty} units`}
        >
          <div
            className="absolute left-0 top-0 bottom-0 transition-all duration-700 ease-out"
            style={{
              width: `${fillPercent}%`,
              background: `linear-gradient(180deg, ${liquidColor}cc 0%, ${liquidColor} 55%, ${liquidColor}dd 100%)`,
              boxShadow: qty > 0 ? `inset 0 0 8px ${glowColor}` : "none",
            }}
          >
            {qty > 0 && (
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 45%, transparent 100%)",
                  animation: "batteryWave 2.4s ease-in-out infinite",
                }}
              />
            )}
          </div>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-800 drop-shadow-sm pointer-events-none">
            {qty <= 0 ? "0%" : `${Math.round(fillPercent)}%`}
          </span>
        </div>
        <div className="w-[5px] h-[12px] rounded-r-sm bg-gray-400" />
      </div>

      <div className="flex flex-col leading-tight">
        <span className={`text-sm font-semibold ${labelColor}`}>{label}</span>
        <span className="text-xs text-gray-500">
          {qty > 0 ? `${qty} units available` : "Currently unavailable"}
        </span>
      </div>

      <style>{`
        @keyframes batteryWave {
          0%, 100% { transform: translateY(0); opacity: 0.35; }
          50% { transform: translateY(2px); opacity: 0.55; }
        }
      `}</style>
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, cart } = useContext(CartContext);

  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!location.state?.product);
  const [error, setError] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] =
    useState("standard");

  const priceScrollRef = useRef(null);
  const activeCardRef = useRef(null);

  // ================= FETCH PRODUCT =================
  useEffect(() => {
    let isMounted = true;
    setSelectedImage(0);
    setQuantity(1);
    const viewerId = getViewerId();

    if (location.state?.product) {
      setProduct(location.state.product);
      setLoading(false);
      axios
        .get(`${API_BASE}/api/products/${id}`, {
          params: { userId: viewerId },
        })
        .then(({ data }) => {
          if (isMounted && data.success && data.product) {
            setProduct(data.product);
          }
        })
        .catch(() => {});
      return () => {
        isMounted = false;
      };
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(false);
        try {
          const { data } = await axios.get(`${API_BASE}/api/products/${id}`, {
            params: { userId: viewerId },
          });
          if (isMounted && data.success && data.product) {
            setProduct(data.product);
            setLoading(false);
            return;
          }
        } catch (e) {
          // fallback
        }
        const res = await axios.get(`${API_BASE}/api/products`, {
          params: { userId: viewerId },
        });
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

  // ================= PAYMENT METHODS =================
  const availablePaymentMethods = useMemo(() => {
    const allMethods = [
      {
        id: "upi",
        label: "UPI / Google Pay",
        desc: "Instant pay via UPI apps",
        icon: Wallet,
        backendNames: ["upi", "upi / google pay"],
      },
      {
        id: "card",
        label: "Credit / Debit Card",
        desc: "Visa, Mastercard, RuPay",
        icon: CreditCard,
        backendNames: [
          "card",
          "credit / debit card",
          "credit card",
          "debit card",
        ],
      },
      {
        id: "cod",
        label: "Cash on Delivery",
        desc: "Pay cash upon arrival",
        icon: Banknote,
        backendNames: ["cod", "cash on delivery"],
      },
      {
        id: "netbanking",
        label: "Net Banking",
        desc: "All major banks supported",
        icon: Building,
        backendNames: ["netbanking", "net banking"],
      },
    ];

    if (
      !product?.paymentMethods ||
      !Array.isArray(product.paymentMethods) ||
      product.paymentMethods.length === 0
    ) {
      return allMethods;
    }

    const filtered = allMethods.filter((method) =>
      product.paymentMethods.some((backendMethod) =>
        method.backendNames.includes(
          String(backendMethod).toLowerCase().trim()
        )
      )
    );
    return filtered.length > 0 ? filtered : allMethods;
  }, [product]);

  useEffect(() => {
    if (availablePaymentMethods.length > 0) {
      setSelectedPayment(availablePaymentMethods[0].id);
    }
  }, [availablePaymentMethods]);

  // ================= PRICING TIERS =================
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
    return [{ minQty: 1, price: Number(product.price) || 0 }];
  }, [product]);

  const maxStock = Math.max(0, Number(product?.stock) || 0);

  const baseUnitPrice = useMemo(() => {
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

  // ================= DISCOUNT =================
  const discountPercent = useMemo(() => {
    return Number(product?.discountPercent || product?.offer || 0) || 0;
  }, [product]);

  const originalUnitPrice = baseUnitPrice;

  const unitPrice = useMemo(() => {
    if (discountPercent > 0 && discountPercent < 100) {
      return (
        Math.round(originalUnitPrice * (1 - discountPercent / 100) * 100) / 100
      );
    }
    return originalUnitPrice;
  }, [originalUnitPrice, discountPercent]);

  const hasDiscount = discountPercent > 0 && unitPrice < originalUnitPrice;
  const totalOriginalPrice = originalUnitPrice * quantity;
  const totalPrice = unitPrice * quantity;
  const totalSavings = hasDiscount ? totalOriginalPrice - totalPrice : 0;

  // ================= DELIVERY =================
  const backendDeliveryCharge = useMemo(() => {
    if (!product) return 0;
    if (
      typeof product.delivery === "object" &&
      product.delivery?.charge !== undefined
    ) {
      return Number(product.delivery.charge) || 0;
    }
    if (product.deliveryCharge !== undefined) {
      return Number(product.deliveryCharge) || 0;
    }
    return typeof product.delivery === "number" ? product.delivery : 0;
  }, [product]);

  const deliveryCharge = useMemo(() => {
    if (selectedDeliveryMethod === "standard") return backendDeliveryCharge;
    return backendDeliveryCharge + 100;
  }, [selectedDeliveryMethod, backendDeliveryCharge]);

  const gstPercent = Number(product?.gst) || 0;
  const hasGst = gstPercent > 0;
  const gstAmount = useMemo(() => {
    if (!hasGst) return 0;
    return (totalPrice * gstPercent) / 100;
  }, [totalPrice, gstPercent, hasGst]);

  const grandTotal = totalPrice + gstAmount + deliveryCharge;

  // ================= IMAGES =================
  const imagesList = useMemo(() => {
    return product?.images?.length > 0 ? product.images : ["/no-image.png"];
  }, [product]);

  useEffect(() => {
    if (imagesList.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % imagesList.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [imagesList.length, isPaused]);

  useEffect(() => {
    if (activeCardRef.current && priceScrollRef.current) {
      activeCardRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [quantity]);

  // Cap quantity if stock drops after fetch
  useEffect(() => {
    if (!product) return;
    const stock = Math.max(0, Number(product.stock) || 0);
    if (stock > 0 && quantity > stock) {
      setQuantity(stock);
    }
  }, [product?.stock]);

  const handleQuantityChange = (value) => {
    let qty = Number(value);
    if (isNaN(qty) || qty < 1) qty = 1;

    const stock = Math.max(0, Number(product?.stock) || 0);

    if (stock <= 0) {
      setQuantity(1);
      toast.error("Out of stock");
      return;
    }

    if (qty > stock) {
      qty = stock;
      toast.error(`Max ${stock} units available`);
    }

    setQuantity(qty);
  };

  // ================= ADD TO CART (stock-safe) =================
  const handleAddToCart = () => {
    if (!product) return;

    const stock = Math.max(0, Number(product.stock) || 0);
    const addQty = Math.max(1, Number(quantity) || 1);
    const productId = String(product._id || product.id || "");

    const alreadyInCart = (cart || [])
      .filter((item) => String(item._id || item.id) === productId)
      .reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    if (stock <= 0) {
      toast.error("Out of stock — this item is currently unavailable");
      return;
    }

    if (addQty > stock) {
      toast.error(`Only ${stock} units available in stock`);
      setQuantity(stock);
      return;
    }

    if (alreadyInCart + addQty > stock) {
      const left = Math.max(0, stock - alreadyInCart);
      if (left <= 0) {
        toast.error(
          `Out of stock in cart — you already have ${alreadyInCart} units (max ${stock})`
        );
      } else {
        toast.error(
          `Only ${left} more unit${left === 1 ? "" : "s"} can be added (stock: ${stock})`
        );
      }
      return;
    }

    addToCart({
      ...product,
      stock,
      quantity: addQty,
      price: unitPrice,
      originalPrice: originalUnitPrice,
      discountPercent,
      paymentMethod: selectedPayment,
      deliveryMethod: selectedDeliveryMethod,
      deliveryCharge,
      grandTotal,
      selectedOption: {
        quantity: addQty,
        price: unitPrice,
        label: `${addQty} units`,
      },
    });

    toast.success(`${addQty} unit${addQty === 1 ? "" : "s"} added to cart`);
  };

  const quickQtys = useMemo(() => {
    if (maxStock <= 0) return [];
    return [1, 5, 10, 25, 50, 100, 250, 500, maxStock].filter(
      (q, i, arr) => q <= maxStock && arr.indexOf(q) === i
    );
  }, [maxStock]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
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

  const isOutOfStock = maxStock <= 0;

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
                {hasDiscount && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full shadow flex items-center gap-1">
                    <Tag size={12} />
                    {discountPercent}% OFF
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

              <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-gray-200/80 text-center">
                <div className="flex flex-col items-center">
                  <Truck size={20} className="text-indigo-600 mb-1" />
                  <span className="text-[11px] font-medium text-gray-700">
                    Fast Delivery
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck size={20} className="text-emerald-600 mb-1" />
                  <span className="text-[11px] font-medium text-gray-700">
                    100% Authentic
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <RotateCcw size={20} className="text-purple-600 mb-1" />
                  <span className="text-[11px] font-medium text-gray-700">
                    Easy Returns
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT - DETAILS */}
            <div className="p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 sm:mb-4 leading-snug sm:leading-tight capitalize">
                  {product.name}
                </h1>

                {/* PRICE BLOCK */}
                <div className="mb-5 sm:mb-6 p-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-purple-50/50">
                  {hasDiscount ? (
                    <>
                      <div className="flex flex-wrap items-end gap-2 sm:gap-3">
                        <div>
                          <p className="text-[11px] sm:text-xs text-gray-500 mb-0.5">
                            Original price
                          </p>
                          <p className="text-base sm:text-lg text-gray-400 line-through font-medium">
                            ₹{originalUnitPrice.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] sm:text-xs text-emerald-700 mb-0.5 font-medium">
                            After {discountPercent}% off
                          </p>
                          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-700">
                            ₹{unitPrice.toLocaleString()}
                          </p>
                        </div>
                        <span className="mb-1 inline-flex items-center gap-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full">
                          <Tag size={11} />
                          {discountPercent}% OFF
                        </span>
                      </div>
                      <p className="mt-2 text-xs sm:text-sm text-emerald-700 font-semibold">
                        You save ₹
                        {(originalUnitPrice - unitPrice).toLocaleString()} per
                        unit
                      </p>
                    </>
                  ) : (
                    <div>
                      <p className="text-[11px] sm:text-xs text-gray-500 mb-0.5">
                        Price
                      </p>
                      <p className="text-2xl sm:text-3xl font-extrabold text-indigo-700">
                        ₹{unitPrice.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* SPECIFICATIONS */}
                <div className="space-y-2 text-gray-600 mb-5 sm:mb-6 text-sm sm:text-base">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {product.category && (
                      <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full uppercase">
                        {product.category}
                      </span>
                    )}
                    {product.brand && (
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full uppercase">
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

                  {product.hsnCode ? (
                    <p className="flex items-center gap-1.5">
                      <Hash size={15} className="text-gray-500" />
                      <span className="font-semibold text-gray-800">
                        HSN Code:
                      </span>{" "}
                      <span className="font-medium text-gray-700">
                        {product.hsnCode}
                      </span>
                    </p>
                  ) : null}

                  {(product.size || product.weight) && (
                    <div className="flex flex-wrap gap-4 pt-1 text-xs sm:text-sm text-gray-700">
                      {product.size && (
                        <span className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-md font-medium">
                          <Ruler size={14} className="text-gray-500" /> Size:{" "}
                          {product.size}
                        </span>
                      )}
                      {product.weight && (
                        <span className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-md font-medium">
                          <Scale size={14} className="text-gray-500" /> Weight:{" "}
                          {product.weight}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <p className="font-semibold text-gray-800 mb-2 text-sm">
                      Availability
                    </p>
                    <StockBattery stock={product.stock} />
                  </div>
                </div>

                {/* DELIVERY OPTIONS */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">
                    Select Delivery Option
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedDeliveryMethod("standard")}
                      className={`relative p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                        selectedDeliveryMethod === "standard"
                          ? "border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          selectedDeliveryMethod === "standard"
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Truck size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs sm:text-sm text-gray-800">
                            Standard Delivery
                          </span>
                          <span className="text-xs font-bold text-indigo-700">
                            {backendDeliveryCharge === 0
                              ? "FREE"
                              : `₹${backendDeliveryCharge}`}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500">
                          {product?.delivery?.time
                            ? `Estimated: ${product.delivery.time} Days`
                            : "Delivered in 3-5 Business Days"}
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedDeliveryMethod("express")}
                      className={`relative p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                        selectedDeliveryMethod === "express"
                          ? "border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          selectedDeliveryMethod === "express"
                            ? "bg-amber-500 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Zap size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs sm:text-sm text-gray-800">
                            Express Delivery
                          </span>
                          <span className="text-xs font-bold text-indigo-700">
                            ₹{backendDeliveryCharge + 100}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Faster Express Delivery
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* PAYMENT METHODS */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">
                    Select Payment Method
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
                          className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50/80 shadow-sm ring-2 ring-indigo-500/20"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                isSelected
                                  ? "bg-indigo-600 text-white"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              <Icon size={18} />
                            </div>
                            <div>
                              <p
                                className={`text-xs sm:text-sm font-semibold ${
                                  isSelected
                                    ? "text-indigo-900"
                                    : "text-gray-800"
                                }`}
                              >
                                {method.label}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {method.desc}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* QUANTITY WISE PRICING */}
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
                        const isActive = baseUnitPrice === tier.price;
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
                      max={Math.max(1, maxStock)}
                      value={quantity}
                      disabled={isOutOfStock}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      className="w-full border-2 border-gray-200 focus:border-indigo-500 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-base sm:text-lg font-semibold text-center outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter quantity"
                    />
                  </div>

                  {!isOutOfStock && (
                    <>
                      <div className="mb-3 sm:mb-4">
                        <input
                          type="range"
                          min="1"
                          max={Math.max(1, maxStock)}
                          value={quantity}
                          onChange={(e) =>
                            handleQuantityChange(e.target.value)
                          }
                          className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>

                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {quickQtys.map((q) => (
                          <button
                            key={q}
                            type="button"
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
                    </>
                  )}

                  {isOutOfStock && (
                    <p className="text-sm font-semibold text-red-600 mt-1">
                      Out of stock — cannot add this product right now
                    </p>
                  )}
                </div>

                {/* TOTAL BREAKDOWN */}
                <div className="mb-6 sm:mb-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 space-y-2">
                  {hasDiscount && (
                    <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500">
                      <span>
                        Original (₹{originalUnitPrice} × {quantity})
                      </span>
                      <span className="line-through">
                        ₹{totalOriginalPrice.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600">
                    <span>
                      {hasDiscount ? "After discount" : "Subtotal"} (₹
                      {unitPrice} × {quantity})
                    </span>
                    <span className="font-medium">
                      ₹{totalPrice.toLocaleString()}
                    </span>
                  </div>

                  {hasDiscount && totalSavings > 0 && (
                    <div className="flex justify-between items-center text-xs sm:text-sm text-emerald-700 font-semibold">
                      <span className="flex items-center gap-1">
                        <Tag size={13} /> You save ({discountPercent}% OFF)
                      </span>
                      <span>− ₹{totalSavings.toLocaleString()}</span>
                    </div>
                  )}

                  {hasGst && (
                    <div className="flex justify-between items-center text-xs sm:text-sm text-indigo-700">
                      <span className="flex items-center gap-1">
                        <Percent size={13} /> GST ({gstPercent}%)
                      </span>
                      <span className="font-medium">
                        + ₹{gstAmount.toLocaleString()}
                      </span>
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

              {/* ACTIONS */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-auto pt-3 sm:pt-4">
                <button
                  disabled={isOutOfStock || quantity < 1}
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 sm:py-3.5 md:py-4 rounded-xl font-semibold text-sm sm:text-base md:text-lg transition shadow-lg"
                >
                  <ShoppingCart size={18} />
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
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
