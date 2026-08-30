import React, { useEffect, useState } from "react";
import axios from "axios";
import { ReceiptText, ArrowLeft, Printer, Download, Search, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminBills = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "https://backend-3-axez.onrender.com/api/orders", // Apne backend ka correct endpoint rakhein
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Backend response handle karein
      if (data.orders) setOrders(data.orders);
      else if (Array.isArray(data)) setOrders(data);
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) =>
    order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.shippingAddress?.phone?.includes(searchTerm)
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ReceiptText className="text-indigo-600" /> Order Bills & Invoices
          </h1>
          <button
            onClick={fetchOrders}
            className="p-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50"
          >
            <RefreshCw size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none text-sm text-gray-700"
          />
        </div>

        {/* Orders / Bills List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading Bills...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border">
            No bills found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-3 border-b pb-2">
                  <div>
                    <p className="text-xs text-gray-400">Order ID</p>
                    <p className="font-mono text-xs font-bold text-indigo-600">
                      #{order._id.slice(-8)}
                    </p>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full">
                    ₹{order.totalPrice || order.grandTotal || 0}
                  </span>
                </div>

                <div className="text-xs text-gray-600 space-y-1 mb-4">
                  <p><span className="font-semibold">Customer:</span> {order.user?.name || order.shippingAddress?.fullName || "Guest"}</p>
                  <p><span className="font-semibold">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p><span className="font-semibold">Payment:</span> {order.paymentMethod || "COD"}</p>
                </div>

                <button
                  onClick={() => setSelectedBill(order)}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
                >
                  <ReceiptText size={14} /> View Invoice
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal / Printable Bill View */}
        {selectedBill && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
              <button
                onClick={() => setSelectedBill(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>

              {/* Invoice Printable Area */}
              <div className="border border-gray-200 p-6 rounded-2xl space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-indigo-700">TAX INVOICE</h2>
                    <p className="text-xs text-gray-500">Pedwal Store</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Invoice ID</p>
                    <p className="font-mono text-sm font-bold text-gray-800">INV-{selectedBill._id.slice(-6)}</p>
                  </div>
                </div>

                {/* Items Table */}
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="py-2 px-2">Item</th>
                      <th className="py-2 px-2">Qty</th>
                      <th className="py-2 px-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.orderItems?.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2 px-2">{item.name}</td>
                        <td className="py-2 px-2">{item.quantity}</td>
                        <td className="py-2 px-2 text-right">₹{item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Total */}
                <div className="flex justify-between items-center font-bold text-sm pt-2">
                  <span>Grand Total:</span>
                  <span className="text-indigo-600">₹{selectedBill.totalPrice || selectedBill.grandTotal}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handlePrint}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700"
                >
                  <Printer size={16} /> Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBills;
