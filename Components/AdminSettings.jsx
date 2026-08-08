import { useState, useEffect } from "react";
import axios from "axios";
import {
  Settings,
  Store,
  Truck,
  CreditCard,
  Percent,
  Package,
  Share2,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const API_BASE = "https://backend-3-axez.onrender.com/api";

const defaultForm = {
  storeName: "",
  storeEmail: "",
  storePhone: "",
  storeAddress: "",
  storeCity: "",
  storeState: "",
  storePincode: "",
  storeCountry: "India",
  whatsapp: "",
  instagram: "",
  facebook: "",
  shippingCharge: 50,
  freeShippingAbove: 999,
  gstPercent: 18,
  lowStockThreshold: 10,
  codEnabled: true,
  onlinePaymentEnabled: false,
  maintenanceMode: false,
  currency: "INR",
};

const AdminSettings = () => {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("store");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/settings`);
      if (data.success && data.settings) {
        setForm({ ...defaultForm, ...data.settings });
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Settings load nahi ho paye",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      const { data } = await axios.put(`${API_BASE}/settings`, form);

      if (data.success) {
        setForm({ ...defaultForm, ...data.settings });
        setMessage({ type: "success", text: "Settings saved successfully!" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: data.message || "Save failed" });
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Settings update failed",
      });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "store", label: "Store", icon: Store },
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "tax", label: "Tax & Stock", icon: Percent },
    { id: "social", label: "Social", icon: Share2 },
  ];

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition";
  const labelClass = "block text-xs sm:text-sm font-medium text-gray-600 mb-1.5";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium text-sm">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Settings className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800">
                Settings
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Store, shipping, payment & more
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchSettings}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 transition shadow-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`mb-5 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertTriangle size={18} />
            )}
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-5">
            {/* ===== STORE ===== */}
            {activeTab === "store" && (
              <>
                <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Store size={18} className="text-indigo-600" />
                  Store Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Store Name</label>
                    <input
                      name="storeName"
                      value={form.storeName}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Pedwal Life Creation"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      name="storeEmail"
                      value={form.storeEmail}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="contact@store.com"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input
                      name="storePhone"
                      value={form.storePhone}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="9876543210"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Address</label>
                    <input
                      name="storeAddress"
                      value={form.storeAddress}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>City</label>
                    <input
                      name="storeCity"
                      value={form.storeCity}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <input
                      name="storeState"
                      value={form.storeState}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Pincode</label>
                    <input
                      name="storePincode"
                      value={form.storePincode}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Country</label>
                    <input
                      name="storeCountry"
                      value={form.storeCountry}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Maintenance */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      Maintenance Mode
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Site temporarily unavailable for customers
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="maintenanceMode"
                      checked={form.maintenanceMode}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                  </label>
                </div>
              </>
            )}

            {/* ===== SHIPPING ===== */}
            {activeTab === "shipping" && (
              <>
                <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Truck size={18} className="text-indigo-600" />
                  Shipping Settings
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      Shipping Charge (₹)
                    </label>
                    <input
                      type="number"
                      name="shippingCharge"
                      value={form.shippingCharge}
                      onChange={handleChange}
                      min="0"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Free Shipping Above (₹)
                    </label>
                    <input
                      type="number"
                      name="freeShippingAbove"
                      value={form.freeShippingAbove}
                      onChange={handleChange}
                      min="0"
                      className={inputClass}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Order amount ≥ ₹{form.freeShippingAbove || 0} pe shipping free
                  hogi. Warna ₹{form.shippingCharge || 0} charge hoga.
                </p>
              </>
            )}

            {/* ===== PAYMENT ===== */}
            {activeTab === "payment" && (
              <>
                <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                  <CreditCard size={18} className="text-indigo-600" />
                  Payment Methods
                </h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        Cash on Delivery (COD)
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Customers pay on delivery
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="codEnabled"
                        checked={form.codEnabled}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        Online Payment
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        UPI / Card / Net Banking (enable when gateway ready)
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="onlinePaymentEnabled"
                        checked={form.onlinePaymentEnabled}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* ===== TAX & STOCK ===== */}
            {activeTab === "tax" && (
              <>
                <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Package size={18} className="text-indigo-600" />
                  Tax & Stock Alerts
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>GST (%)</label>
                    <input
                      type="number"
                      name="gstPercent"
                      value={form.gstPercent}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Low Stock Threshold</label>
                    <input
                      type="number"
                      name="lowStockThreshold"
                      value={form.lowStockThreshold}
                      onChange={handleChange}
                      min="0"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Currency</label>
                    <select
                      name="currency"
                      value={form.currency}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Stock ≤ {form.lowStockThreshold || 0} hone pe low-stock alert
                  dikhega analytics / products mein.
                </p>
              </>
            )}

            {/* ===== SOCIAL ===== */}
            {activeTab === "social" && (
              <>
                <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Share2 size={18} className="text-indigo-600" />
                  Social Links
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className={labelClass}>WhatsApp Number</label>
                    <input
                      name="whatsapp"
                      value={form.whatsapp}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="919876543210"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Instagram URL</label>
                    <input
                      name="instagram"
                      value={form.instagram}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="https://instagram.com/yourpage"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Facebook URL</label>
                    <input
                      name="facebook"
                      value={form.facebook}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white font-semibold text-sm shadow-lg hover:opacity-95 disabled:opacity-60 transition"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
