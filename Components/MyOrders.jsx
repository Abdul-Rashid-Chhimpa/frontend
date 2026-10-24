import { useEffect, useRef, useState } from "react";
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
  Boxes,
  Lock,
} from "lucide-react";

// ======================================================
// API
// ======================================================

const API_BASE = "https://backend-3-axez.onrender.com";

// ======================================================
// DESIGN TOKENS
// ======================================================

const INK = "#15181C";
const MUTED = "#6B7280";
const BORDER = "#E6E8EB";
const SURFACE_MUTED = "#F1F2EF";
const BG = "#F5F6F4";
const PAPER = "#FBFAF8";
const DASH = "#CDD1CB";

const AMBER = "#F0A420";
const AMBER_DARK = "#C97F0F";

const STEEL = "#2B4A5E";
const STEEL_TINT = "#EAF0F3";

// ======================================================
// INVOICE SETTINGS
// ======================================================

// Invoice number prefix  ->  PLC/25-26/0001
const INVOICE_PREFIX = "PLC";

// Company home state (used for CGST+SGST vs IGST decision)
const COMPANY_STATE = "rajasthan";

// Shown on the invoice only when a product has no HSN code saved.
// Set to "" (empty) if you prefer a "-" instead of a default code.
const DEFAULT_HSN = ""; // empty = show "-" when product has no HSN in DB

// Company logo – put file in public/ as pedwal-logo.png
const LOGO_SRC = "/logowithqoute.png";

// ------------------------------------------------------
// PAYMENT QR  (real UPI QR - PEDWAL LIFE CREATION, IDFC FIRST Bank)
// ------------------------------------------------------
// The QR is embedded as an SVG so the printed invoice always shows it
// sharply, with no extra image file to host.
// UPI payload: upi://pay?pa=pedwallifecreation4u@idfcbank&pn=PEDWAL LIFE CREATION&cu=INR
// To change the QR later, replace PAYMENT_QR_SRC with an image URL
// (example: "/payment-qr.png") and update UPI_ID below.
// ------------------------------------------------------

const UPI_ID = "pedwallifecreation4u@idfcbank";

const PAYMENT_QR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" shape-rendering="crispEdges"><rect width="45" height="45" fill="#fff"/><path fill="#000" d="M4 4h7v1h-7zM12 4h2v1h-2zM15 4h2v1h-2zM19 4h1v1h-1zM21 4h1v1h-1zM23 4h3v1h-3zM27 4h6v1h-6zM34 4h7v1h-7zM4 5h1v1h-1zM10 5h1v1h-1zM12 5h1v1h-1zM14 5h2v1h-2zM18 5h1v1h-1zM22 5h2v1h-2zM25 5h1v1h-1zM27 5h3v1h-3zM34 5h1v1h-1zM40 5h1v1h-1zM4 6h1v1h-1zM6 6h3v1h-3zM10 6h1v1h-1zM12 6h2v1h-2zM15 6h2v1h-2zM20 6h1v1h-1zM22 6h2v1h-2zM25 6h5v1h-5zM31 6h1v1h-1zM34 6h1v1h-1zM36 6h3v1h-3zM40 6h1v1h-1zM4 7h1v1h-1zM6 7h3v1h-3zM10 7h1v1h-1zM14 7h2v1h-2zM17 7h2v1h-2zM21 7h1v1h-1zM24 7h2v1h-2zM27 7h1v1h-1zM29 7h1v1h-1zM32 7h1v1h-1zM34 7h1v1h-1zM36 7h3v1h-3zM40 7h1v1h-1zM4 8h1v1h-1zM6 8h3v1h-3zM10 8h1v1h-1zM12 8h4v1h-4zM17 8h1v1h-1zM19 8h2v1h-2zM22 8h1v1h-1zM25 8h1v1h-1zM32 8h1v1h-1zM34 8h1v1h-1zM36 8h3v1h-3zM40 8h1v1h-1zM4 9h1v1h-1zM10 9h1v1h-1zM13 9h1v1h-1zM15 9h2v1h-2zM18 9h1v1h-1zM24 9h4v1h-4zM30 9h1v1h-1zM34 9h1v1h-1zM40 9h1v1h-1zM4 10h7v1h-7zM12 10h1v1h-1zM14 10h1v1h-1zM16 10h1v1h-1zM18 10h1v1h-1zM20 10h1v1h-1zM22 10h1v1h-1zM24 10h1v1h-1zM26 10h1v1h-1zM28 10h1v1h-1zM30 10h1v1h-1zM32 10h1v1h-1zM34 10h7v1h-7zM13 11h1v1h-1zM15 11h1v1h-1zM17 11h3v1h-3zM21 11h3v1h-3zM25 11h1v1h-1zM27 11h3v1h-3zM32 11h1v1h-1zM4 12h1v1h-1zM7 12h7v1h-7zM15 12h1v1h-1zM23 12h1v1h-1zM25 12h2v1h-2zM31 12h1v1h-1zM33 12h1v1h-1zM36 12h1v1h-1zM38 12h3v1h-3zM18 13h1v1h-1zM20 13h3v1h-3zM27 13h1v1h-1zM30 13h1v1h-1zM33 13h5v1h-5zM4 14h1v1h-1zM6 14h1v1h-1zM8 14h4v1h-4zM13 14h3v1h-3zM17 14h1v1h-1zM19 14h11v1h-11zM32 14h2v1h-2zM35 14h1v1h-1zM37 14h2v1h-2zM40 14h1v1h-1zM6 15h1v1h-1zM8 15h2v1h-2zM11 15h4v1h-4zM16 15h1v1h-1zM18 15h1v1h-1zM20 15h2v1h-2zM23 15h2v1h-2zM28 15h1v1h-1zM30 15h1v1h-1zM34 15h2v1h-2zM38 15h3v1h-3zM4 16h1v1h-1zM6 16h1v1h-1zM9 16h2v1h-2zM13 16h2v1h-2zM16 16h5v1h-5zM28 16h1v1h-1zM32 16h3v1h-3zM39 16h2v1h-2zM5 17h1v1h-1zM9 17h1v1h-1zM13 17h1v1h-1zM15 17h3v1h-3zM19 17h2v1h-2zM22 17h1v1h-1zM25 17h1v1h-1zM27 17h1v1h-1zM30 17h4v1h-4zM36 17h1v1h-1zM38 17h1v1h-1zM6 18h1v1h-1zM9 18h3v1h-3zM13 18h2v1h-2zM16 18h1v1h-1zM19 18h2v1h-2zM22 18h2v1h-2zM25 18h1v1h-1zM31 18h3v1h-3zM38 18h3v1h-3zM4 19h2v1h-2zM7 19h1v1h-1zM9 19h1v1h-1zM13 19h1v1h-1zM16 19h1v1h-1zM19 19h1v1h-1zM25 19h2v1h-2zM29 19h1v1h-1zM32 19h2v1h-2zM36 19h1v1h-1zM38 19h1v1h-1zM40 19h1v1h-1zM6 20h2v1h-2zM9 20h2v1h-2zM12 20h1v1h-1zM14 20h1v1h-1zM21 20h2v1h-2zM27 20h2v1h-2zM30 20h2v1h-2zM33 20h2v1h-2zM38 20h3v1h-3zM5 21h2v1h-2zM12 21h1v1h-1zM14 21h2v1h-2zM17 21h2v1h-2zM21 21h1v1h-1zM26 21h1v1h-1zM32 21h1v1h-1zM37 21h1v1h-1zM4 22h1v1h-1zM9 22h3v1h-3zM13 22h2v1h-2zM16 22h3v1h-3zM20 22h2v1h-2zM23 22h1v1h-1zM25 22h2v1h-2zM28 22h3v1h-3zM32 22h1v1h-1zM36 22h1v1h-1zM38 22h1v1h-1zM40 22h1v1h-1zM4 23h2v1h-2zM9 23h1v1h-1zM12 23h1v1h-1zM14 23h1v1h-1zM16 23h2v1h-2zM19 23h2v1h-2zM22 23h3v1h-3zM26 23h2v1h-2zM29 23h1v1h-1zM32 23h2v1h-2zM39 23h2v1h-2zM5 24h3v1h-3zM9 24h2v1h-2zM12 24h1v1h-1zM15 24h4v1h-4zM20 24h2v1h-2zM23 24h2v1h-2zM28 24h1v1h-1zM30 24h2v1h-2zM33 24h5v1h-5zM39 24h2v1h-2zM5 25h2v1h-2zM16 25h1v1h-1zM18 25h2v1h-2zM21 25h4v1h-4zM27 25h1v1h-1zM29 25h3v1h-3zM33 25h1v1h-1zM35 25h2v1h-2zM39 25h1v1h-1zM5 26h4v1h-4zM10 26h2v1h-2zM13 26h1v1h-1zM19 26h2v1h-2zM24 26h5v1h-5zM30 26h3v1h-3zM34 26h1v1h-1zM36 26h3v1h-3zM40 26h1v1h-1zM9 27h1v1h-1zM11 27h2v1h-2zM14 27h2v1h-2zM18 27h1v1h-1zM20 27h1v1h-1zM22 27h3v1h-3zM26 27h1v1h-1zM29 27h2v1h-2zM33 27h2v1h-2zM38 27h2v1h-2zM4 28h3v1h-3zM10 28h1v1h-1zM14 28h3v1h-3zM19 28h1v1h-1zM21 28h1v1h-1zM24 28h5v1h-5zM33 28h1v1h-1zM35 28h3v1h-3zM40 28h1v1h-1zM4 29h1v1h-1zM6 29h2v1h-2zM9 29h1v1h-1zM11 29h1v1h-1zM14 29h1v1h-1zM17 29h2v1h-2zM22 29h2v1h-2zM30 29h2v1h-2zM33 29h1v1h-1zM36 29h1v1h-1zM39 29h1v1h-1zM4 30h2v1h-2zM7 30h1v1h-1zM10 30h4v1h-4zM17 30h3v1h-3zM21 30h1v1h-1zM25 30h1v1h-1zM27 30h5v1h-5zM34 30h1v1h-1zM36 30h5v1h-5zM4 31h1v1h-1zM6 31h4v1h-4zM12 31h3v1h-3zM16 31h2v1h-2zM20 31h1v1h-1zM22 31h2v1h-2zM26 31h1v1h-1zM30 31h1v1h-1zM34 31h1v1h-1zM36 31h1v1h-1zM4 32h1v1h-1zM6 32h2v1h-2zM9 32h2v1h-2zM13 32h2v1h-2zM17 32h3v1h-3zM23 32h2v1h-2zM26 32h1v1h-1zM28 32h2v1h-2zM31 32h8v1h-8zM12 33h2v1h-2zM15 33h2v1h-2zM19 33h1v1h-1zM21 33h6v1h-6zM29 33h1v1h-1zM31 33h2v1h-2zM36 33h2v1h-2zM39 33h1v1h-1zM4 34h7v1h-7zM12 34h1v1h-1zM16 34h1v1h-1zM18 34h6v1h-6zM27 34h1v1h-1zM29 34h2v1h-2zM32 34h1v1h-1zM34 34h1v1h-1zM36 34h1v1h-1zM39 34h2v1h-2zM4 35h1v1h-1zM10 35h1v1h-1zM12 35h2v1h-2zM15 35h2v1h-2zM19 35h1v1h-1zM25 35h1v1h-1zM28 35h3v1h-3zM32 35h1v1h-1zM36 35h1v1h-1zM39 35h1v1h-1zM4 36h1v1h-1zM6 36h3v1h-3zM10 36h1v1h-1zM12 36h2v1h-2zM15 36h1v1h-1zM19 36h2v1h-2zM22 36h1v1h-1zM24 36h2v1h-2zM27 36h3v1h-3zM31 36h7v1h-7zM4 37h1v1h-1zM6 37h3v1h-3zM10 37h1v1h-1zM12 37h5v1h-5zM24 37h3v1h-3zM29 37h7v1h-7zM37 37h2v1h-2zM4 38h1v1h-1zM6 38h3v1h-3zM10 38h1v1h-1zM13 38h1v1h-1zM15 38h1v1h-1zM17 38h2v1h-2zM22 38h1v1h-1zM25 38h1v1h-1zM27 38h2v1h-2zM31 38h1v1h-1zM33 38h1v1h-1zM35 38h3v1h-3zM39 38h2v1h-2zM4 39h1v1h-1zM10 39h1v1h-1zM13 39h1v1h-1zM18 39h2v1h-2zM21 39h1v1h-1zM31 39h10v1h-10zM4 40h7v1h-7zM12 40h5v1h-5zM20 40h1v1h-1zM23 40h2v1h-2zM28 40h1v1h-1zM31 40h1v1h-1zM40 40h1v1h-1z"/></svg>`;

const PAYMENT_QR_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  PAYMENT_QR_SVG
)}`;

// ======================================================
// TEAR LINE
// ======================================================

const TearLine = () => (
  <div className="relative my-1">
    <div style={{ borderTop: `2px dashed ${DASH}` }} />

    <div
      className="absolute -left-4 sm:-left-6 -top-2.5 w-5 h-5 rounded-full"
      style={{
        background: BG,
        border: `1px solid ${BORDER}`,
      }}
    />

    <div
      className="absolute -right-4 sm:-right-6 -top-2.5 w-5 h-5 rounded-full"
      style={{
        background: BG,
        border: `1px solid ${BORDER}`,
      }}
    />
  </div>
);

// ======================================================
// NUMBER TO WORDS
// ======================================================

const numberToWords = (num) => {
  if (!num || isNaN(num)) {
    return "Rupees Zero Only";
  }

  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];

  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const inWords = (n) => {
    if ((n = n.toString()).length > 9) {
      return "overflow";
    }

    const n_array = ("000000000" + n)
      .substr(-9)
      .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);

    if (!n_array) {
      return "";
    }

    let str = "";

    str +=
      n_array[1] != 0
        ? (a[Number(n_array[1])] ||
            b[n_array[1][0]] + " " + a[n_array[1][1]]) + "Crore "
        : "";

    str +=
      n_array[2] != 0
        ? (a[Number(n_array[2])] ||
            b[n_array[2][0]] + " " + a[n_array[2][1]]) + "Lakh "
        : "";

    str +=
      n_array[3] != 0
        ? (a[Number(n_array[3])] ||
            b[n_array[3][0]] + " " + a[n_array[3][1]]) + "Thousand "
        : "";

    str +=
      n_array[4] != 0
        ? (a[Number(n_array[4])] ||
            b[n_array[4][0]] + " " + a[n_array[4][1]]) + "Hundred "
        : "";

    str +=
      n_array[5] != 0
        ? (str !== "" ? "and " : "") +
          (a[Number(n_array[5])] ||
            b[n_array[5][0]] + " " + a[n_array[5][1]])
        : "";

    return str;
  };

  return `Rupees ${inWords(Math.floor(num)).trim()} Only`;
};

// ======================================================
// STEPPER CONFIG
// ======================================================

const STEPPER_STEPS = [
  {
    key: "Pending",
    label: "Pending",
    icon: Clock,
    color: "#F59E0B",
    bgSoft: "#FFFBEB",
    ring: "ring-amber-200",
  },
  {
    key: "Confirmed",
    label: "Confirmed",
    icon: CheckCircle2,
    color: "#4F46E5",
    bgSoft: "#EEF2FF",
    ring: "ring-indigo-200",
  },
  {
    key: "Shipped",
    label: "Shipped",
    icon: Truck,
    color: "#2563EB",
    bgSoft: "#EFF6FF",
    ring: "ring-blue-200",
  },
  {
    key: "Delivered",
    label: "Delivered",
    icon: CheckCircle,
    color: "#059669",
    bgSoft: "#ECFDF5",
    ring: "ring-emerald-200",
  },
];

// ======================================================
// NORMALIZE STATUS
// ======================================================

const normalizeStatus = (status) => {
  if (!status) {
    return "Pending";
  }

  const value = String(status).trim();

  if (
    value === "Order Confirmed" ||
    value === "Processing" ||
    value === "Confirmed"
  ) {
    return "Confirmed";
  }

  if (
    value === "Order Shipped" ||
    value === "Shipped" ||
    value === "Out for Delivery"
  ) {
    return "Shipped";
  }

  if (
    value === "Order Delivered" ||
    value === "Delivered" ||
    value === "Completed"
  ) {
    return "Delivered";
  }

  if (value === "Cancelled" || value === "Canceled") {
    return "Cancelled";
  }

  return "Pending";
};

// ======================================================
// STEP INDEX
// ======================================================

const getStepIndex = (status) => {
  const normalized = normalizeStatus(status);

  const idx = STEPPER_STEPS.findIndex((step) => step.key === normalized);

  return idx >= 0 ? idx : 0;
};

// ======================================================
// DATE FORMAT
// ======================================================

const formatDateTime = (value) => {
  if (!value) {
    return null;
  }

  try {
    const d = new Date(value);

    if (isNaN(d.getTime())) {
      return String(value);
    }

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

// ======================================================
// SERIAL INVOICE NUMBERS
// ======================================================
// Bill numbers are generated in serial order (0001, 0002, ...)
// based on the order creation time of ALL orders in the system,
// restarting each financial year (April - March).
//
// If your backend already stores an `invoiceNumber` on the order,
// that value is used instead.
// ======================================================

const getFinancialYearLabel = (dateValue) => {
  const d = new Date(dateValue);

  if (isNaN(d.getTime())) {
    return "00-00";
  }

  const startYear = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;

  return `${String(startYear).slice(-2)}-${String(startYear + 1).slice(-2)}`;
};

const buildInvoiceNumberMap = (allOrders) => {
  const sorted = [...allOrders].sort((x, y) => {
    const tx = new Date(x.createdAt || 0).getTime();
    const ty = new Date(y.createdAt || 0).getTime();

    if (tx !== ty) {
      return tx - ty;
    }

    return String(x._id).localeCompare(String(y._id));
  });

  const counters = {};
  const map = {};

  sorted.forEach((order) => {
    const fy = getFinancialYearLabel(order.createdAt);

    counters[fy] = (counters[fy] || 1000) + 1; // start from 1001

    map[String(order._id)] = `${INVOICE_PREFIX}/${fy}/${String(
      counters[fy]
    ).padStart(4, "0")}`;
  });

  return map;
};

// ======================================================
// STATE / GST HELPERS
// ======================================================

const getCustomerState = (order, user) => {
  const fromOrder =
    order?.state ||
    order?.shippingAddress?.state ||
    (typeof order?.address === "object" ? order?.address?.state : "") ||
    "";

  return String(fromOrder || user?.state || "Rajasthan").trim();
};

const isRajasthanState = (stateName, stateCode) => {
  const s = String(stateName || "").trim().toLowerCase();
  const c = String(stateCode || "").trim().toLowerCase();

  return (
    s === COMPANY_STATE ||
    s === "rj" ||
    c === "rj" ||
    c === "08" ||
    c.includes("(08)")
  );
};

const getCustomerMobile = (user, order) =>
  user?.mobile ||
  user?.phone ||
  user?.mobileNumber ||
  user?.phoneNumber ||
  order?.mobile ||
  order?.phone ||
  "N/A";

// ======================================================
// STEP TIME
// ======================================================

const getStepTime = (stepKey, order, currentStatus) => {
  const normalizedCurrent = normalizeStatus(currentStatus);

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

  const matchingHistory = history
    .map(normalizeHistoryEntry)
    .filter((entry) => entry.status === stepKey && entry.at);

  if (matchingHistory.length > 0) {
    return formatDateTime(matchingHistory[matchingHistory.length - 1].at);
  }

  // Pending = order creation time
  if (stepKey === "Pending") {
    return formatDateTime(
      order?.createdAt || order?.orderDate || order?.pendingAt
    );
  }

  // Backend timestamp fallback
  const fieldMap = {
    Confirmed: order?.confirmedAt || order?.statusUpdatedAt,

    Shipped: order?.shippedAt || order?.statusUpdatedAt,

    Delivered: order?.deliveredAt || order?.statusUpdatedAt,
  };

  if (stepKey === normalizedCurrent && fieldMap[stepKey]) {
    return formatDateTime(fieldMap[stepKey]);
  }

  if (fieldMap[stepKey]) {
    return formatDateTime(fieldMap[stepKey]);
  }

  return null;
};

// ======================================================
// ORDER STEPPER
// ======================================================

const OrderStepper = ({ status, order }) => {
  const currentStatus = normalizeStatus(status);

  const currentIndex = getStepIndex(currentStatus);

  const progressPercent =
    currentIndex <= 0 ? 0 : (currentIndex / (STEPPER_STEPS.length - 1)) * 100;

  return (
    <div className="w-full px-1 sm:px-3 py-4 sm:py-5">
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-5 left-[10%] right-[10%] h-1 rounded-full bg-gray-200 overflow-hidden">
          {/* Progress */}
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progressPercent}%`,
              background:
                "linear-gradient(90deg, #F59E0B 0%, #4F46E5 40%, #2563EB 70%, #059669 100%)",
            }}
          />
        </div>

        {/* Steps */}
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
                style={{
                  animation: `stepPop 0.45s ease ${index * 0.08}s both`,
                }}
              >
                {/* Icon circle */}
                <div
                  className={`
                    relative
                    w-9 h-9
                    sm:w-11 sm:h-11
                    rounded-full
                    flex items-center justify-center
                    border-2
                    transition-all duration-500 ease-out
                    ${isActive ? `ring-4 ${step.ring} scale-110` : ""}
                    ${isCompleted || isActive ? "shadow-md" : ""}
                  `}
                  style={{
                    backgroundColor:
                      isCompleted || isActive ? step.color : "#FFFFFF",

                    borderColor:
                      isCompleted || isActive ? step.color : "#D1D5DB",

                    color: isCompleted || isActive ? "#FFFFFF" : "#9CA3AF",
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle size={18} className="sm:w-5 sm:h-5" />
                  ) : (
                    <Icon
                      size={16}
                      className={`sm:w-[18px] sm:h-[18px] ${
                        isActive ? "animate-pulse" : ""
                      }`}
                    />
                  )}

                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping opacity-30"
                      style={{
                        backgroundColor: step.color,
                      }}
                    />
                  )}
                </div>

                {/* Label */}
                <p
                  className="mt-2.5 text-[10px] sm:text-xs font-bold text-center leading-tight"
                  style={{
                    color: isActive || isCompleted ? step.color : "#9CA3AF",
                  }}
                >
                  {step.label}
                </p>

                {/* Time */}
                <div className="mt-1 min-h-[28px] sm:min-h-[32px] flex items-start justify-center">
                  {timeLabel && (
                    <span
                      className="text-[9px] sm:text-[10px] font-medium text-center leading-snug px-1 rounded-md"
                      style={{
                        color: step.color,
                        backgroundColor: step.bgSoft,
                      }}
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
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.9);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

// ======================================================
// MAIN COMPONENT
// ======================================================

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] = useState(null);

  // Stores the status we previously saw for each order.
  // Used to detect: Pending -> Confirmed
  const previousStatusesRef = useRef({});

  // Prevents popup during initial loading
  const firstFetchDoneRef = useRef(false);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  // ====================================================
  // COMPANY DETAILS
  // ====================================================

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

  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      // ------------------------------------------------
      // PRODUCT GST MAP (used only for invoice)
      // ------------------------------------------------

      let gstMap = {};
      let hsnMap = {};

      try {
        const productRes = await axios.get(`${API_BASE}/api/products`);

        const productList =
          productRes.data.products || productRes.data || [];

        productList.forEach((prod) => {
          gstMap[String(prod._id)] =
            prod.gst !== undefined ? Number(prod.gst) : 0;

          if (prod.hsnCode && String(prod.hsnCode).trim()) {
            hsnMap[String(prod._id)] = String(prod.hsnCode).trim();
          }
        });
      } catch (prodErr) {
        console.error("Error fetching products for GST:", prodErr);
      }

      // ------------------------------------------------
      // FETCH ALL ORDERS
      // ------------------------------------------------

      const { data } = await axios.get(`${API_BASE}/api/orders/all`);

      if (!data.success) {
        return;
      }

      const allOrders = data.orders || [];

      // ------------------------------------------------
      // SERIAL INVOICE NUMBERS (based on ALL orders)
      // ------------------------------------------------

      const invoiceMap = buildInvoiceNumberMap(allOrders);

      // ------------------------------------------------
      // ONLY CURRENT USER ORDERS
      // ------------------------------------------------

      let myOrders = allOrders.filter((order) => {
        const orderUserId = String(order.userId?._id || order.userId || "");

        const currentUserId = String(user?._id || "");

        return orderUserId === currentUserId && !order.deletedByUser;
      });

      // ------------------------------------------------
      // GST + STATUS + INVOICE NO
      // ------------------------------------------------

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

          // Only real HSN from item or product DB — never invent a code
          const realHsn =
            (item.hsnCode && String(item.hsnCode).trim()) ||
            (item.productId?.hsnCode && String(item.productId.hsnCode).trim()) ||
            (hsnMap[targetId] && String(hsnMap[targetId]).trim()) ||
            "";

          return {
            ...item,
            gst: finalGst,
            hsnCode: realHsn,
          };
        });

        return {
          ...order,

          items: updatedItems || [],

          status: order.status || "Pending",

          casesNumber: Number(order.casesNumber) || 0,

          invoiceNo: order.invoiceNumber || invoiceMap[String(order._id)],

          statusUpdatedAt: order.statusUpdatedAt || order.updatedAt || null,

          statusHistory: Array.isArray(order.statusHistory)
            ? order.statusHistory
            : [],
        };
      });

      // =================================================
      // ADMIN CONFIRMATION DETECTION
      // =================================================

      myOrders.forEach((order) => {
        const orderId = String(order._id);

        const oldStatus = previousStatusesRef.current[orderId];

        const newStatus = normalizeStatus(order.status);

        // ONLY SHOW POPUP WHEN: Pending -> Confirmed
        if (
          firstFetchDoneRef.current &&
          oldStatus === "Pending" &&
          newStatus === "Confirmed"
        ) {
          toast.success(
            `Your Order #${orderId.slice(-6).toUpperCase()} has been Confirmed!`,
            {
              duration: 6000,
              position: "top-center",
              style: {
                borderRadius: "12px",
                background: "#059669",
                color: "#fff",
                fontWeight: "600",
                padding: "14px 18px",
              },
            }
          );
        }

        // Save current status
        previousStatusesRef.current[orderId] = newStatus;
      });

      // Mark first fetch complete
      firstFetchDoneRef.current = true;

      // ------------------------------------------------
      // UPDATE UI
      // ------------------------------------------------

      setOrders(myOrders);
    } catch (error) {
      console.error("Fetch Orders Error:", error);

      if (!silent) {
        toast.error("Failed to fetch orders");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // ====================================================
  // INITIAL LOAD + AUTO SYNC
  // ====================================================

  useEffect(() => {
    fetchOrders();

    // Check admin changes every 10 seconds
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 10000);

    // Browser focus
    const handleFocus = () => {
      fetchOrders(true);
    };

    // Tab visibility
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

  // ====================================================
  // DELETE ORDER FROM USER DASHBOARD
  // ====================================================

  const handleDeleteOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this order from your dashboard?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(orderId);

      const { data } = await axios.put(
        `${API_BASE}/api/orders/user-delete/${orderId}`
      );

      if (data.success || data.message) {
        toast.success("Order removed from dashboard");

        setOrders((prev) => prev.filter((item) => item._id !== orderId));
      } else {
        toast.error(data.message || "Failed to remove order");
      }
    } catch (error) {
      console.error("Delete Order Error:", error);

      toast.error(
        error.response?.data?.message || "Server Error: Unable to remove order"
      );
    } finally {
      setDeletingId(null);
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

    // Item level delivery fee
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

    // Calculate difference
    if (fee === 0 && order.totalAmount && order.items) {
      const itemsSum = order.items.reduce(
        (acc, item) =>
          acc + Number(item.price || 0) * Number(item.quantity || 1),
        0
      );

      if (Number(order.totalAmount) > itemsSum) {
        fee = Number(order.totalAmount) - itemsSum;
      }
    }

    return fee;
  };

  // ====================================================
  // INVOICE
  // ====================================================

  const handleDownloadInvoice = (order, billCopy = 1) => {
    const normalizedStatus = normalizeStatus(order.status);

    // Bill 1: unlocks after admin confirms the order
    const isStatusUnlocked = ["Confirmed", "Shipped", "Delivered"].includes(
      normalizedStatus
    );

    // Bill 2 (duplicate with cases): unlocks only after admin sets casesNumber
    const casesCount = Number(order.casesNumber) || 0;
    const isCasesUnlocked = casesCount > 0;

    if (billCopy === 1 && !isStatusUnlocked) {
      toast.error("Invoice will unlock once the admin confirms your order!");
      return;
    }

    if (billCopy === 2 && !isCasesUnlocked) {
      toast.error(
        "Parcel bill is locked. It will unlock when admin updates the cases / parcel number."
      );
      return;
    }

    if (billCopy === 2 && !isStatusUnlocked) {
      toast.error("Order is not confirmed yet.");
      return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      toast.error(
        "Popup blocked! Please allow popups to view/download invoice."
      );

      return;
    }

    // ------------------------------------------------
    // DATE
    // ------------------------------------------------

    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
      : "N/A";

    // Cases number comes only from admin (Order.casesNumber)
    const casesNumber = casesCount > 0 ? String(casesCount) : "";

    const billLabel = billCopy === 2 ? " (Copy 2 – Parcel)" : "";

    const escapeHtml = (value) =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const customerState = getCustomerState(order, user);

    const customerStateCode = user?.stateCode || "";

    const isIntraState = isRajasthanState(customerState, customerStateCode);

    const customerMobile = getCustomerMobile(user, order);

    const invoiceNumber =
      order.invoiceNo || `${INVOICE_PREFIX}/00-00/0000`;

    const fmt = (n) =>
      Number(n || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    // ------------------------------------------------
    // ITEMS
    // ------------------------------------------------

    const itemsList = order.items || [];

    // Unique HSN codes of all products on this invoice (for the details box)
    // Per-product HSN from DB only; missing → "-"
    const hsnCodes = itemsList.map(
      (it) => (it.hsnCode || it.productId?.hsnCode || "").trim() || "-"
    );
    const realHsns = [...new Set(hsnCodes.filter((h) => h && h !== "-"))];
    const hsnDisplay = realHsns.length > 0 ? realHsns.join(", ") : "-";

    let itemsTableRows = "";

    let totalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    const shippingFee = extractShippingFee(order);

    // ------------------------------------------------
    // ITEM ROWS
    // ------------------------------------------------

    itemsList.forEach((item, i) => {
      const unitPrice = Number(item.price || 0);

      const qty = Number(item.quantity || 1);

      const taxableValue = unitPrice * qty;

      const gstRate = Number(item.gst || 0);

      const taxAmt = gstRate > 0 ? (taxableValue * gstRate) / 100 : 0;

      let cgstRate = 0;
      let sgstRate = 0;
      let igstRate = 0;

      let cgstAmt = 0;
      let sgstAmt = 0;
      let igstAmt = 0;

      if (isIntraState) {
        // Rajasthan: GST split equally into CGST + SGST
        cgstRate = gstRate / 2;
        sgstRate = gstRate / 2;
        cgstAmt = taxAmt / 2;
        sgstAmt = taxAmt / 2;
      } else {
        // Outside Rajasthan: full IGST
        igstRate = gstRate;
        igstAmt = taxAmt;
      }

      totalTaxable += taxableValue;
      totalCgst += cgstAmt;
      totalSgst += sgstAmt;
      totalIgst += igstAmt;

      const lineTotal = taxableValue + taxAmt;

      itemsTableRows += `
        <tr>
          <td style="text-align:center;">${i + 1}</td>

          <td>${
            item.title || item.name || item.productId?.name || "Product Item"
          }</td>

          <td style="text-align:center;">${
            (item.hsnCode || item.productId?.hsnCode || "").trim() || "-"
          }</td>

          <td style="text-align:center;">${qty}</td>

          <td style="text-align:center;">${item.unit || "PCS"}</td>

          <td style="text-align:right;">${fmt(unitPrice)}</td>

          <td style="text-align:right;font-weight:bold;">${fmt(taxableValue)}</td>

          <td style="text-align:center;">${isIntraState ? cgstRate + "%" : "-"}</td>
          <td style="text-align:right;">${isIntraState ? fmt(cgstAmt) : "-"}</td>

          <td style="text-align:center;">${isIntraState ? sgstRate + "%" : "-"}</td>
          <td style="text-align:right;">${isIntraState ? fmt(sgstAmt) : "-"}</td>

          <td style="text-align:center;">${!isIntraState ? igstRate + "%" : "-"}</td>
          <td style="text-align:right;">${!isIntraState ? fmt(igstAmt) : "-"}</td>

          <td style="text-align:right;font-weight:bold;">${fmt(lineTotal)}</td>
        </tr>
      `;
    });

    // ------------------------------------------------
    // SHIPPING ROW
    // ------------------------------------------------

    let rowCounter = itemsList.length + 1;

    if (shippingFee > 0) {
      totalTaxable += shippingFee;

      itemsTableRows += `
        <tr>
          <td style="text-align:center;">${rowCounter}</td>

          <td>Delivery / Shipping Charge</td>

          <td style="text-align:center;">9965</td>

          <td style="text-align:center;">1</td>

          <td style="text-align:center;">NOS</td>

          <td style="text-align:right;">${fmt(shippingFee)}</td>

          <td style="text-align:right;font-weight:bold;">${fmt(shippingFee)}</td>

          <td style="text-align:center;">${isIntraState ? "0%" : "-"}</td>
          <td style="text-align:right;">${isIntraState ? "0.00" : "-"}</td>

          <td style="text-align:center;">${isIntraState ? "0%" : "-"}</td>
          <td style="text-align:right;">${isIntraState ? "0.00" : "-"}</td>

          <td style="text-align:center;">${!isIntraState ? "0%" : "-"}</td>
          <td style="text-align:right;">${!isIntraState ? "0.00" : "-"}</td>

          <td style="text-align:right;font-weight:bold;">${fmt(shippingFee)}</td>
        </tr>
      `;

      rowCounter++;
    }

    // ------------------------------------------------
    // EMPTY ROWS
    // ------------------------------------------------

    const totalFilledRows = itemsList.length + (shippingFee > 0 ? 1 : 0);

    const minRows = Math.max(10, totalFilledRows);

    for (let i = totalFilledRows; i < minRows; i++) {
      itemsTableRows += `
        <tr>
          <td>&nbsp;</td>
          <td></td><td></td><td></td><td></td><td></td><td></td>
          <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
        </tr>
      `;
    }

    // ------------------------------------------------
    // TOTAL
    // ------------------------------------------------

    const totalGstAmount = totalCgst + totalSgst + totalIgst;

    const computedGrandTotal = totalTaxable + totalGstAmount;

    const finalGrandTotal = Number(order.totalAmount || computedGrandTotal);

    const amountInWords = numberToWords(finalGrandTotal);

    const invoiceTitle = `Invoice_${invoiceNumber.replace(/\//g, "-")}${billLabel}`;

    // =================================================
    // INVOICE HTML
    // =================================================

    const htmlContent = `
      <!DOCTYPE html>

      <html>

      <head>

        <title>${invoiceTitle}</title>

        <style>

          * {
            box-sizing: border-box;
            font-family: Arial, sans-serif;
            font-size: 11px;
          }

          body {
            padding: 10px;
            background: #fff;
            color: #000;
          }

          .invoice-container {
            width: 100%;
            max-width: 950px;
            margin: 0 auto;
            border: 2px solid #000;
            padding: 10px;
          }

          .company-header {
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
            margin-bottom: 5px;
          }

          .company-logo {
            width: 70px;
            height: 70px;
            object-fit: contain;
            flex-shrink: 0;
          }

          .company-info {
            flex: 1;
            text-align: center;
          }

          .company-name {
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 0.5px;
          }

          .company-sub {
            font-size: 11px;
            font-weight: bold;
            margin-top: 2px;
          }

          .info-grid {
            display: grid;
            grid-template-columns: 1.2fr 1.2fr 1fr;
            border: 1px solid #000;
            margin-bottom: 5px;
          }

          .info-box {
            padding: 5px;
            border-right: 1px solid #000;
          }

          .info-box:last-child {
            border-right: none;
          }

          .info-title {
            font-weight: bold;
            text-decoration: underline;
            font-size: 10px;
            margin-bottom: 4px;
            display: block;
            text-transform: uppercase;
          }

          .info-row {
            display: flex;
            margin-bottom: 2px;
          }

          .info-label {
            width: 85px;
            font-weight: bold;
            flex-shrink: 0;
          }

          table.invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
          }

          table.invoice-table th,
          table.invoice-table td {
            border: 1px solid #000;
            padding: 4px 3px;
            font-size: 10px;
          }

          table.invoice-table th {
            background: #f2f2f2;
            text-align: center;
            font-weight: bold;
          }

          .total-row td {
            font-weight: bold;
            background: #fafafa;
          }

          .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
          }

          .summary-table td {
            border: 1px solid #000;
            padding: 4px;
            font-size: 11px;
          }

          .footer-grid {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            border: 1px solid #000;
            margin-top: 5px;
          }

          .footer-left {
            border-right: 1px solid #000;
            padding: 5px;
          }

          .bank-wrap {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 10px;
          }

          .qr-box {
            text-align: center;
            flex-shrink: 0;
          }

          .qr-box img {
            width: 110px;
            height: 110px;
            border: 1px solid #000;
            padding: 2px;
          }

          .qr-box div {
            font-size: 9px;
            font-weight: bold;
            margin-top: 2px;
          }

          .qr-box .upi-id {
            font-size: 8px;
            font-weight: normal;
            max-width: 115px;
            word-break: break-all;
          }

          .footer-right {
            padding: 5px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          @media print {
            body {
              padding: 0;
            }

            .invoice-container {
              border: 2px solid #000;
            }
          }

        </style>

      </head>

      <body>

        <div class="invoice-container">

          <!-- COMPANY -->

          <div class="company-header">

            <img
              class="company-logo"
              src="${LOGO_SRC}"
              alt="Pedwal Logo"
              onerror="this.style.display='none'"
            />

            <div class="company-info">
              <div class="company-name">${companyDetails.name}</div>
              <div class="company-sub">${companyDetails.address}</div>
              <div class="company-sub">
                E-mail Address:- ${companyDetails.email}
              </div>
              <div class="company-sub">
                Contact no. ${companyDetails.phone}
              </div>
            </div>

          </div>

          <!-- INFO -->

          <div class="info-grid">

            <div class="info-box">

              <span class="info-title">INVOICE DETAILS</span>

              <div class="info-row">
                <span class="info-label">GSTIN no.</span>
                <span>: ${companyDetails.gstin}</span>
              </div>

              <div class="info-row">
                <span class="info-label">Name</span>
                <span>: ${companyDetails.name}</span>
              </div>

              <div class="info-row">
                <span class="info-label">Address</span>
                <span>: ${companyDetails.address}</span>
              </div>

              <div class="info-row">
                <span class="info-label">Invoice no.</span>
                <span>: <strong>${invoiceNumber}</strong></span>
              </div>

              <div class="info-row">
                <span class="info-label">Invoice Date</span>
                <span>: ${orderDate}</span>
              </div>

              <div class="info-row">
                <span class="info-label">HSN Code</span>
                <span>: ${hsnDisplay}</span>
              </div>

              <div class="info-row">
                <span class="info-label">Cases No.</span>
                <span>: ${casesNumber ? escapeHtml(casesNumber) : "____________"}</span>
              </div>

            </div>

            <!-- BILLED TO -->

            <div class="info-box">

              <span class="info-title">DETAILS OF RECEIVER (BILLED TO)</span>

              <div class="info-row">
                <span class="info-label">Name</span>
                <span>: ${user?.name || "Customer"}</span>
              </div>

              <div class="info-row">
                <span class="info-label">Unique ID</span>
                <span>: ${customerMobile}</span>
              </div>

              <div class="info-row">
                <span class="info-label">Address</span>
                <span>: ${user?.address || "N/A"}</span>
              </div>

              <div class="info-row">
                <span class="info-label">State</span>
                <span>: ${customerState}</span>
              </div>

              <div class="info-row">
                <span class="info-label">State Code</span>
                <span>: ${user?.stateCode || (isIntraState ? "RJ (08)" : "N/A")}</span>
              </div>

              <div class="info-row">
                <span class="info-label">GSTIN No.</span>
                <span>: ${user?.gstin || "N/A"}</span>
              </div>

            </div>

            <!-- SHIPPED TO -->

            <div class="info-box">

              <span class="info-title">DETAILS OF CONSIGNEE (SHIPPED TO)</span>

              <div class="info-row">
                <span class="info-label">Name</span>
                <span>: ${user?.name || "Customer"}</span>
              </div>

              <div class="info-row">
                <span class="info-label">Address</span>
                <span>: ${user?.address || "N/A"}</span>
              </div>

              <div class="info-row">
                <span class="info-label">State</span>
                <span>: ${customerState}</span>
              </div>

              <div class="info-row">
                <span class="info-label">State Code</span>
                <span>: ${user?.stateCode || (isIntraState ? "RJ (08)" : "N/A")}</span>
              </div>

              <div class="info-row">
                <span class="info-label">GSTIN no.</span>
                <span>: ${user?.gstin || "N/A"}</span>
              </div>

            </div>

          </div>

          <!-- ITEMS -->

          <table class="invoice-table">

            <thead>

              <tr>
                <th rowspan="2">S.R. NO.</th>
                <th rowspan="2">Description</th>
                <th rowspan="2">HSN Code</th>
                <th rowspan="2">Qty.</th>
                <th rowspan="2">Unit</th>
                <th rowspan="2">Rs / Unit</th>
                <th rowspan="2">Taxable Value</th>
                <th colspan="2">CGST</th>
                <th colspan="2">SGST</th>
                <th colspan="2">IGST</th>
                <th rowspan="2">Total</th>
              </tr>

              <tr>
                <th>Rate</th>
                <th>Amount</th>

                <th>Rate</th>
                <th>Amount</th>

                <th>Rate</th>
                <th>Amount</th>
              </tr>

            </thead>

            <tbody>

              ${itemsTableRows}

              <tr class="total-row">

                <td colspan="6" style="text-align:right;">Total</td>

                <td style="text-align:right;">${fmt(totalTaxable)}</td>

                <td></td>
                <td style="text-align:right;">${isIntraState ? fmt(totalCgst) : "-"}</td>

                <td></td>
                <td style="text-align:right;">${isIntraState ? fmt(totalSgst) : "-"}</td>

                <td></td>
                <td style="text-align:right;">${!isIntraState ? fmt(totalIgst) : "-"}</td>

                <td style="text-align:right;">${fmt(finalGrandTotal)}</td>

              </tr>

            </tbody>

          </table>

          <!-- SUMMARY -->

          <table class="summary-table">

            <tr>
              <td style="width:200px;font-weight:bold;">
                Total Taxable Value
              </td>
              <td>Rs. ${fmt(totalTaxable)}</td>
            </tr>

            ${
              isIntraState
                ? `
            <tr>
              <td style="font-weight:bold;">Total CGST</td>
              <td>Rs. ${fmt(totalCgst)}</td>
            </tr>

            <tr>
              <td style="font-weight:bold;">Total SGST</td>
              <td>Rs. ${fmt(totalSgst)}</td>
            </tr>
            `
                : `
            <tr>
              <td style="font-weight:bold;">Total IGST</td>
              <td>Rs. ${fmt(totalIgst)}</td>
            </tr>
            `
            }

            <tr>
              <td style="font-weight:bold;">
                Total Invoice Value (in figure)
              </td>
              <td style="font-weight:bold;font-size:12px;">
                Rs. ${fmt(finalGrandTotal)}
              </td>
            </tr>

            <tr>
              <td style="font-weight:bold;">
                Total Invoice Value (in words)
              </td>
              <td style="font-weight:bold;font-size:11px;">
                ${amountInWords}
              </td>
            </tr>

          </table>

          <!-- FOOTER -->

          <div class="footer-grid">

            <div class="footer-left">

              <strong>TERMS & CONDITIONS AS BELOW:-</strong>

              <br />

              1. Goods once sold will not be taken back.

              <br />

              2. 18% per month will be charged on the bill if not made within 30 days.

              <br />

              3. Subjected to 'RAJASTHAN' jurisdiction only.

              <br />
              <br />

              <div class="bank-wrap">

                <div>

                  <strong>BANK DETAILS :</strong>

                  <br />

                  NAME: ${companyDetails.name}

                  <br />

                  A/C NO.: ${companyDetails.accountNo}

                  <br />

                  IFSC CODE: ${companyDetails.ifscCode}

                  <br />

                  BANK: ${companyDetails.bankName}

                  <br />

                  ADDRESS: ${companyDetails.bankAddress}

                </div>

                <div class="qr-box">

                  <img src="${PAYMENT_QR_SRC}" alt="Payment QR" />

                  <div>SCAN TO PAY</div>

                  <div class="upi-id">UPI ID: ${UPI_ID}</div>

                  <div>IDFC FIRST Bank</div>

                </div>

              </div>

            </div>

            <div class="footer-right">

              <div>
                <strong>For: ${companyDetails.name}</strong>
              </div>

              <div style="margin-top:40px;">

                Signature: ________________________

                <br />

                Name: ${companyDetails.proprietor}

                <br />

                Status: PROPRIETOR

                <br />

                Date: ${orderDate}

              </div>

            </div>

          </div>

        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>

      </body>

      </html>
    `;

    printWindow.document.write(htmlContent);

    printWindow.document.close();
  };

  // ====================================================
  // STATUS STYLE
  // ====================================================

  const getStatusStyle = (status) => {
    const s = normalizeStatus(status);

    switch (s) {
      case "Pending":
        return {
          tint: "#FEF6E7",
          text: AMBER_DARK,
          icon: <Clock size={14} />,
        };

      case "Confirmed":
        return {
          tint: "#EEF2FF",
          text: "#4F46E5",
          icon: <CheckCircle2 size={14} />,
        };

      case "Shipped":
        return {
          tint: STEEL_TINT,
          text: STEEL,
          icon: <Truck size={14} />,
        };

      case "Delivered":
        return {
          tint: "#E4F3E9",
          text: "#1D7A43",
          icon: <CheckCircle size={14} />,
        };

      case "Cancelled":
        return {
          tint: "#FBE7E7",
          text: "#B4302F",
          icon: <XCircle size={14} />,
        };

      default:
        return {
          tint: SURFACE_MUTED,
          text: MUTED,
          icon: <Package size={14} />,
        };
    }
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: BG,
        }}
      >
        <p
          className="font-medium"
          style={{
            color: MUTED,
          }}
        >
          Loading orders...
        </p>
      </div>
    );
  }

  // ====================================================
  // UI
  // ====================================================

  return (
    <div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{
        background: BG,
      }}
    >
      <style>{`
        @keyframes casesPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(240, 164, 32, 0.35); }
          50% { box-shadow: 0 0 0 6px rgba(240, 164, 32, 0); }
        }
      `}</style>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* PAGE HEADER */}

        <div className="flex justify-between items-center">
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{
              color: INK,
            }}
          >
            My orders
          </h1>

          <span
            className="text-sm font-medium"
            style={{
              color: MUTED,
            }}
          >
            {orders.length} order
            {orders.length !== 1 ? "s" : ""} placed
          </span>
        </div>

        {/* NO ORDERS */}

        {orders.length === 0 ? (
          <div
            className="rounded-2xl p-10 sm:p-14 text-center"
            style={{
              background: PAPER,
              border: `2px dashed ${DASH}`,
            }}
          >
            <PackageOpen
              size={40}
              className="mx-auto mb-4"
              style={{
                color: MUTED,
              }}
            />

            <h2
              className="text-xl sm:text-2xl font-bold"
              style={{
                color: INK,
              }}
            >
              No orders yet
            </h2>

            <p
              className="mt-2 text-sm"
              style={{
                color: MUTED,
              }}
            >
              Once you place an order, it'll show up here.
            </p>
          </div>
        ) : (
          /* ORDERS */

          <div className="space-y-5 sm:space-y-6">
            {orders.map((order) => {
              const displayStatus = normalizeStatus(order.status);

              const statusStyle = getStatusStyle(order.status);

              const isUnlocked = ["Confirmed", "Shipped", "Delivered"].includes(
                displayStatus
              );

              const casesCount = Number(order.casesNumber) || 0;
              const isCasesUnlocked = casesCount > 0;

              const shippingFee = extractShippingFee(order);

              return (
                <div
                  key={order._id}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: PAPER,
                    border: `1px solid ${BORDER}`,
                  }}
                >
                  {/* HEADER */}

                  <div
                    className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    style={{
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  >
                    <div className="space-y-1.5">
                      <div
                        className="flex items-center gap-2 text-xs sm:text-sm"
                        style={{
                          color: MUTED,
                        }}
                      >
                        <Hash size={13} />

                        <span className="font-mono">{order._id}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs sm:text-sm flex-wrap">
                        <span
                          className="font-semibold font-mono"
                          style={{
                            color: INK,
                          }}
                        >
                          ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                        </span>

                        {order.createdAt && (
                          <span
                            style={{
                              color: MUTED,
                            }}
                          >
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

                        {/* Cases / Parcels – admin sets this */}
                        {isCasesUnlocked ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                            style={{
                              background: "rgba(240, 164, 32, 0.15)",
                              color: AMBER_DARK,
                              border: `1px solid ${AMBER}`,
                              animation: "casesPulse 2s ease-in-out infinite",
                            }}
                          >
                            <Boxes size={12} />
                            {casesCount} parcel{casesCount === 1 ? "" : "s"}
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                            style={{
                              background: SURFACE_MUTED,
                              color: MUTED,
                              border: `1px solid ${BORDER}`,
                            }}
                          >
                            <Lock size={11} />
                            Parcels pending
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* STATUS */}

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

                      {/* DELETE */}

                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        disabled={deletingId === order._id}
                        className="p-1.5 rounded-lg transition disabled:opacity-50"
                        style={{
                          color: "#B4302F",
                        }}
                        title="Remove order"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* STATUS STEPPER */}

                  <div
                    style={{
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  >
                    <OrderStepper status={order.status} order={order} />
                  </div>

                  {/* ITEMS */}

                  <div className="px-4 sm:px-6 py-2">
                    {order.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-3 items-center py-3"
                        style={
                          index !== 0
                            ? {
                                borderTop: `1px solid ${BORDER}`,
                              }
                            : undefined
                        }
                      >
                        {/* IMAGE */}

                        <div
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                          style={{
                            background: SURFACE_MUTED,
                          }}
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

                        {/* PRODUCT INFO */}

                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-semibold text-sm truncate"
                            style={{
                              color: INK,
                            }}
                          >
                            {item.title ||
                              item.name ||
                              item.productId?.name ||
                              "Product"}
                          </h3>

                          <p
                            className="text-xs mt-0.5"
                            style={{
                              color: MUTED,
                            }}
                          >
                            Qty: {item.quantity} · ₹{item.price}/unit
                            {" · "}
                            HSN{" "}
                            {(item.hsnCode || item.productId?.hsnCode || "").trim() ||
                              "-"}
                          </p>
                        </div>

                        {/* ITEM TOTAL */}

                        <p
                          className="font-bold text-sm font-mono flex-shrink-0"
                          style={{
                            color: INK,
                          }}
                        >
                          ₹
                          {(
                            Number(item.price || 0) *
                            Number(item.quantity || 1)
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* TEAR LINE */}

                  <div className="px-4 sm:px-6">
                    <TearLine />
                  </div>

                  {/* FOOTER */}

                  <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* TOTAL */}

                    <div
                      className="text-xs sm:text-sm"
                      style={{
                        color: MUTED,
                      }}
                    >
                      {shippingFee > 0 && (
                        <span>
                          Delivery fee:{" "}
                          <strong
                            style={{
                              color: INK,
                            }}
                          >
                            ₹{shippingFee}
                          </strong>
                          {" · "}
                        </span>
                      )}

                      <span
                        className="font-bold"
                        style={{
                          color: AMBER_DARK,
                        }}
                      >
                        Grand total: ₹
                        {Number(order.totalAmount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* ACTIONS */}

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* BILL 1 – unlocks on admin order confirm */}
                      <button
                        onClick={() => handleDownloadInvoice(order, 1)}
                        disabled={!isUnlocked}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: AMBER,
                          color: "#1A1200",
                        }}
                        title={
                          isUnlocked
                            ? "Download / print invoice"
                            : "Unlocks when admin confirms order"
                        }
                      >
                        {!isUnlocked ? <Lock size={14} /> : <Download size={15} />}
                        Bill 1
                      </button>

                      {/* BILL 2 – unlocks only when admin sets cases number */}
                      <button
                        onClick={() => handleDownloadInvoice(order, 2)}
                        disabled={!isUnlocked || !isCasesUnlocked}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: isCasesUnlocked ? STEEL : SURFACE_MUTED,
                          color: isCasesUnlocked ? "#FFFFFF" : MUTED,
                        }}
                        title={
                          isCasesUnlocked
                            ? "Parcel copy – same details + cases number"
                            : "Locked until admin updates cases / parcel number"
                        }
                      >
                        {!isCasesUnlocked ? (
                          <Lock size={14} />
                        ) : (
                          <Printer size={15} />
                        )}
                        Bill 2
                        {!isCasesUnlocked && (
                          <span className="text-[10px] font-bold opacity-80">
                            LOCKED
                          </span>
                        )}
                      </button>
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
