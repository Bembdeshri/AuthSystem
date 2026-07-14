import React, { useState } from "react";
import API from "../api/axios";

interface LoginProps {
  setView: (v: "login" | "signup" | "forgot" | "dashboard") => void;
  onLoginSuccess: () => void;
}

export default function Login({ setView, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("reset@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Cleanly trims any leading or trailing accidental spaces from the input string
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
    <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
        <p className="text-gray-500 mt-2 text-sm">Sign in to manage your secure session pipeline</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Email Address</label>
          <input type="email" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-gray-900 transition" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Password</label>
          <input type="password" placeholder="••••••••" required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-gray-900 transition" value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 active:scale-[0.99] transition disabled:opacity-50 cursor-pointer">
          {loading ? "Authenticating..." : "Sign In"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between text-xs font-medium">
        <button onClick={() => setView("forgot")} className="text-blue-600 hover:text-blue-700 transition hover:underline">Forgot Password?</button>
        <button onClick={() => setView("signup")} className="text-gray-500 hover:text-gray-700 transition hover:underline">Create Account</button>
      </div>
    </div>
  );
}