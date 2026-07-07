import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./Context";

const Card = () => {
const { addToCart } = useContext(CartContext);
const navigate = useNavigate();

const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);

const [selectedCategory, setSelectedCategory] = useState([]);
const [maxPrice, setMaxPrice] = useState(5000);
const [visibleProducts, setVisibleProducts] = useState(8);

// ================= FETCH PRODUCTS =================

const fetchProducts = async () => {
  try {
    setLoading(true);

    const res = await axios.get(
      "https://backend-1-065x.onrender.com/api/products"
    );

    if (res.data.success) {
      setProducts(res.data.products);
    }
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchProducts();
}, []);

// ================= CATEGORY =================

const categories = [
  ...new Set(
    products
      .map((item) => item.category)
      .filter(Boolean)
  ),
];

const handleCategory = (category) => {
  if (selectedCategory.includes(category)) {
    setSelectedCategory(
      selectedCategory.filter(
        (item) => item !== category
      )
    );
  } else {
    setSelectedCategory([
      ...selectedCategory,
      category,
    ]);
  }
};

// ================= GET LOWEST PRICE =================

const getLowestPrice = (pricing = []) => {
  if (!pricing.length) return 0;

  return Math.min(
    ...pricing.map((item) =>
      Number(item.price)
    )
  );
};

// ================= FILTER PRODUCTS =================

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

    return categoryMatch && priceMatch;
  }
);

// ================= RESET SHOW MORE =================

useEffect(() => {
  setVisibleProducts(8);
}, [selectedCategory, maxPrice]);

// ================= LOADING =================

if (loading) {
  return (
    <div className="flex justify-center items-center h-[300px]">
      <h2 className="text-2xl font-semibold">
        Loading Products...
      </h2>
    </div>
  );
}
  return (
    <div className="max-w-7xl mx-auto p-5">

      <h1 className="text-4xl font-bold text-center mb-10">
        Our Products
      </h1>

      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar */}
        <div className="w-full md:w-72 bg-gray-100 p-5 rounded-xl shadow-md h-fit">

          <h2 className="text-2xl font-bold mb-5">
            Filters
          </h2>

          <h3 className="font-semibold mb-3 bg-blue-600 text-white px-3 py-1 rounded-full w-max">
            Categories
          </h3>

          {categories.map((category) => (
            <label
              key={category}
              className="flex items-center gap-2 mb-2"
            >
              <input
                type="checkbox"
                checked={selectedCategory.includes(
                  category
                )}
                onChange={() =>
                  handleCategory(category)
                }
              />
              {category}
            </label>
          ))}

          <div className="mt-6">

            <h3 className="font-semibold mb-3 bg-green-600 text-white px-3 py-1 rounded-full w-max">
              Price Range
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
              className="w-full"
            />

            <div className="flex justify-between mt-2">
              <span>₹0</span>
              <span className="font-bold text-green-600">
                ₹{maxPrice}
              </span>
            </div>

          </div>

          <button
            onClick={() => {
              setSelectedCategory([]);
              setMaxPrice(5000);
            }}
            className="mt-5 w-full bg-red-500 text-white py-2 rounded-lg"
          >
            Clear Filters
          </button>

        </div>

        {/* Product Grid */}
        <div className="flex-1">

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

  {filteredProducts
    .slice(0, visibleProducts)
    .map((product) => {

      const lowestPrice = getLowestPrice(product.pricing);

      const defaultPrice =
        product.pricing?.[0] || {};

      return (

        <div
          key={product._id}
          className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
        >

          {/* Image */}

          <div className="relative overflow-hidden">

            <img
              src={
                product.images?.[0] ||
                "https://via.placeholder.com/400"
              }
              alt={product.name}
              className="w-full h-64 object-cover group-hover:scale-110 transition duration-500"
            />

            {/* Stock */}

            <span
              className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs text-white ${
                product.stock > 0
                  ? "bg-green-600"
                  : "bg-red-600"
              }`}
            >
              {product.stock > 0
                ? "In Stock"
                : "Out Of Stock"}
            </span>

            {/* Hover Buttons */}

            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition">

              <button
                onClick={() =>
                  navigate(`/product/${product._id}`, {
                    state: product,
                  })
                }
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold  px-5 py-0 cursor-pointer rounded-lg"
              >
                View Details
              </button>

              <button
                disabled={product.stock === 0}
                onClick={() =>
                  addToCart({
                    id: product._id,
                    title: product.name,
                    image: product.images?.[0],
                    quantity: 1,
                    selectedQty:
                      defaultPrice.quantity || 1,
                    price:
                      defaultPrice.price ||
                      lowestPrice,
                  })
                }
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-semibold  px-2 cursor-pointer py-0 rounded-lg"
              >
                Add To Cart
              </button>

            </div>

          </div>

          {/* Details */}

          <div className="p-5">

            <h2 className="text-lg font-bold truncate">
              {product.name}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {product.brand}
            </p>

            <div className="mt-4 flex items-center justify-between">

              <div>
                <p className="text-xs text-gray-500">
                 Just Starting From
                </p>

                <h2 className="text-2xl font-bold text-green-600">
                  ₹{lowestPrice}
                </h2>

              </div>

              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
                {product.category}
              </span>

            </div>

          </div>

        </div>

      );

    })}

</div>

{/* Show More */}

{visibleProducts < filteredProducts.length && (

  <div className="flex justify-center mt-10">

    <button
      onClick={() =>
        setVisibleProducts((prev) => prev + 8)
      }
      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl"
    >
      Show More
    </button>

  </div>

)}

          {/* Show More */}
          {visibleProducts <
            filteredProducts.length && (
            <div className="flex justify-center mt-8">

              <button
                onClick={() =>
                  setVisibleProducts(
                    (prev) => prev + 8
                  )
                }
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Show More
              </button>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Card;
