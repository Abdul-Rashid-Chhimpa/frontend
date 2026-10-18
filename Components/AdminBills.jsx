import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ReceiptText,
  ArrowLeft,
  Printer,
  Search,
  RefreshCw,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ======================================================
// NUMBER TO WORDS
// ======================================================
const numberToWords = (num) => {
  if (!num || isNaN(num)) return "Rupees Zero Only";
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
    "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen ",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const inWords = (n) => {
    if ((n = n.toString()).length > 9) return "overflow";
    const n_array = ("000000000" + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n_array) return "";
    let str = "";
    str += n_array[1] != 0 ? (a[Number(n_array[1])] || b[n_array[1][0]] + " " + a[n_array[1][1]]) + "Crore " : "";
    str += n_array[2] != 0 ? (a[Number(n_array[2])] || b[n_array[2][0]] + " " + a[n_array[2][1]]) + "Lakh " : "";
    str += n_array[3] != 0 ? (a[Number(n_array[3])] || b[n_array[3][0]] + " " + a[n_array[3][1]]) + "Thousand " : "";
    str += n_array[4] != 0 ? (a[Number(n_array[4])] || b[n_array[4][0]] + " " + a[n_array[4][1]]) + "Hundred " : "";
    str += n_array[5] != 0 ? (str != "" ? "and " : "") + (a[Number(n_array[5])] || b[n_array[5][0]] + " " + a[n_array[5][1]]) : "";
    return str;
  };
  return `Rupees ${inWords(Math.floor(num)).trim()} Only`;
};

// ======================================================
// INVOICE SERIAL (starts from 1001)
// ======================================================
const INVOICE_PREFIX = "PLC";

const getFinancialYearLabel = (dateValue) => {
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "00-00";
  const startYear = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `${String(startYear).slice(-2)}-${String(startYear + 1).slice(-2)}`;
};

const buildInvoiceNumberMap = (allOrders) => {
  const sorted = [...allOrders].sort((x, y) => {
    const tx = new Date(x.createdAt || 0).getTime();
    const ty = new Date(y.createdAt || 0).getTime();
    if (tx !== ty) return tx - ty;
    return String(x._id).localeCompare(String(y._id));
  });

  const counters = {};
  const map = {};

  sorted.forEach((order) => {
    const fy = getFinancialYearLabel(order.createdAt);
    counters[fy] = (counters[fy] || 1000) + 1; // 1001 se start
    map[String(order._id)] = `${INVOICE_PREFIX}/${fy}/${String(counters[fy]).padStart(4, "0")}`;
  });

  return map;
};

// ======================================================
// MAIN COMPONENT
// ======================================================
const AdminBills = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); // multi-select
  const [bulkDeleting, setBulkDeleting] = useState(false);

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

  // ====================================================
  // FETCH ORDERS
  // ====================================================
  const fetchOrders = async () => {
    try {
      setLoading(true);

      let gstMap = {};
      try {
        const prodRes = await axios.get("https://backend-3-axez.onrender.com/api/products");
        const allProducts = prodRes.data.products || prodRes.data || [];
        allProducts.forEach((p) => {
          if (p._id) gstMap[String(p._id)] = p.gst !== undefined ? Number(p.gst) : 0;
        });
      } catch (prodErr) {
        console.error("Failed fetching product GST list:", prodErr);
      }

      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "https://backend-3-axez.onrender.com/api/orders/all",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let rawOrders = [];
      if (data.success && data.orders) rawOrders = data.orders;
      else if (Array.isArray(data)) rawOrders = data;

      // Serial numbers
      const invoiceMap = buildInvoiceNumberMap(rawOrders);

      const mappedOrders = rawOrders.map((order) => {
        const itemsList = order.items || order.orderItems || [];
        const updatedItems = itemsList.map((item) => {
          const pId = String(item.productId?._id || item.productId || item.id || item._id || "");
          let dynamicGst = 0;
          if (item.gst !== undefined && item.gst !== null && Number(item.gst) >= 0) {
            dynamicGst = Number(item.gst);
          } else if (pId && gstMap[pId] !== undefined) {
            dynamicGst = gstMap[pId];
          } else if (item.productId && typeof item.productId === "object" && item.productId.gst !== undefined) {
            dynamicGst = Number(item.productId.gst);
          }
          return { ...item, gst: dynamicGst };
        });

        return {
          ...order,
          items: updatedItems,
          invoiceNo: order.invoiceNumber || invoiceMap[String(order._id)] || `${INVOICE_PREFIX}/00-00/1001`,
        };
      });

      setOrders(mappedOrders);
      setSelectedIds([]); // clear selection on refresh
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

  // ====================================================
  // SINGLE DELETE
  // ====================================================
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
        setSelectedIds((prev) => prev.filter((id) => id !== orderId));
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

  // ====================================================
  // MULTI-SELECT + BULK DELETE
  // ====================================================
  const toggleSelect = (orderId) => {
    setSelectedIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map((o) => o._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one bill");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete ${selectedIds.length} selected bill(s)?`
    );
    if (!confirmDelete) return;

    try {
      setBulkDeleting(true);
      let successCount = 0;

      for (const id of selectedIds) {
        try {
          const { data } = await axios.delete(
            `https://backend-3-axez.onrender.com/api/orders/delete/${id}`
          );
          if (data.success || data.message) successCount++;
        } catch (err) {
          console.error(`Failed to delete ${id}:`, err);
        }
      }

      setOrders((prev) => prev.filter((item) => !selectedIds.includes(item._id)));
      setSelectedIds([]);
      toast.success(`${successCount} bill(s) deleted successfully`);
    } catch (error) {
      console.error(error);
      toast.error("Some bills could not be deleted");
    } finally {
      setBulkDeleting(false);
    }
  };

  // ====================================================
  // SHIPPING FEE
  // ====================================================
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

    const itemsList = order.items || order.orderItems || [];
    if (fee === 0 && Array.isArray(itemsList)) {
      itemsList.forEach((item) => {
        fee += Number(
          item.deliveryCharge ?? item.deliveryFee ?? item.shippingCharge ?? item.delivery?.charge ?? 0
        );
      });
    }

    if (fee === 0 && order.totalAmount && itemsList.length > 0) {
      const itemsSum = itemsList.reduce(
        (acc, it) => acc + Number(it.price || 0) * Number(it.quantity || it.qty || 1),
        0
      );
      if (Number(order.totalAmount) > itemsSum) {
        fee = Number(order.totalAmount) - itemsSum;
      }
    }
    return fee;
  };

  // ====================================================
  // PRINT INVOICE
  // ====================================================
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
    const shippingFee = extractShippingFee(order);
    const invoiceNumber = order.invoiceNo || `${INVOICE_PREFIX}/00-00/1001`;

    let itemsTableRows = "";
    let calculatedItemsTotal = 0;
    let calculatedTotalGstAmount = 0;

    itemsList.forEach((item, i) => {
      const unitPrice = Number(item.price || 0);
      const qty = Number(item.quantity || item.qty || 1);
      const lineTotal = unitPrice * qty;
      const itemGstRate = Number(item.gst || 0);
      const totalTaxAmt = itemGstRate > 0 ? (lineTotal * itemGstRate) / 100 : 0;

      calculatedItemsTotal += lineTotal;
      calculatedTotalGstAmount += totalTaxAmt;

      itemsTableRows += `
        <tr>
          <td style="text-align:center;">${i + 1}</td>
          <td>${item.title || item.name || item.productId?.name || "Product Item"}</td>
          <td style="text-align:center;">${item.hsnCode || item.productId?.hsnCode || "8203"}</td>
          <td style="text-align:center;">${qty}</td>
          <td style="text-align:center;">${item.unit || "PCS"}</td>
          <td style="text-align:right;">Rs. ${unitPrice.toFixed(2)}</td>
          <td style="text-align:right;font-weight:bold;">Rs. ${lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="text-align:center;">-</td>
          <td style="text-align:center;">${item.discount || "-"}</td>
          <td style="text-align:center;font-weight:bold;">${itemGstRate}%</td>
          <td style="text-align:right;font-weight:bold;">Rs. ${totalTaxAmt.toFixed(2)}</td>
          <td style="text-align:center;">-</td>
          <td style="text-align:center;">-</td>
          <td style="text-align:center;">-</td>
          <td style="text-align:center;">-</td>
        </tr>
      `;
    });

    let rowCounter = itemsList.length + 1;
    if (shippingFee > 0) {
      itemsTableRows += `
        <tr>
          <td style="text-align:center;">${rowCounter}</td>
          <td>Delivery / Shipping Charge</td>
          <td style="text-align:center;">9965</td>
          <td style="text-align:center;">1</td>
          <td style="text-align:center;">NOS</td>
          <td style="text-align:right;">Rs. ${shippingFee.toFixed(2)}</td>
          <td style="text-align:right;font-weight:bold;">Rs. ${shippingFee.toFixed(2)}</td>
          <td style="text-align:center;">-</td>
          <td style="text-align:center;">-</td>
          <td style="text-align:center;">0%</td>
          <td style="text-align:right;">Rs. 0.00</td>
          <td style="text-align:center;">-</td>
          <td style="text-align:center;">-</td>
          <td style="text-align:center;">-</td>
          <td style="text-align:center;">-</td>
        </tr>
      `;
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

    const customerName = order.customerName || order.user?.name || "Customer";
    const customerAddress = order.shippingAddress?.address || order.user?.address || "N/A";
    const customerState = order.shippingAddress?.state || order.user?.state || "Rajasthan";
    const customerGstin = order.gstin || order.user?.gstin || "N/A";

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoiceNumber}</title>
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
            <div class="info-row"><span class="info-label">Invoice no.</span><span>: <strong>${invoiceNumber}</strong></span></div>
            <div class="info-row"><span class="info-label">Invoice Date</span><span>: ${orderDate}</span></div>
            <div class="info-row"><span class="info-label">Cases / Parcel</span><span>: _______________</span></div>
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
              <td colspan="6" style="text-align:right;">Total</td>
              <td style="text-align:right;">Rs. ${finalGrandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style="text-align:center;">-</td>
              <td style="text-align:center;">-</td>
              <td style="text-align:center;">-</td>
              <td style="text-align:right;">Rs. ${calculatedTotalGstAmount.toFixed(2)}</td>
              <td style="text-align:center;">-</td>
              <td style="text-align:center;">-</td>
              <td style="text-align:center;">-</td>
              <td style="text-align:center;">-</td>
            </tr>
          </tbody>
        </table>

        <table class="summary-table">
          <tr>
            <td style="width:200px;font-weight:bold;">Total Invoice Value (in figure)</td>
            <td style="font-weight:bold;font-size:12px;">Rs. ${finalGrandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;">Total Invoice Value (in words)</td>
            <td style="font-weight:bold;font-size:11px;">${amountInWords}</td>
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
            <div style="margin-top:40px;">
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

  // ====================================================
  // FILTER
  // ====================================================
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const custName = order.customerName || order.user?.name || "";
      const orderId = order._id || "";
      const invoiceNo = order.invoiceNo || "";
      const term = searchTerm.toLowerCase();
      return (
        orderId.toLowerCase().includes(term) ||
        custName.toLowerCase().includes(term) ||
        invoiceNo.toLowerCase().includes(term)
      );
    });
  }, [orders, searchTerm]);

  const allSelected =
    filteredOrders.length > 0 && selectedIds.length === filteredOrders.length;

  // ====================================================
  // UI
  // ====================================================
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
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

        {/* Search + Bulk Actions */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Search size={20} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by Order ID, Invoice No or Customer Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full outline-none text-sm text-gray-700"
            />
          </div>

          {/* Select All + Bulk Delete */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
            >
              {allSelected ? <CheckSquare size={16} className="text-indigo-600" /> : <Square size={16} />}
              {allSelected ? "Deselect All" : "Select All"}
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-xl transition shadow-sm"
              >
                <Trash2 size={15} />
                {bulkDeleting ? "Deleting..." : `Delete (${selectedIds.length})`}
              </button>
            )}
          </div>
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
              const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "N/A";
              const itemsList = order.items || order.orderItems || [];
              const itemsCount = itemsList.length;
              const isSelected = selectedIds.includes(order._id);
              const invoiceNo = order.invoiceNo || "—";

              return (
                <div
                  key={order._id}
                  className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition flex flex-col justify-between ${
                    isSelected ? "border-indigo-500 ring-2 ring-indigo-200" : "border-gray-100"
                  }`}
                >
                  <div>
                    {/* Checkbox + Invoice No + Amount */}
                    <div className="flex justify-between items-start mb-3 border-b pb-2">
                      <div className="flex items-start gap-2">
                        {/* CHECKBOX */}
                        <button
                          onClick={() => toggleSelect(order._id)}
                          className="mt-0.5 flex-shrink-0 text-indigo-600 hover:text-indigo-800 transition"
                          title={isSelected ? "Deselect" : "Select"}
                        >
                          {isSelected ? <CheckSquare size={20} /> : <Square size={20} className="text-gray-400" />}
                        </button>

                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold">Invoice No</p>
                          <p className="font-mono text-xs font-bold text-indigo-600">
                            {invoiceNo}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full">
                        ₹{amount.toLocaleString()}
                      </span>
                    </div>

                    {/* Unique Order ID */}
                    <div className="mb-2">
                      <p className="text-[10px] text-gray-400 uppercase font-semibold">Unique Order ID</p>
                      <p className="font-mono text-[11px] text-gray-700 break-all">
                        {order._id}
                      </p>
                    </div>

                    <div className="text-xs text-gray-600 space-y-1 mb-4">
                      <p>
                        <span className="font-semibold text-gray-800">Customer:</span> {name}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-800">Date:</span> {date}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-800">Total Items:</span> {itemsCount}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-800">Status:</span>{" "}
                        {order.status || "Pending"}
                      </p>
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
