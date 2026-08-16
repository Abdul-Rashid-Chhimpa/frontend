import { useContext, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import html2pdf from "html2pdf.js";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Package,
  Download,
  Printer,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { CartContext } from "./Context";


const ShoppingCart = () => {
  const navigate = useNavigate();
  const {
    cart,
    clearCart,
    increaseQty,
    decreaseQty,
    removeFromCart,
  } = useContext(CartContext);

  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null); // Bill View State
  const invoiceRef = useRef();

  // ===============================
  // COMPANY / ADMIN DETAILS
  // ===============================
  const companyDetails = {
    name: "ApexStore Retail Pvt. Ltd.",
    logo: "https://via.placeholder.com/150x50?text=ApexStore+Logo", // Change with your actual Logo URL
    address: "123 Business Hub, Tech Park, Sector 62",
    cityStateZip: "Noida, Uttar Pradesh - 201301",
    gstin: "09AAACA123411ZP",
    email: "support@apexstore.com",
    phone: "+91 98765 43210",
  };

  // ===============================
  // TOTALS (quantity × price)
  // ===============================
  const totalItems = useMemo(() => {
    return cart.reduce(
      (total, item) => total + Number(item.quantity || 1),
      0
    );
  }, [cart]);

  const subTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      return total + price * qty;
    }, 0);
  }, [cart]);

  const gst = useMemo(() => Math.round(subTotal * 0.18), [subTotal]);
  const grandTotal = useMemo(() => subTotal + gst, [subTotal, gst]);

  // ===============================
  // HELPERS
  // ===============================
  const getItemId = (item) => item._id || item.id;

  const getSelectedLabel = (item) => {
    if (item.selectedOption?.label) return item.selectedOption.label;
    if (item.selectedQty) return `${item.selectedQty} Piece`;
    return "1 unit";
  };

  const getOptionQty = (item) => {
    return item.selectedOption?.quantity || item.selectedQty || 1;
  };

  const getImage = (item) => {
    return (
      item.image ||
      item.images?.[0] ||
      "https://via.placeholder.com/200?text=No+Image"
    );
  };

  const continueShopping = () => navigate("/");

  // ===============================
  // DOWNLOAD PDF INVOICE
  // ===============================
  const downloadInvoicePDF = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: 8,
      filename: `Invoice_${placedOrder?.orderId || "ApexStore"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
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
        customerEmail: user.email || "N/A",
        customerPhone: user.phone || "N/A",
        items: cart.map((item) => ({
          id: String(getItemId(item)),
          title: item.name || item.title,
          brand: item.brand || "N/A",
          image: getImage(item),
          price: Number(item.price),
          quantity: Number(item.quantity || 1),
          lineTotal: Number(item.price || 0) * Number(item.quantity || 1),
          selectedOption: item.selectedOption || null,
        })),
        totalItems,
        subTotal,
        gst,
        totalAmount: Number(grandTotal),
      };

      const { data } = await axios.post(
        "https://backend-3-axez.onrender.com/api/orders/create",
        orderData
      );

      if (data.success || data.order) {
        toast.success("Order Placed Successfully");

        // Save generated bill details
        setPlacedOrder({
          ...orderData,
          orderId: data.order?._id || `ORD-${Date.now().toString().slice(-6)}`,
          date: new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        });

        clearCart();
      } else {
        toast.error(data.message || "Order Failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Unable to place order"
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // INVOICE VIEW (SUCCESS SCREEN)
  // ===============================
  if (placedOrder) {
    return (
      <div className="min-h-screen bg-gray-100 py-10 px-4">
        <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
            <CheckCircle2 size={24} />
            Order Placed Successfully!
          </div>
          <div className="flex gap-3">
            <button
              onClick={downloadInvoicePDF}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow"
            >
              <Download size={16} /> Download Invoice
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow"
            >
              <Printer size={16} /> Print
            </button>
            <button
              onClick={continueShopping}
              className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              Home
            </button>
          </div>
        </div>

        {/* PRINTABLE BILL CANVAS */}
        <div
          ref={invoiceRef}
          className="max-w-4xl mx-auto bg-white p-8 rounded-2xl border border-gray-200 shadow-xl"
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-6">
            <div>
              <img
                src={companyDetails.logo}
                alt="Company Logo"
                className="h-12 object-contain mb-2"
              />
              <h2 className="text-xl font-bold text-gray-900">
                {companyDetails.name}
              </h2>
              <p className="text-xs text-gray-500">{companyDetails.address}</p>
              <p className="text-xs text-gray-500">
                {companyDetails.cityStateZip}
              </p>
              <p className="text-xs text-gray-500">
                GSTIN: <span className="font-semibold">{companyDetails.gstin}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                Tax Invoice
              </span>
              <h3 className="text-base font-bold text-gray-800 mt-2">
                Invoice #{placedOrder.orderId}
              </h3>
              <p className="text-xs text-gray-500">
                Date: {placedOrder.date}
              </p>
              <p className="text-xs text-gray-500">
                Payment Status: <span className="text-emerald-600 font-bold">PAID</span>
              </p>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-2 gap-6 my-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Billed To (Customer)
              </h4>
              <p className="text-sm font-bold text-gray-800">
                {placedOrder.customerName}
              </p>
              <p className="text-xs text-gray-600">
                Email: {placedOrder.customerEmail}
              </p>
              <p className="text-xs text-gray-600">
                Phone: {placedOrder.customerPhone}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Sold By (Seller Info)
              </h4>
              <p className="text-sm font-bold text-gray-800">
                ApexStore Retail Support
              </p>
              <p className="text-xs text-gray-600">
                Email: {companyDetails.email}
              </p>
              <p className="text-xs text-gray-600">
                Phone: {companyDetails.phone}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left border-collapse my-6">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-xs font-semibold uppercase">
                <th className="p-3 rounded-l-lg">Item</th>
                <th className="p-3">Brand</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 text-right rounded-r-lg">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
              {placedOrder.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-3 font-medium text-gray-900">
                    {item.title}
                  </td>
                  <td className="p-3 text-xs text-gray-500">{item.brand}</td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right">
                    ₹{item.price.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-semibold">
                    ₹{item.lineTotal.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bill Summary */}
          <div className="flex justify-end border-t border-gray-200 pt-4">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal</span>
                <span>₹{placedOrder.subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>GST (18%)</span>
                <span>₹{placedOrder.gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2">
                <span>Grand Total</span>
                <span className="text-indigo-600">
                  ₹{placedOrder.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Thank you for shopping with {companyDetails.name}! This is a computer-generated invoice and requires no signature.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===============================
  // EMPTY CART
  // ===============================
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={42} className="text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              Your Cart is Empty
            </h2>
            <p className="text-gray-500 mt-3">
              Looks like you haven't added anything yet.
            </p>
            <button
              onClick={continueShopping}
              className="mt-8 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg transition"
            >
              <ArrowLeft size={18} />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===============================
  // MAIN CART VIEW
  // ===============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Shopping Cart
            </h1>
            <p className="text-gray-500 mt-1">
              {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
            </p>
          </div>
          <button
            onClick={continueShopping}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition"
          >
            <ArrowLeft size={18} />
            Continue Shopping
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-5">
            {cart.map((item, index) => {
              const itemId = getItemId(item);
              const image = getImage(item);
              const name = item.name || item.title || "Product";
              const optionLabel = getSelectedLabel(item);
              const optionQty = getOptionQty(item);

              const unitPrice = Number(item.price || 0);
              const qty = Number(item.quantity || 1);
              const lineTotal = unitPrice * qty;

              return (
                <div
                  key={`${itemId}-${optionQty}-${unitPrice}-${index}`}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col sm:flex-row gap-5 hover:shadow-lg transition"
                >
                  <div className="w-full sm:w-36 h-36 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/200?text=No+Image";
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 line-clamp-2">
                      {name}
                    </h2>

                    {item.brand && (
                      <p className="text-sm text-gray-500 mt-1">
                        Brand: {item.brand}
                      </p>
                    )}

                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                        <Package size={12} />
                        {optionLabel}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mt-3">
                      Unit Price:{" "}
                      <span className="font-medium text-gray-700">
                        ₹{unitPrice.toLocaleString()}
                      </span>
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => decreaseQty(itemId, optionQty)}
                          className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-14 text-center font-bold text-gray-800 text-lg">
                          {qty}
                        </span>
                        <button
                          onClick={() => increaseQty(itemId, optionQty)}
                          className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2">
                        <p className="text-xs text-emerald-600 font-medium">
                          Line Total
                        </p>
                        <p className="text-xl font-extrabold text-emerald-700">
                          ₹{lineTotal.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col justify-end items-end">
                    <button
                      onClick={() => removeFromCart(itemId, optionQty)}
                      className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Total Items</span>
                  <span className="font-semibold text-gray-900">
                    {totalItems}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    ₹{subTotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span className="font-semibold text-gray-900">
                    ₹{gst.toLocaleString()}
                  </span>
                </div>
              </div>

              <hr className="my-5 border-gray-100" />

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-gray-900">
                  Grand Total
                </span>
                <span className="text-2xl font-extrabold text-emerald-600">
                  ₹{grandTotal.toLocaleString()}
                </span>
              </div>

              <button
                onClick={checkoutHandler}
                disabled={loading || cart.length === 0}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-4 rounded-xl font-semibold shadow-lg transition flex items-center justify-center gap-2"
              >
                {loading ? "Placing Order..." : "Proceed To Checkout"}
              </button>

              <button
                onClick={continueShopping}
                className="w-full mt-3 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white py-3.5 rounded-xl font-semibold transition"
              >
                Continue Shopping
              </button>

              <button
                onClick={clearCart}
                disabled={cart.length === 0}
                className="w-full mt-3 border-2 border-red-400 text-red-500 hover:bg-red-500 hover:text-white py-3.5 rounded-xl font-semibold transition disabled:opacity-50"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
