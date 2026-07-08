
import { useState } from "react";
import axios from "axios";

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
});

// Quantity Wise Pricing
const [priceList, setPriceList] = useState([
  {
    quantity: "",
    price: "",
  },
]);

const handleImageChange = (e) => {
  const files = Array.from(e.target.files);

  const updatedFiles = [...imageFiles, ...files].slice(0, 10);

  setImageFiles(updatedFiles);

  const previews = updatedFiles.map((file) =>
    URL.createObjectURL(file)
  );

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

const handleChange = (e) => {
  setProduct({
    ...product,
    [e.target.name]: e.target.value,
  });
};


const addPriceRow = () => {
  setPriceList([
    ...priceList,
    {
      quantity: "",
      price: "",
    },
  ]);
};

const removePriceRow = (index) => {
  const data = [...priceList];

  data.splice(index, 1);

  setPriceList(data);
};


const handlePriceChange = (
  index,
  field,
  value
) => {
  const data = [...priceList];

  data[index][field] = value;

  setPriceList(data);
};


const handleSubmit = async (e) => {
  e.preventDefault();

  if (imageFiles.length === 0) {
    alert("Please upload at least one product image");
    return;
  }

  // Empty pricing remove
  const validPricing = priceList.filter(
    (item) =>
      item.quantity !== "" &&
      item.price !== ""
  );

  if (validPricing.length === 0) {
    alert("Please add at least one pricing option");
    return;
  }

  try {
    setLoading(true);

    const formData = new FormData();

    // Images
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    // Product Details
    formData.append("name", product.name);
    formData.append("brand", product.brand);
    formData.append("category", product.category);
    formData.append("material", product.material);
    formData.append("stock", product.stock);
    formData.append("description", product.description);

    // IMPORTANT
    formData.append(
      "pricing",
      JSON.stringify(validPricing)
    );

    const res = await axios.post(
      "https://backend-3-axez.onrender.com/api/products/add-product",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
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
      });

      setPriceList([
        {
          quantity: "",
          price: "",
        },
      ]);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }
  } catch (err) {
    console.log(err);

    alert(
      err.response?.data?.message ||
        "Product Add Failed"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <>
    {/* Header */}
<div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 rounded-t-3xl p-8 text-white">
  <h1 className="text-3xl md:text-4xl font-bold">
    Add New Product
  </h1>

  <p className="mt-2 text-white/80">
    Upload, manage and publish your products
  </p>
</div>

{/* Card */}
<div className="bg-white rounded-b-3xl shadow-xl p-8">

  {success && (
    <div className="mb-6 bg-green-100 border border-green-500 text-green-700 p-4 rounded-xl">
      Product Added Successfully
    </div>
  )}

  <form
    onSubmit={handleSubmit}
    className="space-y-8"
  >

    {/* Images */}
    <div>

      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold">
          Product Images
        </h2>

        <span className="text-gray-500">
          {images.length}/10
        </span>
      </div>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        className="w-full border rounded-xl p-3"
      />

      {selectedImage && (
        <div className="mt-6">
          <img
            src={selectedImage}
            alt=""
            className="w-full h-[420px] object-cover rounded-2xl border"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-6">

        {images.map((img, index) => (

          <div
            key={index}
            className="relative"
          >

            <img
              src={img}
              alt=""
              onClick={() =>
                setSelectedImage(img)
              }
              className={`w-24 h-24 rounded-xl border-2 object-cover cursor-pointer ${
                selectedImage === img
                  ? "border-blue-600"
                  : "border-gray-300"
              }`}
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

            <label className="absolute bottom-1 right-1 bg-blue-600 text-white text-xs px-2 rounded cursor-pointer">

              Edit

              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) =>
                  replaceImage(
                    index,
                    e.target.files[0]
                  )
                }
              />

            </label>

          </div>

        ))}

      </div>

    </div>

    {/* Product Information */}

    <div className="grid md:grid-cols-2 gap-5">

      <input
        type="text"
        name="name"
        value={product.name}
        onChange={handleChange}
        placeholder="Product Name"
        className="border rounded-xl p-3"
        required
      />

      <input
        type="text"
        name="category"
        value={product.category}
        onChange={handleChange}
        placeholder="Category"
        className="border rounded-xl p-3"
        required
      />

      <input
        type="text"
        name="brand"
        value={product.brand}
        onChange={handleChange}
        placeholder="Brand"
        className="border rounded-xl p-3"
      />

      <input
        type="text"
        name="material"
        value={product.material}
        onChange={handleChange}
        placeholder="Material"
        className="border rounded-xl p-3"
      />

      <input
        type="number"
        name="stock"
        value={product.stock}
        onChange={handleChange}
        placeholder="Stock"
        className="border rounded-xl p-3"
      />

    </div>

    {/* Quantity Wise Pricing */}

    <div>

      <div className="flex justify-between items-center mb-5">

        <h2 className="text-xl font-bold">
          Quantity Wise Pricing
        </h2>

        <button
          type="button"
          onClick={addPriceRow}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Row
        </button>

      </div>

      <div className="space-y-3">

        {priceList.map((item, index) => (

          <div
            key={index}
            className="grid grid-cols-12 gap-3"
          >

            <input
              type="number"
              placeholder="Quantity"

              value={item.quantity}

              onChange={(e)=>
                handlePriceChange(
                  index,
                  "quantity",
                  e.target.value
                )
              }

              className="col-span-5 border rounded-xl p-3"
            />

            <input
              type="number"
              placeholder="Price"

              value={item.price}

              onChange={(e)=>
                handlePriceChange(
                  index,
                  "price",
                  e.target.value
                )
              }

              className="col-span-5 border rounded-xl p-3"
            />

            <button
              type="button"
              onClick={()=>
                removePriceRow(index)
              }
              className="col-span-2 bg-red-500 text-white rounded-xl"
            >
              Delete
            </button>

          </div>

        ))}

      </div>

    </div>

    {/* Description */}

    <textarea

      rows={6}

      name="description"

      value={product.description}

      onChange={handleChange}

      placeholder="Product Description"

      className="w-full border rounded-xl p-4"

    />

    <button

      type="submit"

      disabled={loading}

      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl text-lg font-semibold"

    >
      {loading
        ? "Uploading..."
        : "Add Product"}
    </button>

  </form>

</div>
</>
  );
};

export default AddProduct;
