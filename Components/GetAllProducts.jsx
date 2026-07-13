import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";

const GetAllProducts = () => {
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(true);

const [editProduct, setEditProduct] = useState(null);

const [expandedDesc, setExpandedDesc] = useState({});

const API =
  "https://backend-3-axez.onrender.com/api/products";

// ================= FETCH PRODUCTS =================

const fetchProducts = async () => {
  try {
    setLoading(true);

    const { data } = await axios.get(API);

    if (data.success) {
      setProducts(data.products);
    }
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
  if (!window.confirm("Delete this product ?")) return;

  try {
    const { data } = await axios.delete(`${API}/${id}`);

    if (data.success) {
      setProducts((prev) =>
        prev.filter((item) => item._id !== id)
      );

      alert("Product Deleted");
    }
  } catch (error) {
    console.log(error);
    alert("Delete Failed");
  }
};

// ================= INPUT CHANGE =================

const handleEditChange = (e) => {
  setEditProduct((prev) => ({
    ...prev,
    [e.target.name]: e.target.value,
  }));
};

// ================= PRICE CHANGE =================

const handlePriceChange = (index, field, value) => {
  const pricing = [...editProduct.pricing];

  pricing[index][field] = value;

  setEditProduct((prev) => ({
    ...prev,
    pricing,
  }));
};

// ================= ADD PRICE =================

const addPriceRow = () => {
  setEditProduct((prev) => ({
    ...prev,
    pricing: [
      ...prev.pricing,
      {
        quantity: "",
        price: "",
      },
    ],
  }));
};

// ================= REMOVE PRICE =================

const removePriceRow = (index) => {
  setEditProduct((prev) => ({
    ...prev,
    pricing: prev.pricing.filter(
      (_, i) => i !== index
    ),
  }));
};

// ================= DELETE IMAGE =================

const deleteImage = (index) => {

  setEditProduct((prev) => {

    const updatedImages = [...prev.images];
    updatedImages.splice(index, 1);

    const updatedNewImages =
      (prev.newImages || []).filter(
        (item) => item?.index !== index
      );

    return {
      ...prev,
      images: updatedImages,
      newImages: updatedNewImages,
    };

  });

};

// ================= ADD IMAGE =================

const addImage = (file) => {
  if (!file) return;

  const preview = URL.createObjectURL(file);

  setEditProduct((prev) => ({
    ...prev,
    images: [...prev.images, preview],
    newImages: [
      ...(prev.newImages || []),
      {
        file,
        index: -1,
      },
    ],
  }));
};

// ================= REPLACE IMAGE =================
const replaceImage = (index, file) => {
  if (!file) return;

  const preview = URL.createObjectURL(file);

  setEditProduct((prev) => {

    const updatedImages = [...prev.images];
    updatedImages[index] = preview;

    const updatedNewImages = [...(prev.newImages || [])];

    updatedNewImages[index] = {
      file,
      index,
    };

    return {
      ...prev,
      images: updatedImages,
      newImages: updatedNewImages,
    };

  });
};

// ================= UPDATE PRODUCT =================

const updateProduct = async () => {
  try {
    const formData = new FormData();

    // =========================
    // BASIC DETAILS
    // =========================

    formData.append("name", editProduct.name);
    formData.append("brand", editProduct.brand);
    formData.append("category", editProduct.category);
    formData.append("material", editProduct.material);
    formData.append("stock", editProduct.stock);
    formData.append("description", editProduct.description);

    // =========================
    // PRICING
    // =========================

    formData.append(
      "pricing",
      JSON.stringify(editProduct.pricing)
    );

    // =========================
    // NEW / REPLACED IMAGES
    // =========================

    (editProduct.newImages || []).forEach((item) => {
      if (!item) return;

      formData.append("images", item.file);
      formData.append(
        "replaceIndexes",
        item.index
      );
    });

    // =========================
    // UPDATE API
    // =========================

    const { data } = await axios.put(
      `${API}/${editProduct._id}`,
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

    if (data.success) {
      setProducts((prev) =>
        prev.map((item) =>
          item._id === editProduct._id
            ? data.product
            : item
        )
      );

      alert("Product Updated Successfully");

      setEditProduct(null);

      fetchProducts(); // Latest Images Reload
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.log(error);

    alert(
      error.response?.data?.message ||
        "Update Failed"
    );
  }
};
// ================= DESCRIPTION =================

const toggleDescription = (id) => {
  setExpandedDesc((prev) => ({
    ...prev,
    [id]: !prev[id],
  }));
};

// ================= LOADING =================

if (loading) {
  return (
    <div className="text-center py-20">
      Loading Products...
    </div>
  );
}
  return (
    <>
    {products.length === 0 ? (
  <div className="text-center py-20">
    <h2 className="text-2xl font-bold">
      No Products Found
    </h2>
  </div>
) : (
  products.map((product) => (
    <div
      key={product._id}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl duration-300"
    >
      {/* Main Image */}

      <img
        src={
          product.images?.[0] ||
          "https://via.placeholder.com/500x400"
        }
        alt={product.name}
        className="w-full h-56 object-cover"
      />

      {/* Thumbnail Images */}

      <div className="flex gap-2 p-3 overflow-x-auto">
        {product.images?.length > 0 ? (
          product.images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Product ${index + 1}`}
              className="w-14 h-14 rounded-lg border object-cover"
            />
          ))
        ) : (
          <img
            src="https://via.placeholder.com/80"
            alt="No Image"
            className="w-14 h-14 rounded-lg border object-cover"
          />
        )}
      </div>

      {/* Content */}

      <div className="p-4">

        <h2 className="font-bold text-xl">
          {product.name}
        </h2>

        <div className="flex flex-wrap gap-2 mt-2">

          <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
            {product.category}
          </span>

          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
            Stock : {product.stock}
          </span>

        </div>

        <div className="mt-3 text-sm space-y-1">

          <p>
            <span className="font-semibold">
              Brand :
            </span>{" "}
            {product.brand || "-"}
          </p>

          <p>
            <span className="font-semibold">
              Material :
            </span>{" "}
            {product.material || "-"}
          </p>

        </div>

        {/* Quantity Pricing */}

        <div className="mt-4">

          <h3 className="font-semibold mb-2">
            Quantity Pricing
          </h3>

          <div className="border rounded-lg overflow-hidden">

            <table className="w-full text-sm">

              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2">Qty</th>
                  <th className="py-2">Price</th>
                </tr>
              </thead>

              <tbody>
                {product.pricing?.map((price, index) => (
                  <tr
                    key={index}
                    className="border-t"
                  >
                    <td className="text-center py-2">
                      {price.quantity}
                    </td>

                    <td className="text-center py-2 font-bold text-green-600">
                      ₹{price.price}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>

          </div>

        </div>
            {/* Description */}

            <div className="mt-4 text-sm text-gray-600">

              {expanded
                ? product.description
                : product.description?.slice(0, 80)}

              {product.description?.length > 80 && (
                <button
                  onClick={() =>
                    toggleDescription(product._id)
                  }
                  className="text-blue-600 ml-1"
                >
                  {expanded
                    ? " Show Less"
                    : "...Read More"}
                </button>
              )}

            </div>

            {/* Buttons */}

            <div className="flex gap-3 mt-5">

              <button
                onClick={() =>
                  setEditProduct(product)
                }
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Pencil size={16} />
                Edit
              </button>

              <button
                onClick={() =>
                  deleteProduct(product._id)
                }
                className="flex-1 bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>

            </div>

          </div>

        </div>
      );
    })}
  </div>
)}

      {/* ================= EDIT MODAL ================= */}

      {editProduct && (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-5">

    <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto p-6">

      <h2 className="text-3xl font-bold mb-6">
        Edit Product
      </h2>

      {/* Images */}

      <div className="mb-8">

        <h3 className="font-semibold text-lg mb-3">
          Product Images
        </h3>

        <div className="flex flex-wrap gap-4">

         <div className="flex flex-wrap gap-4">

  {editProduct.images?.map((img, index) => (
    <div
      key={index}
      className="relative"
    >
      <img
        src={img}
        alt=""
        className="w-28 h-28 rounded-xl object-cover border"
      />

      <button
        type="button"
        onClick={() => deleteImage(index)}
        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6"
      >
        ✕
      </button>

      <label className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded cursor-pointer">

        Replace

        <input
          hidden
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files[0]) {
              replaceImage(index, e.target.files[0]);
            }
          }}
        />

      </label>

    </div>
  ))}

  <label className="w-28 h-28 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer">

    +

    <input
      hidden
      type="file"
      accept="image/*"
      onChange={(e) => {
        if (e.target.files[0]) {
          addImage(e.target.files[0]);
        }
      }}
    />

  </label>

</div>

          <label className="w-28 h-28 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer">

            +

            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e)=>
                addImage(
                  e.target.files[0]
                )
              }
            />

          </label>

        </div>

      </div>

      {/* Basic Info */}

      <div className="grid md:grid-cols-2 gap-4">

        <input
          type="text"
          name="name"
          value={editProduct.name}
          onChange={handleEditChange}
          placeholder="Product Name"
          className="border rounded-lg p-3"
        />

        <input
          type="text"
          name="brand"
          value={editProduct.brand}
          onChange={handleEditChange}
          placeholder="Brand"
          className="border rounded-lg p-3"
        />

        <input
          type="text"
          name="category"
          value={editProduct.category}
          onChange={handleEditChange}
          placeholder="Category"
          className="border rounded-lg p-3"
        />

        <input
          type="text"
          name="material"
          value={editProduct.material}
          onChange={handleEditChange}
          placeholder="Material"
          className="border rounded-lg p-3"
        />

        <input
          type="number"
          name="stock"
          value={editProduct.stock}
          onChange={handleEditChange}
          placeholder="Stock"
          className="border rounded-lg p-3"
        />

      </div>

      {/* Pricing */}

      <div className="mt-8">

        <div className="flex justify-between items-center mb-4">

          <h3 className="text-xl font-semibold">
            Quantity Wise Pricing
          </h3>

          <button
            type="button"
            onClick={addPriceRow}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            + Add Price
          </button>

        </div>

        {editProduct.pricing?.map((item,index)=>(

          <div
            key={index}
            className="grid grid-cols-12 gap-3 mb-3"
          >

            <input
              type="number"
              value={item.quantity}
              placeholder="Quantity"
              onChange={(e)=>
                handlePriceChange(
                  index,
                  "quantity",
                  e.target.value
                )
              }
              className="col-span-5 border rounded-lg p-3"
            />

            <input
              type="number"
              value={item.price}
              placeholder="Price"
              onChange={(e)=>
                handlePriceChange(
                  index,
                  "price",
                  e.target.value
                )
              }
              className="col-span-5 border rounded-lg p-3"
            />

            <button
              type="button"
              onClick={()=>removePriceRow(index)}
              className="col-span-2 bg-red-600 text-white rounded-lg"
            >
              Delete
            </button>

          </div>

        ))}

      </div>

      {/* Description */}

      <div className="mt-6">

        <textarea
          rows="5"
          name="description"
          value={editProduct.description}
          onChange={handleEditChange}
          placeholder="Description"
          className="w-full border rounded-xl p-3"
        />

      </div>

      {/* Footer */}

      <div className="flex gap-4 mt-8">

        <button
          onClick={updateProduct}
          className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold"
        >
          Save Changes
        </button>

        <button
onClick={() => setEditProduct(null)}
          className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-semibold"
        >
          Cancel
        </button>

      </div>

    </div>

  </div>
)}
      
    </>
  );
};

export default GetAllProducts;
