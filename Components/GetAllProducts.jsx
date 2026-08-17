import { useEffect, useState } from "react";
import axios from "axios";
import {
  Pencil,
  Trash2,
  Package,
  Plus,
  X,
  ImagePlus,
  Boxes,
  RefreshCw,
  Layers,
  Percent,
  Truck,
  CreditCard,
  CheckCircle2,
  XCircle,
} from "lucide-react";


const GetAllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null);
  const [expandedDesc, setExpandedDesc] = useState({});
  const [updating, setUpdating] = useState(false);

  const API = "https://backend-3-axez.onrender.com/api/products";

  const AVAILABLE_PAYMENT_METHODS = [
    "Cash on Delivery",
    "UPI / Online Payment",
    "Net Banking",
    "Credit / Debit Card",
  ];

  // ================= FETCH PRODUCTS =================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API);
      if (data.success) setProducts(data.products || []);
    } catch (error) {
      console.log(error);
      alert("Failed To Load Products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ================= DELETE PRODUCT =================
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const { data } = await axios.delete(`${API}/${id}`);
      if (data.success) {
        setProducts((prev) => prev.filter((item) => item._id !== id));
        alert("Product Deleted Successfully");
      }
    } catch (error) {
      console.log(error);
      alert("Delete Failed");
    }
  };

  // ================= EDIT FORM HANDLERS =================
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodToggle = (method) => {
    setEditProduct((prev) => {
      const currentMethods = prev.paymentMethods || [];
      const updatedMethods = currentMethods.includes(method)
        ? currentMethods.filter((m) => m !== method)
        : [...currentMethods, method];
      return { ...prev, paymentMethods: updatedMethods };
    });
  };

  const handlePriceChange = (index, field, value) => {
    const updatedPricing = editProduct.pricing ? [...editProduct.pricing] : [];
    updatedPricing[index] = { ...updatedPricing[index], [field]: value };
    setEditProduct((prev) => ({ ...prev, pricing: updatedPricing }));
  };

  const addPriceRow = () => {
    setEditProduct((prev) => ({
      ...prev,
      pricing: [...(prev.pricing || []), { quantity: "", price: "" }],
    }));
  };

  const removePriceRow = (index) => {
    setEditProduct((prev) => ({
      ...prev,
      pricing: prev.pricing.filter((_, i) => i !== index),
    }));
  };

  const toggleDescription = (id) => {
    setExpandedDesc((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ================= IMAGE HANDLING =================
  const deleteImage = (index) => {
    setEditProduct((prev) => {
      const updatedImages = [...(prev.images || [])];
      const removedImage = updatedImages.splice(index, 1)[0];

      if (removedImage && removedImage.startsWith("blob:")) {
        URL.revokeObjectURL(removedImage);
      }

      const updatedNewImages = (prev.newImages || [])
        .filter((item) => item && item.index !== index)
        .map((item) =>
          item.index > index ? { ...item, index: item.index - 1 } : item
        );

      return { ...prev, images: updatedImages, newImages: updatedNewImages };
    });
  };

  const addImage = (file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setEditProduct((prev) => ({
      ...prev,
      images: [...(prev.images || []), preview],
      newImages: [
        ...(prev.newImages || []),
        { file, index: (prev.images || []).length },
      ],
    }));
  };

  const replaceImage = (index, file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setEditProduct((prev) => {
      const updatedImages = [...(prev.images || [])];

      if (updatedImages[index] && updatedImages[index].startsWith("blob:")) {
        URL.revokeObjectURL(updatedImages[index]);
      }

      updatedImages[index] = preview;
      let updatedNewImages = [...(prev.newImages || [])];
      const existing = updatedNewImages.findIndex((img) => img.index === index);

      if (existing !== -1) {
        updatedNewImages[existing] = { file, index };
      } else {
        updatedNewImages.push({ file, index });
      }

      return { ...prev, images: updatedImages, newImages: updatedNewImages };
    });
  };

  const closeEditModal = () => {
    if (editProduct?.images) {
      editProduct.images.forEach((img) => {
        if (typeof img === "string" && img.startsWith("blob:")) {
          URL.revokeObjectURL(img);
        }
      });
    }
    setEditProduct(null);
  };

 // ================= UPDATE PRODUCT =================
  const updateProduct = async () => {
    if (!editProduct.pricing || editProduct.pricing.length === 0) {
      alert("At least one pricing option is required.");
      return;
    }

    const formattedPricing = editProduct.pricing.map((p) => ({
      quantity: Number(p.quantity) || 1,
      price: Number(p.price) || 0,
    }));

    try {
      setUpdating(true);
      const formData = new FormData();

      formData.append("name", editProduct.name || "");
      formData.append("brand", editProduct.brand || "");
      formData.append("category", editProduct.category || "");
      formData.append("material", editProduct.material || "");
      formData.append("stock", Number(editProduct.stock) || 0);
      formData.append("size", editProduct.size || "");
      formData.append("weight", editProduct.weight || "");
      formData.append("gst", Number(editProduct.gst) || 0);
      formData.append("variantGroup", editProduct.variantGroup || "");
      formData.append("description", editProduct.description || "");
      formData.append("pricing", JSON.stringify(formattedPricing));

      formData.append("deliveryCharge", Number(editProduct.deliveryCharge) || 0);
      formData.append("deliveryTime", editProduct.deliveryTime || "");
      formData.append(
        "paymentMethods",
        JSON.stringify(editProduct.paymentMethods || [])
      );

      const existingImages = (editProduct.images || []).filter(
        (img) => typeof img === "string" && img.startsWith("http")
      );
      formData.append("existingImages", JSON.stringify(existingImages));

      (editProduct.newImages || []).forEach((item) => {
        if (!item || !item.file) return;
        formData.append("images", item.file);
        formData.append("replaceIndexes", item.index);
      });

      const { data } = await axios.put(`${API}/${editProduct._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        alert("Product Updated Successfully");
        closeEditModal();
        fetchProducts();
      } else {
        alert(data.message || "Update failed");
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Update Failed");
    } finally {
      setUpdating(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading Products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-6 sm:py-8 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">
              All Products
            </h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">
              {products.length} product{products.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <button
            onClick={fetchProducts}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition font-medium text-sm shadow-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Boxes size={36} className="text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">No Products Found</h2>
            <p className="text-gray-500 mt-2">Add products to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {products.map((product) => {
              const expanded = expandedDesc[product._id];
              const lowestPrice =
                product.pricing?.length > 0
                  ? Math.min(...product.pricing.map((p) => Number(p.price) || 0))
                  : 0;

              const matchingVarieties = product.variantGroup
                ? products.filter(
                    (p) =>
                      p.variantGroup?.trim().toLowerCase() ===
                        product.variantGroup?.trim().toLowerCase() &&
                      p._id !== product._id
                  )
                : [];

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl sm:rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-48 sm:h-52 bg-gradient-to-br from-gray-50 to-gray-100">
                    <img
                      src={product.images?.[0] || "https://via.placeholder.com/500x400?text=No+Image"}
                      alt={product.name}
                      className="w-full h-full object-contain p-4"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/500x400?text=No+Image";
                      }}
                    />
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm text-gray-700">
                      Stock: {product.stock ?? 0}
                    </span>
                  </div>

                  {product.images?.length > 1 && (
                    <div className="flex gap-2 px-4 pt-3 overflow-x-auto scrollbar-hide">
                      {product.images.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt=""
                          className="w-12 h-12 rounded-lg border border-gray-200 object-cover flex-shrink-0"
                        />
                      ))}
                    </div>
                  )}

                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <h2 className="font-bold text-lg text-gray-900 line-clamp-2">
                      {product.name}
                    </h2>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {product.category && (
                        <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
                          {product.category}
                        </span>
                      )}
                      {product.brand && (
                        <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
                          {product.brand}
                        </span>
                      )}
                      {product.variantGroup && (
                        <span className="bg-purple-50 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Layers size={12} />
                          {product.variantGroup}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 text-sm text-gray-600 space-y-0.5">
                      <p>
                        <span className="font-medium text-gray-800">Material:</span>{" "}
                        {product.material || "—"}
                      </p>
                      {(product.size || product.weight) && (
                        <p className="text-xs text-gray-500">
                          {product.size && <span>Size: {product.size} </span>}
                          {product.weight && <span>| Weight: {product.weight}</span>}
                        </p>
                      )}
                      {product.gst !== undefined && product.gst !== null && (
                        <p className="text-xs text-indigo-600 font-medium">
                          GST: {product.gst}%
                        </p>
                      )}
                      <p className="text-emerald-600 font-bold text-base mt-1">
                        From ₹{lowestPrice.toLocaleString()}
                      </p>
                    </div>

                    {/* UPDATED: Delivery & Payment Details Always Visible */}
                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs space-y-2 bg-slate-50 p-2.5 rounded-xl">
                      {/* Delivery Status & Fee */}
                      <div className="flex items-start gap-1.5 text-gray-700">
                        <Truck size={15} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-gray-900">Delivery: </span>
                          {product.deliveryCharge === 0 || product.deliveryCharge === "0" ? (
                            <span className="text-emerald-600 font-bold">Free Delivery</span>
                          ) : product.deliveryCharge ? (
                            <span className="font-medium text-gray-800">₹{product.deliveryCharge} Charge</span>
                          ) : (
                            <span className="text-gray-400 italic">Not Specified</span>
                          )}
                          {product.deliveryTime && (
                            <span className="text-gray-500 font-normal"> ({product.deliveryTime})</span>
                          )}
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div className="flex items-start gap-1.5 text-gray-700">
                        <CreditCard size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-gray-900">Payment: </span>
                          {product.paymentMethods && product.paymentMethods.length > 0 ? (
                            <span className="text-gray-700 font-medium">
                              {product.paymentMethods.join(", ")}
                            </span>
                          ) : (
                            <span className="text-amber-600 italic font-medium">No methods specified</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {matchingVarieties.length > 0 && (
                      <button
                        type="button"
                        className="w-full mt-3 py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl border border-purple-200 transition flex items-center justify-center gap-1.5"
                      >
                        <Layers size={14} />
                        View More Varieties ({matchingVarieties.length + 1} items)
                      </button>
                    )}

                    {product.pricing?.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Quantity Pricing
                        </h3>
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="py-2 px-3 text-left text-gray-600 font-medium">Qty</th>
                                <th className="py-2 px-3 text-right text-gray-600 font-medium">Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {product.pricing.map((price, index) => (
                                <tr key={index} className="border-t border-gray-50">
                                  <td className="py-2 px-3 text-gray-700">{price.quantity}+</td>
                                  <td className="py-2 px-3 text-right font-semibold text-emerald-600">
                                    ₹{Number(price.price).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {product.description && (
                      <div className="mt-3 text-sm text-gray-600 leading-relaxed">
                        {expanded
                          ? product.description
                          : product.description.slice(0, 80)}
                        {product.description.length > 80 && (
                          <button
                            onClick={() => toggleDescription(product._id)}
                            className="text-indigo-600 ml-1 font-medium hover:underline"
                          >
                            {expanded ? "Show Less" : "...Read More"}
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2.5 mt-auto pt-5">
                      <button
                        onClick={() =>
                          setEditProduct({
                            ...product,
                            paymentMethods: product.paymentMethods || [],
                            newImages: [],
                          })
                        }
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-sm"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= EDIT MODAL ================= */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-5">
          <div className="bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 sm:px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl sm:rounded-t-3xl">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Edit Product
              </h2>
              <button
                onClick={closeEditModal}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-6">
              {/* Images */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <ImagePlus size={18} />
                  Product Images
                </h3>
                <div className="flex flex-wrap gap-3">
                  {editProduct.images?.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt=""
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => deleteImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow"
                      >
                        ✕
                      </button>
                      <label className="absolute bottom-1 left-1 right-1 bg-indigo-600 text-white text-[10px] sm:text-xs py-1 rounded text-center cursor-pointer opacity-90 hover:opacity-100">
                        Replace
                        <input
                          hidden
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files[0])
                              replaceImage(index, e.target.files[0]);
                          }}
                        />
                      </label>
                    </div>
                  ))}

                  <label className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition text-gray-400">
                    <Plus size={24} />
                    <span className="text-[10px] mt-1">Add</span>
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files[0]) addImage(e.target.files[0]);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { name: "name", placeholder: "Product Name" },
                  { name: "brand", placeholder: "Brand" },
                  { name: "category", placeholder: "Category" },
                  { name: "material", placeholder: "Material" },
                  { name: "stock", placeholder: "Stock", type: "number" },
                  { name: "size", placeholder: "Size (e.g. XL, 10 inch)" },
                  { name: "weight", placeholder: "Weight (e.g. 500g, 1kg)" },
                  { name: "gst", placeholder: "GST Percentage (%)", type: "number" },
                  { name: "variantGroup", placeholder: "Variant Group" },
                ].map((field) => (
                  <input
                    key={field.name}
                    type={field.type || "text"}
                    name={field.name}
                    value={editProduct[field.name] ?? ""}
                    onChange={handleEditChange}
                    placeholder={field.placeholder}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                  />
                ))}
              </div>

              {/* Delivery Details */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                  <Truck size={18} className="text-indigo-600" />
                  Delivery Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    type="number"
                    name="deliveryCharge"
                    value={editProduct.deliveryCharge ?? ""}
                    onChange={handleEditChange}
                    placeholder="Delivery Charge (₹, 0 for Free)"
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                  />
                  <input
                    type="text"
                    name="deliveryTime"
                    value={editProduct.deliveryTime ?? ""}
                    onChange={handleEditChange}
                    placeholder="Estimated Delivery Time (e.g. 3-5 Business Days)"
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                  <CreditCard size={18} className="text-emerald-600" />
                  Accepted Payment Methods
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AVAILABLE_PAYMENT_METHODS.map((method) => {
                    const isSelected = editProduct.paymentMethods?.includes(method);
                    return (
                      <label
                        key={method}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition text-sm font-medium ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50/50 text-emerald-900"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => handlePaymentMethodToggle(method)}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                        />
                        {method}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Wise Pricing */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">
                    Quantity Wise Pricing *
                  </h3>
                  <button
                    type="button"
                    onClick={addPriceRow}
                    className="flex items-center gap-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition"
                  >
                    <Plus size={14} />
                    Add Price
                  </button>
                </div>

                <div className="space-y-2.5">
                  {editProduct.pricing?.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 sm:gap-3 items-center"
                    >
                      <input
                        type="number"
                        min="1"
                        value={item.quantity ?? ""}
                        placeholder="Min Qty (min 1)"
                        onChange={(e) =>
                          handlePriceChange(index, "quantity", e.target.value)
                        }
                        className="col-span-5 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                      />
                      <input
                        type="number"
                        min="0"
                        value={item.price ?? ""}
                        placeholder="Price (₹)"
                        onChange={(e) =>
                          handlePriceChange(index, "price", e.target.value)
                        }
                        className="col-span-5 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => removePriceRow(index)}
                        className="col-span-2 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm transition"
                      >
                        <Trash2 size={14} className="mx-auto" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-semibold text-gray-800 text-sm mb-2 block">
                  Description
                </label>
                <textarea
                  rows="4"
                  name="description"
                  value={editProduct.description || ""}
                  onChange={handleEditChange}
                  placeholder="Product description..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition resize-none"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={updateProduct}
                  disabled={updating}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold transition shadow-sm"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default GetAllProducts;
