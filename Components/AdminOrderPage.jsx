import { useEffect, useState } from "react";
import axios from "axios";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  const IMAGE_BASE_URL = "https://backend-3-axez.onrender.com/uploads/";

  const fetchOrders = async () => {
    try {
      const res = await axios.get(
        "https://backend-3-axez.onrender.com/api/orders/all"
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
  `https://backend-3-axez.onrender.com/api/orders/${id}`,
  {
    status,
  }
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

             <span
  className={`px-3 py-1 rounded-full text-white text-sm font-semibold

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
            <div className="flex flex-wrap gap-3 mt-5">

  <button
    disabled={order.status === "Pending"}
    onClick={() =>
      updateStatus(order._id, "Pending")
    }
    className="px-4 py-2 rounded-lg bg-yellow-500 text-white disabled:opacity-50"
  >
    Pending
  </button>

  <button
    disabled={order.status === "Shipped"}
    onClick={() =>
      updateStatus(order._id, "Shipped")
    }
    className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
  >
    Shipped
  </button>

  <button
    disabled={order.status === "Delivered"}
    onClick={() =>
      updateStatus(order._id, "Delivered")
    }
    className="px-4 py-2 rounded-lg bg-green-600 text-white disabled:opacity-50"
  >
    Delivered
  </button>

  <button
    disabled={order.status === "Cancelled"}
    onClick={() =>
      updateStatus(order._id, "Cancelled")
    }
    className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50"
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
