import React, { useState } from "react";
import axios from "axios";
import { 
  UploadCloud, 
  Rotate3d, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  Plus, 
  Layers, 
  Sun, 
  Moon,
  Sparkles,
  Tag,
  DollarSign
} from "lucide-react";

const API_BASE = "https://backend-3-axez.onrender.com";

const Admin3DProductUploader = ({ onSaveProduct }) => {
  const [isDark, setIsDark] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Product Form States
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "Wrenches",
    material: "Chrome Vanadium Steel",
    warranty: "5 Years Replacement Warranty",
    status: "Active",
    stock: 10,
  });

  const [specs, setSpecs] = useState([{ label: "Hardness", value: "58-62 HRC" }]);
  const [images, setImages] = useState([]);
  const [frames360, setFrames360] = useState([]);

  // Replace with your actual Cloudinary Cloud Name & Unsigned Preset
  const CLOUD_NAME = "upa2rnhx";
  const UPLOAD_PRESET = "cloudinary://744198687524635:**********@upa2rnhx";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Specifications Dynamic Rows
  const handleSpecChange = (index, field, value) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };

  const addSpecRow = () => {
    setSpecs([...specs, { label: "", value: "" }]);
  };

  const removeSpecRow = (index) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  // Fixed Cloudinary Multi-Uploader with Instant State Preview
  const uploadToCloudinary = async (files, targetType) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploadedUrls = [];

    try {
      for (const file of files) {
        const dataForm = new FormData();
        dataForm.append("file", file);
        dataForm.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: "POST", body: dataForm }
        );
        const data = await res.json();
        
        if (data.secure_url) {
          const optimizedUrl = data.secure_url.replace(
            "/upload/",
            "/upload/f_auto,q_auto/"
          );
          uploadedUrls.push(optimizedUrl);
        }
      }

      if (targetType === "main") {
        setImages((prev) => [...prev, ...uploadedUrls]);
      } else {
        setFrames360((prev) => [...prev, ...uploadedUrls]);
      }
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      alert("Image upload failed. Please verify Cloudinary credentials.");
    } finally {
      setUploading(false);
    }
  };

  // Submit Handler to Backend API
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("Please upload at least one main product image.");
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
      stock: Number(formData.stock),
      images,
      frames360,
      specs,
      is360Enabled: frames360.length > 0,
    };

    try {
      setUploading(true);
      if (onSaveProduct) {
        await onSaveProduct(payload);
      } else {
        const token = localStorage.getItem("token");
        await axios.post(`${API_BASE}/api/products/create`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      alert("Product successfully created & published in real-time!");
      
      // Reset Form
      setFormData({
        name: "",
        tagline: "",
        description: "",
        price: "",
        discountPrice: "",
        category: "Wrenches",
        material: "Chrome Vanadium Steel",
        warranty: "5 Years Replacement Warranty",
        status: "Active",
        stock: 10,
      });
      setImages([]);
      setFrames360([]);
      setSpecs([{ label: "Hardness", value: "58-62 HRC" }]);
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Failed to save product to database.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`min-h-screen py-10 px-4 sm:px-6 transition-colors duration-500 font-sans ${
        isDark ? "bg-[#0b0f17] text-slate-100" : "bg-slate-100 text-slate-900"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Top Header & Theme Toggle */}
        <div className="flex items-center justify-between mb-8 p-6 rounded-3xl border backdrop-blur-xl bg-white/[0.03] border-white/10 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Rotate3d size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight">3D & 360° Studio Uploader</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Sparkles size={10} className="inline mr-1" /> Pro Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Manage high-performance 3D models, 360° rotation sequences & specs with real-time sync.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition cursor-pointer text-amber-400"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} className="text-slate-700" />}
          </button>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className={`p-8 rounded-3xl border shadow-2xl backdrop-blur-xl space-y-6 ${
            isDark ? "bg-white/[0.02] border-white/10" : "bg-white border-slate-200"
          }`}
        >
          {/* Section 1: Basic Info */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
              <Tag size={16} /> 1. General Information & Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5 text-slate-400">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Heavy Duty Pipe Wrench 12 inch"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/40 text-sm focus:outline-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-400">Product Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/40 text-sm focus:outline-amber-400 cursor-pointer"
                >
                  <option value="Active">Active (Live)</option>
                  <option value="Draft">Draft</option>
                  <option value="Hidden">Hidden</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5 text-slate-400">Tagline / Subtitle</label>
                <input
                  type="text"
                  name="tagline"
                  placeholder="e.g. Forged Chrome-Vanadium Steel • Anti-Slip Grip"
                  value={formData.tagline}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/40 text-sm focus:outline-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-400">Category</label>
                <input
                  type="text"
                  name="category"
                  placeholder="e.g. Wrenches, Pliers"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/40 text-sm focus:outline-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Inventory */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 flex items-center gap-2">
              <DollarSign size={16} /> 2. Pricing & Stock
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-400">MRP Price (₹) *</label>
                <input
                  type="number"
                  name="price"
                  placeholder="2499"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/40 text-sm focus:outline-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-400">Selling Price (₹)</label>
                <input
                  type="number"
                  name="discountPrice"
                  placeholder="1899"
                  value={formData.discountPrice}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/40 text-sm focus:outline-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-400">Initial Stock</label>
                <input
                  type="number"
                  name="stock"
                  placeholder="50"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/40 text-sm focus:outline-amber-400"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold mb-1.5 text-slate-400">Full Description *</label>
              <textarea
                name="description"
                rows={4}
                placeholder="Detailed description about material strength, application, and industrial usage..."
                value={formData.description}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-700/50 bg-slate-900/40 text-sm focus:outline-amber-400"
              />
            </div>
          </div>

          {/* Section 3: Technical Specifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Layers size={16} /> 3. Detailed Specifications
              </h3>
              <button
                type="button"
                onClick={addSpecRow}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition cursor-pointer flex items-center gap-1"
              >
                <Plus size={14} /> Add Spec
              </button>
            </div>

            <div className="space-y-3">
              {specs.map((spec, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Label (e.g. Hardness)"
                    value={spec.label}
                    onChange={(e) => handleSpecChange(index, "label", e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700/50 bg-slate-900/40 text-xs focus:outline-amber-400"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 58-62 HRC)"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700/50 bg-slate-900/40 text-xs focus:outline-amber-400"
                  />
                  {specs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpecRow(index)}
                      className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Cloudinary Media & 360° Sequence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Main Gallery Images */}
            <div className="p-5 rounded-2xl border-2 border-dashed border-slate-700/60 bg-slate-900/20 flex flex-col justify-between">
              <div>
                <label className="flex flex-col items-center cursor-pointer text-center">
                  <UploadCloud className="text-amber-400 mb-2" size={32} />
                  <span className="text-sm font-bold text-slate-200">Main Product Gallery</span>
                  <span className="text-xs text-slate-400 mt-0.5">Upload high-res photos for cards & lightbox</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => uploadToCloudinary(e.target.files, "main")}
                  />
                </label>
              </div>

              <div className="flex gap-2 mt-4 flex-wrap">
                {images.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow cursor-pointer"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 360° Sequence Frames */}
            <div className="p-5 rounded-2xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 flex flex-col justify-between">
              <div>
                <label className="flex flex-col items-center cursor-pointer text-center">
                  <Rotate3d className="text-amber-400 mb-2 animate-spin-slow" size={32} />
                  <span className="text-sm font-bold text-slate-200">360° Rotation Frames</span>
                  <span className="text-xs text-slate-400 mt-0.5">Select 4–24 sequential angles for turntable view</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => uploadToCloudinary(e.target.files, "360")}
                  />
                </label>
              </div>

              <div className="flex gap-2 mt-4 flex-wrap">
                {frames360.map((url, idx) => (
                  <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border border-amber-400/60">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/80 text-amber-400 text-[10px] text-center font-bold">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full py-4 rounded-2xl font-extrabold text-slate-950 flex items-center justify-center gap-2 shadow-xl hover:opacity-95 active:scale-[0.99] transition cursor-pointer"
            style={{ background: "#F0A420" }}
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Processing & Syncing Media...
              </>
            ) : (
              <>
                <CheckCircle2 size={20} /> Publish Product to Live Store
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin3DProductUploader;
