import { useLocation, useNavigate } from "react-router-dom";
import { useContext, useState,useEffect } from "react";
import { CartContext } from "./Context";

const ProductDetails = () => {

const location = useLocation();
const navigate = useNavigate();

const { addToCart } = useContext(CartContext);

// ================= PRODUCT DATA =================

const product = location.state;

// ================= SELECTED IMAGE =================

const [selectedImage, setSelectedImage] = useState("");

// ================= SELECTED PRICING =================

const [selectedPricing, setSelectedPricing] = useState({
  quantity: 1,
  price: 0,
});

// ================= LOAD PRODUCT =================

useEffect(() => {
  if (!product) return;

  // Default Image
  if (product.images?.length > 0) {
    setSelectedImage(product.images[0]);
  }

  // Default Pricing
  if (product.pricing?.length > 0) {
    setSelectedPricing(product.pricing[0]);
  } else {
    setSelectedPricing({
      quantity: 1,
      price: 0,
    });
  }
}, [product]);

// ================= PRODUCT NOT FOUND =================

if (!product) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">

      <h1 className="text-3xl font-bold text-red-600">
        Product Not Found
      </h1>

      <p className="text-gray-500">
        This product doesn't exist or was removed.
      </p>

      <button
        onClick={() => navigate("/")}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition"
      >
        Back To Home
      </button>

    </div>
  );
}


  return (

<div className="grid grid-cols-1 ml-2  mr-2 mt-2 mb-2 lg:grid-cols-2 gap-12">

  {/* ================= LEFT : PRODUCT IMAGES ================= */}

  <div>

    {/* Main Image */}

    <div className="bg-white rounded-3xl border shadow-lg h-[500px] flex items-center justify-center overflow-hidden">

      <img
        src={selectedImage}
        alt={product.name}
        className="max-w-full max-h-full object-contain hover:scale-110 transition duration-300"
      />

    </div>

    {/* Thumbnails */}

    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-5">

      {product.images?.map((img, index) => (

        <button
          key={index}
          type="button"
          onClick={() => setSelectedImage(img)}
          className={`rounded-xl border-2 overflow-hidden transition hover:scale-105 ${
            selectedImage === img
              ? "border-blue-600 shadow-lg"
              : "border-gray-300"
          }`}
        >

          <img
            src={img}
            alt={`Product ${index + 1}`}
            className="w-full h-20 object-contain bg-white p-2"
          />

        </button>

      ))}

    </div>

  </div>

  {/* ================= RIGHT : PRODUCT DETAILS ================= */}

  <div>

    <h1 className="text-3xl md:text-4xl font-bold">
      {product.name}
    </h1>

    {/* Category & Stock */}

    <div className="flex flex-wrap gap-3 mt-5">

      <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
        {product.category}
      </span>

      <span
        className={`px-4 py-2 rounded-full text-sm font-semibold ${
          product.stock > 0
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {product.stock > 0
          ? `${product.stock} Pieces Available`
          : "Out Of Stock"}
      </span>

    </div>

    {/* Description */}

    <div className="mt-8">

      <h2 className="text-xl font-bold mb-3">
        Description
      </h2>

      <p className="text-gray-600 leading-8">
        {product.description}
      </p>

    </div>

    {/* Product Information */}

    <div className="grid grid-cols-2 gap-4 mt-8">

      <div className="bg-gray-50 rounded-xl p-4">

        <p className="text-gray-500 text-sm">
          Brand
        </p>

        <h3 className="font-semibold mt-1">
          {product.brand || "-"}
        </h3>

      </div>

      <div className="bg-gray-50 rounded-xl p-4">

        <p className="text-gray-500 text-sm">
          Material
        </p>

        <h3 className="font-semibold mt-1">
          {product.material || "-"}
        </h3>

      </div>

      <div className="bg-gray-50 rounded-xl p-4">

        <p className="text-gray-500 text-sm">
          Category
        </p>

        <h3 className="font-semibold mt-1">
          {product.category}
        </h3>

      </div>

      <div className="bg-gray-50 rounded-xl p-4">

        <p className="text-gray-500 text-sm">
          Available Stock
        </p>

        <h3 className="font-semibold mt-1">
          {product.stock} Pieces
        </h3>

      </div>

    </div>

    {/* Quantity */}

    <div className="mt-8">

      <h2 className="font-semibold text-lg mb-3">
        Select Quantity
      </h2>

      <select
        value={selectedPricing?.quantity || ""}
        onChange={(e) => {

          const pricing = product.pricing.find(
            (item) =>
              item.quantity === Number(e.target.value)
          );

          setSelectedPricing(pricing);

        }}
        className="w-full border-2 rounded-xl p-4 outline-none focus:border-blue-600"
      >

        {product.pricing?.map((item, index) => (

          <option
            key={index}
            value={item.quantity}
          >
            {item.quantity} Pieces - ₹{item.price}
          </option>

        ))}

      </select>

    </div>

    {/* Price */}

    <div className="bg-green-50 rounded-2xl mt-8 p-6 border">

      <p className="text-gray-500">
        Total Price
      </p>

      <h2 className="text-5xl font-bold text-green-600 mt-2">
        ₹{selectedPricing?.price || 0}
      </h2>

    </div>

    {/* Buttons */}

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">

      <button
        disabled={product.stock === 0}
        onClick={() =>
          addToCart({
            ...product,
            price: selectedPricing.price,
            selectedQty: selectedPricing.quantity,
          })
        }
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-semibold transition"
      >
        Add To Cart
      </button>

      <button
        disabled={product.stock === 0}
        onClick={() => {

          addToCart({
            ...product,
            price: selectedPricing.price,
            selectedQty: selectedPricing.quantity,
          });

          navigate("/cart");

        }}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-semibold transition"
      >
        Buy Now
      </button>

    </div>

  </div>

</div>


  );
};

export default ProductDetails;