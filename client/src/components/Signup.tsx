import { useState } from "react";
import API from "../api/axios";
import type { ViewState } from "../App";

interface SignupProps {
  setView: (v: ViewState) => void;
  onSignupSuccess: (email: string) => void;
}

export default function Signup({ setView, onSignupSuccess }: SignupProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await API.post("/auth/signup", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
        password: password
      });
      setSuccess(true);
      setTimeout(() => onSignupSuccess(email.trim()), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 glass-panel glass-card-glow rounded-3xl animate-slideup transition duration-300 hover-scale">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl border border-amber-200/60 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: '#3C1A06' }}>Create Account</h2>
        <p className="mt-2 text-sm" style={{ color: '#A0845C' }}>Register to join the secure authentication network</p>
      </div>

      {success ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200/60 text-emerald-700 rounded-2xl text-center text-sm font-medium animate-pulse-warm flex items-center justify-center gap-2">
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Account created! Forwarding to verification...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#92400E' }}>First Name</label>
              <input type="text" required placeholder="John"
                className="w-full px-4 py-2.5 glass-input rounded-xl text-sm" 
                value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#92400E' }}>Last Name</label>
              <input type="text" required placeholder="Doe"
                className="w-full px-4 py-2.5 glass-input rounded-xl text-sm" 
                value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#92400E' }}>Username</label>
            <input type="text" required placeholder="johndoe123"
              className="w-full px-4 py-2.5 glass-input rounded-xl text-sm" 
              value={username} onChange={e => setUsername(e.target.value)} />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#92400E' }}>Email Address</label>
            <input type="email" required placeholder="name@company.com"
              className="w-full px-4 py-2.5 glass-input rounded-xl text-sm" 
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#92400E' }}>Password</label>
            <input type="password" required placeholder="Min. 8 characters"
              className="w-full px-4 py-2.5 glass-input rounded-xl text-sm" 
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200/60 text-red-700 rounded-xl text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} 
            className="w-full py-3 btn-warm rounded-xl text-sm flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing Up...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>
      )}

      <div className="mt-6 pt-4 border-t border-amber-200/40 text-center text-xs font-semibold">
        <button onClick={() => setView("login")} className="text-amber-700 hover:text-amber-900 transition cursor-pointer">Already have an account? Sign In</button>
      </div>
    </div>
  );
}