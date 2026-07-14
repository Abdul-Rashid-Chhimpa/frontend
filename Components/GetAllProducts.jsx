import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";

const GetAllProducts = () => {

  // ===============================
  // STATES
  // ===============================

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editProduct, setEditProduct] = useState(null);

  const [expandedDesc, setExpandedDesc] = useState({});

  const API =
    "https://backend-3-axez.onrender.com/api/products";

  // ===============================
  // FETCH PRODUCTS
  // ===============================

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

  // ===============================
  // DELETE PRODUCT
  // ===============================

  const deleteProduct = async (id) => {

    const confirmDelete = window.confirm(
      "Delete this product ?"
    );

    if (!confirmDelete) return;

    try {

      const { data } = await axios.delete(
        `${API}/${id}`
      );

      if (data.success) {

        setProducts((prev) =>
          prev.filter(
            (item) => item._id !== id
          )
        );

        alert("Product Deleted Successfully");

      }

    } catch (error) {

      console.log(error);

      alert("Delete Failed");

    }

  };

  // ===============================
  // HANDLE INPUT CHANGE
  // ===============================

  const handleEditChange = (e) => {

    const { name, value } = e.target;

    setEditProduct((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  // ===============================
  // PRICE CHANGE
  // ===============================

  const handlePriceChange = (
    index,
    field,
    value
  ) => {

    const updatedPricing = [
      ...editProduct.pricing,
    ];

    updatedPricing[index][field] = value;

    setEditProduct((prev) => ({
      ...prev,
      pricing: updatedPricing,
    }));

  };

  // ===============================
  // ADD PRICE ROW
  // ===============================

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

  // ===============================
  // REMOVE PRICE ROW
  // ===============================

  const removePriceRow = (index) => {

    setEditProduct((prev) => ({

      ...prev,

      pricing: prev.pricing.filter(
        (_, i) => i !== index
      ),

    }));

  };

  // ===============================
  // DESCRIPTION TOGGLE
  // ===============================

  const toggleDescription = (id) => {

    setExpandedDesc((prev) => ({

      ...prev,

      [id]: !prev[id],

    }));

  };
    // ===============================
  // DELETE IMAGE
  // ===============================

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

  // ===============================
  // ADD NEW IMAGE
  // ===============================

  const addImage = (file) => {

    if (!file) return;

    const preview = URL.createObjectURL(file);

    setEditProduct((prev) => ({

      ...prev,

      images: [
        ...prev.images,
        preview,
      ],

      newImages: [

        ...(prev.newImages || []),

        {
          file,
          index: -1, // New Image
        },

      ],

    }));

  };

  // ===============================
  // REPLACE IMAGE
  // ===============================

  const replaceImage = (index, file) => {

    if (!file) return;

    const preview = URL.createObjectURL(file);

    setEditProduct((prev) => {

      const updatedImages = [...prev.images];

      updatedImages[index] = preview;

      let updatedNewImages = [
        ...(prev.newImages || []),
      ];

      const existing =
        updatedNewImages.findIndex(
          (img) => img.index === index
        );

      if (existing !== -1) {

        updatedNewImages[existing] = {

          file,

          index,

        };

      } else {

        updatedNewImages.push({

          file,

          index,

        });

      }

      return {

        ...prev,

        images: updatedImages,

        newImages: updatedNewImages,

      };

    });

  };

  // ===============================
  // UPDATE PRODUCT
  // ===============================

  const updateProduct = async () => {

    try {

      const formData = new FormData();

      // Basic Details

      formData.append(
        "name",
        editProduct.name
      );

      formData.append(
        "brand",
        editProduct.brand
      );

      formData.append(
        "category",
        editProduct.category
      );

      formData.append(
        "material",
        editProduct.material
      );

      formData.append(
        "stock",
        editProduct.stock
      );

      formData.append(
        "description",
        editProduct.description
      );

      // Pricing

      formData.append(
        "pricing",
        JSON.stringify(
          editProduct.pricing
        )
      );

      // Existing Images

      const existingImages =
        editProduct.images.filter(
          (img) =>
            img.startsWith("http")
        );

      formData.append(
        "existingImages",
        JSON.stringify(existingImages)
      );

      // Upload Queue

      (editProduct.newImages || []).forEach(
        (item) => {

          if (!item) return;

          formData.append(
            "images",
            item.file
          );

          formData.append(
            "replaceIndexes",
            item.index
          );

        }
      );

      const { data } =
        await axios.put(

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

        alert(
          "Product Updated Successfully"
        );

        setEditProduct(null);

        fetchProducts();

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

  // ===============================
  // LOADING
  // ===============================

  if (loading) {

    return (

      <div className="text-center py-20 text-xl font-semibold">

        Loading Products...

      </div>

    );

  }
  return (
  <div className="p-6">

    <h1 className="text-3xl font-bold mb-8">
      All Products
    </h1>

    {products.length === 0 ? (

      <div className="text-center text-2xl font-semibold py-20">

        No Products Found

      </div>

    ) : (

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

        {products.map((product) => {

          const expanded =
            expandedDesc[product._id];

          return (

            <div
              key={product._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl duration-300"
            >

              {/* ========================= */}
              {/* MAIN IMAGE */}
              {/* ========================= */}

              <img
                src={
                  product.images?.[0] ||
                  "https://via.placeholder.com/500x400"
                }
                alt={product.name}
                className="w-full h-56 object-cover"
              />

              {/* ========================= */}
              {/* THUMBNAIL IMAGES */}
              {/* ========================= */}

              <div className="flex gap-2 p-3 overflow-x-auto">

                {product.images?.map(
                  (img, index) => (

                    <img
                      key={index}
                      src={img}
                      alt={`product-${index}`}
                      className="w-14 h-14 rounded-lg border object-cover flex-shrink-0"
                    />

                  )
                )}

              </div>

              {/* ========================= */}
              {/* PRODUCT CONTENT */}
              {/* ========================= */}

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
                                {/* ========================= */}
                {/* QUANTITY WISE PRICING */}
                {/* ========================= */}

                <div className="mt-4">

                  <h3 className="font-semibold mb-2">
                    Quantity Pricing
                  </h3>

                  <div className="border rounded-lg overflow-hidden">

                    <table className="w-full text-sm">

                      <thead className="bg-gray-100">

                        <tr>

                          <th className="py-2">
                            Qty
                          </th>

                          <th className="py-2">
                            Price
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {product.pricing?.map(
                          (price, index) => (

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

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>

                {/* ========================= */}
                {/* DESCRIPTION */}
                {/* ========================= */}

                <div className="mt-4 text-sm text-gray-700 leading-6">

                  {expanded
                    ? product.description
                    : product.description?.slice(0, 80)}

                  {product.description?.length > 80 && (

                    <button
                      onClick={() =>
                        toggleDescription(product._id)
                      }
                      className="text-blue-600 ml-1 font-medium"
                    >

                      {expanded
                        ? " Show Less"
                        : "...Read More"}

                    </button>

                  )}

                </div>

                {/* ========================= */}
                {/* ACTION BUTTONS */}
                {/* ========================= */}

                <div className="flex gap-3 mt-5">

                  <button
                    onClick={() =>
                      setEditProduct({
                        ...product,
                        newImages: [],
                      })
                    }
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                  >

                    <Pencil size={16} />

                    Edit

                  </button>

                  <button
                    onClick={() =>
                      deleteProduct(product._id)
                    }
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
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

    {/* ========================= */}
    {/* EDIT MODAL PART 2B */}
    {/* ========================= */}

    {editProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">

        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto p-6">

          <h2 className="text-3xl font-bold mb-6">
            Edit Product
          </h2>

          {/* ========================= */}
          {/* PRODUCT IMAGES */}
          {/* ========================= */}

          <div className="mb-8">

            <h3 className="font-semibold text-lg mb-4">
              Product Images
            </h3>

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
                    onClick={() =>
                      deleteImage(index)
                    }
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

                          replaceImage(
                            index,
                            e.target.files[0]
                          );

                        }

                      }}
                    />

                  </label>

                </div>

              ))}

              {/* ADD IMAGE */}

              <label className="w-28 h-28 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer text-3xl">

                +

                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {

                    if (e.target.files[0]) {

                      addImage(
                        e.target.files[0]
                      );

                    }

                  }}
                />

              </label>

            </div>

          </div>

          {/* ========================= */}
          {/* BASIC DETAILS */}
          {/* ========================= */}

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

          {/* ========================= */}
          {/* QUANTITY PRICING */}
          {/* ========================= */}

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

            {editProduct.pricing?.map(
              (item, index) => (

                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 mb-3"
                >

                  <input
                    type="number"
                    value={item.quantity}
                    placeholder="Quantity"
                    onChange={(e) =>
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
                    onChange={(e) =>
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
                    onClick={() =>
                      removePriceRow(index)
                    }
                    className="col-span-2 bg-red-600 text-white rounded-lg"
                  >

                    Delete

                  </button>

                </div>

              )
            )}
                      </div>

          {/* ========================= */}
          {/* DESCRIPTION */}
          {/* ========================= */}

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

          {/* ========================= */}
          {/* FOOTER BUTTONS */}
          {/* ========================= */}

          <div className="flex gap-4 mt-8">

            <button
              type="button"
              onClick={updateProduct}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
            >
              Save Changes
            </button>

            <button
              type="button"
              onClick={() => setEditProduct(null)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold"
            >
              Cancel
            </button>

          </div>

        </div>

      </div>

    )}

  </div>

);

};

export default GetAllProducts;
