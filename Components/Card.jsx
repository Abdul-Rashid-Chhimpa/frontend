import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./Context";

const Card = () => {

const { addToCart } = useContext(CartContext);
const navigate = useNavigate();

// ===========================
// STATES
// ===========================

const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);

const [selectedCategory, setSelectedCategory] =
  useState([]);

const [maxPrice, setMaxPrice] =
  useState(5000);

const [visibleProducts, setVisibleProducts] =
  useState(8);

// ===========================
// FETCH PRODUCTS
// ===========================

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
    console.error(error);
    setProducts([]);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchProducts();
}, []);

// ===========================
// ALL CATEGORIES
// ===========================

const categories = [
  ...new Set(
    products
      .map((item) => item.category)
      .filter(Boolean)
  ),
];

// ===========================
// CATEGORY FILTER
// ===========================

const handleCategory = (category) => {
  setSelectedCategory((prev) =>
    prev.includes(category)
      ? prev.filter((item) => item !== category)
      : [...prev, category]
  );
};

// ===========================
// LOWEST PRICE
// ===========================

const getLowestPrice = (pricing = []) => {
  if (!pricing || pricing.length === 0)
    return 0;

  return Math.min(
    ...pricing.map((item) =>
      Number(item.price || 0)
    )
  );
};

// ===========================
// FILTER PRODUCTS
// ===========================

const filteredProducts = products.filter(
  (product) => {
    const categoryMatch =
      selectedCategory.length === 0 ||
      selectedCategory.includes(
        product.category
      );

    const lowestPrice =
      getLowestPrice(product.pricing);

    const priceMatch =
      lowestPrice <= maxPrice;

    return (
      categoryMatch &&
      priceMatch
    );
  }
);

// ===========================
// RESET SHOW MORE
// ===========================

useEffect(() => {
  setVisibleProducts(8);
}, [selectedCategory, maxPrice]);

  // ===========================
  // LOADING
  // ===========================

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

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">

  {/* Heading */}

  <div className="text-center mb-10">

    <h1 className="text-4xl font-bold">
      Our Products
    </h1>

    <p className="text-gray-500 mt-3">
      Browse our latest collection
    </p>

  </div>

  <div className="grid lg:grid-cols-4 gap-8">

    {/* ================= FILTER SIDEBAR ================= */}

    <div className="lg:col-span-1">

      <div className="bg-white rounded-2xl shadow-lg border p-5 sticky top-24">

        <h2 className="text-2xl font-bold mb-6">
          Filters
        </h2>

        {/* Categories */}

        <div>

          <h3 className="font-semibold mb-4">
            Categories
          </h3>

          <div className="space-y-3">

            {categories.map((category) => (

              <label
                key={category}
                className="flex items-center gap-3 cursor-pointer"
              >

                <input
                  type="checkbox"
                  checked={selectedCategory.includes(
                    category
                  )}
                  onChange={() =>
                    handleCategory(category)
                  }
                  className="w-4 h-4 accent-blue-600"
                />

                <span>
                  {category}
                </span>

              </label>

            ))}

          </div>

        </div>

        {/* Price */}

        <div className="mt-8">

          <h3 className="font-semibold mb-4">
            Maximum Price
          </h3>

          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(
                Number(e.target.value)
              )
            }
            className="w-full accent-blue-600"
          />

          <div className="flex justify-between mt-2 text-sm">

            <span>₹0</span>

            <span className="font-semibold text-blue-600">
              ₹{maxPrice}
            </span>

          </div>

        </div>

        {/* Clear */}

        <button
          onClick={() => {
            setSelectedCategory([]);
            setMaxPrice(5000);
          }}
          className="w-full mt-8 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition"
        >
          Clear Filters
        </button>

      </div>

    </div>

    {/* ================= PRODUCTS ================= */}

    <div className="lg:col-span-3">

      {filteredProducts.length === 0 ? (

        <div className="h-96 flex justify-center items-center">

          <h2 className="text-2xl font-bold text-gray-500">
            No Products Found
          </h2>

        </div>

      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

          {filteredProducts
            .slice(0, visibleProducts)
            .map((product) => {

              const lowestPrice =
                getLowestPrice(
                  product.pricing
                );

              const defaultPrice =
                product.pricing?.[0] || {};

              return (
                                <div
                  key={product._id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg border hover:shadow-2xl transition duration-300"
                >

                  {/* Product Image */}

                  <div className="relative">

                    <img
                      src={
                        product.images?.[0] ||
                        "https://via.placeholder.com/400"
                      }
                      alt={product.name}
                      className="w-full h-64 object-cover"
                    />

                    {/* Stock Badge */}

                    <span
                      className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        product.stock > 0
                          ? "bg-green-600"
                          : "bg-red-600"
                      }`}
                    >
                      {product.stock > 0
                        ? "In Stock"
                        : "Out Of Stock"}
                    </span>

                  </div>

                  {/* Product Details */}

                  <div className="p-4">

                    <h2 className="text-lg font-bold truncate">
                      {product.name}
                    </h2>

                    <p className="text-gray-500 text-sm mt-1">
                      {product.brand}
                    </p>

                    <div className="flex justify-between items-center mt-4">

                      <div>

                        <p className="text-xs text-gray-500">
                          Starting From
                        </p>

                        <h3 className="text-2xl font-bold text-green-600">
                          ₹{lowestPrice}
                        </h3>

                      </div>

                      <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                        {product.category}
                      </span>

                    </div>

                    {/* Buttons */}

                    <div className="mt-5 flex gap-3">

                      <button
                        onClick={() =>
                          navigate(
                            `/product/${product._id}`,
                            {
                              state: product,
                            }
                          )
                        }
                        className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                      >
                        View Details
                      </button>

                      <button
                        disabled={
                          product.stock === 0
                        }
                        onClick={() =>
                          addToCart({
                            id: product._id,
                            title:
                              product.name,
                            image:
                              product.images?.[0],
                            quantity: 1,
                            selectedQty:
                              defaultPrice.quantity ||
                              1,
                            price:
                              defaultPrice.price ||
                              lowestPrice,
                          })
                        }
                        className="flex-1 h-11 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
                      >
                        Add To Cart
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}
        </div>
      )}

      {/* Show More */}

      {visibleProducts <
        filteredProducts.length && (

        <div className="flex justify-center mt-10">

          <button
            onClick={() =>
              setVisibleProducts(
                (prev) => prev + 8
              )
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition"
          >
            Show More
          </button>

        </div>
      )}

    </div>
  </div>
</div>

    </>
  );
};

export default Card;
