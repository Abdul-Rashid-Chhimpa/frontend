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
      "https://backend-3-axez.onrender.com/api/products"
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
  <>
  <div
  key={product._id}
  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 border"
>
  {/* Product Image */}
  <div className="relative">
    <img
      src={
        product.images?.[0] ||
        "https://via.placeholder.com/400"
      }
      alt={product.name}
      className="w-full h-60 object-cover"
    />

    {/* Stock Badge */}
    <span
      className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium text-white ${
        product.stock > 0
          ? "bg-green-600"
          : "bg-red-600"
      }`}
    >
      {product.stock > 0
        ? "In Stock"
        : "Out of Stock"}
    </span>
  </div>

  {/* Product Details */}
  <div className="p-4">

    <h2 className="text-lg font-bold truncate">
      {product.name}
    </h2>

    <p className="text-sm text-gray-500 mt-1">
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

      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
        {product.category}
      </span>
    </div>

    {/* Buttons */}
    <div className="mt-5 grid grid-cols-2 gap-3">

      <button
        onClick={() =>
          navigate(`/product/${product._id}`, {
            state: product,
          })
        }
        className="h-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
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
        className="h-11 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold transition"
      >
        Add To Cart
      </button>

    </div>

  </div>
</div>
  </>
  );
};

export default Card;
