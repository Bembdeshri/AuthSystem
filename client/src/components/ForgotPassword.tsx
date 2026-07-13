import React, { useState } from "react";
import API from "../api/axios";

export default function ForgotPassword({ setView }: { setView: (v: string) => void }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); setError("");
    try {
      const res = await API.post("/auth/forgot-password", { email });
      setMessage(res.data.message + " Check backend console logs for link.");
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Forgot Password</h2>
      <p className="text-sm text-gray-600 mb-4">Enter your email to receive a password reset link.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" placeholder="Email Address" required className="w-full border p-2 rounded" value={email} onChange={e => setEmail(e.target.value)} />
        <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700">Send Reset Link</button>
      </form>
      {message && <p className="mt-3 text-green-600 text-sm">{message}</p>}
      {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
      <button onClick={() => setView("login")} className="mt-4 text-sm text-blue-600 underline block mx-auto">Back to Login</button>
    </div>
  );
}