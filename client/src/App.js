import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import VerifyOtp from "./components/VerifyOtp";
import Dashboard from "./components/Dashboard";
import API from "./api/axios";
export default function App() {
    const [view, setView] = useState("login");
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
    const handleSignupSuccess = (email) => {
        setRegisteredEmail(email);
        setView("verify-otp");
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center", children: _jsx("div", { className: "w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-linear-to-br from-slate-50 via-slate-100 to-blue-50/30 flex flex-col items-center justify-center p-6", children: [_jsxs("header", { className: "mb-8 text-center", children: [_jsx("h1", { className: "text-4xl font-black text-gray-900 tracking-tight", children: "AuthSystem v1.0" }), _jsx("p", { className: "text-sm text-gray-500 mt-1 font-mono", children: "PostgreSQL + HTTP-Only Cookie Gateway" })] }), view === "login" && (_jsx(Login, { setView: setView, onLoginSuccess: () => setView("dashboard") })), view === "signup" && (_jsx(Signup, { setView: setView, onSignupSuccess: handleSignupSuccess })), view === "verify-otp" && (_jsx(VerifyOtp, { setView: setView, email: registeredEmail })), view === "forgot" && (_jsx(ForgotPassword, { setView: setView })), view === "forgot-password" && (_jsx(ForgotPassword, { setView: setView })), view === "dashboard" && (_jsx(Dashboard, { onLogout: () => setView("login") }))] }));
}
