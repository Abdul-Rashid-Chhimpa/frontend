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

  const token = localStorage.getItem("token");

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
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      if (isEditing) {
        await axios.put(`https://backend-3-axez.onrender.com/api/banners/${currentId}`, formData, { headers });
        toast.success("Banner updated successfully!");
      } else {
        await axios.post("https://backend-3-axez.onrender.com/api/banners", formData, { headers });
        toast.success("Banner added successfully!");
      }

      setFormData({ image: "", tagline: "", title: "", specs: "", order: 0 });
      setIsEditing(false);
      setCurrentId(null);
      fetchBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
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
  };

  // Delete Handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`https://backend-3-axez.onrender.com/api/banners/${id}`, { headers });
      toast.success("Banner deleted successfully!");
      fetchBanners();
    } catch (error) {
      toast.error("Failed to delete banner");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-slate-100">
      <h2 className="text-2xl font-bold mb-6">Manage Hero Banners (Showcase Slider)</h2>

      {/* Banner Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-8 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Image URL / Cloudinary Link</label>
          <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Tagline (e.g. Heavy-Duty Series)</label>
          <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} placeholder="Heavy-Duty Series" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Title (e.g. Special Combination Plier)</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Special Combination Plier" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Specs Description</label>
          <input type="text" name="specs" value={formData.specs} onChange={handleChange} placeholder="8″ 205mm · Drop Forged" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Display Order</label>
          <input type="number" name="order" value={formData.order} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500" />
        </div>
        <div className="flex items-end gap-3">
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition-all">
            {loading ? "Saving..." : isEditing ? "Update Banner" : "Add Banner"}
          </button>
          {isEditing && (
            <button type="button" onClick={() => { setIsEditing(false); setFormData({ image: "", tagline: "", title: "", specs: "", order: 0 }); }} className="bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl text-sm">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Existing Banners List */}
      <h3 className="text-xl font-semibold mb-4">Existing Banners</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {banners.map((banner) => (
          <div key={banner._id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <img src={banner.image} alt={banner.title} className="w-full h-32 object-contain bg-white rounded-lg mb-3 p-2" />
              <span className="text-xs text-indigo-400 font-semibold uppercase">{banner.tagline}</span>
              <h4 className="font-bold text-white text-base mt-1">{banner.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{banner.specs}</p>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
              <button onClick={() => handleEdit(banner)} className="flex-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 py-1.5 rounded-lg text-xs font-semibold">Edit</button>
              <button onClick={() => handleDelete(banner._id)} className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 py-1.5 rounded-lg text-xs font-semibold">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBannerManager;
