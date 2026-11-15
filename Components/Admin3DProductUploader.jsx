import React, { useState } from "react";
import { UploadCloud, Rotate3d, Trash2, CheckCircle2, Loader2 } from "lucide-react";

const Admin3DProductUploader = ({ onSaveProduct }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [category, setCategory] = useState("Wrenches");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [frames360, setFrames360] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Replace with your Cloudinary Cloud Name & Unsigned Preset
  const CLOUD_NAME = "YOUR_CLOUDINARY_CLOUD_NAME";
  const UPLOAD_PRESET = "YOUR_UPLOAD_PRESET";

  const uploadToCloudinary = async (files, targetType) => {
    setUploading(true);
    const uploadedUrls = [];

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        if (data.secure_url) {
          // Optimize delivery automatically with f_auto,q_auto
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
      alert("Image upload failed. Please check Cloudinary preset.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      price: Number(price),
      discountPrice: Number(discountPrice),
      category,
      description,
      images,
      frames360,
      is360Enabled: true,
    };

    if (onSaveProduct) {
      await onSaveProduct(payload);
    }
    alert("Product with 360° Cloudinary views saved successfully!");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-3xl shadow-xl border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-amber-100 text-amber-700">
          <Rotate3d size={24} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Add Product with 3D & 360° View
          </h2>
          <p className="text-xs text-slate-500">
            Upload main photos & multi-angle 360° frames directly to Cloudinary
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Tool Name (e.g. Heavy Duty Pipe Wrench)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-amber-500"
          />
          <input
            type="text"
            placeholder="Category (e.g. Wrenches, Pliers)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-amber-500"
          />
          <input
            type="number"
            placeholder="MRP Price (₹)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-amber-500"
          />
          <input
            type="number"
            placeholder="Selling Price (₹)"
            value={discountPrice}
            onChange={(e) => setDiscountPrice(e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-amber-500"
          />
        </div>

        <textarea
          rows={3}
          placeholder="Product details, material strength & usage..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-amber-500"
        />

        {/* Main Gallery Images Upload */}
        <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
          <label className="flex flex-col items-center cursor-pointer">
            <UploadCloud className="text-slate-500 mb-1" size={28} />
            <span className="text-sm font-bold text-slate-700">
              Upload Main Product Photos (Cloudinary)
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => uploadToCloudinary(e.target.files, "main")}
            />
          </label>
          <div className="flex gap-2 mt-3 flex-wrap">
            {images.map((url, idx) => (
              <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 360-Degree Sequence Upload */}
        <div className="p-4 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50/40">
          <label className="flex flex-col items-center cursor-pointer">
            <Rotate3d className="text-amber-600 mb-1" size={28} />
            <span className="text-sm font-bold text-slate-800">
              Upload 360° Rotation Angles (Select 4–24 photos in sequence)
            </span>
            <span className="text-xs text-slate-500">
              Users can drag to rotate the tool 360 degrees in full screen
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => uploadToCloudinary(e.target.files, "360")}
            />
          </label>
          <div className="flex gap-2 mt-3 flex-wrap">
            {frames360.map((url, idx) => (
              <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border border-amber-400">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[10px] text-center">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition cursor-pointer"
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Uploading to Cloudinary...
            </>
          ) : (
            <>
              <CheckCircle2 size={18} /> Save 3D & 360° Product
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Admin3DProductUploader;
