import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE = "https://backend-3-axez.onrender.com";
const API = `${API_BASE}/api/banners`;
const MAX_BANNERS = 5;
const MAX_SIZE_MB = 5;

const emptyForm = { tagline: "", title: "", specs: "", order: 0 };

// /uploads/xyz.jpg -> full backend URL, http link ko waise hi rehne do
const getImageUrl = (img) => {
  if (!img) return "";
  return img.startsWith("http") ? img : `${API_BASE}${img}`;
};

const AdminBannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [selectedId, setSelectedId] = useState(null); // big preview wala banner
  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // Fetch Banners
  const fetchBanners = async () => {
    try {
      const { data } = await axios.get(API);
      if (data.success) {
        const list = data.banners || [];
        setBanners(list);
        setSelectedId((prev) =>
          list.some((b) => b._id === prev) ? prev : list[0]?._id || null
        );
      }
    } catch (error) {
      toast.error("Failed to load banners");
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Selected file ka local preview
  useEffect(() => {
    if (!imageFile) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateFile = (file) => {
    if (!file) return false;
    if (!file.type.startsWith("image/")) {
      toast.error("Sirf image file select karein");
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image ${MAX_SIZE_MB}MB se chhoti honi chahiye`);
      return false;
    }
    return true;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (validateFile(file)) setImageFile(file);
    e.target.value = ""; // same file dobara select kar sako
  };

  const clearSelectedFile = () => {
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setFormData(emptyForm);
    clearSelectedFile();
    setIsEditing(false);
    setCurrentId(null);
  };

  // Submit Handler (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditing && banners.length >= MAX_BANNERS) {
      toast.error("Maximum limit reached! Aap sirf 5 banners upload kar sakte hain.");
      return;
    }
    if (!isEditing && !imageFile) {
      toast.error("Pehle ek product image select karein");
      return;
    }

    try {
      setLoading(true);

      const body = new FormData();
      body.append("tagline", formData.tagline);
      body.append("title", formData.title);
      body.append("specs", formData.specs);
      body.append("order", formData.order);
      if (imageFile) body.append("image", imageFile);

      // FormData ke saath Content-Type manually set mat karein
      const config = { headers: authHeaders() };

      if (isEditing) {
        const { data } = await axios.put(`${API}/${currentId}`, body, config);
        if (data.success) toast.success("Banner updated successfully!");
      } else {
        const { data } = await axios.post(API, body, config);
        if (data.success) {
          toast.success("Banner added successfully!");
          if (data.banner?._id) setSelectedId(data.banner._id);
        }
      }

      resetForm();
      fetchBanners();
    } catch (error) {
      console.error("Banner submission error:", error);
      toast.error(error.response?.data?.message || error.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // Edit Trigger
  const handleEdit = (banner) => {
    setIsEditing(true);
    setCurrentId(banner._id);
    setImageFile(null);
    setFormData({
      tagline: banner.tagline || "",
      title: banner.title || "",
      specs: banner.specs || "",
      order: banner.order ?? 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete Handler (X button + Delete button dono yahi use karte hain)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      const { data } = await axios.delete(`${API}/${id}`, { headers: authHeaders() });
      if (data.success) {
        toast.success("Banner deleted successfully!");
        if (currentId === id) resetForm();
        fetchBanners();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete banner");
    }
  };

  // Big banner ki image replace karna (baaki details same rehti hain)
  const handleReplaceImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!validateFile(file) || !selectedBanner) return;

    try {
      setReplacing(true);
      const body = new FormData();
      body.append("image", file);
      const { data } = await axios.put(`${API}/${selectedBanner._id}`, body, {
        headers: authHeaders(),
      });
      if (data.success) {
        toast.success("Image replaced successfully!");
        fetchBanners();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to replace image");
    } finally {
      setReplacing(false);
    }
  };

  const selectedBanner = banners.find((b) => b._id === selectedId) || null;
  const editingBanner = banners.find((b) => b._id === currentId) || null;
  const formPreview = preview || (isEditing ? getImageUrl(editingBanner?.image) : "");
  const limitReached = !isEditing && banners.length >= MAX_BANNERS;

  const inputClass =
    "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 text-white";
  const labelClass = "block text-xs font-semibold uppercase text-slate-400 mb-1";

  return (
    <div className="p-6 max-w-6xl mx-auto text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Manage Hero Banners (Showcase Slider)</h2>
          <p className="text-xs text-slate-400 mt-1">
            Homepage carousel items (maximum {MAX_BANNERS} banners)
          </p>
        </div>
        <div
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
            banners.length >= MAX_BANNERS
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
          }`}
        >
          📊 Uploaded: <span className="font-bold">{banners.length} / {MAX_BANNERS}</span> Banners
        </div>
      </div>

      {/* Banner Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-8 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Image upload area */}
        <div>
          <label className={labelClass}>
            Product Image {isEditing ? "(naya select karein to replace hogi)" : "*"}
          </label>

          {formPreview ? (
            <div className="relative w-full h-56 bg-white/5 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
              <img src={formPreview} alt="preview" className="w-full h-full object-contain p-2" />

              {/* X: selected file hatane ke liye */}
              {imageFile && (
                <button
                  type="button"
                  onClick={clearSelectedFile}
                  title="Remove selected image"
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white text-sm font-bold flex items-center justify-center shadow-lg cursor-pointer"
                >
                  ✕
                </button>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-slate-950/80 hover:bg-slate-950 border border-slate-700 text-xs px-3 py-1.5 rounded-lg cursor-pointer"
              >
                {imageFile ? "Change" : "Replace image"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={limitReached}
              className="w-full h-56 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-3xl">🖼️</span>
              <span className="text-sm font-medium">Click to upload product image</span>
              <span className="text-[11px]">PNG, JPG, WEBP · max {MAX_SIZE_MB}MB</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Text fields */}
        <div className="grid grid-cols-1 gap-4 content-start">
          <div>
            <label className={labelClass}>Tagline (e.g. Heavy-Duty Series)</label>
            <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} placeholder="Heavy-Duty Series" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Title (e.g. Special Combination Plier)</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Special Combination Plier" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Specs Description</label>
            <input type="text" name="specs" value={formData.specs} onChange={handleChange} placeholder="8″ 205mm · Drop Forged" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Display Order Index</label>
            <input type="number" name="order" value={formData.order} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || limitReached}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-all cursor-pointer text-sm shadow-lg shadow-indigo-600/20"
          >
            {loading
              ? "Saving..."
              : isEditing
              ? "Update Banner"
              : limitReached
              ? `Limit Reached (${MAX_BANNERS}/${MAX_BANNERS})`
              : "Add Banner"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-xl text-sm cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Showcase: 1 big + baaki small cards */}
      <h3 className="text-xl font-semibold mb-4">Active Banners ({banners.length})</h3>

      {banners.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <p>No banners uploaded yet. Add your first banner using the form above!</p>
        </div>
      ) : (
        <>
          {/* Big preview */}
          {selectedBanner && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl mb-5">
              <div className="relative w-full h-64 md:h-96 bg-white/5 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
                <img
                  src={getImageUrl(selectedBanner.image)}
                  alt={selectedBanner.title}
                  className="w-full h-full object-contain p-3"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/800x500?text=Image+Not+Found";
                  }}
                />
                <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md border border-slate-800">
                  Slide #{banners.findIndex((b) => b._id === selectedBanner._id) + 1} (Order: {selectedBanner.order})
                </span>

                {/* X: big banner delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(selectedBanner._id)}
                  title="Delete banner"
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold flex items-center justify-center shadow-lg cursor-pointer"
                >
                  ✕
                </button>

                {replacing && (
                  <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center text-sm">
                    Replacing image...
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                    {selectedBanner.tagline}
                  </span>
                  <h4 className="font-bold text-white text-lg mt-1">{selectedBanner.title}</h4>
                  <p className="text-sm text-slate-400 mt-1">{selectedBanner.specs}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => replaceInputRef.current?.click()}
                    disabled={replacing}
                    className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    🔄 Replace Image
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(selectedBanner)}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    ✏️ Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedBanner._id)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>

              <input
                ref={replaceInputRef}
                type="file"
                accept="image/*"
                onChange={handleReplaceImage}
                className="hidden"
              />
            </div>
          )}

          {/* Small cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {banners.map((banner, idx) => {
              const active = banner._id === selectedId;
              return (
                <div
                  key={banner._id}
                  onClick={() => setSelectedId(banner._id)}
                  className={`relative bg-slate-900 rounded-xl p-2 cursor-pointer transition-all border ${
                    active
                      ? "border-indigo-500 ring-2 ring-indigo-500/40"
                      : "border-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="w-full h-24 bg-white/5 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={getImageUrl(banner.image)}
                      alt={banner.title}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/200x150?text=No+Image";
                      }}
                    />
                  </div>
                  <p className="text-[11px] font-semibold text-white mt-2 line-clamp-1">{banner.title}</p>
                  <p className="text-[10px] text-slate-500">Slide #{idx + 1}</p>

                  {/* X: small card delete */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(banner._id);
                    }}
                    title="Delete banner"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shadow-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminBannerManager;
