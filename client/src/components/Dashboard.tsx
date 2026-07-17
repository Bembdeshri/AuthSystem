import { useState, useEffect } from "react";
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

interface ActiveSession {
  session_id: string;
  expires_at: string;
  created_at: string;
}

interface LoginAttempt {
  id: string;
  login_status: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  login_time: string;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [history, setHistory] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);

  const fetchData = async () => {
    try {
      const profileRes = await API.get("/user/profile");
      const data = profileRes.data.user || profileRes.data;
      setUser({
        id: data.id,
        firstName: data.firstName || data.first_name,
        lastName: data.lastName || data.last_name,
        username: data.username,
        email: data.email,
        role: data.role || "User",
      });
      const sessionsRes = await API.get("/user/active-sessions");
      setSessions(sessionsRes.data.sessions || []);
      const historyRes = await API.get("/user/login-history");
      setHistory(historyRes.data.history || []);
    } catch (err) {
      console.error("Dashboard data load failure:", err);
      onLogout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setSessionTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogoutClick = async () => {
    try { await API.post("/auth/logout"); } catch (err) { console.error("Logout error:", err); }
    finally { onLogout(); }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await API.delete(`/user/sessions/${sessionId}`);
      const sessionsRes = await API.get("/user/active-sessions");
      setSessions(sessionsRes.data.sessions || []);
    } catch (err) { console.error("Revoke session failure:", err); }
  };

  const generateApiKey = () => {
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    setApiKey(`auth_key_live_${randomHex}`);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + 
           " " + new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-medium tracking-wide" style={{ color: '#A0845C' }}>Loading your dashboard...</p>
      </div>
    );
  }

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Secure User";

  return (
    <div className="w-full min-h-screen flex flex-col animate-slideup">
      
      {/* FULL-WIDTH TOP HEADER */}
      <header className="w-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 px-8 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg shadow-amber-500/10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse-warm shadow-sm shadow-emerald-400/50"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                Online
              </span>
              <span className="text-amber-100/70 text-xs font-mono">ID: {user?.id}</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mt-1">
              Welcome, {user?.firstName}!
            </h2>
          </div>
        </div>
        <button
          onClick={handleLogoutClick}
          className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white font-medium rounded-xl border border-white/20 transition cursor-pointer text-xs flex items-center gap-2 backdrop-blur-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </header>

      {/* MAIN DASHBOARD BODY */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT SIDEBAR (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* USER PROFILE CARD */}
          <div className="glass-panel glass-card-glow rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-extrabold shadow-lg shadow-amber-400/20">
                {user?.firstName?.charAt(0) || "U"}{user?.lastName?.charAt(0) || ""}
              </div>
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white shadow-sm"></span>
            </div>
            
            <h3 className="text-lg font-bold mt-4" style={{ color: '#3C1A06' }}>{fullName}</h3>
            <p className="text-xs font-mono mt-0.5 text-amber-700">@{user?.username}</p>
            <p className="text-xs mt-2" style={{ color: '#A0845C' }}>{user?.email}</p>

            <div className="mt-4 pt-4 border-t border-amber-200/40 w-full flex justify-center gap-2">
              <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full border border-amber-200/60">
                {user?.role}
              </span>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Verified
              </span>
            </div>
          </div>

          {/* TELEMETRY */}
          <div className="glass-panel glass-card-glow rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#92400E' }}>
              Session Telemetry
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/40">
                <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: '#A0845C' }}>Active Time</p>
                <p className="text-lg font-mono font-bold mt-1" style={{ color: '#3C1A06' }}>{formatTime(sessionTime)}</p>
              </div>
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/40">
                <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: '#A0845C' }}>Cookies</p>
                <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> HttpOnly
                </p>
              </div>
            </div>
          </div>

          {/* DEV TOKEN GENERATOR */}
          <div className="glass-panel glass-card-glow rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#92400E' }}>
              Developer Token
            </h4>
            <p className="text-xs leading-relaxed" style={{ color: '#A0845C' }}>
              Generate a temporary Bearer token for external scripts.
            </p>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text" readOnly placeholder="Generate token..."
                  value={apiKey}
                  className="flex-1 px-3 py-2 glass-input rounded-xl text-xs font-mono"
                />
                {apiKey && (
                  <button onClick={copyToClipboard}
                    className="px-3 py-2 btn-warm rounded-xl text-xs">
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
              <button onClick={generateApiKey}
                className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 font-bold rounded-xl text-xs transition cursor-pointer"
                style={{ color: '#92400E' }}>
                {apiKey ? "Regenerate Token" : "Generate Token"}
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT AREA (8 cols) */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* ACTIVE SESSIONS */}
          <div className="glass-panel glass-card-glow rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#3C1A06' }}>Active Sessions</h3>
              <span className="bg-amber-50 border border-amber-200/60 text-amber-700 text-xs px-2.5 py-0.5 rounded-full font-mono">
                {sessions.length} active
              </span>
            </div>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {sessions.map((sess, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-amber-50/40 border border-amber-200/30 rounded-xl text-xs hover:border-amber-300/50 transition">
                  <div className="space-y-1">
                    <p className="font-mono font-semibold truncate max-w-[340px]" style={{ color: '#3C1A06' }}>
                      {sess.session_id}
                    </p>
                    <p className="text-[10px]" style={{ color: '#A0845C' }}>
                      Created: {formatDate(sess.created_at)}
                    </p>
                  </div>
                  <button onClick={() => handleRevokeSession(sess.session_id)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200/50 text-red-600 font-semibold rounded-lg text-[10px] tracking-wide transition cursor-pointer">
                    Revoke
                  </button>
                </div>
              ))}
              {sessions.length === 0 && (
                <p className="text-xs py-4 text-center" style={{ color: '#A0845C' }}>No active sessions found.</p>
              )}
            </div>
          </div>

          {/* LOGIN HISTORY */}
          <div className="glass-panel glass-card-glow rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#3C1A06' }}>Security History</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: '#A0845C' }}>Last 10 events</span>
            </div>

            <div className="divide-y divide-amber-200/30 max-h-[320px] overflow-y-auto pr-1">
              {history.map((hist, idx) => (
                <div key={idx} className="py-3.5 flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold" style={{ color: '#3C1A06' }}>
                        {hist.login_status === "SUCCESS" ? "Session Created" : "Auth Failure"}
                      </p>
                      <span className={`w-1.5 h-1.5 rounded-full ${hist.login_status === "SUCCESS" ? "bg-emerald-500" : "bg-red-500"}`}></span>
                    </div>
                    <p className="text-[10px] font-mono mt-1" style={{ color: '#A0845C' }}>
                      IP: {hist.ip_address} &bull; {hist.user_agent?.split(" ")[0] || "Unknown"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                      hist.login_status === "SUCCESS" 
                        ? "text-emerald-700 bg-emerald-50 border border-emerald-200/50" 
                        : "text-red-700 bg-red-50 border border-red-200/50"
                    }`}>
                      {hist.login_status}
                    </span>
                    <p className="text-[9px] font-mono mt-1" style={{ color: '#A0845C' }}>
                      {formatDate(hist.login_time)}
                    </p>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-xs py-4 text-center" style={{ color: '#A0845C' }}>No login history found.</p>
              )}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}