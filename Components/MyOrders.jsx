import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Hash,
  Clock,
  Truck,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Package,
  PackageOpen,
  Download,
  Trash2,
  Printer,
  Check,
} from "lucide-react";

// ======================================================
// DESIGN TOKENS
// ======================================================
const INK = "#15181C";
const MUTED = "#6B7280";
const BORDER = "#E6E8EB";
const SURFACE = "#FFFFFF";
const SURFACE_MUTED = "#F1F2EF";
const BG = "#F5F6F4";
const PAPER = "#FBFAF8";
const DASH = "#CDD1CB";
const AMBER = "#F0A420";
const AMBER_DARK = "#C97F0F";
const STEEL = "#2B4A5E";
const STEEL_TINT = "#EAF0F3";

const TearLine = () => (
  <div className="relative my-1">
    <div style={{ borderTop: `2px dashed ${DASH}` }} />
    <div
      className="absolute -left-4 sm:-left-6 -top-2.5 w-5 h-5 rounded-full"
      style={{ background: BG, border: `1px solid ${BORDER}` }}
    />
    <div
      className="absolute -right-4 sm:-right-6 -top-2.5 w-5 h-5 rounded-full"
      style={{ background: BG, border: `1px solid ${BORDER}` }}
    />
  </div>
);

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
// STEPPER CONFIG
// ======================================================
const STEPPER_STEPS = [
  { key: "Pending", label: "Pending", icon: Clock, color: "#F59E0B", bgSoft: "#FFFBEB", ring: "ring-amber-200" },
  { key: "Confirmed", label: "Confirmed", icon: CheckCircle2, color: "#4F46E5", bgSoft: "#EEF2FF", ring: "ring-indigo-200" },
  { key: "Shipped", label: "Shipped", icon: Truck, color: "#2563EB", bgSoft: "#EFF6FF", ring: "ring-blue-200" },
  { key: "Delivered", label: "Delivered", icon: CheckCircle, color: "#059669", bgSoft: "#ECFDF5", ring: "ring-emerald-200" },
];

const normalizeStatus = (status) =>
  status === "Order Confirmed" || status === "Processing" ? "Confirmed" : status || "Pending";

const getStepIndex = (status) => {
  const idx = STEPPER_STEPS.findIndex((s) => s.key === normalizeStatus(status));
  return idx >= 0 ? idx : 0;
};

const formatDateTime = (value) => {
  if (!value) return null;
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(value);
  }
};

const getStepTime = (stepKey, order, currentStatus) => {
  const normalizedCurrent = normalizeStatus(currentStatus);

  // Backend should save every admin status change here.
  const history = Array.isArray(order?.statusHistory)
    ? order.statusHistory
    : [];

  const normalizeHistoryEntry = (entry) => ({
    ...entry,
    status: normalizeStatus(entry?.status),
    at:
      entry?.at ||
      entry?.timestamp ||
      entry?.updatedAt ||
      entry?.dateTime ||
      entry?.createdAt ||
      null,
  });

  // Use the LAST occurrence of this status from backend history.
  const matchingHistory = history
    .map(normalizeHistoryEntry)
    .filter((entry) => entry.status === stepKey && entry.at);

  if (matchingHistory.length > 0) {
    return formatDateTime(matchingHistory[matchingHistory.length - 1].at);
  }

  // Pending is the order creation time if history has not stored it.
  if (stepKey === "Pending") {
    return formatDateTime(
      order?.createdAt ||
        order?.orderDate ||
        order?.pendingAt ||
        order?.statusUpdatedAt
    );
  }

  // Current step fallback.
  if (stepKey === normalizedCurrent) {
    return formatDateTime(
      order?.statusUpdatedAt ||
        order?.updatedAt ||
        order?.confirmedAt ||
        order?.shippedAt ||
        order?.deliveredAt
    );
  }

  // Fallback for APIs that store named timestamps.
  const fieldMap = {
    Confirmed: order?.confirmedAt,
    Shipped: order?.shippedAt,
    Delivered: order?.deliveredAt,
  };

  if (fieldMap[stepKey]) {
    return formatDateTime(fieldMap[stepKey]);
  }

  return null;
};

useEffect(() => {
  fetchOrders();

  // Poll every 20s so admin status/time updates appear
  const interval = setInterval(() => {
    fetchOrders(true); // silent refresh
  }, 20000);

  return () => clearInterval(interval);
}, []);
  const progressPercent =
    currentIndex <= 0 ? 0 : (currentIndex / (STEPPER_STEPS.length - 1)) * 100;

  return (
    <div className="w-full px-1 sm:px-3 py-4 sm:py-5">
      <div className="relative">
        <div className="absolute top-5 left-[10%] right-[10%] h-1 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progressPercent}%`,
              background:
                "linear-gradient(90deg, #F59E0B 0%, #4F46E5 40%, #2563EB 70%, #059669 100%)",
            }}
          />
        </div>

        <div className="relative z-10 flex justify-between">
          {STEPPER_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;
            const timeLabel = getStepTime(step.key, order, currentStatus);

            return (
              <div
                key={step.key}
                className="flex flex-col items-center flex-1 min-w-0 px-0.5"
                style={{ animation: `stepPop 0.45s ease ${index * 0.08}s both` }}
              >
                <div
                  className={`
                    relative w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center
                    border-2 transition-all duration-500 ease-out
                    ${isActive ? `ring-4 ${step.ring} scale-110` : ""}
                    ${isCompleted || isActive ? "shadow-md" : ""}
                  `}
                  style={{
                    backgroundColor: isCompleted || isActive ? step.color : "#FFFFFF",
                    borderColor: isCompleted || isActive ? step.color : "#D1D5DB",
                    color: isCompleted || isActive ? "#FFFFFF" : "#9CA3AF",
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle size={18} className="sm:w-5 sm:h-5" />
                  ) : (
                    <Icon size={16} className={`sm:w-[18px] sm:h-[18px] ${isActive ? "animate-pulse" : ""}`} />
                  )}
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping opacity-30"
                      style={{ backgroundColor: step.color }}
                    />
                  )}
                </div>

                <p
                  className={`mt-2.5 text-[10px] sm:text-xs font-bold text-center leading-tight transition-colors duration-300 ${
                    isActive || isCompleted ? "" : "text-gray-400"
                  }`}
                  style={{ color: isActive || isCompleted ? step.color : undefined }}
                >
                  {step.label}
                </p>

                <div
                  className={`mt-1 min-h-[28px] sm:min-h-[32px] flex items-start justify-center transition-all duration-500 ${
                    timeLabel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                  }`}
                >
                  {timeLabel && (
                    <span
                      className="text-[9px] sm:text-[10px] font-medium text-center leading-snug px-1 rounded-md"
                      style={{ color: step.color, backgroundColor: step.bgSoft }}
                    >
                      {timeLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes stepPop {
          from { opacity: 0; transform: translateY(8px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

// ======================================================
// COMPONENT
// ======================================================
const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
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

    // Keep the customer's order status/date/time synchronized with admin updates.
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 10000);

    const handleFocus = () => fetchOrders(true);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchOrders(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const fetchOrders = async (silent = false) => {
  try {
    if (!silent) setLoading(true);

    let gstMap = {};
    try {
      const productRes = await axios.get(
        "https://backend-3-axez.onrender.com/api/products"
      );
      const productList = productRes.data.products || productRes.data || [];
      productList.forEach((prod) => {
        gstMap[String(prod._id)] =
          prod.gst !== undefined ? Number(prod.gst) : 0;
      });
    } catch (prodErr) {
      console.error("Error fetching products for GST:", prodErr);
    }

    const { data } = await axios.get(
      "https://backend-3-axez.onrender.com/api/orders/all"
    );

    if (data.success) {
      let myOrders = data.orders.filter(
        (order) => order.userId === user?._id && !order.deletedByUser
      );

      myOrders = myOrders.map((order) => {
        const updatedItems = order.items?.map((item) => {
          const targetId = String(
            item.productId?._id || item.productId || item.id || item._id || ""
          );
          let finalGst = 0;
          if (item.gst !== undefined && item.gst !== null && Number(item.gst) > 0) {
            finalGst = Number(item.gst);
          } else if (targetId && gstMap[targetId] !== undefined) {
            finalGst = gstMap[targetId];
          } else if (
            item.productId &&
            typeof item.productId === "object" &&
            item.productId.gst !== undefined
          ) {
            finalGst = Number(item.productId.gst);
          }
          return { ...item, gst: finalGst };
        });

        // Keep status timestamps from backend as-is
        return {
          ...order,
          items: updatedItems,
          statusUpdatedAt: order.statusUpdatedAt || order.updatedAt,
          statusHistory: Array.isArray(order.statusHistory)
            ? order.statusHistory
            : [],
        };
      });

      setOrders(myOrders);
    }
  } catch (error) {
    console.error(error);
    if (!silent) toast.error("Failed to fetch orders");
  } finally {
    if (!silent) setLoading(false);
  }
};

  const handleConfirmOrder = async (orderId) => {
    try {
      setConfirmingId(orderId);
      const updatedAt = new Date().toISOString();
      const { data } = await axios.put(
        `https://backend-3-axez.onrender.com/api/orders/confirm/${orderId}`
      );
      if (data.success) {
        toast.success("Order Confirmed! Bill Unlocked.");
        setOrders((prev) =>
          prev.map((order) => {
            if (order._id !== orderId) return order;
            const prevHistory = Array.isArray(order.statusHistory)
              ? order.statusHistory
              : [];
            return {
              ...order,
              status: "Confirmed",
              statusUpdatedAt: updatedAt,
              statusHistory: [
                ...prevHistory,
                { status: "Confirmed", at: updatedAt, timestamp: updatedAt },
              ],
              deletedByUser: false,
            };
          })
        );
      } else {
        toast.error(data.message || "Failed to confirm order");
      }
    } catch (error) {
      console.error("Confirm Order Error:", error);
      toast.error(
        error.response?.data?.message || "Server Error: Could not confirm order"
      );
    } finally {
      setConfirmingId(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this order from your dashboard?"
      )
    )
      return;
    try {
      setDeletingId(orderId);
      const { data } = await axios.put(
        `https://backend-3-axez.onrender.com/api/orders/user-delete/${orderId}`
      );
      if (data.success || data.message) {
        toast.success("Order removed from dashboard");
        setOrders((prev) => prev.filter((item) => item._id !== orderId));
      } else {
        toast.error(data.message || "Failed to remove order");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Server Error: Unable to remove order"
      );
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
        fee += Number(
          item.deliveryCharge ??
            item.deliveryFee ??
            item.shippingCharge ??
            item.delivery?.charge ??
            0
        );
      });
    }
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

  const handleDownloadInvoice = (order) => {
    const isUnlocked = ["Confirmed", "Processing", "Shipped", "Delivered"].includes(
      order.status
    );
    if (!isUnlocked) {
      toast.error("Invoice will unlock once the order is Confirmed!");
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
      itemsTableRows += `<tr><td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>`;
    }

    const computedGrandTotal =
      calculatedItemsTotal + calculatedTotalGstAmount + shippingFee;
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
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const getStatusStyle = (status) => {
    const s = normalizeStatus(status);
    switch (s) {
      case "Pending":
        return { tint: "#FEF6E7", text: AMBER_DARK, icon: <Clock size={14} /> };
      case "Confirmed":
        return { tint: "#EEF2FF", text: "#4F46E5", icon: <CheckCircle2 size={14} /> };
      case "Shipped":
        return { tint: STEEL_TINT, text: STEEL, icon: <Truck size={14} /> };
      case "Delivered":
        return { tint: "#E4F3E9", text: "#1D7A43", icon: <CheckCircle size={14} /> };
      case "Cancelled":
        return { tint: "#FBE7E7", text: "#B4302F", icon: <XCircle size={14} /> };
      default:
        return { tint: SURFACE_MUTED, text: MUTED, icon: <Package size={14} /> };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <p className="font-medium" style={{ color: MUTED }}>
          Loading orders...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ background: BG }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: INK }}>
            My orders
          </h1>
          <span className="text-sm font-medium" style={{ color: MUTED }}>
            {orders.length} order{orders.length !== 1 ? "s" : ""} placed
          </span>
        </div>

        {orders.length === 0 ? (
          <div
            className="rounded-2xl p-10 sm:p-14 text-center"
            style={{ background: PAPER, border: `2px dashed ${DASH}` }}
          >
            <PackageOpen size={40} className="mx-auto mb-4" style={{ color: MUTED }} />
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: INK }}>
              No orders yet
            </h2>
            <p className="mt-2 text-sm" style={{ color: MUTED }}>
              Once you place an order, it'll show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {orders.map((order) => {
              const displayStatus = normalizeStatus(order.status);
              const statusStyle = getStatusStyle(order.status);
              const isUnlocked = [
                "Confirmed",
                "Processing",
                "Shipped",
                "Delivered",
              ].includes(normalizeStatus(order.status));
              const shippingFee = extractShippingFee(order);

              return (
                <div
                  key={order._id}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: PAPER, border: `1px solid ${BORDER}` }}
                >
                  {/* Header */}
                  <div
                    className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    style={{ borderBottom: `1px solid ${BORDER}` }}
                  >
                    <div className="space-y-1.5">
                      <div
                        className="flex items-center gap-2 text-xs sm:text-sm"
                        style={{ color: MUTED }}
                      >
                        <Hash size={13} />
                        <span className="font-mono">{order._id}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs sm:text-sm">
                        <span
                          className="font-semibold font-mono"
                          style={{ color: INK }}
                        >
                          ₹{Number(order.totalAmount || 0).toLocaleString()}
                        </span>
                        {order.createdAt && (
                          <span style={{ color: MUTED }}>
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{
                          background: statusStyle.tint,
                          color: statusStyle.text,
                        }}
                      >
                        {statusStyle.icon}
                        {displayStatus}
                      </div>
                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        disabled={deletingId === order._id}
                        className="p-1.5 rounded-lg transition disabled:opacity-50"
                        style={{ color: "#B4302F" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* ========== STATUS STEPPER ========== */}
                  <div style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <OrderStepper status={order.status} order={order} />
                  </div>

                  {/* Items */}
                  <div className="px-4 sm:px-6 py-2">
                    {order.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-3 items-center py-3"
                        style={
                          index !== 0
                            ? { borderTop: `1px solid ${BORDER}` }
                            : undefined
                        }
                      >
                        <div
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                          style={{ background: SURFACE_MUTED }}
                        >
                          <img
                            src={
                              item.image ||
                              item.images?.[0] ||
                              item.productId?.images?.[0]
                            }
                            className="w-full h-full object-contain p-1.5"
                            alt=""
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-semibold text-sm truncate"
                            style={{ color: INK }}
                          >
                            {item.title || item.name || item.productId?.name}
                          </h3>
                          <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                            Qty: {item.quantity} · ₹{item.price}/unit
                            {Number(item.gst) > 0 ? ` · GST ${item.gst}%` : ""}
                          </p>
                        </div>
                        <p
                          className="font-bold text-sm font-mono flex-shrink-0"
                          style={{ color: INK }}
                        >
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="px-4 sm:px-6">
                    <TearLine />
                  </div>

                  {/* Footer */}
                  <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs sm:text-sm" style={{ color: MUTED }}>
                      {shippingFee > 0 && (
                        <span>
                          Delivery fee:{" "}
                          <strong style={{ color: INK }}>₹{shippingFee}</strong>{" "}
                          ·{" "}
                        </span>
                      )}
                      <span className="font-bold" style={{ color: AMBER_DARK }}>
                        Grand total: ₹{order.totalAmount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {normalizeStatus(order.status) === "Pending" && (
                        <button
                          onClick={() => handleConfirmOrder(order._id)}
                          disabled={confirmingId === order._id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition disabled:opacity-50"
                          style={{ background: "#16A34A", color: "#FFFFFF" }}
                        >
                          <Check size={16} /> Confirm Order
                        </button>
                      )}
                      <button
                        onClick={() => handleDownloadInvoice(order)}
                        disabled={!isUnlocked}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition disabled:opacity-50"
                        style={{ background: AMBER, color: "#1A1200" }}
                      >
                        <Download size={15} /> Invoice
                      </button>
                      {isUnlocked && (
                        <button
                          onClick={() => handleDownloadInvoice(order)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm transition"
                          style={{ background: SURFACE_MUTED, color: INK }}
                        >
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
