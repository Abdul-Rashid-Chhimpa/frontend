import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import {
  Package,
  ArrowLeft,
  ShoppingCart,
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

  // ================= FETCH PRODUCT =================
  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setQuantity(1);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        try {
          const { data } = await axios.get(
            `https://backend-3-axez.onrender.com/api/products/${id}`
          );
          if (data.success && data.product) {
            setProduct(data.product);
            setSelectedImage(0);
            setQuantity(1);
            return;
          }
        } catch (e) {}

        const res = await axios.get(
          "https://backend-3-axez.onrender.com/api/products"
        );
        const found = res.data.products?.find((p) => p._id === id);
        if (found) {
          setProduct(found);
          setSelectedImage(0);
          setQuantity(1);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, product]);

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium text-sm sm:text-base">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  // ================= NOT FOUND =================
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

  // ================= IMAGES =================
  const images =
    product.images && product.images.length > 0
      ? product.images
      : ["/no-image.png"];

  // ================= PRICING TIERS (sorted) =================
  const pricingTiers =
    product.pricing && product.pricing.length > 0
      ? [...product.pricing]
          .map((tier) => ({
            minQty: Number(tier.quantity || tier.minQty || 1),
            price: Number(tier.price) || 0,
          }))
          .sort((a, b) => a.minQty - b.minQty)
      : [
          {
            minQty: 1,
            price: Number(product.price) || 0,
          },
        ];

  // ================= AUTO PRICE BASED ON QUANTITY =================
  const getUnitPrice = (qty) => {
    let applicablePrice = pricingTiers[0].price;
    for (let i = 0; i < pricingTiers.length; i++) {
      if (qty >= pricingTiers[i].minQty) {
        applicablePrice = pricingTiers[i].price;
      } else {
        break;
      }
    }
    return applicablePrice;
  };

  const unitPrice = getUnitPrice(quantity);
  const totalPrice = unitPrice * quantity;
  const maxStock = product.stock || 1;

  // ================= HANDLERS =================
  const handleQuantityChange = (value) => {
    let qty = Number(value);
    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > maxStock) qty = maxStock;
    setQuantity(qty);
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity: quantity,
      price: unitPrice,
      selectedOption: {
        quantity: quantity,
        price: unitPrice,
        label: `${quantity} units`,
      },
    });
  };

  const quickQtys = [1, 5, 10, 25, 50, 100, 250, 500, maxStock].filter(
    (q, i, arr) => q <= maxStock && arr.indexOf(q) === i
  );

  // ================= RENDER =================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-4 sm:py-6 md:py-8 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-4 sm:mb-6 transition text-sm sm:text-base"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* ================= LEFT - IMAGE GALLERY ================= */}
            <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="relative bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden mb-4 sm:mb-5 flex items-center justify-center h-[260px] xs:h-[300px] sm:h-[360px] md:h-[420px] lg:h-[460px]">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain p-3 sm:p-4 transition-all duration-300"
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

              {images.length > 1 && (
                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                        selectedImage === index
                          ? "border-indigo-600 ring-2 ring-indigo-300 scale-105"
                          : "border-gray-200 hover:border-indigo-400"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-contain bg-white p-1"
                        onError={(e) => {
                          e.target.src = "/no-image.png";
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ================= RIGHT - DETAILS ================= */}
            <div className="p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 sm:mb-4 leading-snug sm:leading-tight">
                  {product.name}
                </h1>

                {/* Basic Info */}
                <div className="space-y-1.5 sm:space-y-2 text-gray-600 mb-5 sm:mb-6 text-sm sm:text-base">
                  <p>
                    <span className="font-semibold text-gray-800">Brand:</span>{" "}
                    {product.brand || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">Material:</span>{" "}
                    {product.material || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">Category:</span>{" "}
                    {product.category || product.name}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">Stock:</span>{" "}
                    <span
                      className={
                        product.stock > 0
                          ? "text-emerald-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {product.stock > 0
                        ? `${product.stock} available`
                        : "Out of Stock"}
                    </span>
                  </p>
                </div>

                {/* ========== PRICING TIERS - HORIZONTAL SCROLL (3 cards visible) ========== */}
                <div className="mb-5 sm:mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2.5 sm:mb-3 text-sm sm:text-base">
                    Price Chart
                  </h3>

                  <div className="overflow-x-auto pb-2 price-scroll">
                    <div className="flex gap-2.5 sm:gap-3 min-w-max">
                      {pricingTiers.map((tier, index) => {
                        const isActive = unitPrice === tier.price;
                        return (
                          <div
                            key={index}
                            className={`flex-shrink-0 w-[100px] sm:w-[110px] px-2.5 py-2.5 sm:px-3 sm:py-3 rounded-xl border text-center transition ${
                              isActive
                                ? "border-indigo-500 bg-indigo-50 shadow-md"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <p className="text-[10px] sm:text-[11px] text-gray-500 mb-0.5">
                              {tier.minQty}+ units
                            </p>
                            <p
                              className={`text-sm sm:text-base font-bold leading-tight ${
                                isActive ? "text-indigo-700" : "text-gray-800"
                              }`}
                            >
                              ₹{tier.price}
                            </p>
                            <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">
                              / unit
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-[11px] sm:text-xs text-gray-400 mt-2">
                    Scroll to see all prices • Auto updates with quantity
                  </p>
                </div>

                {/* ========== QUANTITY SELECTOR ========== */}
                <div className="mb-5 sm:mb-6">
                  <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      Select Quantity
                    </p>
                    <span className="text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                      {quantity} units
                    </span>
                  </div>

                  {/* Number Input */}
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
                    <p className="text-[11px] sm:text-xs text-gray-400 mt-1 text-center">
                      Type any quantity (Max {maxStock})
                    </p>
                  </div>

                  {/* Slider */}
                  <div className="mb-3 sm:mb-4">
                    <input
                      type="range"
                      min="1"
                      max={maxStock}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[11px] sm:text-xs text-gray-400 mt-1">
                      <span>1</span>
                      <span>{maxStock}</span>
                    </div>
                  </div>

                  {/* Quick Select Buttons */}
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

                {/* ========== TOTAL PRICE ========== */}
                <div className="mb-6 sm:mb-8 p-3.5 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl border border-indigo-100">
                  <div className="flex justify-between items-center gap-3">
                    <div className="min-w-0">
                      <p className="text-gray-700 font-medium text-sm sm:text-base">
                        Total Price
                      </p>
                      <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                        ₹{unitPrice} × {quantity} units
                      </p>
                    </div>
                    <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-indigo-700 whitespace-nowrap">
                      ₹{totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mb-5 sm:mb-6">
                    <h3 className="font-semibold text-gray-800 mb-1.5 sm:mb-2 text-base sm:text-lg">
                      Description
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>

              {/* ========== ACTION BUTTONS ========== */}
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

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Price Chart Scrollbar */
        .price-scroll::-webkit-scrollbar {
          height: 6px;
        }
        .price-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .price-scroll::-webkit-scrollbar-thumb {
          background: #c7d2fe;
          border-radius: 10px;
        }
        .price-scroll::-webkit-scrollbar-thumb:hover {
          background: #818cf8;
        }

        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;
