import { useState } from "react";
import API from "../api/axios";

interface LoginProps {
  setView: (v: "login" | "signup" | "forgot" | "dashboard") => void;
  onLoginSuccess: () => void;
}

export default function Login({ setView, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await API.post("/auth/login", { 
        email: email.trim(), 
        password 
      });
      onLoginSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 glass-panel glass-card-glow rounded-3xl animate-slideup transition duration-300 hover-scale">
      <div className="text-center mb-8">
        {/* Warm amber icon */}
        <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl border border-amber-200/60 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: '#3C1A06' }}>Welcome Back</h2>
        <p className="mt-2 text-sm" style={{ color: '#A0845C' }}>Sign in to access your secure dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#92400E' }}>Email Address</label>
          <input 
            type="email" 
            required 
            placeholder="name@company.com"
            className="w-full px-4 py-3 glass-input rounded-xl text-sm" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#92400E' }}>Password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            required 
            className="w-full px-4 py-3 glass-input rounded-xl text-sm" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200/60 text-red-700 rounded-xl text-xs font-medium flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full py-3 btn-warm rounded-xl text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Authenticating...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-amber-200/40 flex justify-between text-xs font-semibold">
        <button onClick={() => setView("forgot")} className="text-amber-700 hover:text-amber-900 transition cursor-pointer">Forgot Password?</button>
        <button onClick={() => setView("signup")} className="text-amber-600/60 hover:text-amber-800 transition cursor-pointer">Create Account</button>
      </div>
    </div>
  );
}