import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
// If you have your signup and forgot components built, import them here:
// import Signup from "./components/Signup";
// import ForgotPassword from "./components/ForgotPassword";
import API from "./api/axios";

// 1. Expand the View Type definition to include all available layout panels
type ViewState = "login" | "signup" | "forgot" | "dashboard";

export default function App() {
  const [view, setView] = useState<ViewState>("login");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Perform a silent authentication check on startup
    API.get("/user/profile")
      .then(() => setView("dashboard"))
      .catch(() => setView("login"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-100 to-blue-50/30 flex flex-col items-center justify-center p-6">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">AuthSystem v1.0</h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">PostgreSQL + HTTP-Only Cookie Gateway</p>
      </header>

      {/* 2. Conditionally switch render states dynamically using your state value */}
      {view === "login" && (
        <Login setView={setView} onLoginSuccess={() => setView("dashboard")} />
      )}

      {view === "dashboard" && (
        <Dashboard onLogout={() => setView("login")} />
      )}

      {view === "signup" && (
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Create Account Panel</h2>
          <p className="text-gray-500 text-sm mb-6">Registration endpoint wrapper goes here.</p>
          <button onClick={() => setView("login")} className="text-blue-600 hover:underline text-sm font-medium">
            ← Back to Login
          </button>
        </div>
        // Replace this placeholder div block with <Signup setView={setView} /> once built!
      )}

      {view === "forgot" && (
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Forgot Password Panel</h2>
          <p className="text-gray-500 text-sm mb-6">Token generator dispatcher wrapper goes here.</p>
          <button onClick={() => setView("login")} className="text-blue-600 hover:underline text-sm font-medium">
            ← Back to Login
          </button>
        </div>
        // Replace this placeholder div block with <ForgotPassword setView={setView} /> once built!
      )}
    </div>
  );
}