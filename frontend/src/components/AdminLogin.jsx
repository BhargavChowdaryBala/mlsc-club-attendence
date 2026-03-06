import React from 'react';

const AdminLogin = ({ onBack }) => {
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

        {/* Login Box Placeholder */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl w-full shadow-2xl backdrop-blur-md relative overflow-hidden">
             {/* Decorative glow */}
             <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
             
             <div className="flex flex-col gap-4 text-center py-6">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full mx-auto flex items-center justify-center border border-slate-700/50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-cyan-400 opacity-70">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                </div>
                <p className="text-slate-500 text-sm mt-2">Authentication logic will go here in the future.</p>
             </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
