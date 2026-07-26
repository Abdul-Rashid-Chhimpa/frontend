import { createContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Unique key for each cart item (product + selected option)
  const getCartKey = (item) => {
    const id = item._id || item.id;
    const optQty = item.selectedOption?.quantity || item.selectedQty || 1;
    const optPrice = item.selectedOption?.price || item.price || 0;
    return `${id}_${optQty}_${optPrice}`;
  };

  // ================= ADD TO CART =================
  const addToCart = (product) => {
    setCart((prev) => {
      const key = getCartKey(product);
      const existingIndex = prev.findIndex(
        (item) => getCartKey(item) === key
      );

      if (existingIndex !== -1) {
        // Already exists → quantity badhao
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity:
            Number(updated[existingIndex].quantity || 1) +
            Number(product.quantity || 1),
        };
        toast.success("Quantity updated in cart");
        return updated;
      }

      // Naya item add karo
      toast.success("Added to cart");
      return [
        ...prev,
        {
          ...product,
          quantity: Number(product.quantity || 1),
          price: Number(product.price || 0),
          selectedOption: product.selectedOption || {
            quantity: 1,
            price: Number(product.price || 0),
            label: "1 unit",
          },
        },
      ];
    });
  };

  // ================= INCREASE QTY =================
  const increaseQty = (id, optionQty) => {
    setCart((prev) =>
      prev.map((item) => {
        const itemId = item._id || item.id;
        const itemOptQty =
          item.selectedOption?.quantity || item.selectedQty || 1;

        if (
          String(itemId) === String(id) &&
          Number(itemOptQty) === Number(optionQty || 1)
        ) {
          return {
            ...item,
            quantity: Number(item.quantity || 1) + 1,
          };
        }
        return item;
      })
    );
  };

  // ================= DECREASE QTY =================
  const decreaseQty = (id, optionQty) => {
    setCart((prev) =>
      prev
        .map((item) => {
          const itemId = item._id || item.id;
          const itemOptQty =
            item.selectedOption?.quantity || item.selectedQty || 1;

          if (
            String(itemId) === String(id) &&
            Number(itemOptQty) === Number(optionQty || 1)
          ) {
            const newQty = Number(item.quantity || 1) - 1;
            if (newQty <= 0) return null;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // ================= REMOVE FROM CART =================
  const removeFromCart = (id, optionQty) => {
    setCart((prev) =>
      prev.filter((item) => {
        const itemId = item._id || item.id;
        const itemOptQty =
          item.selectedOption?.quantity || item.selectedQty || 1;

        if (optionQty !== undefined && optionQty !== null) {
          return !(
            String(itemId) === String(id) &&
            Number(itemOptQty) === Number(optionQty)
          );
        }

        return String(itemId) !== String(id);
      })
    );
    toast.success("Product removed from cart");
  };

  // ================= CLEAR CART =================
  const clearCart = () => {
    setCart([]);
    toast.success("Cart cleared");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
