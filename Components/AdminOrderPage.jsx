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
  AlertTriangle,
  Trash2,
} from "lucide-react";

const API_BASE = "https://backend-3-axez.onrender.com/api";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Confirmation Modal State
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [confirmText, setConfirmText] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const { data } = await axios.get(`${API_BASE}/orders/all`);

      if (data && data.orders) {
        setOrders(data.orders);
      } else if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Fetch Orders Error:", error);
      setErrorMsg(
        error.response?.data?.message ||
          "Failed to load orders. Make sure to remove .populate('items.product') from backend controller."
      );
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
      await axios.put(`${API_BASE}/orders/${id}`, { status });
      await fetchOrders();
    } catch (error) {
      console.error("Update Status Error:", error);
      alert(error.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete Order Handler
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      setDeletingId(orderToDelete._id);
      await axios.delete(`${API_BASE}/orders/${orderToDelete._id}`);
      setOrderToDelete(null);
      setConfirmText("");
      await fetchOrders();
    } catch (error) {
      console.error("Delete Order Error:", error);
      alert(error.response?.data?.message || "Failed to delete order");
    } finally {
      setDeletingId(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-6 sm:py-8 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
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

        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-red-50 border border-red-200 text-red-700 shadow-sm">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

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
              const currentStatus = order.status || "Pending";
              const statusStyle = getStatusStyle(currentStatus);
              const isUpdating = updatingId === order._id;
              const isDeleting = deletingId === order._id;

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
                            {Number(order.totalAmount || 0).toLocaleString(
                              "en-IN"
                            )}
                          </span>

                          {order.items?.length > 0 && (
                            <span className="flex items-center gap-1.5">
                              <Package size={13} />
                              {order.items.length} items
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`inline-flex items-center gap-1.5 self-start lg:self-center px-3.5 py-1.5 rounded-full text-white text-xs sm:text-sm font-semibold ${statusStyle.badge} shadow-sm`}
                      >
                        {statusStyle.icon}
                        {currentStatus}
                      </div>
                    </div>
                  </div>

                  {/* Products List */}
                  <div className="px-4 sm:px-6 py-4 sm:py-5">
                    <div className="space-y-3">
                      {order.items?.map((item, index) => (
                        <div
                          key={item.id || index}
                          className="flex gap-3 sm:gap-4 items-center p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition"
                        >
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

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">
                              {item.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs sm:text-sm text-gray-500">
                              <span>Qty: {item.quantity}</span>
                              <span>•</span>
                              <span>
                                ₹
                                {Number(item.price || 0).toLocaleString(
                                  "en-IN"
                                )}{" "}
                                / unit
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-gray-400">Total</p>
                            <p className="font-bold text-gray-900 text-sm sm:text-base">
                              ₹
                              {(
                                Number(item.price || 0) *
                                Number(item.quantity || 1)
                              ).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-2.5 font-medium uppercase tracking-wide">
                        Update Status
                      </p>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        <button
                          disabled={currentStatus === "Pending" || isUpdating || isDeleting}
                          onClick={() => updateStatus(order._id, "Pending")}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                        >
                          <Clock size={14} />
                          Pending
                        </button>

                        <button
                          disabled={currentStatus === "Shipped" || isUpdating || isDeleting}
                          onClick={() => updateStatus(order._id, "Shipped")}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                        >
                          <Truck size={14} />
                          Shipped
                        </button>

                        <button
                          disabled={currentStatus === "Delivered" || isUpdating || isDeleting}
                          onClick={() => updateStatus(order._id, "Delivered")}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                        >
                          <CheckCircle size={14} />
                          Delivered
                        </button>

                        <button
                          disabled={currentStatus === "Cancelled" || isUpdating || isDeleting}
                          onClick={() => updateStatus(order._id, "Cancelled")}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                        >
                          <XCircle size={14} />
                          Cancel
                        </button>
                      </div>
                    </div>

                    {/* Permanent Delete Button */}
                    <div className="flex items-end sm:items-center">
                      <button
                        disabled={isUpdating || isDeleting}
                        onClick={() => {
                          setOrderToDelete(order);
                          setConfirmText("");
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-600 hover:text-white transition shadow-sm"
                        title="Delete Order Permanently"
                      >
                        <Trash2 size={16} />
                        Delete Order
                      </button>
                    </div>

                    {isUpdating && (
                      <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1.5">
                        <RefreshCw size={12} className="animate-spin" />
                        Updating status...
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {orderToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>

              <h3 className="text-xl font-bold text-gray-900">
                Delete Order Permanently?
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Order ID <span className="font-mono font-bold text-gray-700">#{orderToDelete._id}</span> will be deleted forever. This action cannot be undone.
              </p>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                  Type <span className="text-rose-600 font-extrabold">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE here..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setOrderToDelete(null);
                    setConfirmText("");
                  }}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  disabled={confirmText !== "DELETE" || deletingId === orderToDelete._id}
                  onClick={handleDeleteOrder}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md"
                >
                  {deletingId === orderToDelete._id ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Confirm Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
