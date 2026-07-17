import { useState, useEffect } from "react";
import API from "../api/axios";
import type { ViewState } from "../App";

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
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    if (tokenParam) { setToken(tokenParam); setIsResetStep(true); }
  }, []);

  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      await API.post("/auth/forgot-password", { email: email.trim() });
      setSuccess("If that email is registered, a secure recovery link has been sent to your inbox.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit recovery request.");
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await API.post("/auth/reset-password", { token, password: newPassword });
      setSuccess("Password updated successfully! Redirecting to login...");
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => setView("login"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password. Link may be expired.");
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-md p-8 glass-panel glass-card-glow rounded-3xl animate-slideup transition duration-300 hover-scale">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl border border-amber-200/60 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3.38" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: '#3C1A06' }}>
          {isResetStep ? "Reset Password" : "Recover Account"}
        </h2>
        <p className="mt-2 text-sm" style={{ color: '#A0845C' }}>
          {isResetStep ? "Set a new secure password for your account" : "Request a secure recovery link to your email"}
        </p>
      </div>

      {success && (
        <div className="p-4 mb-4 bg-emerald-50 border border-emerald-200/60 text-emerald-700 rounded-2xl text-center text-sm font-medium animate-pulse-warm flex items-center justify-center gap-2">
          <svg className="w-5 h-5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200/60 text-red-700 rounded-xl text-xs font-medium flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {!success && !isResetStep && (
        <form onSubmit={handleRequestLink} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#92400E' }}>Email Address</label>
            <input type="email" required placeholder="name@company.com"
              className="w-full px-4 py-3 glass-input rounded-xl text-sm"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 btn-warm rounded-xl text-sm flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending link...</span>
              </>
            ) : <span>Send Recovery Link</span>}
          </button>
        </form>
      )}

      {!success && isResetStep && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#92400E' }}>New Password</label>
            <input type="password" required placeholder="Min. 8 characters"
              className="w-full px-4 py-3 glass-input rounded-xl text-sm"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#92400E' }}>Confirm Password</label>
            <input type="password" required placeholder="Confirm new password"
              className="w-full px-4 py-3 glass-input rounded-xl text-sm"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 btn-warm rounded-xl text-sm flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Updating Password...</span>
              </>
            ) : <span>Update Password</span>}
          </button>
        </form>
      )}

      <div className="mt-6 pt-4 border-t border-amber-200/40 text-center text-xs font-semibold">
        <button onClick={() => setView("login")} className="text-amber-600/60 hover:text-amber-800 transition cursor-pointer">Back to Sign In</button>
      </div>
    </div>
  );
}