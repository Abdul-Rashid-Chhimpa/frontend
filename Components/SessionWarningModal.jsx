import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SessionWarningModal = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute warning countdown
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = setInterval(() => {
      const expiryStr = localStorage.getItem("tokenExpiry");
      if (!expiryStr) return;

      const expiry = Number(expiryStr);
      const currentTime = Date.now();
      const timeLeftMs = expiry - currentTime;
      const timeLeftSec = Math.floor(timeLeftMs / 1000);

      // Jab 1 hour hone mein sirf 60 seconds (1 minute) bachenge
      if (timeLeftSec <= 60 && timeLeftSec > 0) {
        setShowWarning(true);
        setTimeLeft(timeLeftSec);
      } 
      // Jab time poora khatam ho jayega
      else if (timeLeftSec <= 0) {
        handleForceLogout();
      }
    }, 1000);

    return () => clearInterval(checkSession);
  }, []);

  const handleForceLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenExpiry");
    localStorage.removeItem("userId");
    navigate("/login", { replace: true });
    window.location.reload();
  };

  const handleSkip = () => {
    // Skip karne par modal band ho jayega, lekin agle check par fir se trigger hoga agar time bacha hai
    setShowWarning(false);
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 text-center text-slate-100">
        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-400 text-xl font-bold">
          ⚠️
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Session Expiring Soon</h3>
        <p className="text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
          Your session will expire in <span className="text-red-400 font-bold">{timeLeft} seconds</span> due to inactivity. Would you like to stay or log in again?
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium py-2.5 rounded-xl transition-all border border-slate-700"
          >
            Skip
          </button>
          <button
            onClick={handleForceLogout}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
          >
            Login Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionWarningModal;
