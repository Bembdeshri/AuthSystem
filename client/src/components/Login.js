import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import API from "../api/axios";
export default function Login({ setView, onLoginSuccess }) {
    const [email, setEmail] = useState("name@company.com");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
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
        }
        catch (err) {
            setError(err.response?.data?.message || "Invalid email or password.");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "w-full max-w-md p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h2", { className: "text-3xl font-extrabold text-gray-900 tracking-tight", children: "Welcome Back" }), _jsx("p", { className: "text-gray-500 mt-2 text-sm", children: "Sign in to manage your secure session pipeline" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2", children: "Email Address" }), _jsx("input", { type: "email", required: true, className: "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-gray-900 transition", value: email, onChange: e => setEmail(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2", children: "Password" }), _jsx("input", { type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, className: "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-gray-900 transition", value: password, onChange: e => setPassword(e.target.value) })] }), error && (_jsxs("div", { className: "p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-pulse", children: ["\u26A0\uFE0F ", error] })), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 active:scale-[0.99] transition disabled:opacity-50 cursor-pointer", children: loading ? "Authenticating..." : "Sign In" })] }), _jsxs("div", { className: "mt-8 pt-6 border-t border-gray-100 flex justify-between text-xs font-medium", children: [_jsx("button", { onClick: () => setView("forgot"), className: "text-blue-600 hover:text-blue-700 transition hover:underline", children: "Forgot Password?" }), _jsx("button", { onClick: () => setView("signup"), className: "text-gray-500 hover:text-gray-700 transition hover:underline", children: "Create Account" })] })] }));
}
