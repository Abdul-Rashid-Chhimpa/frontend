import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Package,
  Hash,
  IndianRupee,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Calendar,
  ShoppingBag,
  Download,
  Trash2,
} from "lucide-react";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const companyDetails = {
    name: "ApexStore Retail Pvt. Ltd.",
    address: "123 Business Hub, Tech Park, Sector 62",
    cityStateZip: "Noida, Uttar Pradesh - 201301",
    gstin: "09AAACA123411ZP",
    email: "support@apexstore.com",
    phone: "+91 98765 43210",
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        "https://backend-3-axez.onrender.com/api/orders/all"
      );
      if (data.success) {
        const myOrders = data.orders.filter(
          (order) => order.userId === user?._id
        );
        setOrders(myOrders);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // ORDER DELETE HANDLER
  const handleDeleteOrder = async (orderId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this order?"
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(orderId);
      const { data } = await axios.delete(
        `https://backend-3-axez.onrender.com/api/orders/delete/${orderId}`
      );

      if (data.success || data.message) {
        toast.success("Order deleted permanently");
        setOrders((prev) => prev.filter((item) => item._id !== orderId));
      } else {
        toast.error(data.message || "Failed to delete order");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Server Error: Unable to delete");
    } finally {
      setDeletingId(null);
    }
  };

  // INVOICE PRINT / DOWNLOAD PDF HANDLER
  const handleDownloadInvoice = (order) => {
    if (order.status !== "Delivered") {
      toast.error("Invoice download is available only after order is Delivered!");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups to download invoice.");
      return;
    }

    const itemsHtml = order.items
      ?.map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${Number(item.price || 0).toLocaleString()}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}</td>
        </tr>
      `
      )
      .join("");

    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "N/A";

    const subTotal = order.subTotal || order.totalAmount || 0;
    const gst = order.gst || 0;
    const grandTotal = order.totalAmount || 0;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${order._id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 20px; color: #333; }
            .invoice-box { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 10px; }
            .flex-between { display: flex; justify-content: space-between; align-items: flex-start; }
            .header-title { font-size: 24px; font-weight: bold; color: #4F46E5; margin: 0; }
            .badge { background: #DEF7EC; color: #03543F; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th { background: #F9FAFB; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6B7280; }
            .totals { width: 250px; margin-left: auto; margin-top: 20px; font-size: 14px; }
            .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
            .grand-total { font-size: 16px; font-weight: bold; border-top: 1px solid #ddd; padding-top: 8px; color: #059669; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="flex-between">
              <div>
                <h2 class="header-title">${companyDetails.name}</h2>
                <p style="font-size: 12px; color: #666; margin: 4px 0;">${companyDetails.address}</p>
                <p style="font-size: 12px; color: #666; margin: 0;">${companyDetails.cityStateZip}</p>
                <p style="font-size: 12px; color: #666; margin-top: 4px;">GSTIN: <strong>${companyDetails.gstin}</strong></p>
              </div>
              <div style="text-align: right;">
                <span class="badge">TAX INVOICE</span>
                <h3 style="font-size: 14px; margin: 8px 0 2px 0;">Invoice #${order._id}</h3>
                <p style="font-size: 12px; color: #666; margin: 0;">Date: ${orderDate}</p>
              </div>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />

            <div class="flex-between" style="font-size: 12px; background: #F9FAFB; padding: 12px; border-radius: 8px;">
              <div>
                <strong style="color: #9CA3AF; text-transform: uppercase;">Customer Info:</strong>
                <p style="margin: 4px 0 0 0; font-weight: bold; font-size: 14px;">${user?.name || "Customer"}</p>
                <p style="margin: 2px 0 0 0; color: #4B5563;">${user?.email || "N/A"}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="totals">
              <div><span>Subtotal:</span> <span>₹${Number(subTotal).toLocaleString()}</span></div>
              <div><span>GST (18%):</span> <span>₹${Number(gst).toLocaleString()}</span></div>
              <div class="grand-total"><span>Grand Total:</span> <span>₹${Number(grandTotal).toLocaleString()}</span></div>
            </div>

            <div style="margin-top: 40px; text-align: center; font-size: 11px; color: #9CA3AF; border-top: 1px solid #eee; padding-top: 10px;">
              Thank you for shopping with ${companyDetails.name}!
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          badge: "bg-amber-500",
          icon: <Clock size={14} />,
        };
      case "Shipped":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          badge: "bg-blue-600",
          icon: <Truck size={14} />,
        };
      case "Delivered":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          badge: "bg-emerald-600",
          icon: <CheckCircle size={14} />,
        };
      case "Cancelled":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          badge: "bg-red-600",
          icon: <XCircle size={14} />,
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          badge: "bg-gray-500",
          icon: <Package size={14} />,
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading Orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-6 sm:py-10 px-3 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-indigo-700 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            My Orders
          </h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            {orders.length} order{orders.length !== 1 ? "s" : ""} placed
          </p>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10 sm:p-14 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag size={36} className="text-indigo-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              No Orders Found
            </h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Your placed orders will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {orders.map((order) => {
              const statusStyle = getStatusStyle(order.status);
              const isDelivered = order.status === "Delivered";

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Order Header */}
                  <div
                    className={`px-4 sm:px-6 py-4 border-b ${statusStyle.border} ${statusStyle.bg}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <Hash size={14} />
                          <span className="font-mono truncate max-w-[180px] sm:max-w-none">
                            {order._id}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm">
                          <span className="flex items-center gap-1.5 font-semibold text-gray-800">
                            <IndianRupee size={14} />
                            {Number(order.totalAmount || 0).toLocaleString()}
                          </span>

                          {order.createdAt && (
                            <span className="flex items-center gap-1.5 text-gray-500">
                              <Calendar size={13} />
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs sm:text-sm font-semibold ${statusStyle.badge} shadow-sm`}
                        >
                          {statusStyle.icon}
                          {order.status}
                        </div>

                        {/* Delete Order Button */}
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          disabled={deletingId === order._id}
                          title="Delete Order Permanently"
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="px-4 sm:px-6 py-4 space-y-3">
                    {order.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-3 sm:gap-4 items-center p-3 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-gray-50 transition"
                      >
                        {/* Image */}
                        <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-lg sm:rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/80?text=No+Img";
                            }}
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">
                            {item.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs sm:text-sm text-gray-500">
                            <span>Qty: {item.quantity}</span>
                            <span>•</span>
                            <span>
                              ₹{Number(item.price || 0).toLocaleString()} / unit
                            </span>
                          </div>
                        </div>

                        {/* Line Total */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] sm:text-xs text-gray-400">
                            Total
                          </p>
                          <p className="font-bold text-gray-900 text-sm sm:text-base">
                            ₹
                            {(
                              Number(item.price || 0) *
                              Number(item.quantity || 1)
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Action Bar */}
                  <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-gray-600">
                    <div className="flex flex-wrap gap-4">
                      {order.subTotal && (
                        <span>
                          Subtotal:{" "}
                          <strong>
                            ₹{Number(order.subTotal).toLocaleString()}
                          </strong>
                        </span>
                      )}
                      {order.gst && (
                        <span>
                          GST:{" "}
                          <strong>
                            ₹{Number(order.gst).toLocaleString()}
                          </strong>
                        </span>
                      )}
                      <span className="font-bold text-emerald-600">
                        Grand Total: ₹
                        {Number(order.totalAmount || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Bill Download Button (Active only when Delivered) */}
                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      disabled={!isDelivered}
                      title={
                        isDelivered
                          ? "Download Tax Invoice PDF"
                          : "Invoice available after order delivery"
                      }
                      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                        isDelivered
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow hover:shadow-md cursor-pointer"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
                      }`}
                    >
                      <Download size={15} />
                      {isDelivered ? "Download Invoice" : "Bill (Locked)"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
