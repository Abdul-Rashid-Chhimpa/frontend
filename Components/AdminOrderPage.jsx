import { useEffect, useState } from "react";
import axios from "axios";
import {
  Package,
  User,
  Hash,
  IndianRupee,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        "https://backend-3-axez.onrender.com/api/orders/all"
      );
      setOrders(data.orders || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      await axios.put(
        `https://backend-3-axez.onrender.com/api/orders/${id}`,
        { status }
      );
      await fetchOrders();
    } catch (error) {
      console.log(error);
    } finally {
      setUpdatingId(null);
    }
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

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-6 sm:py-8 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">
              Admin Orders
            </h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              {orders.length} order{orders.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition font-medium text-sm shadow-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag size={36} className="text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">No Orders Yet</h2>
            <p className="text-gray-500 mt-2">
              Orders will appear here once customers place them.
            </p>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {orders.map((order) => {
              const statusStyle = getStatusStyle(order.status);
              const isUpdating = updatingId === order._id;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Order Header */}
                  <div
                    className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${statusStyle.border} ${statusStyle.bg}`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-500" />
                          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                            {order.customerName || "Customer"}
                          </h2>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600">
                          <span className="flex items-center gap-1.5">
                            <Hash size={13} />
                            <span className="font-mono truncate max-w-[140px] sm:max-w-none">
                              {order._id}
                            </span>
                          </span>

                          <span className="flex items-center gap-1.5 font-semibold text-gray-800">
                            <IndianRupee size={13} />
                            {Number(order.totalAmount || 0).toLocaleString()}
                          </span>

                          {order.totalItems && (
                            <span className="flex items-center gap-1.5">
                              <Package size={13} />
                              {order.totalItems} items
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`inline-flex items-center gap-1.5 self-start lg:self-center px-3.5 py-1.5 rounded-full text-white text-xs sm:text-sm font-semibold ${statusStyle.badge} shadow-sm`}
                      >
                        {statusStyle.icon}
                        {order.status}
                      </div>
                    </div>
                  </div>

                  {/* Products List */}
                  <div className="px-4 sm:px-6 py-4 sm:py-5">
                    <div className="space-y-3">
                      {order.items?.map((item, index) => (
                        <div
                          key={index}
                          className="flex gap-3 sm:gap-4 items-center p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition"
                        >
                          {/* Image */}
                          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
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
                              <span>₹{Number(item.price || 0).toLocaleString()} / unit</span>
                            </div>
                          </div>

                          {/* Line Total */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-gray-400">Total</p>
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

                    {/* Extra Info (if available) */}
                    {(order.subTotal || order.gst) && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs sm:text-sm text-gray-600">
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
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">
                      Update Status
                    </p>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      <button
                        disabled={order.status === "Pending" || isUpdating}
                        onClick={() => updateStatus(order._id, "Pending")}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                      >
                        <Clock size={14} />
                        Pending
                      </button>

                      <button
                        disabled={order.status === "Shipped" || isUpdating}
                        onClick={() => updateStatus(order._id, "Shipped")}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                      >
                        <Truck size={14} />
                        Shipped
                      </button>

                      <button
                        disabled={order.status === "Delivered" || isUpdating}
                        onClick={() => updateStatus(order._id, "Delivered")}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                      >
                        <CheckCircle size={14} />
                        Delivered
                      </button>

                      <button
                        disabled={order.status === "Cancelled" || isUpdating}
                        onClick={() => updateStatus(order._id, "Cancelled")}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                      >
                        <XCircle size={14} />
                        Cancel
                      </button>
                    </div>

                    {isUpdating && (
                      <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1.5">
                        <RefreshCw size={12} className="animate-spin" />
                        Updating...
                      </p>
                    )}
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

export default AdminOrders;
