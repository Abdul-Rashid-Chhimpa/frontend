import { useState } from "react";
import axios from "axios";
import {
  PackagePlus,
  ImagePlus,
  Plus,
  Trash2,
  CheckCircle,
  Upload,
  X,
  Ruler,
  Weight,
  Percent,
  Truck,
  CreditCard,
  Info,
} from "lucide-react";

const AddProduct = () => {
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [product, setProduct] = useState({
    name: "",
    brand: "",
    material: "",
    category: "",
    stock: "",
    description: "",
    variantGroup: "",
    size: "",
    weight: "",
    gst: "",
    // 🚚 Delivery Fields
    minQtyForFreeDelivery: "", // Kis quantity se delivery free hogi
    standardDeliveryCharge: "", // Agar order free delivery threshold se kam ho to kitna charge lagega
    deliveryNote: "Free delivery on orders with 5 or more items!", // Static/Custom banner line
    // 💳 Payment Options Status
    paymentMethods: {
      cod: true,
      phonepe: true,
      gpay: true,
      paytm: true,
      card: true,
      netbanking: true,
    },
  });

  const [priceList, setPriceList] = useState([{ quantity: "", price: "" }]);

  // ================= IMAGE HANDLERS =================
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const updatedFiles = [...imageFiles, ...files].slice(0, 10);
    setImageFiles(updatedFiles);
    const previews = updatedFiles.map((file) => URL.createObjectURL(file));
    setImages(previews);
    if (previews.length > 0 && !selectedImage) {
      setSelectedImage(previews[0]);
    }
  };

  const deleteImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newFiles = imageFiles.filter((_, i) => i !== index);
    setImages(newImages);
    setImageFiles(newFiles);
    if (newImages.length > 0) {
      setSelectedImage(newImages[0]);
    } else {
      setSelectedImage("");
    }
  };

  const replaceImage = (index, file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    const newImages = [...images];
    newImages[index] = preview;
    const newFiles = [...imageFiles];
    newFiles[index] = file;
    setImages(newImages);
    setImageFiles(newFiles);
    if (selectedImage === images[index]) {
      setSelectedImage(preview);
    }
  };

  // ================= FORM HANDLERS =================
  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handlePaymentToggle = (methodKey) => {
    setProduct((prev) => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [methodKey]: !prev.paymentMethods[methodKey],
      },
    }));
  };

  const addPriceRow = () => {
    setPriceList([...priceList, { quantity: "", price: "" }]);
  };

  const removePriceRow = (index) => {
    const data = [...priceList];
    data.splice(index, 1);
    setPriceList(data.length ? data : [{ quantity: "", price: "" }]);
  };

  const handlePriceChange = (index, field, value) => {
    const data = [...priceList];
    data[index][field] = value;
    setPriceList(data);
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageFiles.length === 0) {
      alert("Please upload at least one product image");
      return;
    }

    const validPricing = priceList.filter(
      (item) => item.quantity !== "" && item.price !== ""
    );

    if (validPricing.length === 0) {
      alert("Please add at least one pricing option");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      formData.append("name", product.name);
      formData.append("brand", product.brand);
      formData.append("category", product.category);
      formData.append("material", product.material);
      formData.append("stock", product.stock);
      formData.append("description", product.description);
      formData.append("variantGroup", product.variantGroup || "");
      formData.append("size", product.size || "");
      formData.append("weight", product.weight || "");
      formData.append("gst", product.gst || 0);

      // 🚚 Delivery & Payment Settings Sent to Backend
      formData.append("minQtyForFreeDelivery", product.minQtyForFreeDelivery || 0);
      formData.append("standardDeliveryCharge", product.standardDeliveryCharge || 0);
      formData.append("deliveryNote", product.deliveryNote);
      formData.append("paymentMethods", JSON.stringify(product.paymentMethods));

      formData.append("pricing", JSON.stringify(validPricing));

      const res = await axios.post(
        "https://backend-3-axez.onrender.com/api/products/add-product",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        alert("Product Added Successfully");
        setSuccess(true);
        setImages([]);
        setImageFiles([]);
        setSelectedImage("");
        setProduct({
          name: "",
          brand: "",
          category: "",
          material: "",
          stock: "",
          description: "",
          variantGroup: "",
          size: "",
          weight: "",
          gst: "",
          minQtyForFreeDelivery: "",
          standardDeliveryCharge: "",
          deliveryNote: "Free delivery on orders with 5 or more items!",
          paymentMethods: {
            cod: true,
            phonepe: true,
            gpay: true,
            paytm: true,
            card: true,
            netbanking: true,
          },
        });
        setPriceList([{ quantity: "", price: "" }]);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Product Add Failed");
    } fontally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-6 sm:py-8 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <PackagePlus size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">
                Add New Product
              </h1>
              <p className="text-white/80 text-sm sm:text-base mt-0.5">
                Upload, manage and publish your products
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {success && (
            <div className="mx-4 sm:mx-6 mt-5 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
              <CheckCircle size={18} />
              Product Added Successfully
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-7">
            {/* ========== IMAGES ========== */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                  <ImagePlus size={18} />
                  Product Images
                </h2>
                <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  {images.length}/10
                </span>
              </div>

              <label className="flex flex-col items-center justify-center w-full h-32 sm:h-36 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition group">
                <Upload
                  size={28}
                  className="text-gray-400 group-hover:text-indigo-500 mb-2"
                />
                <span className="text-sm text-gray-500 group-hover:text-indigo-600 font-medium">
                  Click to upload images
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  PNG, JPG up to 10 files
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {selectedImage && (
                <div className="mt-4 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-full h-[240px] sm:h-[320px] md:h-[380px] object-contain p-3"
                  />
                </div>
              )}

              {images.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt=""
                        onClick={() => setSelectedImage(img)}
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 object-cover cursor-pointer transition ${
                          selectedImage === img
                            ? "border-indigo-600 ring-2 ring-indigo-200"
                            : "border-gray-200 hover:border-indigo-300"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => deleteImage(index)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow"
                      >
                        <X size={12} />
                      </button>
                      <label className="absolute bottom-0.5 left-0.5 right-0.5 bg-indigo-600 text-white text-[9px] sm:text-[10px] py-0.5 rounded text-center cursor-pointer opacity-0 group-hover:opacity-100 transition">
                        Edit
                        <input
                          hidden
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            replaceImage(index, e.target.files[0])
                          }
                        />
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ========== BASIC INFO ========== */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3">
                Product Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { name: "name", placeholder: "Product Name *", required: true },
                  { name: "category", placeholder: "Category *", required: true },
                  { name: "brand", placeholder: "Brand" },
                  { name: "material", placeholder: "Material" },
                  { name: "stock", placeholder: "Stock", type: "number" },
                ].map((field) => (
                  <input
                    key={field.name}
                    type={field.type || "text"}
                    name={field.name}
                    value={product[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                  />
                ))}
              </div>
            </div>

            {/* ========== SIZE, WEIGHT & GST ========== */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                Size, Weight & Tax <span className="text-xs font-normal text-gray-500">(Optional)</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="relative">
                  <input
                    type="text"
                    name="size"
                    value={product.size}
                    onChange={handleChange}
                    placeholder="Size (e.g. 10 inch, XL)"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                  />
                  <Ruler size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                </div>

                <div className="relative">
                  <input
                    type="text"
                    name="weight"
                    value={product.weight}
                    onChange={handleChange}
                    placeholder="Weight (e.g. 500g, 1.5 kg)"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                  />
                  <Weight size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                </div>

                <div className="relative">
                  <input
                    type="number"
                    name="gst"
                    value={product.gst}
                    onChange={handleChange}
                    placeholder="GST Rate (%) e.g. 18"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                  />
                  <Percent size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* ========== 🚚 DELIVERY SETTINGS & RULES ========== */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Truck size={18} className="text-indigo-600" />
                Delivery Charges & Rules
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Free Delivery Minimum Quantity
                  </label>
                  <input
                    type="number"
                    name="minQtyForFreeDelivery"
                    value={product.minQtyForFreeDelivery}
                    onChange={handleChange}
                    placeholder="e.g. 5 (5 ya usse zyadah par delivery free)"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Standard Delivery Charge (₹)
                  </label>
                  <input
                    type="number"
                    name="standardDeliveryCharge"
                    value={product.standardDeliveryCharge}
                    onChange={handleChange}
                    placeholder="e.g. 50 (Kam quantity hone par charge)"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>

              {/* Delivery Banner Message Customization */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Delivery Banner Line (User Display Note)
                </label>
                <input
                  type="text"
                  name="deliveryNote"
                  value={product.deliveryNote}
                  onChange={handleChange}
                  placeholder="e.g. Order 5+ units to get FREE Delivery!"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 bg-white"
                />
              </div>

              {/* Dynamic Information Preview Box */}
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800">
                <Info size={16} className="mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-semibold mb-0.5">Live Delivery Rule Summary:</p>
                  <p>
                    • Quantity <strong>{product.minQtyForFreeDelivery || 0}</strong> ya usse zyada par delivery <strong>FREE</strong> rahegi.
                  </p>
                  <p>
                    • Quantity <strong>{product.minQtyForFreeDelivery || 0}</strong> se kam hone par <strong>₹{product.standardDeliveryCharge || 0}</strong> delivery charge apply hoga.
                  </p>
                </div>
              </div>
            </div>

            {/* ========== 💳 PAYMENT OPTIONS ACTIVE/INACTIVE ========== */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <CreditCard size={18} className="text-indigo-600" />
                Accepted Payment Methods
              </h2>
              <p className="text-xs text-gray-500 mb-3">
                Admin is product ke liye payment options bandh (Disable) ya chalu (Enable) kar sakta hai.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { key: "cod", label: "Cash on Delivery" },
                  { key: "phonepe", label: "PhonePe" },
                  { key: "gpay", label: "Google Pay" },
                  { key: "paytm", label: "Paytm" },
                  { key: "card", label: "Credit/Debit Card" },
                  { key: "netbanking", label: "Net Banking" },
                ].map((item) => (
                  <label
                    key={item.key}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition ${
                      product.paymentMethods[item.key]
                        ? "bg-indigo-50 border-indigo-300 text-indigo-900"
                        : "bg-white border-gray-200 text-gray-400"
                    }`}
                  >
                    <span className="text-xs font-semibold">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={product.paymentMethods[item.key]}
                      onChange={() => handlePaymentToggle(item.key)}
                      className="w-4 h-4 accent-indigo-600 cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* ========== VARIANT GROUP ========== */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3">
                Variant Group (Optional)
              </h2>
              <input
                type="text"
                name="variantGroup"
                value={product.variantGroup}
                onChange={handleChange}
                placeholder="e.g. pliers-water, wrench-adj, spanner-set"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              />
              <p className="text-xs text-gray-500 mt-2">
                Same group name wale products ek family banenge. Example:{" "}
                <span className="font-medium text-indigo-600">pliers-water</span>{" "}
                — is naam se multiple pliers add karo to unpe “View Varieties” button dikhega.
              </p>
            </div>

            {/* ========== PRICING ========== */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base sm:text-lg font-bold text-gray-800">
                  Quantity Wise Pricing
                </h2>
                <button
                  type="button"
                  onClick={addPriceRow}
                  className="flex items-center gap-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition"
                >
                  <Plus size={14} />
                  Add Row
                </button>
              </div>
              <div className="space-y-2.5">
                {priceList.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 sm:gap-3 items-center"
                  >
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) =>
                        handlePriceChange(index, "quantity", e.target.value)
                      }
                      className="col-span-5 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) =>
                        handlePriceChange(index, "price", e.target.value)
                      }
                      className="col-span-5 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => removePriceRow(index)}
                      className="col-span-2 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 transition flex items-center justify-center"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ========== DESCRIPTION ========== */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3">
                Description
              </h2>
              <textarea
                rows={5}
                name="description"
                value={product.description}
                onChange={handleChange}
                placeholder="Write product description..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition resize-none"
              />
            </div>

            {/* ========== SUBMIT ========== */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-semibold shadow-lg transition"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <PackagePlus size={20} />
                  Add Product
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
