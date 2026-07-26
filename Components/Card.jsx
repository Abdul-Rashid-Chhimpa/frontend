import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./Context";

import {
  Hammer,
  Wrench,
  Drill,
  Shield,
  Package,
  Ruler,
  Settings,
  Cog,
} from "lucide-react";

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

  setLoading(true);

  try {

    const { data } = await axios.get(
      "https://backend-3-axez.onrender.com/api/products"
    );

    if (data.success) {

      setProducts(data.products || []);

    } else {

      setProducts([]);

    }

  } catch (error) {

    console.log(error);

    setProducts([]);

  } finally {

    setLoading(false);

  }

};

useEffect(() => {

  fetchProducts();

}, []);

// ===========================
// CATEGORY LIST
// (Product Name = Category)
// ===========================

const categories = [
  ...new Set(
    products
      .map((item) => item.name)
      .filter(Boolean)
  ),
];

// ===========================
// CATEGORY ICONS
// ===========================

const categoryIcons = {

  Hammer,
  Hammers: Hammer,

  Wrench,
  Wrenches: Wrench,

  Drill,
  Drills: Drill,

  Safety: Shield,

  Measuring: Ruler,

  Hardware: Cog,

  Accessories: Settings,

};

const getCategoryIcon = (category) => {

  if (!category) return Package;

  const key = category.trim();

  return categoryIcons[key] || Package;

};

// ===========================
// CATEGORY FILTER
// ===========================

const handleCategory = (category) => {

  setSelectedCategory((prev) =>

    prev.includes(category)

      ? prev.filter(
          (item) => item !== category
        )

      : [...prev, category]

  );

};

// ===========================
// LOWEST PRICE
// ===========================

const getLowestPrice = (product) => {

  if (
    product.pricing &&
    product.pricing.length > 0
  ) {

    return Math.min(

      ...product.pricing.map((item) =>
        Number(item.price)
      )

    );

  }

  return Number(product.price || 0);

};

// ===========================
// FILTER PRODUCTS
// ===========================

const filteredProducts = products.filter(

  (product) => {

    const categoryMatch =

      selectedCategory.length === 0 ||

      selectedCategory.includes(
        product.name
      );

    const priceMatch =

      getLowestPrice(product) <= maxPrice;

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

{/* ==========================
      SHOP BY CATEGORY
========================== */}

<div className="mb-8">

  <div className="flex items-center justify-between mb-4">

    <h3 className="text-lg font-bold text-gray-800">
      Shop By Category
    </h3>

    <span className="text-xs text-gray-500">
      {categories.length} Items
    </span>

  </div>

  <div
    dir="rtl"
    className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2"
  >

    {categories.map((category) => {

      const Icon = getCategoryIcon(category);

      const active =
        selectedCategory.includes(category);

      const totalProducts =
        products.filter(
          (item) => item.name === category
        ).length;

      return (

        <button
          key={category}
          onClick={() =>
            handleCategory(category)
          }
          className={`snap-start flex-shrink-0
          w-20 sm:w-24 md:w-28
          rounded-2xl
          border border-gray-200
          p-3
          transition-all duration-300

          ${
            active
              ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white border-blue-600 shadow-lg scale-105"
              : "bg-white hover:border-blue-500 hover:shadow-md"
          }`}
        >

          <div
            className={`w-9 h-9 rounded-full mx-auto flex items-center justify-center

            ${
              active
                ? "bg-white/20"
                : "bg-blue-100"
            }`}
          >

            <Icon
              size={18}
              className={
                active
                  ? "text-white"
                  : "text-blue-700"
              }
            />

          </div>

          <h4 className="mt-2 text-[11px] font-semibold text-center truncate">

            {category}

          </h4>

          <p
            className={`mt-1 text-[10px] text-center

            ${
              active
                ? "text-blue-100"
                : "text-gray-500"
            }`}
          >

            {totalProducts} Product

          </p>

        </button>

      );

    })}

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

   {/* ================= PRODUCTS ================= */}

<div className="lg:col-span-3">

  {filteredProducts.length === 0 ? (

    <div className="h-[500px] flex flex-col justify-center items-center">

      <Package
        size={70}
        className="text-gray-300"
      />

      <h2 className="mt-5 text-2xl font-bold text-gray-700">
        No Products Found
      </h2>

      <p className="text-gray-500 mt-2">
        Try changing your filters.
      </p>

    </div>

  ) : (

    <>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

        {filteredProducts
          .slice(0, visibleProducts)
          .map((product) => {

            const lowestPrice =
              getLowestPrice(product);

            return (

              <div
                key={product._id}
                className="group bg-white rounded-3xl border border-gray-200 shadow-md hover:shadow-2xl transition duration-300 overflow-hidden hover:-translate-y-2"
              >

                {/* IMAGE */}

                <div className="relative bg-gray-100 h-64 overflow-hidden">

                  <img
                    src={
                      product.images?.[0] ||
                      "https://via.placeholder.com/400x400?text=No+Image"
                    }
                    alt={product.name}
                    className="w-full h-full object-contain p-6 group-hover:scale-110 transition duration-500"
                  />

                  <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">

                    {product.name}

                  </span>

                  <span
                    className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full text-white

                    ${
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

                {/* DETAILS */}

                <div className="p-5">

                  <h2 className="font-bold text-lg line-clamp-2">

                    {product.name}

                  </h2>

                  <p className="text-gray-500 mt-2">

                    Brand : {product.brand}

                  </p>

                  <div className="flex justify-between items-center mt-5">

                    <div>

                      <p className="text-xs text-gray-500">
                        Price
                      </p>

                      <h2 className="text-3xl font-bold text-green-600">

                        ₹{lowestPrice}

                      </h2>

                    </div>

                    <div>

                      <p className="text-xs text-gray-500">
                        Stock
                      </p>

                      <h3 className="font-bold text-blue-600 text-center">

                        {product.stock}

                      </h3>

                    </div>

                  </div>

                  {/* BUTTONS */}

                  <div className="grid grid-cols-2 gap-3 mt-6">

                    <button
                      onClick={() =>
                        navigate(`/product/${product._id}`, {
                          state: product,
                        })
                      }
                      className="py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                    >

                      Details

                    </button>

                    <button
                      disabled={product.stock === 0}
                      onClick={() =>
                        addToCart({
                          id: product._id,
                          title: product.name,
                          image: product.images?.[0],
                          quantity: 1,
                          selectedQty: 1,
                          price: lowestPrice,
                        })
                      }
                      className="py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold transition"
                    >

                      Add Cart

                    </button>

                  </div>

                </div>

              </div>

            );

          })}

      </div>

      {/* LOAD MORE */}

      {visibleProducts < filteredProducts.length && (

        <div className="flex justify-center mt-10">

          <button
            onClick={() =>
              setVisibleProducts((prev) => prev + 8)
            }
            className="px-10 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold hover:scale-105 transition"
          >

            Load More

          </button>

        </div>

      )}

    </>

  )}

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
