import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";





const Register = () => {
const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


const [showPassword, setShowPassword] = useState(false);
const [form, setForm] = useState({
  name: "",
  mobile: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const handleChange = (e) => {
  const { name, value } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation
  if (!form.name.trim()) {
    toast.error("Name is required");
    return;
  }

  if (!form.mobile.trim()) {
    toast.error("Mobile number is required");
    return;
  }

  if (!/^[6-9]\d{9}$/.test(form.mobile)) {
    toast.error("Enter valid mobile number");
    return;
  }

  if (!form.email.trim()) {
    toast.error("Email is required");
    return;
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(form.email)) {
    toast.error("Invalid email");
    return;
  }

  if (!form.password) {
    toast.error("Password is required");
    return;
  }

  if (form.password.length < 6) {
    toast.error(
      "Password must be at least 6 characters"
    );
    return;
  }

  if (form.password !== form.confirmPassword) {
  toast.error("Passwords do not match");
  return;
}

  try {
    setLoading(true);

    const { data } = await axios.post(
      "https://backend-3-axez.onrender.com/api/auth/register",
      {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      }
    );

    if (data.success) {
      toast.success(data.message);

      setForm({
        name: "",
        mobile: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.log(error);

    toast.error(
      error.response?.data?.message ||
        "Registration Failed"
    );
  } finally {
    setLoading(false);
  }
};

  return (
   <>
   <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center px-4 py-10">

  <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10">

    {/* Logo */}

    <div className="flex justify-center mb-6">
      <img
        src="/pedwallogo.png"
        alt="Pedwal Logo"
        className="h-16 sm:h-20 object-contain"
      />
    </div>

    {/* Heading */}

    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-800">
        Create Account
      </h1>

      <p className="text-gray-500 mt-2 text-sm">
        Register to continue shopping
      </p>
    </div>

    {/* ===== Form Starts Here ===== */}

    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Name */}

      <div>
        <label className="block text-sm font-medium mb-2">
          Full Name
        </label>

        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          className="w-full h-12 border rounded-xl px-4 focus:ring-2 focus:ring-blue-300 focus:border-blue-600 outline-none"
        />
      </div>

      {/* Mobile */}

      <div>
        <label className="block text-sm font-medium mb-2">
          Mobile Number
        </label>

        <input
          type="tel"
          name="mobile"
          value={form.mobile}
          onChange={handleChange}
          placeholder="Enter mobile number"
          maxLength={10}
          className="w-full h-12 border rounded-xl px-4 focus:ring-2 focus:ring-blue-300 focus:border-blue-600 outline-none"
        />
      </div>

      {/* Email */}

      <div>
        <label className="block text-sm font-medium mb-2">
          Email
        </label>

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter email"
          className="w-full h-12 border rounded-xl px-4 focus:ring-2 focus:ring-blue-300 focus:border-blue-600 outline-none"
        />
      </div>

      {/* Password */}

      <div className="relative">
        <label className="block text-sm font-medium mb-2">
          Password
        </label>

        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter password"
          className="w-full h-12 border rounded-xl px-4 pr-12 focus:ring-2 focus:ring-blue-300 focus:border-blue-600 outline-none"
        />

        <button
          type="button"
          onClick={() =>
            setShowPassword(!showPassword)
          }
          className="absolute right-4 top-11"
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>

      {/* Confirm Password */}

      <div>
        <label className="block text-sm font-medium mb-2">
          Confirm Password
        </label>

        <input
          type={showPassword ? "text" : "password"}
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm password"
          className="w-full h-12 border rounded-xl px-4 focus:ring-2 focus:ring-blue-300 focus:border-blue-600 outline-none"
        />
      </div>

      {/* Button */}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg transition-all"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          className="text-blue-600 font-semibold cursor-pointer hover:underline"
        >
          Login
        </span>
      </p>

    </form>

  </div>

</div>
   </>
  );
};

export default Register;
