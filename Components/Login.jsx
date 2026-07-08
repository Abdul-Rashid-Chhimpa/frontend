import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      if (user.role === "admin") {
        navigate("/adminsidebar", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }
  }, [navigate]);

  const loginHandler = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        "https://backend-3-axez.onrender.com/api/auth/login",
        {
          email: email.trim(),
          password,
        }
      );

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success(`Welcome ${data.user.name}`);

      if (data.user.role === "admin") {
        navigate("/adminsidebar", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }

    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4">

      <form
        onSubmit={loginHandler}
        className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8"
      >

        <div className="flex justify-center mb-6">
          <img
            src="/pedwallogo.png"
            alt="Logo"
            className="h-16"
          />
        </div>

        <h1 className="text-3xl font-bold text-center">
          Welcome Back
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Login to continue shopping
        </p>

        {/* Email */}

        <label className="font-medium">
          Email
        </label>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full border rounded-lg p-3 mt-2 mb-5 outline-none focus:border-blue-600"
        />

        {/* Password */}

        <label className="font-medium">
          Password
        </label>

        <div className="relative mt-2">

          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Enter Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border rounded-lg p-3 pr-12 outline-none focus:border-blue-600"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            className="absolute right-4 top-3"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>

        </div>

        <div className="flex justify-between mt-5 text-sm">

          <label className="flex gap-2">
            <input type="checkbox" />
            Remember Me
          </label>

          <button
            type="button"
            className="text-blue-600"
          >
            Forgot Password?
          </button>

        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-7 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
        >
          {loading
            ? "Signing In..."
            : "Login"}
        </button>

        <p className="text-center mt-6 text-gray-500">
          Don't have an account?{" "}
          <span
            onClick={() =>
              navigate("/register")
            }
            className="text-blue-600 cursor-pointer font-semibold"
          >
            Register
          </span>
        </p>

      </form>

    </div>
  );
};

export default Login;
