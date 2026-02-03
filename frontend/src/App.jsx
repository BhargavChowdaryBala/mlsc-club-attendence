import React, { useState } from 'react';
import Scanner from './components/Scanner';
import ManualEntry from './components/ManualEntry';

function App() {
  const [activeTab, setActiveTab] = useState('scan');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 mb-2">
          Club Attendance
        </h1>
        <p className="text-slate-500 font-medium tracking-wide">Event Coordinator Portal</p>
      </header>

      {/* Toggle */}
      <div className="flex bg-white p-1 rounded-xl shadow-md border border-slate-200 mb-8">
        <button
          onClick={() => setActiveTab('scan')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'scan'
              ? 'bg-primary text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          QR Scanner
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'manual'
              ? 'bg-primary text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          Manual Entry
        </button>
      </div>

      {/* Content */}
      <main className="w-full max-w-lg">
        <div className={`transition-opacity duration-300 ${activeTab === 'scan' ? 'block' : 'hidden'}`}>
          <Scanner />
        </div>
        <div className={`transition-opacity duration-300 ${activeTab === 'manual' ? 'block' : 'hidden'}`}>
          <ManualEntry />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} Club Tech Team
      </footer>
    </div>
  );
}

export default App;
