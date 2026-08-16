import React, { useState } from "react";
import { PackagePlus, ImagePlus, Plus, Trash2, CheckCircle, Upload, X, Ruler, Weight, Percent } from "lucide-react";

const AddProduct=()=> {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState({
    title: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    stock: "",
    gst: "", // GST percentage number
    dimensions: "",
    weight: "",
    images: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setProduct((prev) => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Add your submit API call logic here
      console.log("Submitting Product:", product);
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Product Add Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md my-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b">
        <PackagePlus className="w-8 h-8 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Product Title</label>
            <input
              type="text"
              name="title"
              value={product.title}
              onChange={handleChange}
              placeholder="Enter product title"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              name="category"
              value={product.category}
              onChange={handleChange}
              placeholder="Enter category"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              placeholder="0.00"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Discount Price (₹)</label>
            <input
              type="number"
              name="discountPrice"
              value={product.discountPrice}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Stock Quantity</label>
            <input
              type="number"
              name="stock"
              value={product.stock}
              onChange={handleChange}
              placeholder="Enter quantity"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* GST Rate (Only Input Number Field) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Percent className="w-4 h-4 text-gray-500" /> GST Rate (%)
            </label>
            <input
              type="number"
              name="gst"
              value={product.gst}
              onChange={handleChange}
              placeholder="e.g. 18"
              min="0"
              max="100"
              step="any"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Ruler className="w-4 h-4 text-gray-500" /> Dimensions
            </label>
            <input
              type="text"
              name="dimensions"
              value={product.dimensions}
              onChange={handleChange}
              placeholder="L x W x H cm"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Weight className="w-4 h-4 text-gray-500" /> Weight (kg)
            </label>
            <input
              type="text"
              name="weight"
              value={product.weight}
              onChange={handleChange}
              placeholder="e.g. 0.5 kg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            rows="4"
            value={product.description}
            onChange={handleChange}
            placeholder="Write product description..."
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          ></textarea>
        </div>

        {/* Image Upload Section */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Product Images</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
              <Upload className="w-10 h-10 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Click to upload product images</span>
            </label>
          </div>

          {/* Image Previews */}
          {product.images.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
              {product.images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 border rounded-lg overflow-hidden group">
                  <img
                    src={URL.createObjectURL(img)}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
        >
          {loading ? (
            "Adding Product..."
          ) : (
            <>
              <Plus className="w-5 h-5" /> Add Product
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default AddProduct;
