import React, { useState } from "react";
import API from "../api/axios";
import { ViewState } from "../App";

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
      // Sends both snake_case and camelCase parameters simultaneously 
      // to cleanly satisfy the validator schema check and the service tier.
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
    <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
        <p className="text-gray-500 mt-2 text-sm">Join our secure authentication system pipeline</p>
      </div>

      {success ? (
        <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl text-center text-sm font-medium">
          🎉 Account created successfully! Redirecting you to login panel...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">First Name</label>
              <input type="text" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500 text-gray-900" value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Last Name</label>
              <input type="text" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500 text-gray-900" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Username</label>
            <input type="text" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500 text-gray-900" value={username} onChange={e => setUsername(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Email Address</label>
            <input type="email" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500 text-gray-900" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Password</label>
            <input type="password" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500 text-gray-900" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium">⚠️ {error}</div>}

          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer">
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>
      )}

      <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs font-medium">
        <button onClick={() => setView("login")} className="text-blue-600 hover:underline">Already have an account? Sign In</button>
      </div>
    </div>
  );
}