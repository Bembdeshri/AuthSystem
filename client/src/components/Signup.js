import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import API from "../api/axios";
export default function Signup({ setView, onSignupSuccess }) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
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
        }
        catch (err) {
            setError(err.response?.data?.message || "Failed to create account.");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "w-full max-w-md p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("h2", { className: "text-3xl font-extrabold text-gray-900 tracking-tight", children: "Create Account" }), _jsx("p", { className: "text-gray-500 mt-2 text-sm", children: "Join our secure authentication system pipeline" })] }), success ? (_jsx("div", { className: "p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl text-center text-sm font-medium", children: "\uD83C\uDF89 Account created successfully! Redirecting you to login panel..." })) : (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1", children: "First Name" }), _jsx("input", { type: "text", required: true, className: "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500 text-gray-900", value: firstName, onChange: e => setFirstName(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1", children: "Last Name" }), _jsx("input", { type: "text", required: true, className: "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500 text-gray-900", value: lastName, onChange: e => setLastName(e.target.value) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1", children: "Username" }), _jsx("input", { type: "text", required: true, className: "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500 text-gray-900", value: username, onChange: e => setUsername(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1", children: "Email Address" }), _jsx("input", { type: "email", required: true, className: "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500 text-gray-900", value: email, onChange: e => setEmail(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1", children: "Password" }), _jsx("input", { type: "password", required: true, className: "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500 text-gray-900", value: password, onChange: e => setPassword(e.target.value) })] }), error && _jsxs("div", { className: "p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium", children: ["\u26A0\uFE0F ", error] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer", children: loading ? "Registering..." : "Sign Up" })] })), _jsx("div", { className: "mt-6 pt-4 border-t border-gray-100 text-center text-xs font-medium", children: _jsx("button", { onClick: () => setView("login"), className: "text-blue-600 hover:underline", children: "Already have an account? Sign In" }) })] }));
}
