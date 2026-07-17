import { useState, useEffect } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import VerifyOtp from "./components/VerifyOtp";
import Dashboard from "./components/Dashboard";
import API from "./api/axios";

// Added "verify-otp" and "forgot-password" view states
export type ViewState = "login" | "signup" | "forgot" | "forgot-password" | "verify-otp" | "dashboard";

export default function App() {
  const [view, setView] = useState<ViewState>("login");
  const [loading, setLoading] = useState(true);
  // Keeps track of the email during registration so VerifyOtp knows where to send the code
  const [registeredEmail, setRegisteredEmail] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("token")) {
    setView("forgot");
    setLoading(false);
    return;
  }
    // Check if user has an active session cookie on boot
    API.get("/user/profile")
      .then(() => setView("dashboard"))
      .catch(() => setView("login"))
      .finally(() => setLoading(false));
  }, []);

  // Helper function to handle a successful signup transition
  const handleSignupSuccess = (email: string) => {
    setRegisteredEmail(email);
    setView("verify-otp");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Dashboard takes full page — no wrapper padding/header
  if (view === "dashboard") {
    return <Dashboard onLogout={() => setView("login")} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <header className="mb-8 text-center animate-fadein">
        <h1 className="text-4xl font-black tracking-tight" style={{ color: '#3C1A06' }}>ShieldGate</h1>
        <p className="text-sm mt-1 font-mono" style={{ color: '#A0845C' }}>Secure Authentication Gateway</p>
      </header>

      {view === "login" && (
        <Login setView={setView} onLoginSuccess={() => setView("dashboard")} />
      )}

      {view === "signup" && (
        <Signup setView={setView} onSignupSuccess={handleSignupSuccess} />
      )}

      {view === "verify-otp" && (
        <VerifyOtp setView={setView} email={registeredEmail} />
      )}

      {view === "forgot" && (
        <ForgotPassword setView={setView} />
      )}

      {view === "forgot-password" && (
        <ForgotPassword setView={setView} />
      )}
    </div>
  );
}