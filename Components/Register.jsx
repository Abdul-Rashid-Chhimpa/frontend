import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Invalid email");
      return;
    }
    if (!form.password) {
      toast.error("Password is required");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
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
        error.response?.data?.message || "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      placeholder: "Enter your full name",
      icon: <User size={18} className="text-gray-400" />,
    },
    {
      name: "mobile",
      label: "Mobile Number",
      type: "tel",
      placeholder: "Enter mobile number",
      maxLength: 10,
      icon: <Phone size={18} className="text-gray-400" />,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter email",
      icon: <Mail size={18} className="text-gray-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header strip */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-6 py-7 sm:py-8 text-center text-white">
            <div className="flex justify-center mb-3">
              <img
                src="/pedwallogo.png"
                alt="Pedwal Logo"
                className="h-12 sm:h-14 object-contain mixblend-multiply rounded-xl shadow-lg "
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Create Account
            </h1>
            <p className="text-white/80 mt-1.5 text-sm">
              Register to continue shopping
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-4 sm:space-y-5">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {field.label}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
                    {field.icon}
                  </span>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    className="w-full h-12 border border-gray-200 rounded-xl pl-11 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                  />
                </div>
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <Lock size={18} className="text-gray-400" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full h-12 border border-gray-200 rounded-xl pl-11 pr-12 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <Lock size={18} className="text-gray-400" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full h-12 border border-gray-200 rounded-xl pl-11 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold shadow-lg transition flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-600 pt-1">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-indigo-600 font-semibold hover:underline"
              >
                Login
              </Link>
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          Secure registration · Pedwal Life Creation
        </p>
      </div>
    </div>
  );
};

export default Register;
