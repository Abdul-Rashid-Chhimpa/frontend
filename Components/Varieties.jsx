import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Package, ArrowLeft } from "lucide-react";
import { CartContext } from "../Components/Context";

const Varieties = () => {
  const { group } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const groupName = location.state?.groupName || group;
  const productName = location.state?.productName || "Product";

  useEffect(() => {
    const fetchVarieties = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `https://backend-3-axez.onrender.com/api/products?variantGroup=${group}`
        );
        if (data.success) {
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error(error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (group) fetchVarieties();
  }, [group]);

  const getLowestPrice = (product) => {
    if (product.pricing && product.pricing.length > 0) {
      return Math.min(...product.pricing.map((item) => Number(item.price) || 0));
    }
    return Number(product.price || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading varieties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back + Heading */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-6"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-700 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            More Varieties
          </h1>
          <p className="text-gray-500 mt-2">
            Other options related to <span className="font-semibold text-gray-700">{productName}</span>
          </p>
        </div>

        {products.length === 0 ? (
          <div className="h-[400px] flex flex-col justify-center items-center bg-white rounded-3xl shadow-sm">
            <Package size={64} className="text-gray-300" />
            <h2 className="mt-4 text-xl font-bold text-gray-700">No Varieties Found</h2>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold"
            >
              Back to Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6">
            {products.map((product) => {
              const finalPrice = getLowestPrice(product) || Number(product.price) || 0;

              return (
                <div
                  key={product._id}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-indigo-200 transition-all duration-300 overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative h-52 sm:h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <img
                      src={product.images?.[0] || "/no-image.png"}
                      alt={product.name}
                      className="w-full h-full object-contain p-5 group-hover:scale-110 transition duration-500"
                      onError={(e) => (e.target.src = "/no-image.png")}
                    />
                    <span
                      className={`absolute top-3 right-3 text-xs font-semibold px-3 py-1 rounded-full shadow ${
                        product.stock > 0 ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                      }`}
                    >
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4 sm:p-5">
                    <h2 className="font-bold text-base sm:text-lg line-clamp-2 text-gray-800 group-hover:text-indigo-700 transition">
                      {product.name}
                    </h2>
                    <div className="mt-2 space-y-0.5 text-xs sm:text-sm text-gray-500">
                      <p>Brand: <span className="text-gray-700">{product.brand || "N/A"}</span></p>
                      <p>Material: <span className="text-gray-700">{product.material || "N/A"}</span></p>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Price</p>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-indigo-700">₹{finalPrice}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase">Stock</p>
                        <h4 className="font-bold text-emerald-600 text-lg">{product.stock ?? 0}</h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 mt-5">
                      <button
                        onClick={() =>
                          navigate(`/product/${product._id}`, { state: { product } })
                        }
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl py-2.5 text-sm font-semibold"
                      >
                        Buy Now
                      </button>
                      <button
                        disabled={product.stock === 0}
                        onClick={() =>
                          addToCart({ ...product, quantity: 1, price: finalPrice })
                        }
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-xl py-2.5 text-sm font-semibold"
                      >
                        Add Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Varieties;