import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const CartContext = createContext();

const CartProvider = ({ children }) => {

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // ===========================
  // SAVE CART
  // ===========================

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

// ===========================
// ADD TO CART
// ===========================

const addToCart = (product) => {
  const productId = product._id || product.id;

  const selectedQty =
    product.selectedQty ||
    product.pricing?.[0]?.quantity ||
    1;

  const selectedPrice =
    product.price ||
    product.pricing?.[0]?.price ||
    0;

  setCart((prevCart) => {
    const exist = prevCart.find(
      (item) =>
        (item._id || item.id) === productId &&
        item.selectedQty === selectedQty
    );

    if (exist) {
      toast.success("Quantity Updated");

      return prevCart.map((item) =>
        (item._id || item.id) === productId &&
        item.selectedQty === selectedQty
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      );
    }

    toast.success("Added To Cart");

    return [
      ...prevCart,
      {
        ...product,

        _id: productId,
        id: productId,

        name: product.name || product.title,
        title: product.title || product.name,

        image:
          product.image ||
          product.images?.[0] ||
          "",

        images:
          product.images || [],

        price: Number(selectedPrice),

        selectedQty,

        quantity: 1,
      },
    ];
  });
};

// ===========================
// REMOVE
// ===========================

const removeFromCart = (id, qty) => {
  setCart((prevCart) =>
    prevCart.filter(
      (item) =>
        !(
          (item._id || item.id) === id &&
          item.selectedQty === qty
        )
    )
  );

  toast.success("Product Removed");
};

// ===========================
// INCREASE
// ===========================

const increaseQty = (id, qty) => {
  setCart((prevCart) =>
    prevCart.map((item) =>
      (item._id || item.id) === id &&
      item.selectedQty === qty
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    )
  );
};

// ===========================
// DECREASE
// ===========================

const decreaseQty = (id, qty) => {
  setCart((prevCart) =>
    prevCart
      .map((item) =>
        (item._id || item.id) === id &&
        item.selectedQty === qty
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
      .filter((item) => item.quantity > 0)
  );
};

// ===========================
// UPDATE PACK
// ===========================

const updateSelectedQty = (
  id,
  oldQty,
  newQty,
  newPrice
) => {
  setCart((prevCart) =>
    prevCart.map((item) =>
      (item._id || item.id) === id &&
      item.selectedQty === oldQty
        ? {
            ...item,
            selectedQty: newQty,
            price: Number(newPrice),
          }
        : item
    )
  );
};

// ===========================
// CLEAR CART
// ===========================

const clearCart = () => {
  setCart([]);
  localStorage.removeItem("cart");
};

// ===========================
// TOTALS
// ===========================

const cartCount = cart.reduce(
  (total, item) => total + Number(item.quantity),
  0
);

const totalAmount = cart.reduce(
  (total, item) =>
    total +
    Number(item.price) *
      Number(item.quantity),
  0
);


  return (

    <CartContext.Provider
      value={{

        cart,

        addToCart,

        removeFromCart,

        increaseQty,

        decreaseQty,

        updateSelectedQty,

        clearCart,

        cartCount,

        totalAmount,

      }}
    >
      {children}
    </CartContext.Provider>

  );

};

export default CartProvider;