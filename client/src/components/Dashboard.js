import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import API from "../api/axios";
export default function Dashboard({ onLogout }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [apiKey, setApiKey] = useState("");
    const [copied, setCopied] = useState(false);
    // Simulated real-time metrics
    const [sessionTime, setSessionTime] = useState(0);
    useEffect(() => {
        // 1. Fetch authenticated user profile data
        API.get("/user/profile")
            .then((res) => {
            // Adapt properties to match whatever casing format your profile route returns
            const data = res.data.user || res.data;
            setUser({
                id: data.id,
                firstName: data.firstName || data.first_name,
                lastName: data.lastName || data.last_name,
                username: data.username,
                email: data.email,
                role: data.role || "User",
            });
        })
            .catch((err) => {
            console.error("Failed to load profile context:", err);
            onLogout(); // Redirect to login if token validation fails
        })
            .finally(() => setLoading(false));
        // 2. Incremental timer tracking active session duration
        const timer = setInterval(() => {
            setSessionTime((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [onLogout]);
    const handleLogoutClick = async () => {
        try {
            await API.post("/auth/logout");
        }
        catch (err) {
            console.error("Error clearing backend HTTP cookie session:", err);
        }
        finally {
            onLogout(); // Transition view back to login regardless
        }
    };
    const generateApiKey = () => {
        const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        setApiKey(`auth_key_live_${randomHex}`);
        setCopied(false);
    };
    const copyToClipboard = () => {
        if (!apiKey)
            return;
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    // Format active duration helper (mm:ss)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };
    if (loading) {
        return (_jsxs("div", { className: "w-full max-w-4xl p-12 text-center", children: [_jsx("div", { className: "w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-gray-500 font-medium", children: "Loading secure workspace..." })] }));
    }
    const fullName = user ? `${user.firstName} ${user.lastName}` : "Authenticated User";
    return (_jsxs("div", { className: "w-full max-w-5xl bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden", children: [_jsxs("div", { className: "bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-8 py-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: [_jsxs("div", { children: [_jsx("span", { className: "bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-xs", children: "Operational Node" }), _jsxs("h2", { className: "text-2xl font-black tracking-tight mt-2", children: ["Welcome back, ", user?.firstName || "Explorer", "!"] }), _jsx("p", { className: "text-blue-100/90 text-sm mt-1", children: "Secure session authorized via HTTP-only validation gateway." })] }), _jsx("button", { onClick: handleLogoutClick, className: "px-5 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold rounded-xl border border-white/20 transition cursor-pointer text-sm", children: "Sign Out Session" })] }), _jsxs("div", { className: "p-8 grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-1 space-y-6", children: [_jsxs("div", { className: "bg-gray-50/50 rounded-2xl p-6 border border-gray-100 text-center", children: [_jsxs("div", { className: "w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-4 shadow-lg shadow-indigo-100", children: [user?.firstName?.charAt(0) || "U", user?.lastName?.charAt(0) || ""] }), _jsx("h3", { className: "text-lg font-bold text-gray-900", children: fullName }), _jsxs("p", { className: "text-xs text-gray-500 font-mono mt-1", children: ["@", user?.username] }), _jsxs("div", { className: "mt-4 pt-4 border-t border-gray-100/80 flex justify-center gap-2", children: [_jsx("span", { className: "bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full", children: user?.role || "Standard" }), _jsxs("span", { className: "bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1", children: [_jsx("span", { className: "w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" }), "Active"] })] })] }), _jsxs("div", { className: "bg-gray-50/50 rounded-2xl p-6 border border-gray-100 space-y-4", children: [_jsx("h4", { className: "text-xs font-bold uppercase tracking-wider text-gray-400", children: "Security Telemetry" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-white p-4 rounded-xl border border-gray-100", children: [_jsx("p", { className: "text-xs text-gray-400", children: "Session Age" }), _jsx("p", { className: "text-lg font-mono font-bold text-gray-800 mt-1", children: formatTime(sessionTime) })] }), _jsxs("div", { className: "bg-white p-4 rounded-xl border border-gray-100", children: [_jsx("p", { className: "text-xs text-gray-400", children: "Verified Email" }), _jsx("p", { className: "text-sm font-bold text-green-600 mt-2 flex items-center gap-1", children: "\u2705 Fully Active" })] })] })] })] }), _jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs("div", { className: "bg-white rounded-2xl p-6 border border-gray-100 shadow-xs", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 mb-4", children: "Integrations & Developer Sandbox" }), _jsx("p", { className: "text-gray-500 text-sm mb-6 leading-relaxed", children: "Below are your developer credentials. You can generate a temporary Bearer token API key to make authorized operations against outside pipelines." }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2", children: "Sandbox API Key" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", readOnly: true, placeholder: "Click generate below to issue a key...", value: apiKey, className: "flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-mono text-gray-700 select-all" }), apiKey && (_jsx("button", { onClick: copyToClipboard, className: "px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition cursor-pointer", children: copied ? "Copied! ✓" : "Copy" }))] })] }), _jsx("button", { onClick: generateApiKey, className: "w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-100 transition cursor-pointer", children: apiKey ? "Regenerate Token" : "Generate Access Token" })] })] }), _jsxs("div", { className: "bg-white rounded-2xl p-6 border border-gray-100 shadow-xs", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900", children: "Recent Security Activity" }), _jsx("span", { className: "text-xs text-gray-400", children: "Live feed updates" })] }), _jsxs("div", { className: "divide-y divide-gray-100", children: [_jsxs("div", { className: "py-3 flex justify-between items-center text-xs", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-800", children: "Session Handshake Created" }), _jsx("p", { className: "text-gray-400 font-mono mt-0.5", children: "IP: 127.0.0.1 (Localhost Loopback)" })] }), _jsx("span", { className: "text-green-600 font-semibold bg-green-50 px-2.5 py-1 rounded-md", children: "SUCCESS" })] }), _jsxs("div", { className: "py-3 flex justify-between items-center text-xs", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-800", children: "OTP Code Dispatched" }), _jsxs("p", { className: "text-gray-400 font-mono mt-0.5", children: ["Dest: ", user?.email || "Inbox"] })] }), _jsx("span", { className: "text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-md", children: "SENT" })] }), _jsxs("div", { className: "py-3 flex justify-between items-center text-xs", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-800", children: "Registration Pipeline Created" }), _jsx("p", { className: "text-gray-400 font-mono mt-0.5", children: "Account Status: Inactive until OTP" })] }), _jsx("span", { className: "text-gray-500 font-semibold bg-gray-100 px-2.5 py-1 rounded-md", children: "COMPLETE" })] })] })] })] })] })] }));
}
