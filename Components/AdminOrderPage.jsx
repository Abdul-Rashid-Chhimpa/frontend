import { useEffect, useState } from "react";
import axios from "axios";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  const IMAGE_BASE_URL = "http://localhost:8080/uploads/";

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/orders/all"
      );

      setOrders(res.data.orders || res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:8080/api/orders/update-status/${id}`,
        { status }
      );

      fetchOrders();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-5">
        Admin Orders
      </h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="border p-4 rounded-lg shadow"
          >
            <div className="flex justify-between">
              <h2 className="font-bold">
                {order.customerName}
              </h2>

              <span>{order.status}</span>
            </div>

            <p>Total: ₹{order.totalAmount}</p>

            {/* ITEMS */}
            <div className="mt-4 space-y-3">
              {order.items?.map((item) => (
                <div
                  key={item._id}
                  className="flex gap-3 items-center border p-2 rounded"
                >
                  <img
                    src={`${IMAGE_BASE_URL}${item.image}`}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/80";
                    }}
                  />

                  <div className="flex-1">
                    <p className="font-medium">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>

            {/* STATUS BUTTONS */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() =>
                  updateStatus(order._id, "Shipped")
                }
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Ship
              </button>

              <button
                onClick={() =>
                  updateStatus(order._id, "Delivered")
                }
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Deliver
              </button>

              <button
                onClick={() =>
                  updateStatus(order._id, "Cancelled")
                }
                className="bg-red-500 text-white px-3 py-1 rounded"
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