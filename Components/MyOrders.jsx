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
  Printer,
} from "lucide-react";

// Helper function: Convert number to Words (Indian Currency Format)
const numberToWords = (num) => {
  if (!num || isNaN(num)) return "Rupees Zero Only";
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
  const user = JSON.parse(localStorage.getItem("user")) || {};

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
      // 1. Fetch all Products first to create a dynamic GST Map
      let gstMap = {};
      try {
        const productRes = await axios.get("https://backend-3-axez.onrender.com/api/products");
        const productList = productRes.data.products || productRes.data || [];
        
        productList.forEach((prod) => {
          const id = String(prod._id);
          // Store exact GST rate from database
          gstMap[id] = prod.gst !== undefined ? Number(prod.gst) : 0;
        });
      } catch (prodErr) {
        console.error("Error fetching products database for GST mapping:", prodErr);
      }

      // 2. Fetch User Orders
      const { data } = await axios.get("https://backend-3-axez.onrender.com/api/orders/all");
      if (data.success) {
       // MyOrders.jsx ke inside fetchOrders() me filter logic update:
let myOrders = data.orders.filter(
  (order) => order.userId === user?._id && !order.deletedByUser
);

        // 3. Dynamic GST Injector based on Product ID or Name match
        myOrders = myOrders.map((order) => {
          const updatedItems = order.items?.map((item) => {
            // Extract Product ID
            const targetId = String(
              item.productId?._id || item.productId || item.id || item._id || ""
            );
            
            // Check GST priority: Order Item GST -> Database Product GST Map -> Default 0
            let finalGst = 0;
            if (item.gst !== undefined && item.gst !== null && Number(item.gst) > 0) {
              finalGst = Number(item.gst);
            } else if (targetId && gstMap[targetId] !== undefined) {
              finalGst = gstMap[targetId];
            } else if (item.productId && typeof item.productId === "object" && item.productId.gst !== undefined) {
              finalGst = Number(item.productId.gst);
            }

            return {
              ...item,
              gst: finalGst,
            };
          });

          return {
            ...order,
            items: updatedItems,
          };
        });

        setOrders(myOrders);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

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

  const extractShippingFee = (order) => {
    let fee = Number(
      order.shippingCharge ??
      order.deliveryFee ??
      order.shippingCost ??
      order.deliveryCharge ??
      order.shippingAmount ??
      order.delivery?.charge ??
      0
    );

    if (fee === 0 && order.items && Array.isArray(order.items)) {
      order.items.forEach((item) => {
        const itemShipping = Number(
          item.deliveryCharge ??
          item.deliveryFee ??
          item.shippingCharge ??
          item.delivery?.charge ??
          0
        );
        fee += itemShipping;
      });
    }

    if (fee === 0 && order.totalAmount && order.items) {
      const itemsSum = order.items.reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
      if (Number(order.totalAmount) > itemsSum) {
        fee = Number(order.totalAmount) - itemsSum;
      }
    }

    return fee;
  };

  const handleDownloadInvoice = (order) => {
    if (order.status !== "Delivered") {
      toast.error("Invoice is available only after order is Delivered!");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups to view/download invoice.");
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
    let itemsTableRows = "";

    let calculatedItemsTotal = 0;
    let calculatedTotalGstAmount = 0;

    const shippingFee = extractShippingFee(order);

    itemsList.forEach((item, i) => {
      const unitPrice = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      const lineTotal = unitPrice * qty;

      const itemGstRate = Number(item.gst || 0);
      const totalTaxAmt = itemGstRate > 0 ? (lineTotal * itemGstRate) / 100 : 0;

      calculatedItemsTotal += lineTotal;
      calculatedTotalGstAmount += totalTaxAmt;

      itemsTableRows += `
        <tr>
          <td style="text-align: center;">${i + 1}</td>
          <td>${item.title || item.name || item.productId?.name || "Product Item"}</td>
          <td style="text-align: center;">${item.hsnCode || item.productId?.hsnCode || "8203"}</td>
          <td style="text-align: center;">${qty}</td>
          <td style="text-align: center;">${item.unit || "PCS"}</td>
          <td style="text-align: right;">Rs. ${unitPrice.toFixed(2)}</td>
          <td style="text-align: right; font-weight: bold;">Rs. ${lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="text-align: center;">-</td>
          <td style="text-align: center;">${item.discount || "-"}</td>
          <td style="text-align: center; font-weight: bold;">${itemGstRate}%</td>
          <td style="text-align: right; font-weight: bold;">Rs. ${totalTaxAmt.toFixed(2)}</td>
          <td style="text-align: center;">-</td>
          <td style="text-align: center;">-</td>
          <td style="text-align: center;">-</td>
          <td style="text-align: center;">-</td>
        </tr>
      `;
    });

    let rowCounter = itemsList.length + 1;
    if (shippingFee > 0) {
      itemsTableRows += `
        <tr>
          <td style="text-align: center;">${rowCounter}</td>
          <td>Delivery / Shipping Charge</td>
          <td style="text-align: center;">9965</td>
          <td style="text-align: center;">1</td>
          <td style="text-align: center;">NOS</td>
          <td style="text-align: right;">Rs. ${shippingFee.toFixed(2)}</td>
          <td style="text-align: right; font-weight: bold;">Rs. ${shippingFee.toFixed(2)}</td>
          <td style="text-align: center;">-</td>
          <td style="text-align: center;">-</td>
          <td style="text-align: center;">0%</td>
          <td style="text-align: right;">Rs. 0.00</td>
          <td style="text-align: center;">-</td>
          <td style="text-align: center;">-</td>
          <td style="text-align: center;">-</td>
          <td style="text-align: center;">-</td>
        </tr>
      `;
      rowCounter++;
    }

    const totalFilledRows = itemsList.length + (shippingFee > 0 ? 1 : 0);
    const minRows = Math.max(10, totalFilledRows);
    for (let i = totalFilledRows; i < minRows; i++) {
      itemsTableRows += `
        <tr>
          <td>&nbsp;</td>
          <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
        </tr>
      `;
    }

    const computedGrandTotal = calculatedItemsTotal + calculatedTotalGstAmount + shippingFee;
    const finalGrandTotal = Number(order.totalAmount || computedGrandTotal);
    const amountInWords = numberToWords(finalGrandTotal);

    const invoiceTitle = `Invoice_${order._id.slice(-6).toUpperCase()}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${invoiceTitle}</title>
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
            <div class="info-row"><span class="info-label">Name</span><span>: ${user?.name || "Customer"}</span></div>
            <div class="info-row"><span class="info-label">Address</span><span>: ${user?.address || "N/A"}</span></div>
            <div class="info-row"><span class="info-label">State</span><span>: ${user?.state || "Rajasthan"}</span></div>
            <div class="info-row"><span class="info-label">State Code</span><span>: ${user?.stateCode || "RJ (08)"}</span></div>
            <div class="info-row"><span class="info-label">GSTIN No.</span><span>: ${user?.gstin || "N/A"}</span></div>
          </div>
          <div class="info-box">
            <span class="info-title">DETAILS OF CONSIGNEE (SHIPPED TO)</span>
            <div class="info-row"><span class="info-label">Name</span><span>: ${user?.name || "Customer"}</span></div>
            <div class="info-row"><span class="info-label">Address</span><span>: ${user?.address || "N/A"}</span></div>
            <div class="info-row"><span class="info-label">State</span><span>: ${user?.state || "Rajasthan"}</span></div>
            <div class="info-row"><span class="info-label">State Code</span><span>: ${user?.stateCode || "RJ (08)"}</span></div>
            <div class="info-row"><span class="info-label">GSTIN no.</span><span>: ${user?.gstin || "N/A"}</span></div>
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
              <th colspan="2">GST</th>
              <th colspan="2">CGST / SGST</th>
              <th colspan="2">IGST</th>
            </tr>
            <tr>
              <th>Rate</th><th>Amount</th><th>CGST</th><th>SGST</th><th>Rate</th><th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTableRows}
            <tr class="total-row">
              <td colspan="6" style="text-align: right;">Total</td>
              <td style="text-align: right;">Rs. ${finalGrandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style="text-align: center;">-</td>
              <td style="text-align: center;">-</td>
              <td style="text-align: center;">-</td>
              <td style="text-align: right;">Rs. ${calculatedTotalGstAmount.toFixed(2)}</td>
              <td style="text-align: center;">-</td>
              <td style="text-align: center;">-</td>
              <td style="text-align: center;">-</td>
              <td style="text-align: center;">-</td>
            </tr>
          </tbody>
        </table>
        <table class="summary-table">
          <tr>
            <td style="width: 200px; font-weight: bold;">Total Invoice Value (in figure)</td>
            <td style="font-weight: bold; font-size: 12px;">Rs. ${finalGrandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
      <script>
        window.onload = function() { 
          window.print(); 
        }
      </script>
    </body>
    </html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-500", icon: <Clock size={16} /> };
      case "Shipped":
        return { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-600", icon: <Truck size={16} /> };
      case "Delivered":
        return { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-600", icon: <CheckCircle size={16} /> };
      case "Cancelled":
        return { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-600", icon: <XCircle size={16} /> };
      default:
        return { bg: "bg-gray-50", border: "border-gray-200", badge: "bg-gray-500", icon: <Package size={16} /> };
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
          <span className="text-sm text-gray-500 font-medium">
            {orders.length} order{orders.length !== 1 ? "s" : ""} placed
          </span>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10 sm:p-14 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag size={36} className="text-indigo-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">No Orders Found</h2>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {orders.map((order) => {
              const statusStyle = getStatusStyle(order.status);
              const isDelivered = order.status === "Delivered";
              const shippingFee = extractShippingFee(order);

              return (
                <div key={order._id} className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-gray-100 overflow-hidden">
                  <div className={`px-4 sm:px-6 py-4 border-b ${statusStyle.border} ${statusStyle.bg}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <Hash size={14} />
                          <span className="font-mono">{order._id}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs sm:text-sm">
                          <span className="font-semibold text-gray-800">₹{Number(order.totalAmount || 0).toLocaleString()}</span>
                          {order.createdAt && (
                            <span className="text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold ${statusStyle.badge}`}>
                          {statusStyle.icon}
                          {order.status}
                        </div>
                        <button onClick={() => handleDeleteOrder(order._id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg">
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 sm:px-6 py-4 space-y-3">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex gap-3 items-center p-3 rounded-xl border border-gray-100 bg-gray-50/60">
                        <img src={item.image || item.images?.[0] || item.productId?.images?.[0]} className="w-14 h-14 object-contain" alt="" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm">{item.title || item.name || item.productId?.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span>Qty: {item.quantity}</span>
                            <span>•</span>
                            <span>₹{item.price} / unit</span>
                            <span>•</span>
                            <span className="font-bold text-indigo-600">GST: {item.gst}%</span>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900 text-sm">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>

                  <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs sm:text-sm">
                    <div>
                      {shippingFee > 0 && <span>Delivery Fee: <strong>₹{shippingFee}</strong> • </span>}
                      <span className="font-bold text-emerald-600">Grand Total: ₹{order.totalAmount}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleDownloadInvoice(order)} disabled={!isDelivered} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold">
                        <Download size={15} /> Download Invoice
                      </button>
                      {isDelivered && (
                        <button onClick={() => handleDownloadInvoice(order)} className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-800 rounded-xl font-semibold">
                          <Printer size={15} /> Print
                        </button>
                      )}
                    </div>
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
