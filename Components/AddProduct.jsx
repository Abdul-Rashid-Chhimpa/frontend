import { useState, useEffect, useCallback } from "react";
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
  Tag,
  Sparkles,
  Users,
  Search,
  UserCheck,
  Hash,
} from "lucide-react";

const INITIAL_PRODUCT_STATE = {
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
  hsnCode: "",
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
  discountPercent: "",
  discountNote: "",
  isNewProduct: true,
  // --- USER TARGETING FIELDS ---
  discountTargetType: "all", // 'all' or 'selected'
  allowedUserIds: [],
  otherUsersDiscountPercent: "",
  otherUsersDiscountNote: "",
};

// Endpoints tried in order until one returns a user list.
// Remove / reorder these to match your backend.
const USER_LIST_ENDPOINTS = [
  "/api/users",
  "/api/users/all",
  "/api/admin/users",
];

const getUserPhone = (u) => String(u?.phone || u?.mobile || u?.mobileNumber || "");

const AddProduct = () => {
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(INITIAL_PRODUCT_STATE);
  const [priceList, setPriceList] = useState([{ quantity: "", price: "" }]);

  // --- USER SEARCH & SELECTION STATES ---
  const [allUsers, setAllUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  const apiUrl = process.env.REACT_APP_API_URL || "https://backend-3-axez.onrender.com";

  // Clean up Object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      images.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  // ================= FETCH USERS =================
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError("");

    let lastError = null;

    for (const path of USER_LIST_ENDPOINTS) {
      try {
        const res = await axios.get(`${apiUrl}${path}`);

        const body = res.data;

        const list = Array.isArray(body)
          ? body
          : body?.users || body?.data || body?.result || [];

        if (Array.isArray(list)) {
          setAllUsers(list);
          setUsersLoading(false);
          return;
        }
      } catch (err) {
        lastError = err;
      }
    }

    console.error("Failed to fetch user list:", lastError);
    setUsersError("Could not load users. Please check the users API and try again.");
    setUsersLoading(false);
  }, [apiUrl]);

  // Load users as soon as "Selected Users Only" is chosen
  useEffect(() => {
    if (product.discountTargetType === "selected" && allUsers.length === 0) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.discountTargetType]);

  // ================= IMAGE HANDLERS =================
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const updatedFiles = [...imageFiles, ...files].slice(0, 10);
    setImageFiles(updatedFiles);

    images.forEach((url) => URL.revokeObjectURL(url));

    const previews = updatedFiles.map((file) => URL.createObjectURL(file));
    setImages(previews);

    if (previews.length > 0 && !selectedImage) {
      setSelectedImage(previews[0]);
    }
  };

  const deleteImage = (index) => {
    URL.revokeObjectURL(images[index]);

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

    URL.revokeObjectURL(images[index]);
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
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
    setPriceList((prev) => [...prev, { quantity: "", price: "" }]);
  };

  const removePriceRow = (index) => {
    setPriceList((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length ? updated : [{ quantity: "", price: "" }];
    });
  };

  const handlePriceChange = (index, field, value) => {
    setPriceList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // --- USER SELECTION TOGGLE ---
  const toggleUserSelection = (userId) => {
    setProduct((prev) => {
      const exists = prev.allowedUserIds.includes(userId);
      const updatedIds = exists
        ? prev.allowedUserIds.filter((id) => id !== userId)
        : [...prev.allowedUserIds, userId];

      return { ...prev, allowedUserIds: updatedIds };
    });
  };

  // Full list is shown by default; typing filters it (1+ characters)
  const searchLower = userSearchTerm.trim().toLowerCase();

  const filteredUsers = searchLower
    ? allUsers.filter((u) => {
        const nameMatch = u.name && String(u.name).toLowerCase().includes(searchLower);
        const emailMatch = u.email && String(u.email).toLowerCase().includes(searchLower);
        const phoneMatch = getUserPhone(u).includes(searchLower);
        return nameMatch || emailMatch || phoneMatch;
      })
    : allUsers;

  const selectAllShown = () => {
    setProduct((prev) => {
      const merged = new Set(prev.allowedUserIds);
      filteredUsers.forEach((u) => merged.add(u._id));
      return { ...prev, allowedUserIds: Array.from(merged) };
    });
  };

  const clearSelectedUsers = () => {
    setProduct((prev) => ({ ...prev, allowedUserIds: [] }));
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

    if (
      product.discountTargetType === "selected" &&
      product.allowedUserIds.length === 0
    ) {
      alert("Please select at least one user for targeted discount");
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
      formData.append("hsnCode", (product.hsnCode || "").trim());

      formData.append("minQtyForFreeDelivery", product.minQtyForFreeDelivery || 0);
      formData.append("standardDeliveryCharge", product.standardDeliveryCharge || 0);
      formData.append("deliveryNote", product.deliveryNote);
      formData.append("paymentMethods", JSON.stringify(product.paymentMethods));
      formData.append("pricing", JSON.stringify(validPricing));

      formData.append("discountPercent", product.discountPercent || 0);
      formData.append("discountNote", product.discountNote || "");
      formData.append("isNewProduct", product.isNewProduct);

      // --- APPEND USER TARGETING FIELDS ---
      formData.append("discountTargetType", product.discountTargetType);
      formData.append(
        "otherUsersDiscountPercent",
        product.discountTargetType === "selected"
          ? Number(product.otherUsersDiscountPercent) || 0
          : 0
      );
      formData.append(
        "otherUsersDiscountNote",
        product.discountTargetType === "selected"
          ? product.otherUsersDiscountNote || ""
          : ""
      );
      formData.append(
        "allowedUserIds",
        JSON.stringify(
          product.discountTargetType === "selected" ? product.allowedUserIds : []
        )
      );

      const res = await axios.post(`${apiUrl}/api/products/add-product`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        alert("Product Added Successfully");
        setSuccess(true);
        setImages([]);
        setImageFiles([]);
        setSelectedImage("");
        setProduct(INITIAL_PRODUCT_STATE);
        setUserSearchTerm("");
        setPriceList([{ quantity: "", price: "" }]);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Product Add Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-6 sm:py-8 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <PackagePlus size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Add New Product</h1>
              <p className="text-white/80 text-sm sm:text-base mt-0.5">
                Upload, manage and publish your products
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {success && (
            <div className="mx-4 sm:mx-6 mt-5 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
              <CheckCircle size={18} />
              Product Added Successfully
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-7">
            {/* IMAGES */}
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
                <Upload size={28} className="text-gray-400 group-hover:text-indigo-500 mb-2" />
                <span className="text-sm text-gray-500 group-hover:text-indigo-600 font-medium">
                  Click to upload images
                </span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10 files</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {selectedImage && (
                <div className="relative mt-4 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                  {product.isNewProduct && (
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                      <Sparkles size={14} className="animate-spin" />
                      NEW ARRIVAL
                    </div>
                  )}

                  {Number(product.discountPercent) > 0 && (
                    <div className="absolute top-4 right-4 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      {product.discountPercent}% OFF
                    </div>
                  )}

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
                          onChange={(e) => replaceImage(index, e.target.files[0])}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BASIC INFO */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3">Product Information</h2>
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

            {/* NEW PRODUCT BADGE SETTING */}
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-900">Mark as "NEW" Arrival</h3>
                    <p className="text-xs text-emerald-700 mt-0.5">Displays an animated "NEW" badge on product cards to boost visibility</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isNewProduct"
                    checked={product.isNewProduct}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            {/* OFFERS & DISCOUNTS (WITH USER TARGETING) */}
            <div className="bg-gradient-to-br from-rose-50 to-orange-50 p-4 rounded-2xl border border-rose-200/70 space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-rose-900 flex items-center gap-2">
                <Tag size={18} className="text-rose-600" />
                Offer & Discount <span className="text-xs font-normal text-rose-600">(Optional)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-rose-800 mb-1">
                    {product.discountTargetType === "selected"
                      ? "Special Discount for Selected Users (%)"
                      : "Discount Percentage (%)"}
                  </label>
                  <input
                    type="number"
                    name="discountPercent"
                    value={product.discountPercent}
                    onChange={handleChange}
                    placeholder="e.g. 15 for 15% OFF"
                    className="w-full border border-rose-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-rose-800 mb-1">
                    Offer Tag / Custom Note
                  </label>
                  <input
                    type="text"
                    name="discountNote"
                    value={product.discountNote}
                    onChange={handleChange}
                    placeholder="e.g. Special VIP Discount!"
                    className="w-full border border-rose-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-rose-500 bg-white"
                  />
                </div>
              </div>

              {/* TARGET USER OPTION */}
              <div className="pt-2 border-t border-rose-200/60">
                <label className="block text-xs font-semibold text-rose-900 mb-2 flex items-center gap-1.5">
                  <Users size={15} className="text-rose-600" />
                  Who can see this discount?
                </label>
                <div className="flex items-center gap-4 text-xs font-medium text-rose-900">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="discountTargetType"
                      value="all"
                      checked={product.discountTargetType === "all"}
                      onChange={handleChange}
                      className="accent-rose-600 cursor-pointer"
                    />
                    All Users (Public)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="discountTargetType"
                      value="selected"
                      checked={product.discountTargetType === "selected"}
                      onChange={handleChange}
                      className="accent-rose-600 cursor-pointer"
                    />
                    Selected Users Only (Special Discount)
                  </label>
                </div>

                {/* USER SEARCH & SELECTION SECTION */}
                {product.discountTargetType === "selected" && (
                  <div className="mt-3 bg-white p-3 sm:p-4 rounded-xl border border-rose-200 space-y-3">
                    {/* DISCOUNT FOR OTHER (NON-SELECTED) USERS */}
                    <div className="p-3 rounded-lg bg-rose-50/60 border border-rose-100">
                      <p className="text-xs font-semibold text-rose-900 mb-2">
                        Discount for all OTHER users (not selected)
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="number"
                          name="otherUsersDiscountPercent"
                          value={product.otherUsersDiscountPercent}
                          onChange={handleChange}
                          placeholder="e.g. 5 (leave empty for no discount)"
                          className="w-full bg-white rounded-lg px-3 py-2 text-xs sm:text-sm outline-none border border-rose-200 focus:border-rose-400"
                        />
                        <input
                          type="text"
                          name="otherUsersDiscountNote"
                          value={product.otherUsersDiscountNote}
                          onChange={handleChange}
                          placeholder="e.g. Regular Sale"
                          className="w-full bg-white rounded-lg px-3 py-2 text-xs sm:text-sm outline-none border border-rose-200 focus:border-rose-400"
                        />
                      </div>
                      <p className="text-[11px] text-rose-700 mt-1.5">
                        Selected users see the special discount above. Everyone else sees this one.
                      </p>
                    </div>

                    {/* SEARCH */}
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search user by Name, Email or Phone..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-rose-500"
                      />
                      {userSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setUserSearchTerm("")}
                          className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                          title="Clear search"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* LIST HEADER (fixed height so layout never jumps) */}
                    <div className="flex items-center justify-between h-6 text-[11px] text-gray-500">
                      <span>
                        {usersLoading
                          ? "Loading users..."
                          : `Showing ${filteredUsers.length} of ${allUsers.length} users`}
                      </span>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={selectAllShown}
                          disabled={filteredUsers.length === 0}
                          className="font-semibold text-rose-600 hover:text-rose-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Select all shown
                        </button>
                        <button
                          type="button"
                          onClick={clearSelectedUsers}
                          disabled={product.allowedUserIds.length === 0}
                          className="font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* USER LIST (fixed height + scroll) */}
                    <div
                      className="h-56 overflow-y-auto border border-gray-100 rounded-lg bg-white"
                      style={{ scrollbarGutter: "stable" }}
                    >
                      {usersLoading ? (
                        <div className="h-full flex items-center justify-center text-xs text-gray-400">
                          Loading users...
                        </div>
                      ) : usersError ? (
                        <div className="h-full flex flex-col items-center justify-center gap-2 px-4 text-center">
                          <p className="text-xs text-red-500">{usersError}</p>
                          <button
                            type="button"
                            onClick={fetchUsers}
                            className="text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg transition"
                          >
                            Retry
                          </button>
                        </div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-gray-400 px-4 text-center">
                          {allUsers.length === 0
                            ? "No users available."
                            : `No users found matching "${userSearchTerm}"`}
                        </div>
                      ) : (
                        filteredUsers.map((user) => {
                          const isSelected = product.allowedUserIds.includes(user._id);
                          const displayName = user.name || "No Name";
                          const subText = [user.email, getUserPhone(user)]
                            .filter(Boolean)
                            .join(" · ");

                          return (
                            <label
                              key={user._id}
                              className={`flex items-center gap-3 h-14 px-3 border-b border-gray-100 last:border-b-0 cursor-pointer select-none transition-colors ${
                                isSelected ? "bg-rose-50" : "hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleUserSelection(user._id)}
                                className="w-4 h-4 shrink-0 accent-rose-600 cursor-pointer"
                              />

                              <div className="w-8 h-8 shrink-0 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-bold uppercase">
                                {displayName.charAt(0)}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm text-gray-800 font-medium truncate">
                                  {displayName}
                                </p>
                                <p className="text-[11px] text-gray-400 truncate">
                                  {subText || "No contact info"}
                                </p>
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>

                    {/* SELECTED USERS (always rendered, fixed height) */}
                    <div className="pt-1">
                      <p className="text-[11px] font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                        <UserCheck size={13} className="text-emerald-600" />
                        Selected Users ({product.allowedUserIds.length})
                      </p>

                      <div className="h-16 overflow-y-auto rounded-lg border border-dashed border-gray-200 bg-gray-50/60 p-2">
                        {product.allowedUserIds.length === 0 ? (
                          <p className="text-[11px] text-gray-400">
                            No users selected yet. Tick the checkbox next to a user above.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {product.allowedUserIds.map((id) => {
                              const matchedUser = allUsers.find((u) => u._id === id);
                              return (
                                <span
                                  key={id}
                                  className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[11px] px-2 py-0.5 rounded-full font-medium"
                                >
                                  {matchedUser?.name || matchedUser?.email || id}
                                  <button
                                    type="button"
                                    onClick={() => toggleUserSelection(id)}
                                    className="hover:text-rose-900"
                                  >
                                    <X size={12} />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SIZE, WEIGHT & GST */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                Size, Weight, HSN & Tax <span className="text-xs font-normal text-gray-500">(Optional)</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                    type="text"
                    inputMode="numeric"
                    name="hsnCode"
                    maxLength={8}
                    value={product.hsnCode}
                    onChange={(e) =>
                      setProduct((prev) => ({
                        ...prev,
                        hsnCode: e.target.value.replace(/\D/g, "").slice(0, 8),
                      }))
                    }
                    placeholder="HSN Code (e.g. 8203)"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                  />
                  <Hash size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
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

            {/* DELIVERY SETTINGS */}
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
                    placeholder="e.g. 5"
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
                    placeholder="e.g. 50"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>

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

            {/* PAYMENT METHODS */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <CreditCard size={18} className="text-indigo-600" />
                Accepted Payment Methods
              </h2>
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

            {/* VARIANT GROUP */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3">Variant Group (Optional)</h2>
              <input
                type="text"
                name="variantGroup"
                value={product.variantGroup}
                onChange={handleChange}
                placeholder="e.g. pliers-water, wrench-adj, spanner-set"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>

            {/* PRICING */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base sm:text-lg font-bold text-gray-800">Quantity Wise Pricing</h2>
                <button
                  type="button"
                  onClick={addPriceRow}
                  className="flex items-center gap-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition"
                >
                  <Plus size={14} /> Add Row
                </button>
              </div>
              <div className="space-y-2.5">
                {priceList.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 sm:gap-3 items-center">
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => handlePriceChange(index, "quantity", e.target.value)}
                      className="col-span-5 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => handlePriceChange(index, "price", e.target.value)}
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

            {/* DESCRIPTION */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3">Description</h2>
              <textarea
                rows={5}
                name="description"
                value={product.description}
                onChange={handleChange}
                placeholder="Write product description..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition resize-none"
              />
            </div>

            {/* SUBMIT */}
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
                  <PackagePlus size={20} /> Add Product
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
