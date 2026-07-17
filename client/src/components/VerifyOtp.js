import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import API from "../api/axios";
export default function VerifyOtp({ setView, email }) {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);
    useEffect(() => {
        // Focus the first input box on load
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);
    const handleChange = (element, index) => {
        const value = element.value;
        if (isNaN(Number(value)))
            return; // Allow numbers only
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1); // Get the last typed char
        setOtp(newOtp);
        // Focus next input automatically
        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
    };
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
                // Focus previous input on backspace if empty
                inputRefs.current[index - 1]?.focus();
            }
        }
    };
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();
        if (pastedData.length === 6 && !isNaN(Number(pastedData))) {
            const newOtp = pastedData.split("");
            setOtp(newOtp);
            inputRefs.current[5]?.focus();
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const code = otp.join("");
        if (code.length < 6) {
            setError("Please enter the complete 6-digit code.");
            setLoading(false);
            return;
        }
        try {
            await API.post("/auth/verify-otp", {
                email,
                otp: code,
            });
            setSuccess(true);
            setTimeout(() => setView("login"), 2500);
        }
        catch (err) {
            setError(err.response?.data?.message || "Invalid or expired OTP code.");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "w-full max-w-md p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("h2", { className: "text-3xl font-extrabold text-gray-900 tracking-tight", children: "Verify Email" }), _jsxs("p", { className: "text-gray-500 mt-2 text-sm", children: ["We sent a 6-digit verification code to ", _jsx("br", {}), _jsx("span", { className: "font-semibold text-gray-700", children: email || "your email" })] })] }), success ? (_jsx("div", { className: "p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl text-center text-sm font-medium", children: "\uD83C\uDF89 Email verified successfully! Redirecting to login..." })) : (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsx("div", { className: "flex justify-between gap-2 px-2", onPaste: handlePaste, children: otp.map((digit, index) => (_jsx("input", { type: "text", maxLength: 1, value: digit, ref: (el) => { inputRefs.current[index] = el; }, onChange: (e) => handleChange(e.target, index), onKeyDown: (e) => handleKeyDown(e, index), className: "w-12 h-12 text-center text-xl font-bold bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" }, index))) }), error && _jsxs("div", { className: "p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium text-center", children: ["\u26A0\uFE0F ", error] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer", children: loading ? "Verifying..." : "Verify Code" })] })), _jsx("div", { className: "mt-6 pt-4 border-t border-gray-100 text-center text-xs font-medium", children: _jsx("button", { onClick: () => setView("login"), className: "text-blue-600 hover:underline", children: "Back to Sign In" }) })] }));
}
