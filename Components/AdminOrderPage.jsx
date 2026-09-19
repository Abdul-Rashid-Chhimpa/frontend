import { useEffect, useState } from "react";
import axios from "axios";
import {
  Package,
  User,
  Hash,
  IndianRupee,
  Truck,
  CheckCircle,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  ShoppingBag,
  AlertTriangle,
  Trash2,
  Calendar,
} from "lucide-react";

const API_BASE = "https://backend-3-axez.onrender.com/api";

// Step config with unique colors
const STEPPER_STEPS = [
  {
    key: "Pending",
    label: "Pending",
    icon: Clock,
    color: "#F59E0B",       // amber
    bgSoft: "#FFFBEB",
    ring: "ring-amber-200",
  },
  {
    key: "Confirmed",
    label: "Confirmed",
    icon: CheckCircle2,
    color: "#4F46E5",       // indigo
    bgSoft: "#EEF2FF",
    ring: "ring-indigo-200",
  },
  {
    key: "Shipped",
    label: "Shipped",
    icon: Truck,
    color: "#2563EB",       // blue
    bgSoft: "#EFF6FF",
    ring: "ring-blue-200",
  },
  {
    key: "Delivered",
    label: "Delivered",
    icon: CheckCircle,
    color: "#059669",       // emerald
    bgSoft: "#ECFDF5",
    ring: "ring-emerald-200",
  },
];

const normalizeStatus = (status) =>
  status === "Order Confirmed" ? "Confirmed" : status || "Pending";

const getStepIndex = (status) => {
  const idx = STEPPER_STEPS.findIndex((s) => s.key === normalizeStatus(status));
  return idx >= 0 ? idx : 0;
};

const formatDateTime = (value) => {
  if (!value) return null;
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value); // already formatted string
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(value);
  }
};

// Find timestamp for a step from history / fallbacks
const getStepTime = (stepKey, order, currentStatus) => {
  const history = order.statusHistory || [];
  const found = [...history]
    .reverse()
    .find((h) => normalizeStatus(h.status) === stepKey);
  if (found?.at) return formatDateTime(found.at);

  // Current status → use statusUpdatedAt
  if (normalizeStatus(currentStatus) === stepKey && order.statusUpdatedAt) {
    return formatDateTime(order.statusUpdatedAt);
  }

  // Pending often equals order created time
  if (stepKey === "Pending" && (order.createdAt || order.orderDate)) {
    return formatDateTime(order.createdAt || order.orderDate);
  }

  return null;
};

const OrderStepper = ({ status, order }) => {
  const currentStatus = normalizeStatus(status);
  const isCancelled = currentStatus === "Cancelled";
  const currentIndex = getStepIndex(currentStatus);

  if (isCancelled) {
    return (
      <div className="w-full px-2 sm:px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold animate-[fadeIn_0.35s_ease]">
          <XCircle size={18} />
          <span>Order Cancelled</span>
          {order.statusUpdatedAt && (
            <span className="text-xs font-medium text-red-500/90">
              · {formatDateTime(order.statusUpdatedAt)}
            </span>
          )}
        </div>
      </div>
    );
  }

  const progressPercent =
    currentIndex <= 0
      ? 0
      : (currentIndex / (STEPPER_STEPS.length - 1)) * 100;

  return (
    <div className="w-full px-1 sm:px-3 py-5 sm:py-6">
      <div className="relative">
        {/* Track line */}
        <div
          className="absolute top-5 left-[10%] right-[10%] h-1 rounded-full bg-gray-200 overflow-hidden"
          aria-hidden
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progressPercent}%`,
              background:
                "linear-gradient(90deg, #F59E0B 0%, #4F46E5 40%, #2563EB 70%, #059669 100%)",
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative z-10 flex justify-between">
          {STEPPER_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;
            const timeLabel = getStepTime(step.key, order, currentStatus);

            return (
              <div
                key={step.key}
                className="flex flex-col items-center flex-1 min-w-0 px-0.5"
                style={{
                  animation: `stepPop 0.45s ease ${index * 0.08}s both`,
                }}
              >
                {/* Circle */}
                <div
                  className={`
                    relative w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center
                    border-2 transition-all duration-500 ease-out
                    ${isActive ? `ring-4 ${step.ring} scale-110` : ""}
                    ${isCompleted || isActive ? "shadow-md" : ""}
                  `}
                  style={{
                    backgroundColor:
                      isCompleted || isActive ? step.color : "#FFFFFF",
                    borderColor:
                      isCompleted || isActive ? step.color : "#D1D5DB",
                    color: isCompleted || isActive ? "#FFFFFF" : "#9CA3AF",
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle
                      size={18}
                      className="sm:w-5 sm:h-5 transition-transform duration-300"
                    />
                  ) : (
                    <Icon
                      size={16}
                      className={`sm:w-[18px] sm:h-[18px] ${
                        isActive ? "animate-pulse" : ""
                      }`}
                    />
                  )}

                  {/* Active pulse ring */}
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping opacity-30"
                      style={{ backgroundColor: step.color }}
                    />
                  )}
                </div>

                {/* Label */}
                <p
                  className={`mt-2.5 text-[10px] sm:text-xs font-bold text-center leading-tight transition-colors duration-300 ${
                    isActive || isCompleted ? "" : "text-gray-400"
                  }`}
                  style={{
                    color: isActive || isCompleted ? step.color : undefined,
                  }}
                >
                  {step.label}
                </p>

                {/* Date & time */}
                <div
                  className={`mt-1 min-h-[28px] sm:min-h-[32px] flex items-start justify-center transition-all duration-500 ${
                    timeLabel
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-1"
                  }`}
                >
                  {timeLabel && (
                    <span
                      className="text-[9px] sm:text-[10px] font-medium text-center leading-snug px-1 rounded-md"
                      style={{
                        color: step.color,
                        backgroundColor: step.bgSoft,
                      }}
                    >
                      {timeLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes stepPop {
          from { opacity: 0; transform: translateY(8px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
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
      const updatedAt = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Build history entry
      const historyEntry = { status, at: updatedAt };

      await axios.put(`${API_BASE}/orders/${id}`, {
        status,
        statusUpdatedAt: updatedAt,
        // optional: backend can store this if supported
        statusHistoryEntry: historyEntry,
      });

      setOrders((prevOrders) =>
        prevOrders.map((o) => {
          if (o._id !== id) return o;
          const prevHistory = Array.isArray(o.statusHistory)
            ? o.statusHistory
            : [];
          return {
            ...o,
            status,
            statusUpdatedAt: updatedAt,
            statusHistory: [...prevHistory, historyEntry],
          };
        })
      );
    } catch (error) {
      console.error("Update Status Error:", error);
      alert(error.response?.data?.message || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

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
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case "Pending":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          badge: "bg-amber-500",
          icon: <Clock size={14} />,
        };
      case "Confirmed":
        return {
          bg: "bg-indigo-50",
          border: "border-indigo-200",
          badge: "bg-indigo-600",
          icon: <CheckCircle2 size={14} />,
        };
      case "Shipped":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          badge: "bg-blue-600",
          icon: <Truck size={14} />,
        };
      case "Delivered":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          badge: "bg-emerald-600",
          icon: <CheckCircle size={14} />,
        };
      case "Cancelled":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          badge: "bg-red-600",
          icon: <XCircle size={14} />,
        };
      default:
        return {
          bg: "bg-gray-50",
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

        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-red-50 border border-red-200 text-red-700 shadow-sm">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

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
              const currentStatus = normalizeStatus(order.status);
              const statusStyle = getStatusStyle(currentStatus);
              const isUpdating = updatingId === order._id;
              const isDeleting = deletingId === order._id;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Header */}
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
                              {order.items.length} item
                              {order.items.length !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-start lg:items-end gap-1">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white text-xs sm:text-sm font-semibold ${statusStyle.badge} shadow-sm`}
                        >
                          {statusStyle.icon}
                          {currentStatus}
                        </div>
                        {order.statusUpdatedAt && (
                          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5">
                            <Calendar size={12} className="text-gray-400" />
                            <span>
                              Updated: {formatDateTime(order.statusUpdatedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ANIMATED STEPPER + DATE/TIME */}
                  <div className="px-2 sm:px-4 border-b border-gray-100 bg-white">
                    <OrderStepper status={currentStatus} order={order} />
                  </div>

                  {/* Products */}
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

                  {/* Actions */}
                  <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-2.5 font-medium uppercase tracking-wide">
                        Update Status
                      </p>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        <button
                          disabled={
                            currentStatus === "Pending" ||
                            isUpdating ||
                            isDeleting
                          }
                          onClick={() => updateStatus(order._id, "Pending")}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                        >
                          <Clock size={14} />
                          Pending
                        </button>
                        <button
                          disabled={
                            currentStatus === "Confirmed" ||
                            isUpdating ||
                            isDeleting
                          }
                          onClick={() => updateStatus(order._id, "Confirmed")}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                        >
                          <CheckCircle2 size={14} />
                          Confirm Order
                        </button>
                        <button
                          disabled={
                            currentStatus === "Shipped" ||
                            isUpdating ||
                            isDeleting
                          }
                          onClick={() => updateStatus(order._id, "Shipped")}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                        >
                          <Truck size={14} />
                          Shipped
                        </button>
                        <button
                          disabled={
                            currentStatus === "Delivered" ||
                            isUpdating ||
                            isDeleting
                          }
                          onClick={() => updateStatus(order._id, "Delivered")}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                        >
                          <CheckCircle size={14} />
                          Delivered
                        </button>
                        <button
                          disabled={
                            currentStatus === "Cancelled" ||
                            isUpdating ||
                            isDeleting
                          }
                          onClick={() => updateStatus(order._id, "Cancelled")}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                        >
                          <XCircle size={14} />
                          Cancel
                        </button>
                      </div>
                    </div>

                    <div className="flex items-end sm:items-center">
                      <button
                        disabled={isUpdating || isDeleting}
                        onClick={() => {
                          setOrderToDelete(order);
                          setConfirmText("");
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-600 hover:text-white transition shadow-sm"
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

        {/* Delete modal */}
        {orderToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Delete Order Permanently?
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Order ID{" "}
                <span className="font-mono font-bold text-gray-700">
                  #{orderToDelete._id}
                </span>{" "}
                will be deleted forever. This action cannot be undone.
              </p>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                  Type{" "}
                  <span className="text-rose-600 font-extrabold">DELETE</span>{" "}
                  to confirm:
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
                  disabled={
                    confirmText !== "DELETE" ||
                    deletingId === orderToDelete._id
                  }
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
