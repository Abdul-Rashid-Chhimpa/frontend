import { useEffect, useState } from "react";
import axios from "axios";
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
} from "lucide-react";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

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
    } finally {
      setLoading(false);
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
                      <div
                        className={`inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-full text-white text-xs sm:text-sm font-semibold ${statusStyle.badge} shadow-sm`}
                      >
                        {statusStyle.icon}
                        {order.status}
                      </div>
                    </div>
                  </div>

                  {/* Items */}
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

                  {/* Footer Summary */}
                  {(order.subTotal || order.gst) && (
                    <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-4 text-xs sm:text-sm text-gray-600">
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
                      <span className="ml-auto font-bold text-emerald-600">
                        Grand Total: ₹
                        {Number(order.totalAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
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
