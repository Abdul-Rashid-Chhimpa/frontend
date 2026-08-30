import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ReceiptText,
  ArrowLeft,
  Printer,
  Search,
  RefreshCw,
  Eye,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Helper function: Convert number to Words (Indian Currency Format)
const numberToWords = (num) => {
  if (!num) return "Rupees Zero Only";
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
    "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (n) => {
    if ((n = n.toString()).length > 9) return "overflow";
    let n_array = ("000000000" + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n_array) return "";
    let str = "";
    str += n_array[1] != 0 ? (a[Number(n_array[1])] || b[n_array[1][0]] + " " + a[n_array[1][1]]) + "Crore " : "";
    str += n_array[2] != 0 ? (a[Number(n_array[2])] || b[n_array[2][0]] + " " + a[n_array[2][1]]) + "Lakh " : "";
    str += n_array[3] != 0 ? (a[Number(n_array[3])] || b[n_array[3][0]] + " " + a[n_array[3][1]]) + "Thousand " : "";
    str += n_array[4] != 0 ? (a[Number(n_array[4])] || b[n_array[4][0]] + " " + a[n_array[4][1]]) + "Hundred " : "";
    str += n_array[5] != 0 ? ((str != "") ? "and " : "") + (a[Number(n_array[5])] || b[n_array[5][0]] + " " + a[n_array[5][1]]) : "";
    return str;
  };
  const amount = Math.floor(num);
  return `Rupees ${inWords(amount).trim()} Only`;
};

const AdminBills = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const companyDetails = {
    name: "PEDWAL LIFE CREATION",
    address: "NAGAUR-341001, RAJASTHAN",
    email: "pedwalifecreation4u@gmail.com",
    phone: "+91 9887663598, +91 7412945826",
    gstin: "08AMKPA3583G1Z2",
    bankName: "IDFC FIRST BANK",
    accountNo: "10281392354",
    ifscCode: "IDFB0043314",
    bankAddress: "NAGAUR-341001 (RAJ)",
    proprietor: "Mohammed Arif",
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "https://backend-3-axez.onrender.com/api/orders/all",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success && data.orders) {
        setOrders(data.orders);
      } else if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
      toast.error("Failed to fetch bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDeleteOrder = async (orderId) => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this order/bill?");
    if (!confirmDelete) return;

    try {
      setDeletingId(orderId);
      const { data } = await axios.delete(
        `https://backend-3-axez.onrender.com/api/orders/delete/${orderId}`
      );
      if (data.success || data.message) {
        toast.success("Order/Bill deleted successfully");
        setOrders((prev) => prev.filter((item) => item._id !== orderId));
      } else {
        toast.error(data.message || "Failed to delete order");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Server Error: Unable to delete");
    } finally {
      setDeletingId(null);
    }
  };

  // EXACT INVOICE PRINT / DOWNLOAD PDF HANDLER (MATCHING MYORDERS)
  const handlePrintInvoice = (order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups to view/print invoice.");
      return;
    }

    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
      : "N/A";

    const itemsList = order.items || order.orderItems || [];
    const minRows = Math.max(10, itemsList.length);
    let itemsTableRows = "";

    for (let i = 0; i < minRows; i++) {
      const item = itemsList[i];
      if (item) {
        const price = Number(item.price || 0);
        const qty = Number(item.quantity || item.qty || 1);
        const total = price * qty;
        const taxableVal = item.taxableValue || total;
        const igstAmt = item.igstAmount || total * 0.18;
        itemsTableRows += `
          <tr>
            <td style="text-align: center;">${i + 1}</td>
            <td>${item.title || item.name || "Product"}</td>
            <td style="text-align: center;">${item.hsnCode || "8203"}</td>
            <td style="text-align: center;">${qty}</td>
            <td style="text-align: center;">${item.unit || "PCS"}</td>
            <td style="text-align: right;">Rs. ${price.toFixed(2)}</td>
            <td style="text-align: right;">${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            <td style="text-align: right;">Rs. ${taxableVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            <td style="text-align: center;">${item.discount || "-"}</td>
            <td style="text-align: center;">-</td>
            <td style="text-align: center;">-</td>
            <td style="text-align: center;">-</td>
            <td style="text-align: center;">-</td>
            <td style="text-align: center;">18%</td>
            <td style="text-align: right;">Rs. ${igstAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          </tr>
        `;
      } else {
        itemsTableRows += `
          <tr>
            <td>&nbsp;</td>
            <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
          </tr>
        `;
      }
    }

    const subTotal = Number(order.subTotal || order.totalAmount || 0);
    const taxAmt = Number(order.gst || subTotal * 0.18);
    const grandTotal = Number(order.totalAmount || subTotal + taxAmt);
    const amountInWords = numberToWords(grandTotal);

    const customerName = order.customerName || order.user?.name || "Customer";
    const customerAddress = order.shippingAddress?.address || order.user?.address || "N/A";
    const customerState = order.shippingAddress?.state || order.user?.state || "Rajasthan";
    const customerGstin = order.gstin || order.user?.gstin || "N/A";

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice #${order._id}</title>
      <style>
        * { box-sizing: border-box; font-family: Arial, sans-serif; font-size: 11px; }
        body { padding: 10px; background: #fff; color: #000; }
        .invoice-container { width: 100%; max-width: 900px; margin: 0 auto; border: 2px solid #000; padding: 10px; }
        .company-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 5px; }
        .company-name { font-size: 20px; font-weight: bold; letter-spacing: 0.5px; }
        .company-sub { font-size: 11px; font-weight: bold; margin-top: 2px; }
        .info-grid { display: grid; grid-template-columns: 1.2fr 1.2fr 1fr; border: 1px solid #000; margin-bottom: 5px; }
        .info-box { padding: 5px; border-right: 1px solid #000; }
        .info-box:last-child { border-right: none; }
        .info-title { font-weight: bold; text-decoration: underline; font-size: 10px; margin-bottom: 4px; display: block; text-transform: uppercase; }
        .info-row { display: flex; margin-bottom: 2px; }
        .info-label { width: 85px; font-weight: bold; }
        table.invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
        table.invoice-table th, table.invoice-table td { border: 1px solid #000; padding: 4px 3px; font-size: 10px; }
        table.invoice-table th { background: #f2f2f2; text-align: center; font-weight: bold; }
        .total-row td { font-weight: bold; }
        .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
        .summary-table td { border: 1px solid #000; padding: 4px; font-size: 11px; }
        .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr; border: 1px solid #000; margin-top: 5px; }
        .footer-left { border-right: 1px solid #000; padding: 5px; }
        .footer-right { padding: 5px; display: flex; flex-direction: column; justify-content: space-between; }
        @media print { body { padding: 0; } .invoice-container { border: 2px solid #000; } }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="company-header">
          <div class="company-name">${companyDetails.name}</div>
          <div class="company-sub">${companyDetails.address}</div>
          <div class="company-sub">E-mail Address:- ${companyDetails.email}</div>
          <div class="company-sub">Contact no. ${companyDetails.phone}</div>
        </div>
        <div class="info-grid">
          <div class="info-box">
            <span class="info-title">INVOICE DETAILS</span>
            <div class="info-row"><span class="info-label">GSTIN no.</span><span>: ${companyDetails.gstin}</span></div>
            <div class="info-row"><span class="info-label">Name</span><span>: ${companyDetails.name}</span></div>
            <div class="info-row"><span class="info-label">Address</span><span>: ${companyDetails.address}</span></div>
            <div class="info-row"><span class="info-label">Invoice no.</span><span>: ${order._id ? order._id.slice(-6).toUpperCase() : "N/A"}</span></div>
            <div class="info-row"><span class="info-label">Invoice Date</span><span>: ${orderDate}</span></div>
          </div>
          <div class="info-box">
            <span class="info-title">DETAILS OF RECEIVER (BILLED TO)</span>
            <div class="info-row"><span class="info-label">Name</span><span>: ${customerName}</span></div>
            <div class="info-row"><span class="info-label">Address</span><span>: ${customerAddress}</span></div>
            <div class="info-row"><span class="info-label">State</span><span>: ${customerState}</span></div>
            <div class="info-row"><span class="info-label">GSTIN No.</span><span>: ${customerGstin}</span></div>
          </div>
          <div class="info-box">
            <span class="info-title">DETAILS OF CONSIGNEE (SHIPPED TO)</span>
            <div class="info-row"><span class="info-label">Name</span><span>: ${customerName}</span></div>
            <div class="info-row"><span class="info-label">Address</span><span>: ${customerAddress}</span></div>
            <div class="info-row"><span class="info-label">State</span><span>: ${customerState}</span></div>
            <div class="info-row"><span class="info-label">GSTIN no.</span><span>: ${customerGstin}</span></div>
          </div>
        </div>
        <table class="invoice-table">
          <thead>
            <tr>
              <th rowspan="2">S.R. NO.</th>
              <th rowspan="2">Description</th>
              <th rowspan="2">HSN Code</th>
              <th rowspan="2">Qty.</th>
              <th rowspan="2">Unit</th>
              <th rowspan="2">Rs/ Unit</th>
              <th rowspan="2">Total</th>
              <th rowspan="2">Taxable Value</th>
              <th rowspan="2">Discount</th>
              <th colspan="2">CGST</th>
              <th colspan="2">SGST</th>
              <th colspan="2">IGST</th>
            </tr>
            <tr>
              <th>Rate</th><th>Amount</th><th>Rate</th><th>Amount</th><th>Rate</th><th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTableRows}
            <tr class="total-row">
              <td colspan="6" style="text-align: right;">Total</td>
              <td style="text-align: right;">Rs. ${subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              <td style="text-align: right;">Rs. ${subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
              <td></td><td></td><td></td><td></td><td></td><td></td>
              <td style="text-align: right;">Rs. ${taxAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>
        <table class="summary-table">
          <tr>
            <td style="width: 200px; font-weight: bold;">Total Invoice Value (in figure)</td>
            <td style="font-weight: bold; font-size: 12px;">Rs. ${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Total Invoice Value (in words)</td>
            <td style="font-weight: bold; font-size: 11px;">${amountInWords}</td>
          </tr>
        </table>
        <div class="footer-grid">
          <div class="footer-left">
            <strong>TERMS & CONDITIONS AS BELOW:-</strong><br/>
            1. Goods once sold will not be taken back.<br/>
            2. 18% per month will be charged on the bill if not made within 30 days.<br/>
            3. Subjected to 'RAJASTHAN' jurisdiction only.<br/><br/>
            <strong>BANK DETAILS :</strong><br/>
            NAME: ${companyDetails.name}<br/>
            A/C NO.: ${companyDetails.accountNo}<br/>
            IFSC CODE : ${companyDetails.ifscCode}<br/>
            BANK: ${companyDetails.bankName}<br/>
            ADDRESS: ${companyDetails.bankAddress}
          </div>
          <div class="footer-right">
            <div><strong>For: ${companyDetails.name}</strong></div>
            <div style="margin-top: 40px;">
              Signature : ________________________<br/>
              Name : ${companyDetails.proprietor}<br/>
              Status : PROPRIETOR<br/>
              Date : ${orderDate}
            </div>
          </div>
        </div>
      </div>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const filteredOrders = orders.filter((order) => {
    const custName = order.customerName || order.user?.name || "";
    const orderId = order._id || "";
    return (
      orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      custName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
            <ReceiptText className="text-indigo-600" /> Admin Bills & GST Invoices
          </h1>
          <button
            onClick={fetchOrders}
            className="p-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 flex items-center gap-2 text-sm font-medium text-gray-600"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID or Customer Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none text-sm text-gray-700"
          />
        </div>

        {/* Orders / Bills List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 font-medium">Loading Orders & Bills...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border">
            No bills or orders found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => {
              const amount = Number(order.totalAmount || order.totalPrice || 0);
              const name = order.customerName || order.user?.name || "Customer";
              const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A";
              const itemsCount = (order.items || order.orderItems || []).length;

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3 border-b pb-2">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-semibold">Order ID</p>
                        <p className="font-mono text-xs font-bold text-indigo-600">
                          #{order._id ? order._id.slice(-8) : "N/A"}
                        </p>
                      </div>
                      <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full">
                        ₹{amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 space-y-1 mb-4">
                      <p><span className="font-semibold text-gray-800">Customer:</span> {name}</p>
                      <p><span className="font-semibold text-gray-800">Date:</span> {date}</p>
                      <p><span className="font-semibold text-gray-800">Total Items:</span> {itemsCount}</p>
                      <p><span className="font-semibold text-gray-800">Status:</span> {order.status || "Pending"}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                    <button
                      onClick={() => handlePrintInvoice(order)}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Printer size={15} /> Print GST Invoice
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      disabled={deletingId === order._id}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl border border-gray-200 transition disabled:opacity-50"
                      title="Delete Bill"
                    >
                      <Trash2 size={16} />
                    </button>
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

export default AdminBills;
