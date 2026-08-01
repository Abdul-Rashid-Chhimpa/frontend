import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ================= PASSWORD VALIDATION CHECKS =================
  const checks = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  // Calculate Strength Score (0 to 5)
  const strengthScore = Object.values(checks).filter(Boolean).length;

  const getStrengthLabel = () => {
    if (password.length === 0) return { label: "", color: "bg-gray-600", text: "" };
    if (strengthScore <= 2) return { label: "Weak 🔴", color: "bg-red-500", text: "text-red-400" };
    if (strengthScore <= 4) return { label: "Medium 🟡", color: "bg-yellow-500", text: "text-yellow-400" };
    return { label: "Strong 🟢", color: "bg-green-500", text: "text-green-400" };
  };

  const strength = getStrengthLabel();

  // ================= SUBMIT HANDLER =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Passwords do not match!");
      return;
    }

    if (strengthScore < 3) {
      toast.error("Please create a stronger password!");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        `https://backend-3-axez.onrender.com/api/auth/reset-password/${token}`,
        { password }
      );

      if (data.success) {
        toast.success(data.message || "Password reset successful!");
        navigate("/login");
      }
    } catch (error) {
      console.error("Reset Password Error:", error);
      // Detailed error message from backend
      toast.error(
        error.response?.data?.message || "Link expired or invalid token. Please request a new link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Set New Password
        </h2>
        <p className="text-indigo-200/70 text-sm text-center mb-6">
          Create a strong password for your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* New Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 pr-12 text-white placeholder-indigo-200/50 outline-none focus:border-indigo-400 transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-200/70 hover:text-white text-sm"
            >
              {showPassword ? "🙈 Hide" : "👁️ Show"}
            </button>
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-indigo-200/50 outline-none focus:border-indigo-400 transition"
              required
            />
          </div>

          {/* Password Strength Meter */}
          {password.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-indigo-200/80">Strength:</span>
                <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${(strengthScore / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Password Criteria Checklist */}
          <div className="bg-black/20 rounded-xl p-3.5 space-y-1.5 text-xs text-indigo-200/80">
            <p className="font-medium text-white mb-1">Password Requirements:</p>
            <div className="grid grid-cols-2 gap-1">
              <span className={checks.length ? "text-green-400 font-medium" : "text-gray-400"}>
                {checks.length ? "✓" : "✕"} At least 6 chars
              </span>
              <span className={checks.uppercase ? "text-green-400 font-medium" : "text-gray-400"}>
                {checks.uppercase ? "✓" : "✕"} Uppercase (A-Z)
              </span>
              <span className={checks.lowercase ? "text-green-400 font-medium" : "text-gray-400"}>
                {checks.lowercase ? "✓" : "✕"} Lowercase (a-z)
              </span>
              <span className={checks.number ? "text-green-400 font-medium" : "text-gray-400"}>
                {checks.number ? "✓" : "✕"} Number (0-9)
              </span>
              <span className={`col-span-2 ${checks.specialChar ? "text-green-400 font-medium" : "text-gray-400"}`}>
                {checks.specialChar ? "✓" : "✕"} Special symbol (!@#$%^&*)
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl shadow-lg transition duration-200 disabled:opacity-50 mt-2"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
