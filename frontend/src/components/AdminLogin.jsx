import React, { useState } from 'react';
import { verifyPassword } from '../services/api';

const AdminLogin = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await verifyPassword(password);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.message || 'Invalid password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col items-center justify-center p-4">
        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 sm:top-6 sm:left-6 text-slate-400 hover:text-white flex items-center gap-2 transition-colors cursor-pointer bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10"
        >
          <span>←</span> Home
        </button>

        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors cursor-pointer bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10"
        >
          Logout
        </button>

        <div className="flex flex-col items-center w-full max-w-4xl animate-fade-in-up">
          <div className="w-24 h-24 mb-6 rounded-full bg-white/5 border border-white/10 p-2 shadow-[0_0_20px_rgba(34,211,238,0.2)] backdrop-blur-sm">
            <img src="/logo.png" alt="MLSC Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-8 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
            HOD Dashboard
          </h1>

          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl w-full shadow-2xl backdrop-blur-md relative overflow-hidden text-center min-h-[400px] flex flex-col items-center justify-center">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
            <h2 className="text-2xl font-bold text-white mb-4">Welcome, HOD!</h2>
            <p className="text-slate-400">The dashboard features will be implemented here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col items-center justify-center p-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 text-slate-400 hover:text-white flex items-center gap-2 transition-colors cursor-pointer bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10"
      >
        <span>←</span> Home
      </button>

      {/* Main Content */}
      <div className="flex flex-col items-center w-full max-w-md animate-fade-in-up">
        {/* Logo area */}
        <div className="w-24 h-24 mb-6 rounded-full bg-white/5 border border-white/10 p-2 shadow-[0_0_20px_rgba(34,211,238,0.2)] backdrop-blur-sm">
          <img src="/logo.png" alt="MLSC Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
        </div>

        {/* Heading container */}
        <div className="text-center mb-8 w-full px-4">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-3 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
            Hello this is admin login page
          </h1>
          <p className="text-slate-400 font-medium">Please sign in to access HOD dashboard.</p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/50 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl w-full relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-red-400 text-xs italic">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
