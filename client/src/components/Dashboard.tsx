import React, { useState, useEffect } from "react";
import API from "../api/axios";

interface DashboardProps {
  onLogout: () => void;
}

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
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
    } catch (err) {
      console.error("Error clearing backend HTTP cookie session:", err);
    } finally {
      onLogout(); // Transition view back to login regardless
    }
  };

  const generateApiKey = () => {
    const randomHex = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    setApiKey(`auth_key_live_${randomHex}`);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format active duration helper (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl p-12 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Loading secure workspace...</p>
      </div>
    );
  }

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Authenticated User";

  return (
    <div className="w-full max-w-5xl bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-8 py-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-xs">
            Operational Node
          </span>
          <h2 className="text-2xl font-black tracking-tight mt-2">
            Welcome back, {user?.firstName || "Explorer"}!
          </h2>
          <p className="text-blue-100/90 text-sm mt-1">
            Secure session authorized via HTTP-only validation gateway.
          </p>
        </div>
        <button
          onClick={handleLogoutClick}
          className="px-5 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold rounded-xl border border-white/20 transition cursor-pointer text-sm"
        >
          Sign Out Session
        </button>
      </div>

      {/* 2. DASHBOARD BODY GRID */}
      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: User Card & Security Metrics */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* User Profile Card */}
          <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-4 shadow-lg shadow-indigo-100">
              {user?.firstName?.charAt(0) || "U"}
              {user?.lastName?.charAt(0) || ""}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{fullName}</h3>
            <p className="text-xs text-gray-500 font-mono mt-1">@{user?.username}</p>
            
            <div className="mt-4 pt-4 border-t border-gray-100/80 flex justify-center gap-2">
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                {user?.role || "Standard"}
              </span>
              <span className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Active
              </span>
            </div>
          </div>

          {/* Session Telemetry Stats */}
          <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Security Telemetry
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400">Session Age</p>
                <p className="text-lg font-mono font-bold text-gray-800 mt-1">
                  {formatTime(sessionTime)}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400">Verified Email</p>
                <p className="text-sm font-bold text-green-600 mt-2 flex items-center gap-1">
                  ✅ Fully Active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Tools & Sandbox */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Integrations & Developer Sandbox</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Below are your developer credentials. You can generate a temporary Bearer token API key to make authorized operations against outside pipelines.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Sandbox API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    placeholder="Click generate below to issue a key..."
                    value={apiKey}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-mono text-gray-700 select-all"
                  />
                  {apiKey && (
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition cursor-pointer"
                    >
                      {copied ? "Copied! ✓" : "Copy"}
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={generateApiKey}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-100 transition cursor-pointer"
              >
                {apiKey ? "Regenerate Token" : "Generate Access Token"}
              </button>
            </div>
          </div>

          {/* Activity / Mock System Log Tracker */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Security Activity</h3>
              <span className="text-xs text-gray-400">Live feed updates</span>
            </div>

            <div className="divide-y divide-gray-100">
              <div className="py-3 flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-gray-800">Session Handshake Created</p>
                  <p className="text-gray-400 font-mono mt-0.5">IP: 127.0.0.1 (Localhost Loopback)</p>
                </div>
                <span className="text-green-600 font-semibold bg-green-50 px-2.5 py-1 rounded-md">
                  SUCCESS
                </span>
              </div>

              <div className="py-3 flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-gray-800">OTP Code Dispatched</p>
                  <p className="text-gray-400 font-mono mt-0.5">Dest: {user?.email || "Inbox"}</p>
                </div>
                <span className="text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-md">
                  SENT
                </span>
              </div>

              <div className="py-3 flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-gray-800">Registration Pipeline Created</p>
                  <p className="text-gray-400 font-mono mt-0.5">Account Status: Inactive until OTP</p>
                </div>
                <span className="text-gray-500 font-semibold bg-gray-100 px-2.5 py-1 rounded-md">
                  COMPLETE
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}