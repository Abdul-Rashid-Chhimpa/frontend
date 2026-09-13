import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const OrderStatus = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const { data } = await axios.get(
          `https://backend-3-axez.onrender.com/api/payments/verify/${orderId}`
        );

        if (data.success && data.data.order_status === "PAID") {
          setStatus("PAID");
        } else {
          setStatus("FAILED");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("FAILED");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-amber-500 mb-2" size={40} />
        <p className="text-gray-600">Verifying your payment status...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center border">
        {status === "PAID" ? (
          <>
            <CheckCircle2 size={60} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Payment Successful!</h1>
            <p className="text-sm text-gray-500 mt-2">
              Order ID: <span className="font-semibold text-gray-700">{orderId}</span>
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 w-full py-3 bg-slate-800 text-white font-semibold rounded-xl"
            >
              Back to Home
            </button>
          </>
        ) : (
          <>
            <XCircle size={60} className="text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Payment Failed / Pending</h1>
            <p className="text-sm text-gray-500 mt-2">
              We couldn't confirm your payment for Order ID: {orderId}
            </p>
            <button
              onClick={() => navigate("/cart")}
              className="mt-6 w-full py-3 bg-amber-500 text-black font-semibold rounded-xl"
            >
              Return to Cart
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderStatus;
