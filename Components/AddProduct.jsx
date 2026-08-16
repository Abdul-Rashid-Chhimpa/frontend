import React, { useState } from "react";
import {
  PackagePlus,
  Plus,
  Trash2,
  Upload,
  X,
  Percent,
  Ruler,
  Weight,
} from "lucide-react";

const AddProduct = () => {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    brand: "",
    category: "",
    material: "",
    stock: "",
    size: "",
    weight: "",
    gst: "",
    variantGroup: "",
    description: "",
    images: [],
  });

  // Dynamic Quantity Wise Pricing State
  const [pricing, setPricing] = useState([{ quantity: 1, price: "" }]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Pricing Handlers
  const handlePricingChange = (index, field, value) => {
    const updatedPricing = [...pricing];
    updatedPricing[index][field] = value;
    setPricing(updatedPricing);
  };

  const addPricingRow = () => {
    setPricing((prev) => [...prev, { quantity: "", price: "" }]);
  };

  const removePricingRow = (index) => {
    if (pricing.length === 1) return; // At least one pricing row required
    setPricing((prev) => prev.filter((_, i) => i !== index));
  };

  // Image Upload Handlers
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setProduct((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const removeImage = (index) => {
    setProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Submit Handler sending FormData to Node/Express Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("brand", product.brand);
      formData.append("category", product.category);
      formData.append("material", product.material);
      formData.append("stock", product.stock);
      formData.append("size", product.size);
      formData.append("weight", product.weight);
      formData.append("gst", product.gst);
      formData.append("variantGroup", product.variantGroup);
      formData.append("description", product.description);

      // JSON stringify dynamic pricing list for backend
      formData.append("pricing", JSON.stringify(pricing));

      // Append image files
      product.images.forEach((img) => {
        formData.append("images", img);
      });

      console.log("Submitting Product Form Data...");

      /* API Call Example:
      const res = await axios.post("/api/add-product", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert(res.data.message);
      */
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Product Add Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-md my-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b">
        <PackagePlus className="w-8 h-8 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Images Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            <Upload className="w-4 h-4" /> Product Images
          </label>
          <div className="flex flex-wrap items-center gap-4">
            {product.images.map((img, idx) => (
              <div
                key={idx}
                className="relative w-24 h-24 border border-gray-300 rounded-xl overflow-hidden group shadow-sm"
              >
                <img
                  src={URL.createObjectURL(img)}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs hover:bg-red-600 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-gray-50 transition text-gray-400 hover:text-indigo-600">
              <Plus className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Add</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Basic Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            placeholder="Product Name"
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            type="text"
            name="brand"
            value={product.brand}
            onChange={handleChange}
            placeholder="Brand"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            type="text"
            name="category"
            value={product.category}
            onChange={handleChange}
            placeholder="Category"
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            type="text"
            name="material"
            value={product.material}
            onChange={handleChange}
            placeholder="Material"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            type="number"
            name="stock"
            value={product.stock}
            onChange={handleChange}
            placeholder="Stock"
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            type="text"
            name="size"
            value={product.size}
            onChange={handleChange}
            placeholder="Size (e.g. XL, 10 inch)"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            type="text"
            name="weight"
            value={product.weight}
            onChange={handleChange}
            placeholder="Weight (e.g. 500g, 1kg)"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            type="number"
            name="gst"
            value={product.gst}
            onChange={handleChange}
            placeholder="GST Percentage (%)"
            min="0"
            max="100"
            step="any"
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Variant Group */}
        <div>
          <input
            type="text"
            name="variantGroup"
            value={product.variantGroup}
            onChange={handleChange}
            placeholder="Variant Group (e.g. pliers-water)"
            className="w-full md:w-1/2 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Quantity Wise Pricing Section */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-800">
              Quantity Wise Pricing
            </h3>
            <button
              type="button"
              onClick={addPricingRow}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-xl transition"
            >
              <Plus className="w-4 h-4" /> Add Price
            </button>
          </div>

          <div className="space-y-3">
            {pricing.map((row, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  value={row.quantity}
                  onChange={(e) =>
                    handlePricingChange(index, "quantity", e.target.value)
                  }
                  placeholder="Min Quantity"
                  required
                  className="w-1/2 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input
                  type="number"
                  min="0"
                  value={row.price}
                  onChange={(e) =>
                    handlePricingChange(index, "price", e.target.value)
                  }
                  placeholder="Price (₹)"
                  required
                  className="w-1/2 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => removePricingRow(index)}
                  disabled={pricing.length === 1}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white p-2.5 rounded-xl transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <textarea
            name="description"
            rows="3"
            value={product.description}
            onChange={handleChange}
            placeholder="Write product description..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 disabled:bg-gray-400"
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
};

export default AddProduct;
