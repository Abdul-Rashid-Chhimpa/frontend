import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { Package, ArrowLeft, ShoppingCart } from "lucide-react";
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
  const [selectedImage, setSelectedImage] = useState(0); // current big image index

  useEffect(() => {
    if (product) {
      // product already aaya state se
      setSelectedImage(0);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);

        // 1. Try single product API
        try {
          const { data } = await axios.get(
            `https://backend-3-axez.onrender.com/api/products/${id}`
          );
          if (data.success && data.product) {
            setProduct(data.product);
            setSelectedImage(0);
            return;
          }
        } catch (e) {
          // ignore
        }

        // 2. Fallback - all products
        const res = await axios.get(
          "https://backend-3-axez.onrender.com/api/products"
        );
        const found = res.data.products?.find((p) => p._id === id);

        if (found) {
          setProduct(found);
          setSelectedImage(0);
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

  // Loading
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

  // Not Found
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

  // Images array (fallback to single image or placeholder)
  const images =
    product.images && product.images.length > 0
      ? product.images
      : ["/no-image.png"];

  // Price helper
  const getPrice = () => {
    if (product.pricing?.length > 0) {
      return Math.min(...product.pricing.map((p) => Number(p.price) || 0));
    }
    return Number(product.price || 0);
  };

  const finalPrice = getPrice();

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

                {/* Offer Badge */}
                {product.offer > 0 && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                    {product.offer}% OFF
                  </span>
                )}
              </div>

              {/* Small Thumbnails */}
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

            {/* ================= RIGHT - PRODUCT DETAILS ================= */}
            <div className="p-6 md:p-10 flex flex-col">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>

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

                {/* Price */}
                <div className="mb-8">
                  <p className="text-sm text-gray-500 mb-1">Price</p>
                  <div className="flex items-center gap-3">
                    <p className="text-3xl sm:text-4xl font-extrabold text-indigo-700">
                      ₹{finalPrice}
                    </p>
                    {product.offer > 0 && (
                      <span className="text-sm text-red-500 font-semibold">
                        ({product.offer}% OFF)
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mb-8">
                    <h3 className="font-semibold text-gray-800 mb-2 text-lg">
                      Description
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-4">
                <button
                  disabled={product.stock === 0}
                  onClick={() =>
                    addToCart({
                      ...product,
                      quantity: 1,
                      price: finalPrice,
                    })
                  }
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

      {/* Hide scrollbar for thumbnails */}
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
