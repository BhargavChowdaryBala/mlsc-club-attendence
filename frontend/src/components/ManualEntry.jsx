import React, { useState } from 'react';
import { markAttendance } from '../services/api';

const ManualEntry = () => {
    const [rollNo, setRollNo] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rollNo) return;

        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const data = await markAttendance(rollNo);
            setResult({
                message: data.message,
                student: data.student
            });
            setRollNo(''); // Clear input on success
            if (navigator.vibrate) navigator.vibrate(200);
        } catch (err) {
            setError(err.message);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col gap-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-800">Manual Entry</h3>
                <p className="text-slate-500 text-sm">Enter Roll Number if QR scan fails</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-slate-600 font-semibold text-sm uppercase tracking-wider">Roll Number</label>
                    <input
                        type="text"
                        placeholder="e.g. 21B01A0XXX"
                        value={rollNo}
                        onChange={(e) => setRollNo(e.target.value)}
                        className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 text-lg font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition placeholder:text-slate-300"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !rollNo}
                    className="w-full px-6 py-4 bg-secondary text-white font-bold text-lg rounded-xl hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95 shadow-lg shadow-slate-200"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>
                            Updating...
                        </span>
                    ) : 'Mark Attendance'}
                </button>
            </form>

            {(result || error) && (
                <div className={`p-6 rounded-xl text-center animate-fade-in-up border ${result ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    {result && (
                        <>
                            <div className="mx-auto w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <p className="text-green-700 font-extrabold text-lg">{result.message}</p>
                            {result.student && (
                                <div className="mt-2 text-slate-600 text-sm">
                                    <span className="font-semibold block">{result.student.name}</span>
                                    <span className="opacity-75">{result.student.rollNo}</span>
                                </div>
                            )}
                        </>
                    )}

                    {error && (
                        <>
                            <div className="mx-auto w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-2">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <p className="text-red-700 font-bold">{error}</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManualEntry;
