import { useEffect, useState } from "react";
import axios from "axios";
import { Package } from "lucide-react";

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-xl font-semibold">
        Loading Orders...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={70} className="mx-auto text-gray-400" />
          <h2 className="text-2xl font-semibold mt-5">
            No Orders Found
          </h2>

          <p className="text-gray-500 mt-2">
            Your placed orders will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow-md border p-6"
            >
              <div className="flex flex-wrap justify-between gap-4 mb-5">
                <div>
                  <h2 className="font-bold text-lg">
                    Order ID
                  </h2>

                  <p className="text-gray-500">
                    {order._id}
                  </p>
                </div>

                <div>
                  <h2 className="font-bold">
                    Status
                  </h2>

                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                    {order.status}
                  </span>
                </div>

                <div>
                  <h2 className="font-bold">
                    Total
                  </h2>

                  <p className="text-green-600 font-semibold">
                    ₹{order.totalAmount}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {order.items.map((item, index) => (
  <div
    key={index}
    className="flex gap-4 items-center border rounded-xl p-3"
  >
    <img
      src={
        item.image && item.image !== ""
          ? item.image
          : "/no-image.png"
      }
      alt={item.title}
      className="w-20 h-20 rounded-lg object-cover border"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = "/no-image.png";
      }}
    />

    <div className="flex-1">
      <h3 className="font-semibold">
        {item.title}
      </h3>

      <p>
        Qty : {item.quantity}
      </p>

      <p className="font-bold text-blue-600">
        ₹{item.price}
      </p>
    </div>
  </div>
))}
              </div>

              <div className="text-right mt-5 text-sm text-gray-500">
                Ordered On :
                {" "}
                {new Date(
                  order.createdAt
                ).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
