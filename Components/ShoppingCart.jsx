import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Package,
  Printer,
  CheckCircle2,
} from "lucide-react";
import { CartContext } from "./Context";

const ShoppingCart = () => {
  const navigate = useNavigate();
  const { cart, clearCart, increaseQty, decreaseQty, removeFromCart } =
    useContext(CartContext);

  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const companyDetails = {
    name: "ApexStore Retail Pvt. Ltd.",
    address: "123 Business Hub, Tech Park, Sector 62",
    cityStateZip: "Noida, Uttar Pradesh - 201301",
    gstin: "09AAACA123411ZP",
    email: "support@apexstore.com",
    phone: "+91 98765 43210",
  };

  const totalItems = useMemo(() => {
    return cart.reduce((total, item) => total + Number(item.quantity || 1), 0);
  }, [cart]);

  // 🔥 DYNAMIC SUBTOTAL CALCULATION
  const subTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      return total + price * qty;
    }, 0);
  }, [cart]);

  // 🔥 DYNAMIC ITEM-LEVEL GST CALCULATION
  const gst = useMemo(() => {
    return cart.reduce((totalGst, item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      // Agar backend product me gst dynamic h to wo lega, warna default 18%
      const gstRate = item.gst !== undefined && item.gst !== "" ? Number(item.gst) : 18;
      const itemSubtotal = price * qty;
      const itemGst = (itemSubtotal * gstRate) / 100;
      return totalGst + itemGst;
    }, 0);
  }, [cart]);

  const grandTotal = useMemo(() => Math.round(subTotal + gst), [subTotal, gst]);

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

  // NATIVE PRINT / DOWNLOAD PDF HANDLER
  const handlePrintOrDownload = () => {
    window.print();
  };

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
        items: cart.map((item) => {
          const gstRate = item.gst !== undefined && item.gst !== "" ? Number(item.gst) : 18;
          const lineTotal = Number(item.price || 0) * Number(item.quantity || 1);
          const itemGst = (lineTotal * gstRate) / 100;

          return {
            id: String(getItemId(item)),
            title: item.name || item.title,
            brand: item.brand || "N/A",
            image: getImage(item),
            price: Number(item.price),
            quantity: Number(item.quantity || 1),
            gstRate: gstRate, // 🔥 Dynamic GST Rate saved in Order Item
            gstAmount: Math.round(itemGst),
            lineTotal: lineTotal,
            selectedOption: item.selectedOption || null,
          };
        }),
        totalItems,
        subTotal,
        gst: Math.round(gst), // Dynamic GST Total
        totalAmount: Number(grandTotal),
      };

      const { data } = await axios.post(
        "https://backend-3-axez.onrender.com/api/orders/create",
        orderData
      );

      if (data.success || data.order) {
        toast.success("Order Placed Successfully");

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
      toast.error(err.response?.data?.message || "Unable to place order");
    } finally {
      setLoading(false);
    }
  };

  // INVOICE RESPONSIVE VIEW
  if (placedOrder) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 px-3 sm:px-6">
        {/* Print Styles CSS inject */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-invoice, #printable-invoice * {
              visibility: visible;
            }
            #printable-invoice {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              box-shadow: none !important;
              border: none !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        {/* Action Header */}
        <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-base sm:text-lg">
            <CheckCircle2 size={22} />
            Order Placed Successfully!
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrintOrDownload}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shadow"
            >
              <Printer size={16} /> Save / Download PDF (Print)
            </button>
            <button
              onClick={continueShopping}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition"
            >
              Home
            </button>
          </div>
        </div>

        {/* INVOICE CONTAINER */}
        <div
          id="printable-invoice"
          className="max-w-4xl mx-auto bg-white p-4 sm:p-8 rounded-2xl border border-gray-200 shadow-xl overflow-hidden"
        >
          {/* Company Branding & Invoice Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-gray-200 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-lg">
                  A
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {companyDetails.name}
                </h2>
              </div>
              <p className="text-xs text-gray-500">{companyDetails.address}</p>
              <p className="text-xs text-gray-500">
                {companyDetails.cityStateZip}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                GSTIN: <span className="font-semibold">{companyDetails.gstin}</span>
              </p>
            </div>

            <div className="sm:text-right w-full sm:w-auto">
              <span className="inline-block bg-indigo-100 text-indigo-800 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                Tax Invoice
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-gray-800 mt-2 break-all sm:break-normal">
                Invoice #{placedOrder.orderId}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Date: {placedOrder.date}
              </p>
              <p className="text-xs text-gray-500">
                Payment Status:{" "}
                <span className="text-emerald-600 font-bold">PAID</span>
              </p>
            </div>
          </div>

          {/* Customer & Seller Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Billed To (Customer)
              </h4>
              <p className="text-xs sm:text-sm font-bold text-gray-800">
                {placedOrder.customerName}
              </p>
              <p className="text-xs text-gray-600 break-all">
                Email: {placedOrder.customerEmail}
              </p>
              <p className="text-xs text-gray-600">
                Phone: {placedOrder.customerPhone}
              </p>
            </div>

            <div>
              <h4 className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Sold By (Seller Info)
              </h4>
              <p className="text-xs sm:text-sm font-bold text-gray-800">
                ApexStore Retail Support
              </p>
              <p className="text-xs text-gray-600 break-all">
                Email: {companyDetails.email}
              </p>
              <p className="text-xs text-gray-600">
                Phone: {companyDetails.phone}
              </p>
            </div>
          </div>

          {/* Table View */}
          <div className="overflow-x-auto my-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-xs font-semibold uppercase">
                  <th className="p-3 rounded-l-lg">Item</th>
                  <th className="p-3">Brand</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-center">GST %</th>
                  <th className="p-3 text-right rounded-r-lg">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm text-gray-800">
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
                    <td className="p-3 text-center text-xs font-semibold text-indigo-600">
                      {item.gstRate}%
                    </td>
                    <td className="p-3 text-right font-semibold">
                      ₹{item.lineTotal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotal & Totals */}
          <div className="flex justify-end border-t border-gray-200 pt-4">
            <div className="w-full sm:w-64 space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal</span>
                <span>₹{placedOrder.subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>GST Total</span>
                <span>₹{placedOrder.gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-bold text-gray-900 border-t border-gray-200 pt-2">
                <span>Grand Total</span>
                <span className="text-indigo-600">
                  ₹{placedOrder.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-4 border-t border-gray-100 text-center">
            <p className="text-[10px] sm:text-xs text-gray-400">
              Thank you for shopping with {companyDetails.name}! Computer generated invoice.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // CART VIEW & EMPTY CART
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={36} className="text-indigo-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Your Cart is Empty
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Looks like you haven't added anything yet.
            </p>
            <button
              onClick={continueShopping}
              className="mt-6 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow transition text-sm"
            >
              <ArrowLeft size={18} />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
              Shopping Cart
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
            </p>
          </div>
          <button
            onClick={continueShopping}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition text-sm"
          >
            <ArrowLeft size={18} />
            Continue Shopping
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => {
              const itemId = getItemId(item);
              const image = getImage(item);
              const name = item.name || item.title || "Product";
              const optionLabel = getSelectedLabel(item);
              const optionQty = getOptionQty(item);

              const unitPrice = Number(item.price || 0);
              const qty = Number(item.quantity || 1);
              const lineTotal = unitPrice * qty;
              const itemGstRate = item.gst !== undefined && item.gst !== "" ? Number(item.gst) : 18;

              return (
                <div
                  key={`${itemId}-${optionQty}-${unitPrice}-${index}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 hover:shadow-md transition"
                >
                  <div className="w-full sm:w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2">
                      {name}
                    </h2>

                    {item.brand && (
                      <p className="text-xs text-gray-500 mt-1">
                        Brand: {item.brand}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full">
                        <Package size={12} />
                        {optionLabel}
                      </span>
                      {/* 🔥 GST RATE TAG */}
                      <span className="inline-flex items-center text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                        GST: {itemGstRate}%
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      Unit Price:{" "}
                      <span className="font-medium text-gray-700">
                        ₹{unitPrice.toLocaleString()}
                      </span>
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => decreaseQty(itemId, optionQty)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center font-bold text-gray-800 text-sm">
                          {qty}
                        </span>
                        <button
                          onClick={() => increaseQty(itemId, optionQty)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] text-gray-500">Total</p>
                        <p className="text-base font-extrabold text-emerald-600">
                          ₹{lineTotal.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col justify-end items-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <button
                      onClick={() => removeFromCart(itemId, optionQty)}
                      className="flex items-center gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition text-xs font-medium"
                    >
                      <Trash2 size={15} />
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
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

                {/* 🔥 DYNAMIC GST CALCULATION DISPLAY */}
                <div className="flex justify-between text-gray-600">
                  <span>Estimated GST</span>
                  <span className="font-semibold text-gray-900">
                    ₹{Math.round(gst).toLocaleString()}
                  </span>
                </div>
              </div>

              <hr className="my-4 border-gray-100" />

              <div className="flex justify-between items-center mb-5">
                <span className="text-base font-bold text-gray-900">
                  Grand Total
                </span>
                <span className="text-xl font-extrabold text-emerald-600">
                  ₹{grandTotal.toLocaleString()}
                </span>
              </div>

              <button
                onClick={checkoutHandler}
                disabled={loading || cart.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold shadow transition text-sm"
              >
                {loading ? "Placing Order..." : "Proceed To Checkout"}
              </button>

              <button
                onClick={clearCart}
                disabled={cart.length === 0}
                className="w-full mt-2.5 border border-red-300 text-red-500 hover:bg-red-50 py-2.5 rounded-xl font-semibold transition text-xs disabled:opacity-50"
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
