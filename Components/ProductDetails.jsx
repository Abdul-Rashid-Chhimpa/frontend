import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  FiMinus,
  FiPlus,
  FiTruck,
  FiShield,
  FiArrowLeft,
  FiShare2,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiInfo,
  FiShoppingBag,
} from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ProductDetail = ({ addToCart, cart = [] }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Delivery check state
  const [pincode, setPincode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Share state
  const [copied, setCopied] = useState(false);

  // Fetch Product Data
  useEffect(() => {
    let isMounted = true;

    setSelectedImage(0);
    setQuantity(1);
    setDeliveryStatus(null);

    // Use passed navigation state if available
    if (location.state?.product) {
      setProduct(location.state.product);
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(false);

        // Fetch direct product ID
        const { data } = await axios.get(
          `https://backend-3-axez.onrender.com/api/products/${id}`
        );

        if (isMounted) {
          if (data.success && data.product) {
            setProduct(data.product);
          } else {
            setError(true);
          }
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

  // Calculations
  const isOutOfStock = product?.stock !== undefined && product.stock <= 0;
  const inCartCount =
    cart.find((item) => (item.id || item._id) === id)?.quantity || 0;
  const remainingStock = (product?.stock || 0) - inCartCount;

  // Handlers
  const handleQuantityChange = (type) => {
    if (type === "increase") {
      if (quantity < remainingStock) {
        setQuantity((prev) => prev + 1);
      }
    } else {
      if (quantity > 1) {
        setQuantity((prev) => prev - 1);
      }
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock || remainingStock <= 0) return;
    if (addToCart) {
      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock || remainingStock <= 0) return;
    if (addToCart) {
      addToCart(product, quantity);
    }
    navigate("/checkout");
  };

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (!pincode || pincode.trim().length < 6) {
      setDeliveryStatus({
        type: "error",
        message: "Please enter a valid 6-digit PIN code",
      });
      return;
    }

    setPincodeLoading(true);
    setTimeout(() => {
      setPincodeLoading(false);
      const isDeliverable = /^[1-9][0-9]{5}$/.test(pincode.trim());
      if (isDeliverable) {
        setDeliveryStatus({
          type: "success",
          message: "Standard delivery available within 3-5 business days.",
        });
      } else {
        setDeliveryStatus({
          type: "error",
          message: "Delivery is currently unavailable for this PIN code.",
        });
      }
    }, 600);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || "Product",
          text: `Check out ${product?.name}!`,
          url: window.location.href,
        });
      } catch (err) {
        // Share cancelled or failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Pre-process images
  const images = product
    ? [
        product.image,
        product.images?.[0],
        product.images?.[1],
        product.images?.[2],
      ].filter(Boolean)
    : [];

  const displayImages =
    images.length > 0
      ? images
      : ["https://via.placeholder.com/600x600?text=No+Image"];

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium animate-pulse">
              Loading product details...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error UI
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-grow flex items-center justify-center">
          <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Product Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The item you are looking for might have been removed or is
              temporarily unavailable.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition"
            >
              <FiArrowLeft /> Back to Shop
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        {/* Breadcrumb / Back button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition"
          >
            <FiArrowLeft size={16} /> Back
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition relative"
          >
            <FiShare2 size={16} /> {copied ? "Link Copied!" : "Share"}
          </button>
        </div>

        {/* Product Layout */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative group">
              <img
                src={displayImages[selectedImage] || displayImages[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition duration-300 group-hover:scale-105"
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-red-600 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-md">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Selection */}
            {displayImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition ${
                      selectedImage === idx
                        ? "border-indigo-600 ring-2 ring-indigo-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="flex flex-col">
            {/* Category / Badge */}
            {product.category && (
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 w-max px-3 py-1 rounded-full mb-3">
                {product.category}
              </span>
            )}

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>

            {/* Price Section */}
            <div className="flex items-baseline gap-3 my-4">
              <span className="text-3xl font-extrabold text-gray-900">
                ₹{product.price?.toLocaleString("en-IN")}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ₹{product.originalPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                      {Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100
                      )}
                      % OFF
                    </span>
                  </>
                )}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {product.description || "No description available for this item."}
            </p>

            <hr className="border-gray-100 mb-6" />

            {/* Quantity and Availability */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <span className="text-xs font-medium text-gray-500">
                  {isOutOfStock ? (
                    <span className="text-red-500 font-semibold">
                      Out of stock
                    </span>
                  ) : remainingStock <= 5 ? (
                    <span className="text-amber-600 font-semibold">
                      Only {remainingStock} left in stock
                    </span>
                  ) : (
                    <span className="text-green-600 font-semibold">
                      In Stock
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange("decrease")}
                    disabled={isOutOfStock || quantity <= 1}
                    className="p-3 text-gray-600 hover:text-black hover:bg-gray-100 transition disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <FiMinus size={16} />
                  </button>
                  <span className="w-12 text-center font-semibold text-gray-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange("increase")}
                    disabled={isOutOfStock || quantity >= remainingStock}
                    className="p-3 text-gray-600 hover:text-black hover:bg-gray-100 transition disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || remainingStock <= 0}
                className={`flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-medium transition shadow-sm ${
                  added
                    ? "bg-green-600 text-white"
                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                } disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`}
              >
                {added ? (
                  <>
                    <FiCheck size={18} /> Added to Cart
                  </>
                ) : (
                  <>
                    <FiShoppingBag size={18} /> Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock || remainingStock <= 0}
                className="py-3.5 px-6 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>

            {/* Pincode Checker */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
                Delivery Options
              </label>
              <form
                onSubmit={handlePincodeCheck}
                className="flex gap-2 mb-2"
              >
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit PIN code"
                  value={pincode}
                  onChange={(e) =>
                    setPincode(e.target.value.replace(/\D/g, ""))
                  }
                  className="flex-grow px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-600"
                />
                <button
                  type="submit"
                  disabled={pincodeLoading}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {pincodeLoading ? "Checking..." : "Check"}
                </button>
              </form>

              {deliveryStatus && (
                <div
                  className={`text-xs p-2.5 rounded-lg flex items-center gap-2 mt-2 ${
                    deliveryStatus.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {deliveryStatus.type === "success" ? (
                    <FiCheck size={14} className="flex-shrink-0" />
                  ) : (
                    <FiInfo size={14} className="flex-shrink-0" />
                  )}
                  <span>{deliveryStatus.message}</span>
                </div>
              )}
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 border-t border-gray-100 pt-6">
              <div className="flex items-center gap-3">
                <FiTruck className="text-indigo-600 flex-shrink-0" size={20} />
                <span>Fast & Reliable Shipping</span>
              </div>
              <div className="flex items-center gap-3">
                <FiShield className="text-indigo-600 flex-shrink-0" size={20} />
                <span>100% Genuine Products</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
