import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import { CartContext } from "./Context";

const ShoppingCart = () => {
const navigate = useNavigate();

const {
  cart,
  setCart,
  clearCart,
  increaseQty,
  decreaseQty,
  removeFromCart,
} = useContext(CartContext);

const [loading, setLoading] = useState(false);

// ===============================
// TOTAL ITEMS
// ===============================

const totalItems = useMemo(() => {
  return cart.reduce(
    (total, item) =>
      total + Number(item.quantity || 1),
    0
  );
}, [cart]);

// ===============================
// SUB TOTAL
// ===============================

const subTotal = useMemo(() => {
  return cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 1),
    0
  );
}, [cart]);

// ===============================
// GST
// ===============================

const gst = useMemo(() => {
  return Math.round(subTotal * 0.18);
}, [subTotal]);

// ===============================
// GRAND TOTAL
// ===============================

const grandTotal = useMemo(() => {
  return subTotal + gst;
}, [subTotal, gst]);

// ===============================
// CONTINUE SHOPPING
// ===============================

const continueShopping = () => {
  navigate("/");
};

// ===============================
// CHECKOUT
// ===============================
const checkoutHandler = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      toast.error("Please Login First");
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);

    const orderData = {
      userId: user._id,
      customerName: user.name,

      items: cart.map((item) => ({
        id: String(item._id || item.id), // String because Mongo _id is string
        title: item.name || item.title,
        image: item.image || item.images?.[0] || "",
        price: Number(item.price),
        quantity: Number(item.quantity || 1),
      })),

      totalAmount: Number(grandTotal),
    };

    console.log("Sending Order:", orderData);

    const { data } = await axios.post(
      "https://backend-3-axez.onrender.com/api/orders/create",
      orderData
    );

    if (data.success) {
      toast.success("Order Placed Successfully");

      clearCart();

      navigate("/orders");
    } else {
      toast.error(data.message);
    }
  } catch (err) {
    console.error(err);

    toast.error(
      err.response?.data?.message ||
      "Unable to place order"
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <>
<div className="max-w-7xl mx-auto px-4 py-10">

  <h1 className="text-3xl md:text-4xl font-bold mb-8">
    Shopping Cart
  </h1>

  
{cart.length === 0 ? (
  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
    <img
      src="/shopping-cart.png"
      alt="Empty Cart"
      className="w-12 mx-auto"
    />

    <h2 className="text-3xl font-bold mt-6">
      Your Cart is Empty
    </h2>

    <p className="text-gray-500 mt-3">
      Looks like you haven't added anything yet.
    </p>

    <button
      onClick={continueShopping}
      className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl"
    >
      Continue Shopping
    </button>
  </div>
) : (
  <div className="grid lg:grid-cols-3 gap-8">

    {/* ================= CART ITEMS ================= */}

    <div className="lg:col-span-2 space-y-5">

      {cart.map((item) => (

        <div
          key={`${item._id || item.id}-${item.selectedQty}`}
          className="bg-white rounded-2xl shadow-md border p-5 flex flex-col md:flex-row gap-5"
        >

          {/* PRODUCT IMAGE */}

          <div className="w-full md:w-40 flex justify-center">

            <img
              src={
                item.image ||
                item.images?.[0] ||
                "https://via.placeholder.com/200"
              }
              alt={item.name || item.title}
              className="w-36 h-36 object-contain"
            />

          </div>

          {/* PRODUCT DETAILS */}

          <div className="flex-1">

            <h2 className="text-xl font-bold">
              {item.name || item.title}
            </h2>

            {item.brand && (
              <p className="text-gray-500 mt-1">
                Brand : {item.brand}
              </p>
            )}

            <p className="text-gray-500 mt-1">
              Pack :
              <span className="font-semibold ml-2">
                {item.selectedQty} Piece
              </span>
            </p>

            <h3 className="text-2xl text-green-600 font-bold mt-4">
              ₹{item.price}
            </h3>

            {/* QUANTITY */}

            <div className="flex items-center gap-4 mt-5">

              <button
                onClick={() =>
                  decreaseQty(
                    item._id || item.id,
                    item.selectedQty
                  )
                }
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                -
              </button>

              <span className="text-lg font-bold">
                {item.quantity}
              </span>

              <button
                onClick={() =>
                  increaseQty(
                    item._id || item.id,
                    item.selectedQty
                  )
                }
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                +
              </button>

            </div>

          </div>

          {/* REMOVE */}

          <div className="flex justify-end md:justify-start">

            <button
              onClick={() =>
                removeFromCart(
                  item._id || item.id,
                  item.selectedQty
                )
              }
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl"
            >
              Remove
            </button>

          </div>

        </div>

      ))}

    </div>

  </div>
)}

 </div>

      {/* ================= ORDER SUMMARY ================= */}

      <div className="lg:sticky lg:top-24 h-fit">

        <div className="bg-white rounded-2xl shadow-lg border p-6">

          <h2 className="text-2xl font-bold mb-6">
            Order Summary
          </h2>

          {/* Coupon */}

          <div>

          </div>

          {/* Price Details */}

          <div className="space-y-4 mt-8">

            <div className="flex justify-between">

              <span className="text-gray-600">
                Total Items
              </span>

              <span className="font-semibold">
                {totalItems}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-gray-600">
                Subtotal
              </span>

              <span className="font-semibold">
                ₹{subTotal}
              </span>

            </div>
            <div className="flex justify-between">

              <span className="text-gray-600">
                GST (18%)
              </span>

              <span className="font-semibold">
                ₹{gst}
              </span>

            </div>

          </div>

          <hr className="my-6" />

          <div className="flex justify-between items-center">

            <span className="text-xl font-bold">
              Grand Total
            </span>

            <span className="text-3xl font-bold text-green-600">

              ₹{grandTotal}

            </span>

          </div>

          {/* Checkout */}

          <button
            onClick={checkoutHandler}
            disabled={loading || cart.length === 0}
            className="w-full mt-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-semibold transition"
          >

            {loading
              ? "Placing Order..."
              : "Proceed To Checkout"}

          </button>

          {/* Continue Shopping */}

          <button
            onClick={continueShopping}
            className="w-full mt-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-4 rounded-xl font-semibold transition"
          >
            Continue Shopping
          </button>

          {/* Clear Cart */}

          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="w-full mt-4 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white py-4 rounded-xl font-semibold transition disabled:opacity-50"
          >
            Clear Cart
          </button>

        </div>

      </div>




    
    </>
  );
};

export default ShoppingCart;
