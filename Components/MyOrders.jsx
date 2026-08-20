import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
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
  Download,
  Trash2,
} from "lucide-react";

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

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("https://backend-3-axez.onrender.com/api/orders/all");
      if (data.success) {
        const myOrders = data.orders.filter((order) => order.userId === user?._id);
        setOrders(myOrders);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // ORDER DELETE HANDLER
  const handleDeleteOrder = async (orderId) => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this order?");
    if (!confirmDelete) return;

    try {
      setDeletingId(orderId);
      const { data } = await axios.delete(`https://backend-3-axez.onrender.com/api/orders/delete/${orderId}`);
      if (data.success || data.message) {
        toast.success("Order deleted permanently");
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

  // INVOICE PRINT / DOWNLOAD PDF HANDLER
  const handleDownloadInvoice = (order) => {
    if (order.status !== "Delivered") {
      toast.error("Invoice download is available only after order is Delivered!");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups to download invoice.");
      return;
    }
    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
      : "N/A";

    const itemsList = order.items || [];
    const minRows = Math.max(10, itemsList.length);
    let itemsTableRows = "";
    for (let i = 0; i < minRows; i++) {
      const item = itemsList[i];
      if (item) {
        const price = Number(item.price || 0);
        const qty = Number(item.quantity || 1);
        const total = price * qty;
        const taxableVal = item.taxableValue || total;
        const igstAmt = item.igstAmount || total * 0.18;
        itemsTableRows += `
          <tr>
            <td style="text-align: center;">${i + 1}</td>
            <td>${item.title || ""}</td>
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
            <div class="info-row"><span class="info-label">Invoice no.</span><span>: ${order._id.slice(-6).toUpperCase()}</span></div>
            <div class="info-row"><span class="info-label">Invoice Date</span><span>: ${orderDate}</span></div>
          </div>
          <div class="info-box">
            <span class="info-title">DETAILS OF RECEIVER (BILLED TO)</span>
            <div class="info-row"><span class="info-label">Name</span><span>: ${user?.name || "Jay Bhavani Traders"}</span></div>
            <div class="info-row"><span class="info-label">Address</span><span>: ${user?.address || "Hyderabad"}</span></div>
            <div class="info-row"><span class="info-label">State</span><span>: ${user?.state || "Telangana"}</span></div>
            <div class="info-row"><span class="info-label">State Code</span><span>: ${user?.stateCode || "TS (36)"}</span></div>
            <div class="info-row"><span class="info-label">GSTIN No.</span><span>: ${user?.gstin || "36AMYPB3174E1ZX"}</span></div>
          </div>
          <div class="info-box">
            <span class="info-title">DETAILS OF CONSIGNEE (SHIPPED TO)</span>
            <div class="info-row"><span class="info-label">Name</span><span>: ${user?.name || "Jay Bhavani Traders"}</span></div>
            <div class="info-row"><span class="info-label">Address</span><span>: ${user?.address || "Hyderabad"}</span></div>
            <div class="info-row"><span class="info-label">State</span><span>: ${user?.state || "Telangana"}</span></div>
            <div class="info-row"><span class="info-label">State Code</span><span>: ${user?.stateCode || "TS (36)"}</span></div>
            <div class="info-row"><span class="info-label">GSTIN no.</span><span>: ${user?.gstin || "36AMYPB3174E1ZX"}</span></div>
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
            <td style="font-weight: bold; font-size: 12px;">Rs. ${grandTotal+taxAmt}</td>
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

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          badge: "bg-amber-500",
          icon: <Clock size={16} />,
        };
      case "Shipped":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          badge: "bg-blue-600",
          icon: <Truck size={16} />,
        };
      case "Delivered":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          badge: "bg-emerald-600",
          icon: <CheckCircle size={16} />,
        };
      case "Cancelled":
        return {
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          badge: "bg-red-600",
          icon: <XCircle size={16} />,
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          badge: "bg-gray-500",
          icon: <Package size={16} />,
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Loading Orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
          <span className="text-sm text-gray-500 font-medium">
            {orders.length} order{orders.length !== 1 ? "s" : ""} placed
          </span>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10 sm:p-14 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag size={36} className="text-indigo-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">No Orders Found</h2>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Your placed orders will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {orders.map((order) => {
              const statusStyle = getStatusStyle(order.status);
              const isDelivered = order.status === "Delivered";
              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Order Header */}
                  <div className={`px-4 sm:px-6 py-4 border-b ${statusStyle.border} ${statusStyle.bg}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status Badge & Delete */}
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs sm:text-sm font-semibold ${statusStyle.badge} shadow-sm`}
                        >
                          {statusStyle.icon}
                          {order.status}
                        </div>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          disabled={deletingId === order._id}
                          title="Delete Order Permanently"
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="px-4 sm:px-6 py-4 space-y-3">
                    {order.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-3 sm:gap-4 items-center p-3 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-gray-50 transition"
                      >
                        <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-lg sm:rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/80?text=No+Img";
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
                            <span>₹{Number(item.price || 0).toLocaleString()} / unit</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] sm:text-xs text-gray-400">Total</p>
                          <p className="font-bold text-gray-900 text-sm sm:text-base">
                            ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Action Bar */}
                  <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-gray-600">
                    <div className="flex flex-wrap gap-4">
                      {order.subTotal && (
                        <span>
                          Subtotal: <strong>₹{Number(order.subTotal).toLocaleString()}</strong>
                        </span>
                      )}
                      {order.gst && (
                        <span>
                          GST: <strong>₹{Number(order.gst).toLocaleString()}</strong>
                        </span>
                      )}
                      <span className="font-bold text-emerald-600">
                        Grand Total: ₹{Number(order.totalAmount || 0).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      disabled={!isDelivered}
                      title={
                        isDelivered
                          ? "Download Tax Invoice PDF"
                          : "Invoice available after order delivery"
                      }
                      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                        isDelivered
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow hover:shadow-md cursor-pointer"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
                      }`}
                    >
                      <Download size={15} />
                      {isDelivered ? "Download Invoice" : "Bill (Locked)"}
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

export default MyOrders;
