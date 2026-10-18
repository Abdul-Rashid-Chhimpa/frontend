import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Pencil,
  Trash2,
  X,
  ImagePlus,
  Boxes,
  RefreshCw,
  Layers,
  Truck,
  CreditCard,
  Tag,
  Users,
  Search,
  UserCheck,
} from "lucide-react";

// ======================================================
// DESIGN TOKENS
// ======================================================
const INK = "#15181C";
const MUTED = "#6B7280";
const BORDER = "#E6E8EB";
const SURFACE = "#FFFFFF";
const BG = "#F5F6F4";
const STEEL = "#2B4A5E";

const USER_LIST_ENDPOINTS = [
  "/api/users",
  "/api/users/all",
  "/api/admin/users",
];

const getUserPhone = (u) => String(u?.phone || u?.mobile || u?.mobileNumber || "");

const normalizeAllowedIds = (list) =>
  Array.isArray(list)
    ? list.map((u) => String(u && typeof u === "object" ? u._id : u)).filter(Boolean)
    : [];

const GetAllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState(null);
  const [expandedDesc, setExpandedDesc] = useState({});
  const [updating, setUpdating] = useState(false);

  const [allUsers, setAllUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  const BASE_URL = "https://backend-3-axez.onrender.com";
  const API = `${BASE_URL}/api/products`;

  const AVAILABLE_PAYMENT_METHODS = [
    "Cash on Delivery",
    "UPI / Online Payment",
    "Net Banking",
    "Credit / Debit Card",
  ];

  const getUserLabel = (id) => {
    const u = allUsers.find((x) => String(x._id) === String(id));
    const shortId = String(id).slice(-6);
    if (!u) return `User ...${shortId}`;
    return u.name || u.email || getUserPhone(u) || `User ...${shortId}`;
  };

  // ================= FETCH PRODUCTS =================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/admin/all`);
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

  // ================= FETCH USERS =================
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError("");
    let lastError = null;

    for (const path of USER_LIST_ENDPOINTS) {
      try {
        const res = await axios.get(`${BASE_URL}${path}`);
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
  }, [BASE_URL]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      editProduct?.discountTargetType === "selected" &&
      allUsers.length === 0 &&
      !usersLoading
    ) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editProduct?.discountTargetType]);

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
    const { name, value, type, checked } = e.target;
    setEditProduct((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

  const toggleUserSelection = (userId) => {
    const id = String(userId);
    setEditProduct((prev) => {
      const current = prev.allowedUserIds || [];
      const exists = current.includes(id);
      const updatedIds = exists
        ? current.filter((x) => x !== id)
        : [...current, id];
      return { ...prev, allowedUserIds: updatedIds };
    });
  };

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
    setEditProduct((prev) => {
      const merged = new Set(prev.allowedUserIds || []);
      filteredUsers.forEach((u) => merged.add(String(u._id)));
      return { ...prev, allowedUserIds: Array.from(merged) };
    });
  };

  const clearSelectedUsers = () => {
    setEditProduct((prev) => ({ ...prev, allowedUserIds: [] }));
  };

  // ================= IMAGE HANDLING =================
  const deleteImage = (index) => {
    setEditProduct((prev) => {
      const updatedImages = [...(prev.images || [])];
      const removedImage = updatedImages.splice(index, 1)[0];

      if (removedImage && typeof removedImage === "string" && removedImage.startsWith("blob:")) {
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

      if (
        updatedImages[index] &&
        typeof updatedImages[index] === "string" &&
        updatedImages[index].startsWith("blob:")
      ) {
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
    setUserSearchTerm("");
    setEditProduct(null);
  };

  // ================= OPEN EDIT MODAL =================
  const openEditModal = (product, deliveryCharge, deliveryTime, paymentMethods) => {
    setUserSearchTerm("");

    setEditProduct({
      ...product,
      isNewProduct: product.isNewProduct || false,
      discountPercent: product.discountPercent || "",
      discountNote: product.discountNote || "",
      discountTargetType: product.discountTargetType === "selected" ? "selected" : "all",
      allowedUserIds: normalizeAllowedIds(product.allowedUserIds),
      otherUsersDiscountPercent: product.otherUsersDiscountPercent ?? "",
      otherUsersDiscountNote: product.otherUsersDiscountNote ?? "",
      deliveryCharge: deliveryCharge ?? "",
      deliveryTime: deliveryTime ?? "",
      paymentMethods: paymentMethods,
      newImages: [],
    });
  };

  // ================= UPDATE PRODUCT =================
  const updateProduct = async () => {
    if (!editProduct.pricing || editProduct.pricing.length === 0) {
      alert("At least one pricing option is required.");
      return;
    }

    if (
      editProduct.discountTargetType === "selected" &&
      (editProduct.allowedUserIds || []).length === 0
    ) {
      alert("Please select at least one user for targeted discount");
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

      formData.append("isNewProduct", Boolean(editProduct.isNewProduct));
      formData.append("discountPercent", Number(editProduct.discountPercent) || 0);
      formData.append("discountNote", editProduct.discountNote || "");

      formData.append("discountTargetType", editProduct.discountTargetType || "all");
      formData.append(
        "otherUsersDiscountPercent",
        editProduct.discountTargetType === "selected"
          ? Number(editProduct.otherUsersDiscountPercent) || 0
          : 0
      );
      formData.append(
        "otherUsersDiscountNote",
        editProduct.discountTargetType === "selected"
          ? editProduct.otherUsersDiscountNote || ""
          : ""
      );
      formData.append(
        "allowedUserIds",
        JSON.stringify(
          editProduct.discountTargetType === "selected"
            ? editProduct.allowedUserIds || []
            : []
        )
      );

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

  // ================= LOADING =================
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
              <div
                key={i}
                className="rounded-2xl overflow-hidden border"
                style={{ background: SURFACE, borderColor: BORDER }}
              >
                <div className="h-48 sm:h-52 shimmer" style={{ background: "#F1F2EF" }} />
                <div className="p-4 sm:p-5">
                  <div className="h-4 w-3/4 rounded-md shimmer" style={{ background: BORDER }} />
                  <div className="h-3 w-1/2 rounded-md shimmer mt-3" style={{ background: BORDER }} />
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
          <div
            className="rounded-2xl border p-12 text-center"
            style={{ background: SURFACE, borderColor: BORDER }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: BG }}
            >
              <Boxes size={36} style={{ color: STEEL }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: INK }}>
              No products found
            </h2>
            <p className="mt-2" style={{ color: MUTED }}>
              Add products to see them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {products.map((product) => {
              const expanded = expandedDesc[product._id];
              const lowestPrice =
                product.pricing?.length > 0
                  ? Math.min(...product.pricing.map((p) => Number(p.price) || 0))
                  : 0;

              const deliveryCharge = product.deliveryCharge ?? product.delivery?.charge;
              const deliveryTime = product.deliveryTime || product.delivery?.time;
              const paymentMethods = product.paymentMethods || product.payment || [];

              const isTargeted = product.discountTargetType === "selected";
              const targetedIds = normalizeAllowedIds(product.allowedUserIds);
              const targetedCount = targetedIds.length;
              const otherPercent = Number(product.otherUsersDiscountPercent) || 0;
              const specialPercent = Number(product.discountPercent) || 0;

              return (
                <div
                  key={product._id}
                  className="rounded-2xl overflow-hidden border transition-all duration-200 hover:-translate-y-1 flex flex-col"
                  style={{ background: SURFACE, borderColor: BORDER }}
                >
                  <div className="relative h-48 sm:h-52" style={{ background: "#F1F2EF" }}>
                    <img
                      src={
                        product.images?.[0] ||
                        "https://via.placeholder.com/500x400?text=No+Image"
                      }
                      alt={product.name}
                      className="w-full h-full object-contain p-4"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/500x400?text=No+Image";
                      }}
                    />

                    {product.isNewProduct && (
                      <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                        NEW
                      </span>
                    )}

                    <span
                      className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full border"
                      style={{
                        background: SURFACE,
                        borderColor: BORDER,
                        color: INK,
                      }}
                    >
                      Stock: {product.stock ?? 0}
                    </span>
                  </div>

                  {product.images?.length > 1 && (
                    <div className="flex gap-2 px-4 pt-3 overflow-x-auto">
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
                      {product.discountNote && (
                        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
                          {product.discountNote}
                        </span>
                      )}
                      {isTargeted && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                          <Users size={11} />
                          Special: {targetedCount} user{targetedCount !== 1 ? "s" : ""}
                        </span>
                      )}
                      {product.category && (
                        <span
                          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border"
                          style={{
                            background: BG,
                            borderColor: BORDER,
                            color: INK,
                          }}
                        >
                          <Tag size={11} style={{ color: STEEL }} />
                          {product.category}
                        </span>
                      )}
                      {product.brand && (
                        <span
                          className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg border"
                          style={{
                            background: BG,
                            borderColor: BORDER,
                            color: INK,
                          }}
                        >
                          {product.brand}
                        </span>
                      )}
                      {product.variantGroup && (
                        <span
                          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border"
                          style={{
                            background: BG,
                            borderColor: BORDER,
                            color: INK,
                          }}
                        >
                          <Layers size={11} style={{ color: STEEL }} />
                          {product.variantGroup}
                        </span>
                      )}
                    </div>

                    {/* ===== TARGETED DISCOUNT BOX ===== */}
                    {isTargeted && (
                      <div className="mt-3 p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 text-xs space-y-1.5">
                        <p className="font-semibold text-amber-800 flex items-center gap-1">
                          <UserCheck size={13} />
                          Special discount: {specialPercent}% for {targetedCount} user
                          {targetedCount !== 1 ? "s" : ""}
                        </p>

                        <div className="flex flex-wrap gap-1">
                          {targetedIds.slice(0, 6).map((id) => (
                            <span
                              key={id}
                              className="inline-flex items-center bg-amber-100 text-amber-900 text-[11px] px-2 py-0.5 rounded-full font-medium"
                            >
                              {getUserLabel(id)}
                            </span>
                          ))}
                          {targetedCount > 6 && (
                            <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full font-medium bg-white border border-amber-200 text-amber-800">
                              +{targetedCount - 6} more
                            </span>
                          )}
                        </div>

                        <p className="text-amber-900 pt-1 border-t border-amber-200/60">
                          <span className="font-semibold">
                            Other users (not selected) see:{" "}
                          </span>
                          {otherPercent > 0 ? (
                            <span className="font-bold text-rose-700">
                              {otherPercent}% OFF
                              {product.otherUsersDiscountNote
                                ? ` (${product.otherUsersDiscountNote})`
                                : ""}
                            </span>
                          ) : (
                            <span className="italic text-amber-700">No discount</span>
                          )}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 text-sm space-y-0.5" style={{ color: MUTED }}>
                      <p>
                        <span className="font-medium" style={{ color: INK }}>
                          Material:
                        </span>{" "}
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
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="font-bold text-base" style={{ color: "#1D7A43" }}>
                          From ₹{lowestPrice.toLocaleString()}
                        </p>

                        {isTargeted ? (
                          otherPercent > 0 && (
                            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                              {otherPercent}% OFF
                              <span className="ml-1 text-[10px] font-medium opacity-80">
                                (Others)
                              </span>
                            </span>
                          )
                        ) : (
                          specialPercent > 0 && (
                            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                              {specialPercent}% OFF
                            </span>
                          )
                        )}

                        {isTargeted && specialPercent > 0 && (
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {specialPercent}% Special
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delivery & Payment */}
                    <div
                      className="mt-3 pt-3 border-t text-xs space-y-2 p-2.5 rounded-xl"
                      style={{ borderColor: BORDER, background: BG }}
                    >
                      <div className="flex items-start gap-1.5" style={{ color: INK }}>
                        <Truck
                          size={15}
                          style={{ color: STEEL }}
                          className="flex-shrink-0 mt-0.5"
                        />
                        <div>
                          <span className="font-semibold">Delivery: </span>
                          {deliveryCharge === 0 || deliveryCharge === "0" ? (
                            <span className="font-bold" style={{ color: "#1D7A43" }}>
                              Free delivery
                            </span>
                          ) : deliveryCharge ? (
                            <span className="font-medium">₹{deliveryCharge} charge</span>
                          ) : (
                            <span className="italic" style={{ color: MUTED }}>
                              Not specified
                            </span>
                          )}
                          {deliveryTime && (
                            <span style={{ color: MUTED }}> ({deliveryTime})</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-1.5" style={{ color: INK }}>
                        <CreditCard
                          size={15}
                          style={{ color: STEEL }}
                          className="flex-shrink-0 mt-0.5"
                        />
                        <div>
                          <span className="font-semibold">Payment: </span>
                          {paymentMethods.length > 0 ? (
                            <span className="font-medium">
                              {paymentMethods.join(", ")}
                            </span>
                          ) : (
                            <span
                              className="italic font-medium"
                              style={{ color: "#B4691F" }}
                            >
                              No methods specified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {product.pricing?.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-xs font-semibold mb-2" style={{ color: MUTED }}>
                          Quantity pricing
                        </h3>
                        <div
                          className="rounded-xl overflow-hidden border"
                          style={{ borderColor: BORDER }}
                        >
                          <table className="w-full text-sm">
                            <thead style={{ background: BG }}>
                              <tr>
                                <th
                                  className="py-2 px-3 text-left font-medium"
                                  style={{ color: MUTED }}
                                >
                                  Qty
                                </th>
                                <th
                                  className="py-2 px-3 text-right font-medium"
                                  style={{ color: MUTED }}
                                >
                                  Price
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {product.pricing.map((price, index) => (
                                <tr
                                  key={index}
                                  className="border-t"
                                  style={{ borderColor: BORDER }}
                                >
                                  <td className="py-2 px-3" style={{ color: INK }}>
                                    {price.quantity}+
                                  </td>
                                  <td
                                    className="py-2 px-3 text-right font-semibold"
                                    style={{ color: "#1D7A43" }}
                                  >
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
                          openEditModal(
                            product,
                            deliveryCharge,
                            deliveryTime,
                            paymentMethods
                          )
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
                        style={{
                          borderColor: "#F0BABA",
                          color: "#B4302F",
                          background: "#FBEEEE",
                        }}
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
          <div
            className="w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
            style={{ background: SURFACE }}
          >
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
                <h3
                  className="font-semibold mb-3 flex items-center gap-2"
                  style={{ color: INK }}
                >
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
                    <ImagePlus size={24} />
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

              {/* NEW Arrival */}
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                <div>
                  <label
                    htmlFor="isNewProduct"
                    className="font-bold text-emerald-950 flex items-center gap-2 cursor-pointer text-sm sm:text-base"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                    Mark as "NEW" Arrival
                  </label>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Displays an animated "NEW" badge on product cards
                  </p>
                </div>
                <input
                  id="isNewProduct"
                  type="checkbox"
                  name="isNewProduct"
                  checked={!!editProduct.isNewProduct}
                  onChange={handleEditChange}
                  className="w-6 h-6 accent-emerald-600 cursor-pointer rounded"
                />
              </div>

              {/* Offer & Discount */}
              <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-3">
                <h3 className="font-bold text-rose-950 flex items-center gap-2 text-sm sm:text-base">
                  <Tag size={18} className="text-rose-600" />
                  Offer &amp; Discount{" "}
                  <span className="text-xs font-normal text-rose-600">(Optional)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-rose-900 mb-1">
                      {editProduct.discountTargetType === "selected"
                        ? "Special Discount for Selected Users (%)"
                        : "Discount Percentage (%)"}
                    </label>
                    <input
                      type="number"
                      name="discountPercent"
                      value={editProduct.discountPercent ?? ""}
                      onChange={handleEditChange}
                      placeholder="e.g. 15 for 15% OFF"
                      className="w-full bg-white rounded-xl px-4 py-2.5 text-sm outline-none border border-rose-200 focus:border-rose-400 transition"
                      style={{ color: INK }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-rose-900 mb-1">
                      Offer Tag / Custom Note
                    </label>
                    <input
                      type="text"
                      name="discountNote"
                      value={editProduct.discountNote ?? ""}
                      onChange={handleEditChange}
                      placeholder="e.g. Eid Sale / Limited Time Offer!"
                      className="w-full bg-white rounded-xl px-4 py-2.5 text-sm outline-none border border-rose-200 focus:border-rose-400 transition"
                      style={{ color: INK }}
                    />
                  </div>
                </div>

                {/* Who can see this discount */}
                <div className="pt-3 border-t border-rose-200/60">
                  <label className="block text-xs font-semibold text-rose-900 mb-2 flex items-center gap-1.5">
                    <Users size={15} className="text-rose-600" />
                    Who can see this discount?
                  </label>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-rose-900">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="discountTargetType"
                        value="all"
                        checked={editProduct.discountTargetType !== "selected"}
                        onChange={handleEditChange}
                        className="accent-rose-600 cursor-pointer"
                      />
                      All Users (Public)
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="discountTargetType"
                        value="selected"
                        checked={editProduct.discountTargetType === "selected"}
                        onChange={handleEditChange}
                        className="accent-rose-600 cursor-pointer"
                      />
                      Selected Users Only (Special Discount)
                    </label>
                  </div>

                  {editProduct.discountTargetType === "selected" && (
                    <div className="mt-3 bg-white p-3 sm:p-4 rounded-xl border border-rose-200 space-y-3">
                      {/* Other users discount */}
                      <div className="p-3 rounded-lg bg-rose-50/60 border border-rose-100">
                        <p className="text-xs font-semibold text-rose-900 mb-2">
                          Discount for all OTHER users (not selected)
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="number"
                            name="otherUsersDiscountPercent"
                            value={editProduct.otherUsersDiscountPercent ?? ""}
                            onChange={handleEditChange}
                            placeholder="e.g. 5 (leave empty for no discount)"
                            className="w-full bg-white rounded-lg px-3 py-2 text-xs sm:text-sm outline-none border border-rose-200 focus:border-rose-400"
                          />
                          <input
                            type="text"
                            name="otherUsersDiscountNote"
                            value={editProduct.otherUsersDiscountNote ?? ""}
                            onChange={handleEditChange}
                            placeholder="e.g. Regular Sale"
                            className="w-full bg-white rounded-lg px-3 py-2 text-xs sm:text-sm outline-none border border-rose-200 focus:border-rose-400"
                          />
                        </div>
                        <p className="text-[11px] text-rose-700 mt-1.5">
                          Selected users see the special discount above. Everyone else
                          sees this one.
                        </p>
                      </div>

                      {/* Search */}
                      <div className="relative">
                        <Search
                          size={16}
                          className="absolute left-3 top-3 text-gray-400"
                        />
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
                            disabled={(editProduct.allowedUserIds || []).length === 0}
                            className="font-semibold text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

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
                            const isSelected = (
                              editProduct.allowedUserIds || []
                            ).includes(String(user._id));
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

                      <div className="pt-1">
                        <p className="text-[11px] font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                          <UserCheck size={13} className="text-emerald-600" />
                          Selected Users ({(editProduct.allowedUserIds || []).length})
                        </p>
                        <div className="h-16 overflow-y-auto rounded-lg border border-dashed border-gray-200 bg-gray-50/60 p-2">
                          {(editProduct.allowedUserIds || []).length === 0 ? (
                            <p className="text-[11px] text-gray-400">
                              No users selected yet. Tick the checkbox next to a user
                              above.
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {(editProduct.allowedUserIds || []).map((id) => {
                                const matchedUser = allUsers.find(
                                  (u) => String(u._id) === String(id)
                                );
                                return (
                                  <span
                                    key={id}
                                    className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[11px] px-2 py-0.5 rounded-full font-medium"
                                  >
                                    {matchedUser?.name ||
                                      matchedUser?.email ||
                                      getUserLabel(id)}
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

              {/* Delivery */}
              <div>
                <h3
                  className="font-semibold mb-3 flex items-center gap-2 text-sm"
                  style={{ color: INK }}
                >
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
                <h3
                  className="font-semibold mb-3 flex items-center gap-2 text-sm"
                  style={{ color: INK }}
                >
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
                            ? {
                                borderColor: STEEL,
                                background: `${STEEL}0D`,
                                color: INK,
                              }
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

              {/* Quantity Pricing */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className="font-semibold text-sm flex items-center gap-2"
                    style={{ color: INK }}
                  >
                    <Tag size={18} style={{ color: STEEL }} />
                    Quantity-based Pricing
                  </h3>
                  <button
                    type="button"
                    onClick={addPriceRow}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition"
                    style={{
                      borderColor: STEEL,
                      color: STEEL,
                      background: BG,
                    }}
                  >
                    + Add Tier
                  </button>
                </div>
                <div className="space-y-2.5">
                  {editProduct.pricing?.map((p, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min Qty (e.g. 1)"
                        value={p.quantity ?? ""}
                        onChange={(e) =>
                          handlePriceChange(index, "quantity", e.target.value)
                        }
                        className="w-1/2 rounded-xl px-4 py-2.5 text-sm outline-none border transition"
                        style={{ borderColor: BORDER, color: INK }}
                      />
                      <input
                        type="number"
                        placeholder="Price per unit (₹)"
                        value={p.price ?? ""}
                        onChange={(e) =>
                          handlePriceChange(index, "price", e.target.value)
                        }
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

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: BORDER }}>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 py-3 rounded-xl border text-sm font-semibold transition"
                  style={{
                    borderColor: BORDER,
                    color: INK,
                    background: BG,
                  }}
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
