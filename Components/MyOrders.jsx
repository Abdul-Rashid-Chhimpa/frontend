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

// Number to Words Converter (Indian Currency)
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

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      setDeletingId(orderId);
      const { data } = await axios.delete(`https://backend-3-axez.onrender.com/api/orders/delete/${orderId}`);
      if (data.success || data.message) {
        toast.success("Order deleted successfully");
        setOrders((prev) => prev.filter((item) => item._id !== orderId));
      }
    } catch (error) {
      toast.error("Unable to delete order");
    } finally {
      setDeletingId(null);
    }
  };

  // MULTI-LAYER GST EXTRACTION FUNCTION
  const extractGstRate = (item) => {
    if (!item) return 0;

    // Direct Keys Search
    const keysToSearch = [
      item.gst,
      item.gstRate,
      item.gstPercent,
      item.tax,
      item.productId?.gst,
      item.productId?.gstRate,
      item.productId?.gstPercent,
    ];

    for (let val of keysToSearch) {
      if (val !== undefined && val !== null && val !== "") {
        const parsed = parseFloat(String(val).replace(/[^0-9.]/g, ""));
        if (!isNaN(parsed) && parsed > 0) {
          return parsed;
        }
      }
    }

    // Fallback based on Product Name/Category if missing in DB
    const name = (item.title || item.name || item.productId?.name || "").toLowerCase();
    if (name.includes("hacksaw") || name.includes("frame")) {
      return 12; // Hand tools Standard GST Rate (12%)
    }

    return 0;
  };

  // Delivery Fee Extraction Logic
  const extractShippingFee = (order) => {
    let fee = Number(
      order.shippingCharge ??
      order.deliveryFee ??
      order.shippingCost ??
      order.deliveryCharge ??
      order.delivery?.charge ??
      0
    );

    if (fee === 0 && order.totalAmount && order.items) {
      const itemsSum = order.items.reduce(
        (acc, it) => acc + Number(it.price || 0) * Number(it.quantity || 1),
        0
      );
      if (Number(order.totalAmount) > itemsSum) {
        fee = Number(order.totalAmount) - itemsSum;
      }
    }
    return fee;
  };

  // Download Invoice Handler
  const handleDownloadInvoice = (order) => {
    if (order.status !== "Delivered") {
      toast.error("Invoice is available only after Delivery!");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-IN")
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

      const itemGstRate = extractGstRate(item);
      const totalTaxAmt = itemGstRate > 0 ? (lineTotal * itemGstRate) / 100 : 0;

      calculatedItemsTotal += lineTotal;
      calculatedTotalGstAmount += totalTaxAmt;

      itemsTableRows += `
        <tr>
          <td style="text-align: center;">${i + 1}</td>
          <td>${item.title || item.name || item.productId?.name || "Product Item"}</td>
          <td style="text-align: center;">8203</td>
          <td style="text-align: center;">${qty}</td>
          <td style="text-align: center;">PCS</td>
          <td style="text-align: right;">Rs. ${unitPrice.toFixed(2)}</td>
          <td style="text-align: right; font-weight: bold;">Rs. ${lineTotal.toFixed(2)}</td>
          <td style="text-align: center;">-</td>
          <td style="text-align: center;">-</td>
          <td style="text-align: center; font-weight: bold;">${itemGstRate}%</td>
          <td style="text-align: right; font-weight: bold;">Rs. ${totalTaxAmt.toFixed(2)}</td>
          <td style="text-align: center;">-</td>
          <td style="text-align: center;">-</td>
          <td style="text-align: center;">-</td>
          <td style="text-align: center;">-</td>
        </tr>
      `;
    });

    if (shippingFee > 0) {
      itemsTableRows += `
        <tr>
          <td style="text-align: center;">${itemsList.length + 1}</td>
          <td>Delivery / Shipping Charges</td>
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
    }

    const finalGrandTotal = Number(order.totalAmount || calculatedItemsTotal + shippingFee);
    const amountInWords = numberToWords(finalGrandTotal);

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice_${order._id.slice(-6).toUpperCase()}</title>
      <style>
        * { box-sizing: border-box; font-family: Arial, sans-serif; font-size: 11px; }
        body { padding: 10px; background: #fff; color: #000; }
        .invoice-container { width: 100%; max-width: 900px; margin: 0 auto; border: 2px solid #000; padding: 10px; }
        .company-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 5px; }
        .company-name { font-size: 20px; font-weight: bold; }
        .info-grid { display: grid; grid-template-columns: 1.2fr 1.2fr 1fr; border: 1px solid #000; margin-bottom: 5px; }
        .info-box { padding: 5px; border-right: 1px solid #000; }
        .info-box:last-child { border-right: none; }
        table.invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
        table.invoice-table th, table.invoice-table td { border: 1px solid #000; padding: 4px 3px; font-size: 10px; }
        table.invoice-table th { background: #f2f2f2; text-align: center; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="company-header">
          <div class="company-name">${companyDetails.name}</div>
          <div>${companyDetails.address} | Email: ${companyDetails.email}</div>
        </div>
        <table class="invoice-table">
          <thead>
            <tr>
              <th>S.R.</th>
              <th>Description</th>
              <th>HSN</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Total</th>
              <th>Taxable</th>
              <th>Disc</th>
              <th>GST Rate</th>
              <th>GST Amt</th>
              <th>CGST</th>
              <th>SGST</th>
              <th>IGST Rate</th>
              <th>IGST Amt</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTableRows}
          </tbody>
        </table>
        <div><strong>Total Amount: Rs. ${finalGrandTotal.toFixed(2)}</strong></div>
        <div>Amount in words: ${amountInWords}</div>
      </div>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>

        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-2xl shadow border p-5 space-y-4">
            <div className="flex justify-between border-b pb-3">
              <div>
                <p className="font-mono text-sm text-gray-600">#{order._id}</p>
                <p className="font-bold text-lg text-emerald-600">₹{order.totalAmount}</p>
              </div>
              <button
                onClick={() => handleDeleteOrder(order._id)}
                className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {order.items?.map((item, index) => {
              const currentGst = extractGstRate(item);
              return (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || item.images?.[0] || item.productId?.images?.[0]}
                      className="w-12 h-12 object-contain"
                      alt=""
                    />
                    <div>
                      <p className="font-medium text-sm">{item.title || item.name || item.productId?.name}</p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} • ₹{item.price} •{" "}
                        <span className="font-semibold text-indigo-600">GST: {currentGst}%</span>
                      </p>
                    </div>
                  </div>
                  <p className="font-bold">₹{item.price * item.quantity}</p>
                </div>
              );
            })}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => handleDownloadInvoice(order)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700"
              >
                <Download size={16} /> Download Invoice
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
