import React, { useState } from "react";
import API from "../api/axios";

export default function Signup({ setView }: { setView: (v: string) => void }) {
  const [formData, setFormData] = useState({ firstName: "", lastName: "", username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); setError("");
    try {
      const res = await API.post("/auth/signup", formData);
      setMessage(res.data.message + " Please check your email console.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="First Name" required className="border p-2 rounded" onChange={e => setFormData({...formData, firstName: e.target.value})} />
          <input type="text" placeholder="Last Name" required className="border p-2 rounded" onChange={e => setFormData({...formData, lastName: e.target.value})} />
        </div>
        <input type="text" placeholder="Username" required className="w-full border p-2 rounded" onChange={e => setFormData({...formData, username: e.target.value})} />
        <input type="email" placeholder="Email" required className="w-full border p-2 rounded" onChange={e => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder="Password" required className="w-full border p-2 rounded" onChange={e => setFormData({...formData, password: e.target.value})} />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Sign Up</button>
      </form>
      {message && <p className="mt-3 text-green-600 text-sm">{message}</p>}
      {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
      <p className="mt-4 text-sm text-gray-600">Already registered? <button onClick={() => setView("login")} className="text-blue-600 underline">Login</button></p>
    </div>
  );
}