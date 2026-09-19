import { useEffect, useState } from "react";
import axios from "axios";
import {
  Pencil,
  Trash2,
  Plus,
  X,
  ImagePlus,
  Boxes,
  RefreshCw,
  Layers,
  Truck,
  CreditCard,
  Tag,
} from "lucide-react";

// ======================================================
// DESIGN TOKENS — shared with the storefront + admin console
// ======================================================
const INK = "#15181C";
const MUTED = "#6B7280";
const BORDER = "#E6E8EB";
const SURFACE = "#FFFFFF";
const BG = "#F5F6F4";
const STEEL = "#2B4A5E";

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
      console.error(error);
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
      console.error(error);
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

  // ================= UPDATE PRODUCT FUNCTION =================
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

      const deliveryPayload = {
        charge: Number(editProduct.deliveryCharge) || 0,
        time: editProduct.deliveryTime || "",
      };
      formData.append("delivery", JSON.stringify(deliveryPayload));
      formData.append("deliveryCharge", Number(editProduct.deliveryCharge) || 0);
      formData.append("deliveryTime", editProduct.deliveryTime || "");

      const paymentMethodsArr = editProduct.paymentMethods || [];
      formData.append("paymentMethods", JSON.stringify(paymentMethodsArr));
      formData.append("payment", JSON.stringify(paymentMethodsArr));

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
      console.error(error);
      alert(error.response?.data?.message || "Update Failed");
    } finally {
      setUpdating(false);
    }
  };

  // ======================================================
  // LOADING — flat skeleton grid, consistent with storefront
  // ======================================================
  if (loading) {
    return (
      <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-6" style={{ background: BG }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="h-7 sm:h-9 w-40 rounded-lg shimmer" style={{ background: BORDER }} />
              <div className="h-3.5 w-32 rounded-md shimmer mt-2.5" style={{ background: BORDER }} />
            </div>
            <div className="h-10 w-28 rounded-xl shimmer" style={{ background: BORDER }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border" style={{ background: SURFACE, borderColor: BORDER }}>
                <div className="h-48 sm:h-52 shimmer" style={{ background: "#F1F2EF" }} />
                <div className="p-4 sm:p-5">
                  <div className="h-4 w-3/4 rounded-md shimmer" style={{ background: BORDER }} />
                  <div className="h-3 w-1/2 rounded-md shimmer mt-3" style={{ background: BORDER }} />
                  <div className="h-3 w-2/5 rounded-md shimmer mt-2" style={{ background: BORDER }} />
                  <div className="h-16 rounded-xl shimmer mt-4" style={{ background: BG }} />
                  <div className="grid grid-cols-2 gap-2.5 mt-4">
                    <div className="h-10 rounded-xl shimmer" style={{ background: BORDER }} />
                    <div className="h-10 rounded-xl shimmer" style={{ background: BORDER }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .shimmer { position: relative; overflow: hidden; }
          .shimmer::after {
            content: "";
            position: absolute;
            inset: 0;
            transform: translateX(-100%);
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 100%);
            animation: shimmer-sweep 1.6s infinite;
          }
          @keyframes shimmer-sweep { 100% { transform: translateX(100%); } }
          @media (prefers-reduced-motion: reduce) { .shimmer::after { animation: none; } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 px-3 sm:px-6" style={{ background: BG }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: INK }}>
              All products
            </h1>
            <p className="mt-1 text-sm sm:text-base" style={{ color: MUTED }}>
              {products.length} product{products.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <button
            onClick={fetchProducts}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition"
            style={{ background: SURFACE, borderColor: BORDER, color: INK }}
          >
            <RefreshCw size={16} style={{ color: STEEL }} />
            Refresh
          </button>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border p-12 text-center" style={{ background: SURFACE, borderColor: BORDER }}>
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: BG }}
            >
              <Boxes size={36} style={{ color: STEEL }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: INK }}>No products found</h2>
            <p className="mt-2" style={{ color: MUTED }}>Add products to see them here.</p>
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

              const deliveryCharge = product.deliveryCharge ?? product.delivery?.charge;
              const deliveryTime = product.deliveryTime || product.delivery?.time;
              const paymentMethods = product.paymentMethods || product.payment || [];

              return (
                <div
                  key={product._id}
                  className="rounded-2xl overflow-hidden border transition-all duration-200 hover:-translate-y-1 flex flex-col"
                  style={{ background: SURFACE, borderColor: BORDER }}
                >
                  <div className="relative h-48 sm:h-52" style={{ background: "#F1F2EF" }}>
                    <img
                      src={product.images?.[0] || "https://via.placeholder.com/500x400?text=No+Image"}
                      alt={product.name}
                      className="w-full h-full object-contain p-4"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/500x400?text=No+Image";
                      }}
                    />
                    <span
                      className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full border"
                      style={{ background: SURFACE, borderColor: BORDER, color: INK }}
                    >
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
                          className="w-12 h-12 rounded-lg border object-cover flex-shrink-0"
                          style={{ borderColor: BORDER }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <h2 className="font-bold text-lg line-clamp-2" style={{ color: INK }}>
                      {product.name}
                    </h2>

                    <div className="flex flex-wrap gap-2 mt-2.5">
                      {product.category && (
                        <span
                          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border"
                          style={{ background: BG, borderColor: BORDER, color: INK }}
                        >
                          <Tag size={11} style={{ color: STEEL }} />
                          {product.category}
                        </span>
                      )}
                      {product.brand && (
                        <span
                          className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg border"
                          style={{ background: BG, borderColor: BORDER, color: INK }}
                        >
                          {product.brand}
                        </span>
                      )}
                      {product.variantGroup && (
                        <span
                          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border"
                          style={{ background: BG, borderColor: BORDER, color: INK }}
                        >
                          <Layers size={11} style={{ color: STEEL }} />
                          {product.variantGroup}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 text-sm space-y-0.5" style={{ color: MUTED }}>
                      <p>
                        <span className="font-medium" style={{ color: INK }}>Material:</span>{" "}
                        {product.material || "—"}
                      </p>
                      {(product.size || product.weight) && (
                        <p className="text-xs">
                          {product.size && <span>Size: {product.size} </span>}
                          {product.weight && <span>| Weight: {product.weight}</span>}
                        </p>
                      )}
                      {product.gst !== undefined && product.gst !== null && (
                        <p className="text-xs font-medium" style={{ color: STEEL }}>
                          GST: {product.gst}%
                        </p>
                      )}
                      <p className="font-bold text-base mt-1" style={{ color: "#1D7A43" }}>
                        From ₹{lowestPrice.toLocaleString()}
                      </p>
                    </div>

                    {/* Delivery & Payment Details */}
                    <div className="mt-3 pt-3 border-t text-xs space-y-2 p-2.5 rounded-xl" style={{ borderColor: BORDER, background: BG }}>
                      <div className="flex items-start gap-1.5" style={{ color: INK }}>
                        <Truck size={15} style={{ color: STEEL }} className="flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Delivery: </span>
                          {deliveryCharge === 0 || deliveryCharge === "0" ? (
                            <span className="font-bold" style={{ color: "#1D7A43" }}>Free delivery</span>
                          ) : deliveryCharge ? (
                            <span className="font-medium">₹{deliveryCharge} charge</span>
                          ) : (
                            <span className="italic" style={{ color: MUTED }}>Not specified</span>
                          )}
                          {deliveryTime && (
                            <span style={{ color: MUTED }}> ({deliveryTime})</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5" style={{ color: INK }}>
                        <CreditCard size={15} style={{ color: STEEL }} className="flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Payment: </span>
                          {paymentMethods.length > 0 ? (
                            <span className="font-medium">{paymentMethods.join(", ")}</span>
                          ) : (
                            <span className="italic font-medium" style={{ color: "#B4691F" }}>No methods specified</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {matchingVarieties.length > 0 && (
                      <button
                        type="button"
                        className="w-full mt-3 py-2 px-3 text-xs font-semibold rounded-xl border transition flex items-center justify-center gap-1.5"
                        style={{ background: BG, borderColor: BORDER, color: STEEL }}
                      >
                        <Layers size={14} />
                        View more varieties ({matchingVarieties.length + 1} items)
                      </button>
                    )}

                    {product.pricing?.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-xs font-semibold mb-2" style={{ color: MUTED }}>
                          Quantity pricing
                        </h3>
                        <div className="rounded-xl overflow-hidden border" style={{ borderColor: BORDER }}>
                          <table className="w-full text-sm">
                            <thead style={{ background: BG }}>
                              <tr>
                                <th className="py-2 px-3 text-left font-medium" style={{ color: MUTED }}>Qty</th>
                                <th className="py-2 px-3 text-right font-medium" style={{ color: MUTED }}>Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {product.pricing.map((price, index) => (
                                <tr key={index} className="border-t" style={{ borderColor: BORDER }}>
                                  <td className="py-2 px-3" style={{ color: INK }}>{price.quantity}+</td>
                                  <td className="py-2 px-3 text-right font-semibold" style={{ color: "#1D7A43" }}>
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
                      <div className="mt-3 text-sm leading-relaxed" style={{ color: MUTED }}>
                        {expanded
                          ? product.description
                          : product.description.slice(0, 80)}
                        {product.description.length > 80 && (
                          <button
                            onClick={() => toggleDescription(product._id)}
                            className="ml-1 font-medium hover:underline"
                            style={{ color: STEEL }}
                          >
                            {expanded ? "Show less" : "...Read more"}
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2.5 mt-auto pt-5">
                      <button
                        onClick={() =>
                          setEditProduct({
                            ...product,
                            deliveryCharge: deliveryCharge ?? "",
                            deliveryTime: deliveryTime ?? "",
                            paymentMethods: paymentMethods,
                            newImages: [],
                          })
                        }
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition text-white"
                        style={{ background: STEEL }}
                      >
                        <Pencil size={15} />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition border"
                        style={{ borderColor: "#F0BABA", color: "#B4302F", background: "#FBEEEE" }}
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
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-5">
          <div className="w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto" style={{ background: SURFACE }}>
            <div
              className="sticky top-0 border-b px-5 sm:px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl sm:rounded-t-3xl"
              style={{ background: SURFACE, borderColor: BORDER }}
            >
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: INK }}>
                Edit product
              </h2>
              <button
                onClick={closeEditModal}
                className="p-2 rounded-xl transition hover:bg-gray-100"
                style={{ color: MUTED }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-6">
              {/* Images */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: INK }}>
                  <ImagePlus size={18} style={{ color: STEEL }} />
                  Product images
                </h3>
                <div className="flex flex-wrap gap-3">
                  {editProduct.images?.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt=""
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border"
                        style={{ borderColor: BORDER }}
                      />
                      <button
                        type="button"
                        onClick={() => deleteImage(index)}
                        className="absolute -top-2 -right-2 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow"
                        style={{ background: "#B4302F" }}
                      >
                        ✕
                      </button>
                      <label
                        className="absolute bottom-1 left-1 right-1 text-white text-[10px] sm:text-xs py-1 rounded text-center cursor-pointer opacity-90 hover:opacity-100"
                        style={{ background: STEEL }}
                      >
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

                  <label
                    className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition"
                    style={{ borderColor: BORDER, color: MUTED }}
                  >
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
                  { name: "name", placeholder: "Product name" },
                  { name: "brand", placeholder: "Brand" },
                  { name: "category", placeholder: "Category" },
                  { name: "material", placeholder: "Material" },
                  { name: "stock", placeholder: "Stock", type: "number" },
                  { name: "size", placeholder: "Size (e.g. XL, 10 inch)" },
                  { name: "weight", placeholder: "Weight (e.g. 500g, 1kg)" },
                  { name: "gst", placeholder: "GST percentage (%)", type: "number" },
                  { name: "variantGroup", placeholder: "Variant group" },
                ].map((field) => (
                  <input
                    key={field.name}
                    type={field.type || "text"}
                    name={field.name}
                    value={editProduct[field.name] ?? ""}
                    onChange={handleEditChange}
                    placeholder={field.placeholder}
                    className="rounded-xl px-4 py-3 text-sm outline-none border focus:ring-2 transition"
                    style={{ borderColor: BORDER, color: INK }}
                  />
                ))}
              </div>

              {/* Delivery Details */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm" style={{ color: INK }}>
                  <Truck size={18} style={{ color: STEEL }} />
                  Delivery details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    type="number"
                    name="deliveryCharge"
                    value={editProduct.deliveryCharge ?? ""}
                    onChange={handleEditChange}
                    placeholder="Delivery charge (₹, 0 for free)"
                    className="rounded-xl px-4 py-3 text-sm outline-none border transition"
                    style={{ borderColor: BORDER, color: INK }}
                  />
                  <input
                    type="text"
                    name="deliveryTime"
                    value={editProduct.deliveryTime ?? ""}
                    onChange={handleEditChange}
                    placeholder="Estimated delivery time (e.g. 3-5 business days)"
                    className="rounded-xl px-4 py-3 text-sm outline-none border transition"
                    style={{ borderColor: BORDER, color: INK }}
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm" style={{ color: INK }}>
                  <CreditCard size={18} style={{ color: STEEL }} />
                  Accepted payment methods
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AVAILABLE_PAYMENT_METHODS.map((method) => {
                    const isSelected = editProduct.paymentMethods?.includes(method);
                    return (
                      <label
                        key={method}
                        className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition text-sm font-medium"
                        style={
                          isSelected
                            ? { borderColor: STEEL, background: `${STEEL}0D`, color: INK }
                            : { borderColor: BORDER, color: MUTED }
                        }
                      >
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => handlePaymentMethodToggle(method)}
                          className="w-4 h-4 rounded"
                          style={{ accentColor: STEEL }}
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
                  <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: INK }}>
                    <Tag size={18} style={{ color: STEEL }} />
                    Quantity-based Pricing
                  </h3>
                  <button
                    type="button"
                    onClick={addPriceRow}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition"
                    style={{ borderColor: STEEL, color: STEEL, background: BG }}
                  >
                    <Plus size={14} /> Add Tier
                  </button>
                </div>

                <div className="space-y-2.5">
                  {editProduct.pricing?.map((p, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min Qty (e.g. 1)"
                        value={p.quantity ?? ""}
                        onChange={(e) => handlePriceChange(index, "quantity", e.target.value)}
                        className="w-1/2 rounded-xl px-4 py-2.5 text-sm outline-none border transition"
                        style={{ borderColor: BORDER, color: INK }}
                      />
                      <input
                        type="number"
                        placeholder="Price per unit (₹)"
                        value={p.price ?? ""}
                        onChange={(e) => handlePriceChange(index, "price", e.target.value)}
                        className="w-1/2 rounded-xl px-4 py-2.5 text-sm outline-none border transition"
                        style={{ borderColor: BORDER, color: INK }}
                      />
                      {editProduct.pricing.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePriceRow(index)}
                          className="p-2.5 rounded-xl border transition text-red-600 hover:bg-red-50"
                          style={{ borderColor: "#F0BABA" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2 text-sm" style={{ color: INK }}>
                  Description
                </h3>
                <textarea
                  name="description"
                  rows={4}
                  value={editProduct.description ?? ""}
                  onChange={handleEditChange}
                  placeholder="Enter product description..."
                  className="w-full rounded-xl p-4 text-sm outline-none border transition"
                  style={{ borderColor: BORDER, color: INK }}
                />
              </div>

              {/* Submit / Cancel Actions */}
              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: BORDER }}>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 py-3 rounded-xl border text-sm font-semibold transition"
                  style={{ borderColor: BORDER, color: INK, background: BG }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={updateProduct}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition text-white disabled:opacity-50"
                  style={{ background: STEEL }}
                >
                  {updating ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetAllProducts;
