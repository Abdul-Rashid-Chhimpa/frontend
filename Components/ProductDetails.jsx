import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Zap,
  Truck,
  Percent,
  CheckCircle,
  ShieldCheck,
  Minus,
  Plus,
  Star,
  ArrowLeft,
} from "lucide-react";

// Design Token Colors
const STEEL = "#2D3748";
const AMBER_DARK = "#D97706";
const INK = "#1A202C";
const MUTED = "#718096";
const BORDER = "#E2E8F0";
const BG_LIGHT = "#F7FAFC";

const ProductDetails = ({ product: initialProduct, onAddToCart }) => {
  const navigate = useNavigate();

  // Mock product fallbacks if none passed via props
  const product = initialProduct || {
    id: "prod-101",
    name: "Heavy-Duty Cordless Impact Drill",
    brand: "Pedwal Professional",
    rating: 4.8,
    reviewsCount: 124,
    basePrice: 4500,
    gst: 18,
    stock: 12,
    description:
      "High-torque brushless motor delivering superior performance for tough industrial and DIY masonry, wood, and metal applications.",
    images: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
    ],
    features: [
      "Brushless 20V High-Performance Motor",
      "Includes 2x 4.0Ah Lithium-Ion Batteries",
      "Ergonomic rubberized soft grip handle",
      "Built-in LED work light for dark spaces",
    ],
  };

  // Component State
  const [selectedImage, setSelectedImage] = useState(
    product.images?.[0] || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] =
    useState("standard");

  // Price Calculations
  const deliveryCharges = {
    standard: 0,
    express: 150,
  };

  const deliveryCharge = deliveryCharges[selectedDeliveryMethod] || 0;
  const itemSubtotal = product.basePrice * quantity;
  const gstAmount = Math.round((itemSubtotal * (product.gst || 0)) / 100);
  const grandTotal = itemSubtotal + gstAmount + deliveryCharge;

  // Handlers
  const handleQuantityChange = (type) => {
    if (type === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    } else if (type === "increase" && quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      quantity,
      selectedDeliveryMethod,
      calculatedGst: gstAmount,
      deliveryCharge,
      grandTotal,
    };

    if (onAddToCart) {
      onAddToCart(cartItem);
    } else {
      console.log("Item added to cart:", cartItem);
    }
  };

  return (
    <div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: BG_LIGHT }}
    >
      <div className="max-w-7xl mx-auto">
        {/* BACK NAVIGATION */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 font-semibold text-sm transition-opacity hover:opacity-80"
          style={{ color: STEEL }}
        >
          <ArrowLeft size={18} /> Back to Products
        </button>

        <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12" style={{ borderColor: BORDER }}>
          
          {/* LEFT: GALLERY SECTION */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="w-full aspect-square rounded-2xl overflow-hidden border bg-gray-50 flex items-center justify-center p-4" style={{ borderColor: BORDER }}>
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-contain transition-all duration-300"
              />
            </div>

            {/* THUMBNAILS */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`w-20 h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-all ${
                      selectedImage === imgUrl ? "ring-2 ring-offset-1" : "opacity-70 hover:opacity-100"
                    }`}
                    style={{
                      borderColor: selectedImage === imgUrl ? AMBER_DARK : BORDER,
                    }}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS & PRICING SECTION */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              {/* BRAND & TITLE */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md" style={{ backgroundColor: "#FEF3C7", color: AMBER_DARK }}>
                  {product.brand}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold mt-2" style={{ color: INK }}>
                  {product.name}
                </h1>
              </div>

              {/* RATING & STOCK STATUS */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 font-semibold" style={{ color: AMBER_DARK }}>
                  <Star size={16} fill="currentColor" />
                  <span>{product.rating}</span>
                  <span style={{ color: MUTED }}>({product.reviewsCount} reviews)</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1.5 font-medium" style={{ color: product.stock > 0 ? "#16A34A" : "#DC2626" }}>
                  <CheckCircle size={16} />
                  {product.stock > 0 ? `In Stock (${product.stock} units left)` : "Out of Stock"}
                </span>
              </div>

              <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                {product.description}
              </p>

              {/* FEATURES LIST */}
              {product.features && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: STEEL }}>Key Highlights</span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                    {product.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2" style={{ color: INK }}>
                        <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* QUANTITY & DELIVERY METHOD SELECTOR */}
              <div className="pt-4 border-t space-y-4" style={{ borderColor: BORDER }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold" style={{ color: INK }}>Quantity</span>
                  <div className="flex items-center border rounded-xl overflow-hidden" style={{ borderColor: BORDER }}>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange("decrease")}
                      disabled={quantity <= 1}
                      className="p-2 sm:p-2.5 transition-colors hover:bg-gray-100 disabled:opacity-40"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 font-bold text-sm" style={{ color: INK }}>
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange("increase")}
                      disabled={quantity >= product.stock}
                      className="p-2 sm:p-2.5 transition-colors hover:bg-gray-100 disabled:opacity-40"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* DELIVERY SELECTION */}
                <div className="space-y-2">
                  <span className="text-sm font-semibold" style={{ color: INK }}>Delivery Speed</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedDeliveryMethod("standard")}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        selectedDeliveryMethod === "standard" ? "border-2 shadow-sm" : ""
                      }`}
                      style={{
                        borderColor: selectedDeliveryMethod === "standard" ? AMBER_DARK : BORDER,
                        backgroundColor: selectedDeliveryMethod === "standard" ? "#FFFBEB" : "white",
                      }}
                    >
                      <span className="text-xs font-bold" style={{ color: INK }}>Standard Delivery</span>
                      <span className="text-xs font-medium text-emerald-600 mt-1">FREE (3-5 Days)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedDeliveryMethod("express")}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        selectedDeliveryMethod === "express" ? "border-2 shadow-sm" : ""
                      }`}
                      style={{
                        borderColor: selectedDeliveryMethod === "express" ? AMBER_DARK : BORDER,
                        backgroundColor: selectedDeliveryMethod === "express" ? "#FFFBEB" : "white",
                      }}
                    >
                      <span className="text-xs font-bold" style={{ color: INK }}>Express Delivery</span>
                      <span className="text-xs font-medium mt-1" style={{ color: AMBER_DARK }}>+₹150 (1-2 Days)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* DYNAMIC BREAKDOWN & PRICING */}
              <div className="p-4 rounded-xl space-y-2 mt-4" style={{ backgroundColor: BG_LIGHT, border: `1px solid ${BORDER}` }}>
                <div className="flex justify-between items-center text-xs sm:text-sm" style={{ color: MUTED }}>
                  <span>Base Price ({quantity} item{quantity > 1 ? "s" : ""})</span>
                  <span className="font-medium" style={{ color: INK }}>
                    ₹{itemSubtotal.toLocaleString()}
                  </span>
                </div>

                {product.gst > 0 && (
                  <div className="flex justify-between items-center text-xs sm:text-sm" style={{ color: MUTED }}>
                    <span className="flex items-center gap-1">
                      <Percent size={14} />
                      GST ({product.gst}%)
                    </span>
                    <span className="font-medium" style={{ color: INK }}>
                      +₹{gstAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs sm:text-sm" style={{ color: MUTED }}>
                  <span className="flex items-center gap-1">
                    <Truck size={14} />
                    Delivery ({selectedDeliveryMethod === "express" ? "Express" : "Standard"})
                  </span>
                  <span className="font-medium" style={{ color: INK }}>
                    {deliveryCharge === 0 ? "FREE" : `+₹${deliveryCharge.toLocaleString()}`}
                  </span>
                </div>

                <div className="pt-2 border-t flex justify-between items-center" style={{ borderColor: BORDER }}>
                  <span className="font-bold text-sm sm:text-base" style={{ color: INK }}>
                    Grand Total
                  </span>
                  <span className="text-xl sm:text-2xl font-black" style={{ color: AMBER_DARK }}>
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t" style={{ borderColor: BORDER }}>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 py-3.5 sm:py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white"
                style={{ background: STEEL }}
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>

              <button
                type="button"
                onClick={() => {
                  handleAddToCart();
                  navigate("/cart");
                }}
                disabled={product.stock <= 0}
                className="flex-1 py-3.5 sm:py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white"
                style={{ background: AMBER_DARK }}
              >
                <Zap size={20} />
                Buy Now
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
