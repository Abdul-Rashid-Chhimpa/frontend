import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AdminBannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    image: "",
    tagline: "",
    title: "",
    specs: "",
    order: 0,
  });

  // Fetch Banners
  const fetchBanners = async () => {
    try {
      const { data } = await axios.get("https://backend-3-axez.onrender.com/api/banners");
      if (data.success) setBanners(data.banners);
    } catch (error) {
      toast.error("Failed to load banners");
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit Handler (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for max 5 banners limit on creation
    if (!isEditing && banners.length >= 5) {
      toast.error("Maximum limit reached! You can only upload up to 5 banners.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json" 
      };

      if (isEditing) {
        const { data } = await axios.put(
          `https://backend-3-axez.onrender.com/api/banners/${currentId}`, 
          formData, 
          { headers }
        );
        if (data.success) {
          toast.success("Banner updated successfully!");
        }
      } else {
        const { data } = await axios.post(
          "https://backend-3-axez.onrender.com/api/banners", 
          formData, 
          { headers }
        );
        if (data.success) {
          toast.success("Banner added successfully!");
        }
      }

      setFormData({ image: "", tagline: "", title: "", specs: "", order: 0 });
      setIsEditing(false);
      setCurrentId(null);
      fetchBanners();
    } catch (error) {
      console.error("Banner submission error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Operation failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Edit Trigger
  const handleEdit = (banner) => {
    setIsEditing(true);
    setCurrentId(banner._id);
    setFormData({
      image: banner.image,
      tagline: banner.tagline,
      title: banner.title,
      specs: banner.specs,
      order: banner.order,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete Handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const { data } = await axios.delete(`https://backend-3-axez.onrender.com/api/banners/${id}`, { headers });
      
      if (data.success) {
        toast.success("Banner deleted successfully!");
        fetchBanners();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete banner");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-slate-100 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Manage Hero Banners (Showcase Slider)</h2>
          <p className="text-xs text-slate-400 mt-1">Configure homepage carousel items (Recommended: up to 5 banners)</p>
        </div>
        <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
          banners.length >= 5 
            ? "bg-red-500/10 border-red-500/30 text-red-400" 
            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
        }`}>
          📊 Uploaded: <span className="font-bold">{banners.length} / 5</span> Banners
        </div>
      </div>

      {/* Banner Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-8 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Image URL / Cloudinary Link</label>
          <input 
            type="text" 
            name="image" 
            value={formData.image} 
            onChange={handleChange} 
            placeholder="https://res.cloudinary.com/..." 
            required 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 text-white" 
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Tagline (e.g. Heavy-Duty Series)</label>
          <input 
            type="text" 
            name="tagline" 
            value={formData.tagline} 
            onChange={handleChange} 
            placeholder="Heavy-Duty Series" 
            required 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 text-white" 
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Title (e.g. Special Combination Plier)</label>
          <input 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            placeholder="Special Combination Plier" 
            required 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 text-white" 
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Specs Description</label>
          <input 
            type="text" 
            name="specs" 
            value={formData.specs} 
            onChange={handleChange} 
            placeholder="8″ 205mm · Drop Forged" 
            required 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 text-white" 
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Display Order Index</label>
          <input 
            type="number" 
            name="order" 
            value={formData.order} 
            onChange={handleChange} 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 text-white" 
          />
        </div>

        <div className="flex items-end gap-3">
          <button 
            type="submit" 
            disabled={loading || (!isEditing && banners.length >= 5)} 
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-all cursor-pointer text-sm shadow-lg shadow-indigo-600/20"
          >
            {loading ? "Saving..." : isEditing ? "Update Banner" : banners.length >= 5 ? "Limit Reached (5/5)" : "Add Banner"}
          </button>
          {isEditing && (
            <button 
              type="button" 
              onClick={() => { 
                setIsEditing(false); 
                setFormData({ image: "", tagline: "", title: "", specs: "", order: 0 }); 
              }} 
              className="bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl text-sm cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Existing Banners List */}
      <h3 className="text-xl font-semibold mb-4 flex items-center justify-between">
        <span>Active Banners List ({banners.length})</span>
      </h3>

      {banners.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <p>No banners uploaded yet. Add your first banner using the form above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {banners.map((banner, idx) => (
            <div key={banner._id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-lg relative group">
              <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md border border-slate-800">
                Slide #{idx + 1} (Order: {banner.order})
              </span>

              <div>
                <div className="w-full h-40 bg-white/5 rounded-xl mb-3 overflow-hidden border border-slate-800 flex items-center justify-center">
                  <img 
                    src={banner.image} 
                    alt={banner.title} 
                    className="w-full h-full object-contain p-2" 
                    onError={(e) => {
                      e.target.src = "https://placehold.co/400x300?text=Invalid+Image+URL";
                    }}
                  />
                </div>
                <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">{banner.tagline}</span>
                <h4 className="font-bold text-white text-base mt-1 line-clamp-1">{banner.title}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{banner.specs}</p>
              </div>

              <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-800/80">
                <button 
                  onClick={() => handleEdit(banner)} 
                  className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Edit Banner
                </button>
                <button 
                  onClick={() => handleDelete(banner._id)} 
                  className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBannerManager;
