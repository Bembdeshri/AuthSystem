import React, { useState, useEffect } from "react";
import API from "../api/axios";
import { ViewState } from "../App";

interface ForgotPasswordProps {
  setView: (v: ViewState) => void;
}

export default function ForgotPassword({ setView }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState(""); 
  const [isResetStep, setIsResetStep] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Detect if page was opened via the email link (e.g. http://localhost:5173/?token=xxxx or /forgot?token=xxxx)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      setIsResetStep(true);
    }
  }, []);

  // Handler for Phase 1: Submitting Email for recovery link
  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await API.post("/auth/forgot-password", { email: email.trim() });
      setSuccess("If that email is registered, a secure recovery link has been sent to your inbox.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit recovery request.");
    } finally {
      setLoading(false);
    }
  };

  // Handler for Phase 2: Typing and submitting new passwords
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/reset-password", {
        token,
        password: newPassword,
      });
      setSuccess("Your password has been changed successfully! Redirecting you to login...");
      
      // Clear token parameter cleanly from browser bar
      window.history.replaceState({}, document.title, window.location.pathname);
      
      setTimeout(() => setView("login"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password. Link may be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {isResetStep ? "Reset Password" : "Recover Account"}
        </h2>
        <p className="text-gray-500 mt-2 text-sm">
          {isResetStep
            ? "Configure a secure new password for your account"
            : "Request a secure password recovery handshake link"}
        </p>
      </div>

      {success && (
        <div className="p-4 mb-4 bg-green-50 border border-green-100 text-green-700 rounded-xl text-center text-sm font-medium">
          🎉 {success}
        </div>
      )}

      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium">
          ⚠️ {error}
        </div>
      )}

      {!success && !isResetStep && (
        <form onSubmit={handleRequestLink} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}

      {!success && isResetStep && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">New Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Saving New Password..." : "Update Password"}
          </button>
        </form>
      )}

      <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs font-medium">
        <button onClick={() => setView("login")} className="text-blue-600 hover:underline">
          Back to Login
        </button>
      </div>
    </div>
  );
}