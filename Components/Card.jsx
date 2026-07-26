// ======================================================
// IMPORTS
// ======================================================
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Hammer,
  Wrench,
  Drill,
  Shield,
  Ruler,
  Cog,
  Settings,
  Package,
} from "lucide-react";
// import { CartContext } from "../../context/CartContext";
import { CartContext } from "../../context/CartContext";

// ======================================================
// COMPONENT
// ======================================================
const Card = () => {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  // ======================================================
  // STATES
  // ======================================================
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [visibleProducts, setVisibleProducts] = useState(8);

  // ======================================================
  // FETCH PRODUCTS
  // ======================================================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        "https://backend-3-axez.onrender.com/api/products"
      );

      if (data.success) {
        setProducts(data.products || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ======================================================
  // CATEGORY LIST
  // Prefer real category field, fall back to name
  // ======================================================
  const categories = [
    ...new Set(
      products
        .map((item) => item.category || item.name)
        .filter(Boolean)
    ),
  ];

  // ======================================================
  // CATEGORY ICONS
  // ======================================================
  const categoryIcons = {
    Hammer: Hammer,
    Hammers: Hammer,
    Wrench: Wrench,
    Wrenches: Wrench,
    Drill: Drill,
    Drills: Drill,
    Safety: Shield,
    Measuring: Ruler,
    Hardware: Cog,
    Accessories: Settings,
    Package: Package,
  };

  const getCategoryIcon = (category) => {
    if (!category) return Package;
    return categoryIcons[category] || Package;
  };

  // ======================================================
  // CATEGORY FILTER HANDLER
  // ======================================================
  const handleCategory = (category) => {
    setSelectedCategory((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  // ======================================================
  // PRICE HELPER
  // ======================================================
  const getLowestPrice = (product) => {
    if (product.pricing && product.pricing.length > 0) {
      return Math.min(
        ...product.pricing.map((item) => Number(item.price) || 0)
      );
    }
    return Number(product.price || 0);
  };

  // ======================================================
  // FILTERED PRODUCTS
  // ======================================================
  const filteredProducts = products.filter((product) => {
    const productCategory = product.category || product.name;
    const categoryMatch =
      selectedCategory.length === 0 ||
      selectedCategory.includes(productCategory);

    const priceMatch = getLowestPrice(product) <= maxPrice;

    return categoryMatch && priceMatch;
  });

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleProducts(8);
  }, [selectedCategory, maxPrice]);

  // ======================================================
  // LOADING STATE
  // ======================================================
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="mt-5 text-xl font-semibold text-gray-700">
            Loading Products...
          </h2>
        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN RENDER
  // ======================================================
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Heading */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Our Products</h1>
        <p className="text-gray-500 mt-3">Browse our latest collection</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* ================= FILTER SIDEBAR ================= */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sticky top-24">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Filters</h2>

            {/* Shop By Category */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-800">
                  Shop By Category
                </h3>
                <span className="text-xs text-gray-500">
                  {categories.length} Categories
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {categories.map((category) => {
                  const Icon = getCategoryIcon(category);
                  const active = selectedCategory.includes(category);
                  const totalProducts = products.filter(
                    (item) => (item.category || item.name) === category
                  ).length;

                  return (
                    <button
                      key={category}
                      onClick={() => handleCategory(category)}
                      className={`group flex-shrink-0 w-[calc(50%-6px)] sm:w-24 rounded-2xl border p-3 transition-all duration-300 ${
                        active
                          ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white border-blue-600 shadow-lg scale-105"
                          : "bg-white border-gray-200 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center transition-all ${
                          active
                            ? "bg-white/20"
                            : "bg-blue-100 group-hover:bg-blue-200"
                        }`}
                      >
                        <Icon
                          size={18}
                          className={active ? "text-white" : "text-blue-700"}
                        />
                      </div>

                      <h4 className="mt-3 text-[11px] sm:text-xs font-semibold text-center truncate">
                        {category}
                      </h4>

                      <p
                        className={`mt-1 text-[10px] text-center ${
                          active ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {totalProducts} Product{totalProducts !== 1 ? "s" : ""}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-800">
                  Maximum Price
                </h3>
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  ₹{maxPrice}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />

              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>₹0</span>
                <span>₹5000+</span>
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedCategory.length > 0 || maxPrice < 5000) && (
              <button
                onClick={() => {
                  setSelectedCategory([]);
                  setMaxPrice(5000);
                }}
                className="mt-6 w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* ================= PRODUCTS ================= */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="h-[500px] flex flex-col justify-center items-center">
              <Package size={70} className="text-gray-300" />
              <h2 className="mt-5 text-2xl font-bold text-gray-700">
                No Products Found
              </h2>
              <p className="text-gray-500 mt-2 text-center">
                No products match your current filters.
                <br />
                Please change category or price.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory([]);
                  setMaxPrice(5000);
                }}
                className="mt-8 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.slice(0, visibleProducts).map((product) => {
                  const lowestPrice = getLowestPrice(product);
                  const finalPrice = lowestPrice || Number(product.price) || 0;

                  return (
                    <div
                      key={product._id}
                      className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      {/* IMAGE */}
                      <div className="relative h-56 bg-gray-100 overflow-hidden">
                        <img
                          src={product.images?.[0] || "/no-image.png"}
                          alt={product.name}
                          className="w-full h-full object-contain p-5 group-hover:scale-110 transition duration-500"
                          onError={(e) => {
                            e.target.src = "/no-image.png";
                          }}
                        />

                        {product.offer > 0 && (
                          <span className="absolute top-3 left-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                            {product.offer}% OFF
                          </span>
                        )}

                        <span
                          className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full ${
                            product.stock > 0
                              ? "bg-green-600 text-white"
                              : "bg-red-600 text-white"
                          }`}
                        >
                          {product.stock > 0 ? "In Stock" : "Out Of Stock"}
                        </span>
                      </div>

                      {/* BODY */}
                      <div className="p-5">
                        <h2 className="font-bold text-lg line-clamp-2 text-gray-800">
                          {product.name}
                        </h2>

                        <p className="text-sm text-gray-500 mt-2">
                          Brand : {product.brand || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Material : {product.material || "N/A"}
                        </p>

                        <div className="flex justify-between items-end mt-5">
                          <div>
                            <p className="text-xs text-gray-400">Price</p>
                            <h2 className="text-2xl font-bold text-blue-700">
                              ₹{finalPrice}
                            </h2>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Stock</p>
                            <h3 className="font-bold text-green-600">
                              {product.stock ?? 0}
                            </h3>
                          </div>
                        </div>

                        {/* BUTTONS */}
                        <div className="grid grid-cols-2 gap-3 mt-6">
                          <button
                            onClick={() =>
                              navigate(`/product/${product._id}`)
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-sm font-semibold transition"
                          >
                            View
                          </button>

                          <button
                            disabled={product.stock === 0}
                            onClick={() =>
                              addToCart({
                                ...product,
                                quantity: 1,
                                price: finalPrice,
                              })
                            }
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl py-3 text-sm font-semibold transition"
                          >
                            Add Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More */}
              {filteredProducts.length > visibleProducts && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() =>
                      setVisibleProducts((prev) => prev + 8)
                    }
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold shadow-lg hover:scale-105 transition duration-300"
                  >
                    Load More Products
                  </button>
                </div>
              )}

              {/* Result Count */}
              <div className="mt-8 text-center text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-blue-600 mx-1">
                  {Math.min(visibleProducts, filteredProducts.length)}
                </span>
                of{" "}
                <span className="font-semibold text-blue-600 mx-1">
                  {filteredProducts.length}
                </span>
                Products
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
