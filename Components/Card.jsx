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
  // CATEGORIES
  // ===========================

  const categories = [
    ...new Set(
      products
        .map((item) => item.category)
        .filter(Boolean)
    ),
  ];

  // ===========================
  // CATEGORY ICONS
  // ===========================

  const categoryIcons = {
    Hammer: Hammer,
    Hammers: Hammer,

    Wrench: Wrench,
    Wrenches: Wrench,
    Spanner: Wrench,
    Spanners: Wrench,

    Drill: Drill,
    Drills: Drill,

    Measuring: Ruler,
    Measurement: Ruler,
    Tape: Ruler,

    Safety: Shield,

    Hardware: Cog,
    Accessories: Settings,

    Others: Package,
  };

  const getCategoryIcon = (category) => {
    if (!category) return Package;

    const key = category.replace(/\s+/g, "");

    return (
      categoryIcons[category] ||
      categoryIcons[key] ||
      Package
    );
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

  const getLowestPrice = (pricing = []) => {
    if (!pricing.length) return 0;

    return Math.min(
      ...pricing.map((item) =>
        Number(item.price || 0)
      )
    );
  };

  // ===========================
  // FILTER PRODUCTS
  // ===========================

  const filteredProducts =
    products.filter((product) => {

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
    });

  useEffect(() => {
    setVisibleProducts(8);
  }, [selectedCategory, maxPrice]);

  // ===========================
  // LOADING
  // ===========================

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">

        <div className="text-center">

          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>

          <h2 className="mt-5 text-xl font-semibold text-gray-700">
            Loading Products...
          </h2>

        </div>

      </div>
    );
  }

  // ===========================
  // RETURN START
  // ===========================

  return (

    <div className="max-w-7xl mx-auto px-4 py-8">

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

      {/* ===========================
        FILTER SIDEBAR
=========================== */}

<div className="lg:col-span-1">

  <div className="sticky top-24">

    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">

      {/* HEADER */}

      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 p-5">

        <h2 className="text-2xl font-bold text-white">
          Product Filters
        </h2>

        <p className="text-blue-100 text-sm mt-1">
          Find the right hand tool easily
        </p>

      </div>

      <div className="p-6">

        {/* ======================
            SHOP BY CATEGORY
        ======================= */}

        <div>

          <h3 className="text-lg font-bold mb-5">
            Shop By Category
          </h3>

          <div className="grid grid-cols-2 gap-4">

            {categories.map((category) => {

              const Icon =
                getCategoryIcon(category);

              const active =
                selectedCategory.includes(category);

              const totalProducts =
                products.filter(
                  (item) =>
                    item.category === category
                ).length;

              return (

                <button
                  key={category}
                  onClick={() =>
                    handleCategory(category)
                  }
                  className={`group rounded-2xl border p-4 transition-all duration-300

                  ${
                    active
                      ? "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white border-transparent shadow-xl scale-105"
                      : "bg-white hover:border-blue-500 hover:shadow-lg hover:-translate-y-1"
                  }`}
                >

                  <div
                    className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-3

                    ${
                      active
                        ? "bg-white/20"
                        : "bg-blue-100 group-hover:bg-blue-200"
                    }`}
                  >

                    <Icon
                      size={28}
                      className={
                        active
                          ? "text-white"
                          : "text-blue-700"
                      }
                    />

                  </div>

                  <h4 className="font-semibold text-sm">

                    {category}

                  </h4>

                  <p
                    className={`text-xs mt-1

                    ${
                      active
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >

                    {totalProducts} Products

                  </p>

                </button>

              );

            })}

          </div>

        </div>

        {/* ======================
            PRICE FILTER
        ======================= */}

        <div className="mt-10">

          <div className="flex justify-between items-center mb-4">

            <h3 className="font-bold text-lg">
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
            onChange={(e) =>
              setMaxPrice(
                Number(e.target.value)
              )
            }
            className="w-full accent-blue-600 cursor-pointer"
          />

          <div className="flex justify-between mt-3 text-sm text-gray-500">

            <span>₹0</span>

            <span>₹5000+</span>

          </div>

        </div>

        {/* ======================
            RESULT
        ======================= */}

        <div className="mt-8 rounded-2xl bg-blue-50 border border-blue-200 p-4">

          <h4 className="font-semibold text-blue-700">
            Results
          </h4>

          <p className="text-3xl font-bold mt-2">

            {filteredProducts.length}

          </p>

          <p className="text-gray-500 text-sm">

            Products Found

          </p>

        </div>

        {/* ======================
            CLEAR FILTER
        ======================= */}

        <button
          onClick={() => {

            setSelectedCategory([]);

            setMaxPrice(5000);

          }}
          className="w-full mt-8 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] duration-300"
        >

          Clear All Filters

        </button>

      </div>

    </div>

  </div>

</div>
{/* ===========================
        PRODUCTS SECTION
=========================== */}

<div className="lg:col-span-3">

  {filteredProducts.length === 0 ? (

    <div className="h-[500px] flex flex-col justify-center items-center">

      <Package
        size={80}
        className="text-gray-300"
      />

      <h2 className="text-3xl font-bold mt-6 text-gray-700">
        No Products Found
      </h2>

      <p className="text-gray-500 mt-2">
        Please change your filters.
      </p>

    </div>

  ) : (

    <>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">

        {filteredProducts
          .slice(0, visibleProducts)
          .map((product) => {

            const lowestPrice =
              getLowestPrice(product.pricing);

            const defaultPrice =
              product.pricing?.[0] || {};

            return (

              <div
                key={product._id}
                className="group bg-white rounded-3xl border border-gray-200 shadow-lg hover:shadow-2xl overflow-hidden transition duration-300 hover:-translate-y-2"
              >

                {/* IMAGE */}

                <div className="relative bg-gray-100 h-72 flex items-center justify-center overflow-hidden">

                  <img
                    src={
                      product.images?.[0] ||
                      "/no-image.png"
                    }
                    alt={product.name}
                    className="w-full h-full object-contain p-6 transition duration-500 group-hover:scale-110"
                  />

                  <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">

                    {product.category}

                  </span>

                  <span
                    className={`absolute top-4 right-4 text-xs px-3 py-1 rounded-full text-white

                    ${
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

                {/* DETAILS */}

                <div className="p-5">

                  <h2 className="text-xl font-bold line-clamp-2">

                    {product.name}

                  </h2>

                  <p className="text-gray-500 mt-2">

                    Brand : {product.brand}

                  </p>

                  <div className="mt-5 flex justify-between items-center">

                    <div>

                      <p className="text-xs text-gray-400">
                        Starting Price
                      </p>

                      <h2 className="text-3xl font-bold text-green-600">

                        ₹{lowestPrice}

                      </h2>

                    </div>

                    <div className="text-right">

                      <p className="text-xs text-gray-500">

                        Stock

                      </p>

                      <h3 className="font-bold text-blue-700">

                        {product.stock}

                      </h3>

                    </div>

                  </div>

                  {/* BUTTONS */}

                  <div className="grid grid-cols-2 gap-3 mt-6">

                    <button
                      onClick={() =>
                        navigate(
                          `/product/${product._id}`,
                          {
                            state: product,
                          }
                        )
                      }
                      className="py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
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

                          title: product.name,

                          image:
                            product.images?.[0],

                          quantity: 1,

                          selectedQty:
                            defaultPrice.quantity || 1,

                          price:
                            defaultPrice.price ||
                            lowestPrice,

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

      {visibleProducts <
        filteredProducts.length && (

        <div className="flex justify-center mt-12">

          <button
            onClick={() =>
              setVisibleProducts(
                (prev) => prev + 8
              )
            }
            className="px-10 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold hover:scale-105 transition"
          >

            Load More Products

          </button>

        </div>

      )}

    </>

  )}

</div>

      </div>

    </div>

  );

};

export default Card;
