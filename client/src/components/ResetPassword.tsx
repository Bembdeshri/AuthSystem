import React, { useState, useEffect } from "react";
import API from "../api/axios";

export default function ResetPassword({ setView }: { setView: (v: string) => void }) {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Automatically extracts ?token=VALUE from web URL string
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    if (tokenParam) setToken(tokenParam);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); setError("");
    try {
      const res = await API.post("/auth/reset-password", { token, newPassword });
      setMessage(res.data.message);
      setTimeout(() => setView("login"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Token invalid or expired");
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Set New Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Token" required className="w-full border p-2 rounded bg-gray-100" value={token} onChange={e => setToken(e.target.value)} />
        <input type="password" placeholder="New Password" required className="w-full border p-2 rounded" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Update Password</button>
      </form>
      {message && <p className="mt-3 text-green-600 text-sm">{message}</p>}
      {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
    </div>
  );
}
