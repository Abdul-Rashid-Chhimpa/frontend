import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import {
  Package,
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import { CartContext } from "../Components/Context"; // apna path check karo
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

  // Selected pricing option index
  const [selectedOption, setSelectedOption] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // ================= FETCH PRODUCT =================
  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setSelectedOption(0);
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
            setSelectedOption(0);
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
          setSelectedOption(0);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  // ================= NOT FOUND =================
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
        <Package size={80} className="text-gray-300 mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Product Not Found
        </h1>
        <p className="text-gray-500 mb-8 text-center">
          This product doesn't exist or was removed.
        </p>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition"
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

  // ================= PRICING OPTIONS =================
  // Agar pricing array hai to use karo, warna single price se option banao
  const pricingOptions =
    product.pricing && product.pricing.length > 0
      ? [...product.pricing]
          .sort(
            (a, b) =>
              Number(a.quantity || a.minQty || 1) -
              Number(b.quantity || b.minQty || 1)
          )
          .map((tier) => ({
            quantity: Number(tier.quantity || tier.minQty || 1),
            price: Number(tier.price) || 0,
            label: `${tier.quantity || tier.minQty || 1}+ units`,
          }))
      : [
          {
            quantity: 1,
            price: Number(product.price) || 0,
            label: "1 unit",
          },
        ];

  const currentOption = pricingOptions[selectedOption] || pricingOptions[0];
  const unitPrice = currentOption.price;
  const totalPrice = unitPrice * quantity;

  // ================= QUANTITY HANDLERS =================
  const increaseQty = () => {
    if (quantity < (product.stock || 0)) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQty = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Jab koi pricing option select ho to quantity uske minimum pe set kar do
  const handleSelectOption = (index) => {
    setSelectedOption(index);
    const minQty = pricingOptions[index].quantity || 1;
    setQuantity(minQty);
  };

  // ================= ADD TO CART =================
  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity: quantity,
      price: unitPrice, // selected option ka price
      selectedOption: {
        quantity: currentOption.quantity,
        price: currentOption.price,
        label: currentOption.label,
      },
    });
  };

  // ================= RENDER =================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-6 transition"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* ================= LEFT - IMAGE GALLERY ================= */}
            <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
              {/* Big Main Image */}
              <div className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden mb-5 flex items-center justify-center h-[340px] sm:h-[400px] md:h-[460px]">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain p-4 transition-all duration-300"
                  onError={(e) => {
                    e.target.src = "/no-image.png";
                  }}
                />
                {product.offer > 0 && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                    {product.offer}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 overflow-hidden transition-all duration-200 ${
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
            <div className="p-6 md:p-10 flex flex-col">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>

                {/* Basic Info */}
                <div className="space-y-2.5 text-gray-600 mb-6">
                  <p>
                    <span className="font-semibold text-gray-800">Brand:</span>{" "}
                    {product.brand || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">
                      Material:
                    </span>{" "}
                    {product.material || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">
                      Category:
                    </span>{" "}
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

                {/* ========== SELECTABLE PRICING OPTIONS ========== */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Select Price Option
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pricingOptions.map((option, index) => {
                      const isSelected = selectedOption === index;
                      return (
                        <button
                          key={index}
                          onClick={() => handleSelectOption(index)}
                          className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50 shadow-md"
                              : "border-gray-200 hover:border-indigo-300 bg-white"
                          }`}
                        >
                          {/* Check mark */}
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                              <Check size={14} className="text-white" />
                            </div>
                          )}

                          <p className="text-sm text-gray-500 mb-1">
                            {option.label}
                          </p>
                          <p className="text-xl font-bold text-indigo-700">
                            ₹{option.price}
                            <span className="text-sm font-normal text-gray-500">
                              {" "}
                              / unit
                            </span>
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ========== QUANTITY SELECTOR ========== */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                      <button
                        onClick={decreaseQty}
                        disabled={quantity <= 1}
                        className="w-11 h-11 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-14 text-center font-semibold text-lg">
                        {quantity}
                      </span>
                      <button
                        onClick={increaseQty}
                        disabled={quantity >= (product.stock || 0)}
                        className="w-11 h-11 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      Max: {product.stock || 0}
                    </span>
                  </div>
                </div>

                {/* ========== TOTAL PRICE ========== */}
                <div className="mb-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-700 font-medium">Total Price</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Selected: {currentOption.label} × {quantity}
                      </p>
                    </div>
                    <span className="text-2xl font-extrabold text-indigo-700">
                      ₹{totalPrice}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2 text-lg">
                      Description
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>

              {/* ========== ACTION BUTTONS ========== */}
              <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4">
                <button
                  disabled={product.stock === 0}
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition shadow-lg"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>

                <button
                  onClick={() => navigate("/cart")}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition shadow-lg"
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
      `}</style>
    </div>
  );
};

export default ProductDetails;
