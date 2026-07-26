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

  // Pehle state se product lo (View button se aaya hua)
  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!location.state?.product);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Agar already state me product hai to kuch mat karo
    if (product) return;

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
            return;
          }
        } catch (e) {
          // single product endpoint nahi hai to ignore
        }

        // 2. Fallback → saare products lao aur find karo
        const res = await axios.get(
          "https://backend-3-axez.onrender.com/api/products"
        );
        const found = res.data.products?.find((p) => p._id === id);

        if (found) {
          setProduct(found);
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

  // Price helper
  const getPrice = () => {
    if (product.pricing?.length > 0) {
      return Math.min(...product.pricing.map((p) => Number(p.price) || 0));
    }
    return Number(product.price || 0);
  };

  const finalPrice = getPrice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-8 transition"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">
          {/* Image */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center min-h-[400px]">
            <img
              src={product.images?.[0] || "/no-image.png"}
              alt={product.name}
              className="max-h-[420px] w-full object-contain"
              onError={(e) => (e.target.src = "/no-image.png")}
            />
          </div>

          {/* Details */}
          <div className="p-8 md:p-10 flex flex-col">
            <div className="flex-1">
              {product.offer > 0 && (
                <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                  {product.offer}% OFF
                </span>
              )}

              <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
                {product.name}
              </h1>

              <div className="space-y-2 text-gray-600 mb-6">
                <p>
                  <span className="font-medium text-gray-800">Brand:</span>{" "}
                  {product.brand || "N/A"}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Material:</span>{" "}
                  {product.material || "N/A"}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Category:</span>{" "}
                  {product.category || product.name}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Stock:</span>{" "}
                  <span
                    className={
                      product.stock > 0 ? "text-emerald-600" : "text-red-600"
                    }
                  >
                    {product.stock > 0
                      ? `${product.stock} available`
                      : "Out of Stock"}
                  </span>
                </p>
              </div>

              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-1">Price</p>
                <p className="text-4xl font-extrabold text-indigo-700">
                  ₹{finalPrice}
                </p>
              </div>

              {product.description && (
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <button
                disabled={product.stock === 0}
                onClick={() =>
                  addToCart({
                    ...product,
                    quantity: 1,
                    price: finalPrice,
                  })
                }
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition shadow-lg"
              >
                <ShoppingCart size={22} />
                Add to Cart
              </button>

              <button
                onClick={() => navigate("/")}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold text-lg transition shadow-lg"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
