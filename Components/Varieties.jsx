import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Package, ArrowLeft, Sparkles } from "lucide-react";
import { CartContext } from "../Components/Context";

const API_BASE = "https://backend-3-axez.onrender.com";

// Brand colors (same as Card & Home)
const INK = "#15181C";
const MUTED = "#6B7280";
const BORDER = "#E6E8EB";
const SURFACE = "#FFFFFF";
const BG = "#F5F6F4";
const AMBER = "#F0A420";
const AMBER_DARK = "#C97F0F";
const STEEL = "#2B4A5E";
const STEEL_DARK = "#17303E";

const getImageUrl = (img) => {
  if (!img || typeof img !== "string") return "/no-image.png";
  if (img.startsWith("http") || img.startsWith("data:")) return img;
  if (img.startsWith("/uploads/")) return `${API_BASE}${img}`;
  if (img.startsWith("uploads/")) return `${API_BASE}/${img}`;
  return img;
};

const getProductImage = (product) => {
  const first = Array.isArray(product.images) ? product.images[0] : null;
  const raw =
    (typeof first === "string" ? first : first?.url) ||
    product.image ||
    product.imageUrl ||
    "";
  return getImageUrl(raw);
};

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
          `${API_BASE}/api/products?variantGroup=${group}`,
          { timeout: 60000 }
        );

        // Support both response formats
        const list = Array.isArray(data)
          ? data
          : data?.products || data?.data || [];

        setProducts(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Failed to fetch varieties:", error);
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

  const getCalculatedPrice = (product) => {
    const basePrice = getLowestPrice(product);
    const discountPercent = Number(product.discountPercent || product.offer || 0);

    if (discountPercent > 0) {
      const discountAmount = (basePrice * discountPercent) / 100;
      return Math.round(basePrice - discountAmount);
    }
    return basePrice;
  };

  const goToProduct = (product) => {
    navigate(`/product/${product._id}`, {
      state: { product },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto"
            style={{ borderColor: STEEL, borderTopColor: "transparent" }}
          />
          <p className="mt-4 text-sm font-medium" style={{ color: MUTED }}>
            Loading varieties...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-4" style={{ background: BG }}>
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-sm font-semibold transition hover:opacity-80"
          style={{ color: STEEL }}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Heading */}
        <div className="mb-8">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: INK }}
          >
            More Varieties
          </h1>
          <div className="w-10 h-1 rounded-full mt-2 mb-2" style={{ background: AMBER }} />
          <p className="text-sm" style={{ color: MUTED }}>
            Other options related to{" "}
            <span className="font-semibold" style={{ color: INK }}>
              {productName}
            </span>
          </p>
        </div>

        {products.length === 0 ? (
          <div
            className="h-[380px] flex flex-col justify-center items-center rounded-2xl"
            style={{ background: SURFACE, border: `1px solid ${BORDER}` }}
          >
            <Package size={56} style={{ color: "#C7CBCE" }} />
            <h2 className="mt-4 text-xl font-bold" style={{ color: INK }}>
              No Varieties Found
            </h2>
            <p className="mt-2 text-sm" style={{ color: MUTED }}>
              No other options available in this group.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-2.5 rounded-xl text-white font-semibold text-sm"
              style={{ background: STEEL }}
            >
              Back to Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => {
              const basePrice = getLowestPrice(product);
              const discountPercentage = Number(
                product.discountPercent || product.offer || 0
              );
              const finalPrice = getCalculatedPrice(product);
              const hasDiscount = discountPercentage > 0;
              const inStock = product.stock > 0;

              return (
                <div
                  key={product._id}
                  onClick={() => goToProduct(product)}
                  className="group rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex flex-col cursor-pointer"
                  style={{
                    background: SURFACE,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  {/* Image */}
                  <div
                    className="relative h-28 sm:h-32 md:h-36 overflow-hidden"
                    style={{ background: "#F1F2EF" }}
                  >
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-contain p-2.5 sm:p-3 group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://placehold.co/400x400?text=No+Image";
                      }}
                    />

                    {hasDiscount && (
                      <span
                        className="absolute top-1.5 left-0 text-[9px] sm:text-[10px] font-bold text-white px-2 py-0.5 flex items-center gap-0.5 shadow-md z-10"
                        style={{
                          background: `linear-gradient(135deg, ${AMBER_DARK} 0%, #D9381E 100%)`,
                          clipPath: "polygon(0 0, 100% 0, 92% 100%, 0% 100%)",
                        }}
                      >
                        <Sparkles size={10} />
                        {discountPercentage}% OFF
                      </span>
                    )}

                    <span
                      className="absolute top-1.5 right-1.5 text-[9px] font-semibold px-2 py-0.5 rounded-full z-10"
                      style={
                        inStock
                          ? { background: "#E4F3E9", color: "#1D7A43" }
                          : { background: "#FBE7E7", color: "#B4302F" }
                      }
                    >
                      {inStock ? "In stock" : "Out of stock"}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h2
                        className="font-bold text-xs sm:text-sm line-clamp-2 leading-snug"
                        style={{ color: INK }}
                      >
                        {product.name}
                      </h2>

                      <div className="mt-1 space-y-0.5">
                        <p className="text-[10px] sm:text-[11px]" style={{ color: MUTED }}>
                          Brand:{" "}
                          <span style={{ color: INK }}>{product.brand || "N/A"}</span>
                        </p>
                        <p className="text-[10px] sm:text-[11px]" style={{ color: MUTED }}>
                          Material:{" "}
                          <span style={{ color: INK }}>{product.material || "N/A"}</span>
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-end mt-2">
                        <div>
                          <p className="text-[8px]" style={{ color: MUTED }}>
                            Price
                          </p>
                          {hasDiscount ? (
                            <div className="flex items-baseline gap-1">
                              <h3
                                className="text-base sm:text-lg font-extrabold"
                                style={{ color: "#D9381E" }}
                              >
                                ₹{finalPrice}
                              </h3>
                              <span className="text-[10px] text-gray-400 line-through">
                                ₹{basePrice}
                              </span>
                            </div>
                          ) : (
                            <h3
                              className="text-base sm:text-lg font-extrabold"
                              style={{ color: INK }}
                            >
                              ₹{basePrice}
                            </h3>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-[8px]" style={{ color: MUTED }}>
                            Stock
                          </p>
                          <h4 className="font-bold text-sm" style={{ color: "#1D7A43" }}>
                            {product.stock ?? 0}
                          </h4>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 mt-2.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            goToProduct(product);
                          }}
                          className="text-white rounded-lg py-2 text-[11px] sm:text-xs font-semibold hover:opacity-90 active:scale-95 transition"
                          style={{ background: STEEL }}
                        >
                          Buy now
                        </button>

                        <button
                          disabled={product.stock === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart({
                              ...product,
                              quantity: 1,
                              price: finalPrice,
                            });
                          }}
                          className="rounded-lg py-2 text-[11px] sm:text-xs font-bold transition disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
                          style={
                            product.stock === 0
                              ? { background: "#F1F2EF", color: MUTED }
                              : { background: AMBER, color: "#1A1200" }
                          }
                        >
                          Add to cart
                        </button>
                      </div>
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
