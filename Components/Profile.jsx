import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Globe,
  ShieldCheck,
  Lock,
  Edit3,
  Save,
  X,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { CartContext } from "../Components/Context"; // Adjust path if needed

const Profile = () => {
  const navigate = useNavigate();
  
  // Try to load initial user data from localStorage
  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: savedUser.name || "",
    email: savedUser.email || "",
    mobile: savedUser.mobile || "",
    address: savedUser.address || "",
    city: savedUser.city || "",
    state: savedUser.state || "",
    pincode: savedUser.pincode || "",
    country: savedUser.country || "India",
  });

  // ================= 1. FETCH & SYNC LATEST PROFILE ON REFRESH =================
  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const { data } = await axios.get(
          "https://backend-3-axez.onrender.com/api/auth/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (data.success && data.user) {
          // Sync with LocalStorage
          localStorage.setItem("user", JSON.stringify(data.user));

          // Sync with Form State
          setFormData({
            name: data.user.name || "",
            email: data.user.email || "",
            mobile: data.user.mobile || "",
            address: data.user.address || "",
            city: data.user.city || "",
            state: data.user.state || "",
            pincode: data.user.pincode || "",
            country: data.user.country || "India",
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile on refresh:", error);
      }
    };

    fetchLatestProfile();
  }, []);

  // ================= 2. INPUT CHANGE HANDLER =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= 3. SUBMIT & UPDATE PROFILE =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const { data } = await axios.put(
        "https://backend-3-axez.onrender.com/api/auth/update-profile",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(data.message || "Profile updated successfully!");

        // 🟢 CRITICAL: Update LocalStorage so refresh retains edited data
        const updatedUser = { ...savedUser, ...data.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setIsEditing(false);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update profile. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= 4. CANCEL EDITING =================
  const handleCancel = () => {
    const latestSaved = JSON.parse(localStorage.getItem("user") || "{}");
    setFormData({
      name: latestSaved.name || "",
      email: latestSaved.email || "",
      mobile: latestSaved.mobile || "",
      address: latestSaved.address || "",
      city: latestSaved.city || "",
      state: latestSaved.state || "",
      pincode: latestSaved.pincode || "",
      country: latestSaved.country || "India",
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER & EDIT / SAVE ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-md border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-indigo-200">
              {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {formData.name || "User Profile"}
              </h1>
              <p className="text-sm text-gray-500">{formData.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-md shadow-indigo-100"
              >
                <Edit3 size={16} /> Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm hover:bg-gray-200 transition"
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition shadow-md shadow-emerald-100 disabled:opacity-50"
                >
                  <Save size={16} /> {loading ? "Saving..." : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* MAIN PROFILE FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: Personal Info */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg mb-6 pb-2 border-b border-gray-100">
              <User size={20} />
              <h2>Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <User size={13} /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 text-gray-800 text-sm font-medium transition outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <Mail size={13} /> Email Address (Read-only)
                </label>
                <input
                  type="email"
                  name="email"
                  disabled={true}
                  value={formData.email}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm font-medium outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <Phone size={13} /> Mobile Number
                </label>
                <input
                  type="text"
                  name="mobile"
                  disabled={!isEditing}
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 text-gray-800 text-sm font-medium transition outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Address Info */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg mb-6 pb-2 border-b border-gray-100">
              <MapPin size={20} />
              <h2>Address Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <MapPin size={13} /> Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  disabled={!isEditing}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 text-gray-800 text-sm font-medium transition outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <Building size={13} /> City
                </label>
                <input
                  type="text"
                  name="city"
                  disabled={!isEditing}
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 text-gray-800 text-sm font-medium transition outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <Globe size={13} /> State
                </label>
                <input
                  type="text"
                  name="state"
                  disabled={!isEditing}
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 text-gray-800 text-sm font-medium transition outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <MapPin size={13} /> Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  disabled={!isEditing}
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 text-gray-800 text-sm font-medium transition outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <Globe size={13} /> Country
                </label>
                <input
                  type="text"
                  name="country"
                  disabled={!isEditing}
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 text-gray-800 text-sm font-medium transition outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Security & Account Actions */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg mb-6 pb-2 border-b border-gray-100">
              <ShieldCheck size={20} />
              <h2>Account & Security</h2>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    Password Settings
                  </h3>
                  <p className="text-xs text-gray-500">
                    Change your password to keep your account secure.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 font-medium text-xs hover:bg-gray-100 transition shadow-sm"
              >
                Forgot Password?
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Profile;
