import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Edit3,
  Save,
  X,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Calendar,
} from "lucide-react";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);

  // Profile State
  const [userProfile, setUserProfile] = useState({
    fullName: "Rahul Sharma",
    username: "rahul_sharma99",
    email: "rahul.sharma@example.com",
    phone: "+91 98765 43210",
    secondaryEmail: "rahul.work@example.com",
    bio: "Hardware & Tools Specialist | Business Owner & Tech Enthusiast",
    dob: "1995-08-15",
    gender: "Male",
    address: "123, MG Road, Sector 15",
    city: "Noida",
    state: "Uttar Pradesh",
    pincode: "201301",
    country: "India",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400",
  });

  // Temporary Form State for editing
  const [formData, setFormData] = useState({ ...userProfile });
  const [previewImage, setPreviewImage] = useState(userProfile.avatar);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Image Upload & Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setFormData((prev) => ({ ...prev, avatar: imageUrl }));
    }
  };

  // Save Handler
  const handleSave = (e) => {
    e.preventDefault();
    setUserProfile({ ...formData });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Cancel Handler
  const handleCancel = () => {
    setFormData({ ...userProfile });
    setPreviewImage(userProfile.avatar);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Success Alert */}
        {saveSuccess && (
          <div className="flex items-center gap-3 bg-emerald-500 text-white p-4 rounded-2xl shadow-lg animate-bounce">
            <CheckCircle2 size={22} />
            <span className="font-semibold text-sm sm:text-base">
              Profile successfully updated!
            </span>
          </div>
        )}

        {/* PROFILE HEADER & HERO BANNER */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Banner */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 relative"></div>

          {/* User Meta Info */}
          <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            {/* Avatar with Camera Overlay */}
            <div className="relative group">
              <img
                src={previewImage}
                alt="Profile"
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white shadow-xl bg-white"
              />
              {isEditing && (
                <label className="absolute bottom-1 right-1 bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-full shadow-lg cursor-pointer transition transform hover:scale-105">
                  <Camera size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Name & Bio */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
                {userProfile.fullName}
              </h1>
              <p className="text-indigo-600 font-medium text-sm">
                @{userProfile.username}
              </p>
              <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-xl line-clamp-2">
                {userProfile.bio}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full sm:w-auto">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition active:scale-95"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleSave}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition active:scale-95"
                  >
                    <Save size={16} />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-sm transition active:scale-95"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MAIN FORM SECTIONS */}
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* SECTION 1: Personal Information */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg mb-6 pb-2 border-b border-gray-100">
              <User size={20} />
              <h2>Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  disabled={!isEditing}
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 text-gray-800 text-sm font-medium transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  disabled={!isEditing}
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 text-gray-800 text-sm font-medium transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar size={13} /> Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  disabled={!isEditing}
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 text-gray-800 text-sm font-medium transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  disabled={!isEditing}
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 text-gray-800 text-sm font-medium transition"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Bio
                </label>
                <textarea
                  rows="2"
                  name="bio"
                  disabled={!isEditing}
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 text-gray-800 text-sm font-medium transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Contact Information */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg mb-6 pb-2 border-b border-gray-100">
              <Mail size={20} />
              <h2>Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <Mail size={13} /> Primary Email
                </label>
                <input
                  type="email"
                  name="email"
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 text-gray-800 text-sm font-medium transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <Phone size={13} /> Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 text-gray-800 text-sm font-medium transition"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Secondary Email
                </label>
                <input
                  type="email"
                  name="secondaryEmail"
                  disabled={!isEditing}
                  value={formData.secondaryEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 text-gray-800 text-sm font-medium transition"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Address Information */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg mb-6 pb-2 border-b border-gray-100">
              <MapPin size={20} />
              <h2>Address Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  disabled={!isEditing}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 text-gray-800 text-sm font-medium transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  disabled={!isEditing}
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 text-gray-800 text-sm font-medium transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  disabled={!isEditing}
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 text-gray-800 text-sm font-medium transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  disabled={!isEditing}
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 text-gray-800 text-sm font-medium transition"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 text-gray-800 text-sm font-medium transition"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Security & Account Actions */}
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
                onClick={() => alert("Redirecting to Change Password page...")}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 font-medium text-xs hover:bg-gray-100 transition shadow-sm"
              >
                Change Password
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Profile;