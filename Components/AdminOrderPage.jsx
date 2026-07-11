import { useEffect, useState } from "react";
import axios from "axios";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        "https://backend-3-axez.onrender.com/api/orders/all"
      );

      setOrders(data.orders || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `https://backend-3-axez.onrender.com/api/orders/${id}`,
        {
          status,
        }
      );

      fetchOrders();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">
        Admin Orders
      </h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="border rounded-xl shadow-md p-5 bg-white"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-3 mb-4">

              <div>
                <h2 className="text-xl font-bold">
                  {order.customerName}
                </h2>

                <p className="text-gray-500 text-sm">
                  Order ID : {order._id}
                </p>

                <p className="font-semibold mt-1">
                  Total : ₹{order.totalAmount}
                </p>
              </div>

              <span
                className={`h-fit px-4 py-2 rounded-full text-white text-sm font-semibold
                  ${
                    order.status === "Pending"
                      ? "bg-yellow-500"
                      : order.status === "Shipped"
                      ? "bg-blue-600"
                      : order.status === "Delivered"
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
              >
                {order.status}
              </span>

            </div>

            {/* Products */}
            <div className="space-y-3">

              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-center border rounded-lg p-3"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/80";
                    }}
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {item.title}
                    </h3>

                    <p className="text-gray-500">
                      Qty : {item.quantity}
                    </p>

                    <p className="text-blue-600 font-bold">
                      ₹{item.price}
                    </p>
                  </div>

                  <div className="font-bold">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}

            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 mt-5">

              <button
                disabled={order.status === "Pending"}
                onClick={() =>
                  updateStatus(order._id, "Pending")
                }
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Pending
              </button>

              <button
                disabled={order.status === "Shipped"}
                onClick={() =>
                  updateStatus(order._id, "Shipped")
                }
                className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Shipped
              </button>

              <button
                disabled={order.status === "Delivered"}
                onClick={() =>
                  updateStatus(order._id, "Delivered")
                }
                className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Delivered
              </button>

              <button
                disabled={order.status === "Cancelled"}
                onClick={() =>
                  updateStatus(order._id, "Cancelled")
                }
                className="bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>

            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;
