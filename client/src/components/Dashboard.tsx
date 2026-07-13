import React, { useEffect, useState } from "react";
import API from "../api/axios";

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/user/profile")
      .then(res => setProfile(res.data.user))
      .catch(() => setError("Failed to pull active session credentials."));
  }, []);

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } finally {
      onLogout();
    }
  };

  return (
    <div className="w-full max-w-2xl p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="flex justify-between items-center pb-6 border-b border-gray-100 mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            Secure Control Panel <span className="animate-bounce">🚀</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">Status: Session validated via server-side isolated cookie tracking</p>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-xl text-sm transition cursor-pointer">
          Logout
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl mb-4 font-medium">{error}</div>}

      {profile ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Account Identity</span>
              <span className="text-gray-800 font-semibold text-sm break-all">{profile.email}</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Security Access Level</span>
              <span className="mt-1 inline-block px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-extrabold rounded-md uppercase tracking-wider">
                {profile.role || "USER"}
              </span>
            </div>
          </div>

          <div className="p-4 bg-gray-900 rounded-xl text-emerald-400 font-mono text-xs overflow-x-auto border shadow-inner">
            <div className="text-gray-500 mb-1">// Verified JWT Session Payload</div>
            <div>{JSON.stringify(profile, null, 2)}</div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Querying active isolated sessions...</p>
        </div>
      )}
    </div>
  );
}