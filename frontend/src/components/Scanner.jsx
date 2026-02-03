import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { markAttendance } from '../services/api';

const Scanner = ({ onScanSuccess }) => {
    const [scanResult, setScanResult] = useState(null);
    const [scanError, setScanError] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [cameras, setCameras] = useState([]);
    const [activeCameraId, setActiveCameraId] = useState(null);

    // State for duplicate prevention
    const lastScannedCode = useRef(null);
    const lastScannedTime = useRef(0);
    const COOLDOWN_MS = 3000; // 3 seconds before same code can be scanned again

    const scannerRef = useRef(null);
    const readerId = "reader-custom";

    // Initialize scanner instance once
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                if (scannerRef.current.isScanning) {
                    scannerRef.current.stop().catch(console.error);
                }
                scannerRef.current.clear();
            }
        };
    }, []);

    const startScanning = useCallback(async (cameraIdToUse = null) => {
        setScanError(null);

        // Debug: check if element exists
        const element = document.getElementById(readerId);
        if (!element) {
            setScanError("Internal Error: Scanner element not ready. Please retry.");
            return;
        }

        try {
            let availableCameras = [];
            try {
                availableCameras = await Html5Qrcode.getCameras();
                setCameras(availableCameras);
            } catch (e) {
                console.warn("Could not list cameras, generic start...", e);
            }

            // Improved config for better recognition
            let config = {
                fps: 10,
                // qrbox is optional. If omitted, it scans the full frame. 
                // Using a function allows it to be responsive, but removing it is safest for "not recognizing" issues.
                qrbox: (viewfinderWidth, viewfinderHeight) => {
                    // Use 70% of the smaller dimension
                    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                    const edge = Math.floor(minEdge * 0.7);
                    return { width: edge, height: edge };
                },
                aspectRatio: 1.0
            };

            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode(readerId);
            }

            if (cameraIdToUse) {
                await scannerRef.current.start(cameraIdToUse, config, (t) => handleScan(t), () => { });
            }
            else if (availableCameras.length > 0) {
                let targetId;
                const backCamera = availableCameras.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('environment'));
                targetId = backCamera ? backCamera.id : availableCameras[availableCameras.length - 1].id;
                if (availableCameras.length === 1) targetId = availableCameras[0].id;

                setActiveCameraId(targetId);
                await scannerRef.current.start(targetId, config, (t) => handleScan(t), () => { });
            }
            else {
                try {
                    await scannerRef.current.start({ facingMode: "environment" }, config, (t) => handleScan(t), () => { });
                } catch (err2) {
                    await scannerRef.current.start({ facingMode: "user" }, config, (t) => handleScan(t), () => { });
                }
                Html5Qrcode.getCameras().then(setCameras).catch(e => console.log(e));
            }

            setIsScanning(true);

        } catch (err) {
            let msg = "Unknown error starting camera";
            if (typeof err === 'string') msg = err;
            if (err.message) msg = err.message;
            if (err.name === 'NotAllowedError') msg = "Camera permission denied";
            setScanError(`Camera Error: ${msg}`);
        }
    }, [cameras]);

    const stopScanning = async () => {
        if (scannerRef.current && isScanning) {
            try {
                await scannerRef.current.stop();
                setIsScanning(false);
            } catch (err) {
                console.error("Failed to stop", err);
            }
        }
    };

    const handleSwitchCamera = async () => {
        if (cameras.length < 2) return;
        await stopScanning();
        const currentIndex = cameras.findIndex(c => c.id === activeCameraId);
        const nextIndex = (currentIndex + 1) % cameras.length;
        startScanning(cameras[nextIndex].id);
    };

    const handleScan = async (rawText) => {
        const rollNo = rawText.trim();
        const now = Date.now();

        if (rollNo === lastScannedCode.current && (now - lastScannedTime.current < COOLDOWN_MS)) {
            return;
        }

        lastScannedCode.current = rollNo;
        lastScannedTime.current = now;

        if (navigator.vibrate) try { navigator.vibrate(200); } catch (e) { }

        try {
            const data = await markAttendance(rollNo);

            // Success Vibration (Double Pulse)
            if (navigator.vibrate) try { navigator.vibrate([100, 50, 100]); } catch (e) { }

            setScanResult({
                message: data.message,
                student: data.student,
                timestamp: new Date().toLocaleTimeString()
            });
            setScanError(null);

            onScanSuccess && onScanSuccess(data);

        } catch (err) {
            setScanError(err.message);
            setScanResult(null);
            // Error Vibration (Longer Pulse)
            if (navigator.vibrate) try { navigator.vibrate(400); } catch (e) { }
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-4">

            <style>{`
                #reader-custom video {
                    object-fit: cover !important;
                    width: 100% !important;
                    height: 100% !important;
                    border-radius: 1.5rem;
                }
            `}</style>

            {/* Camera Container */}
            <div className="relative w-full aspect-[4/5] bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                {/* Always-on element */}
                <div className="absolute inset-0 z-0 bg-black">
                    <div id={readerId} className="w-full h-full"></div>
                </div>

                {/* Start Overlay */}
                {!isScanning && !scanResult && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-6 text-center">
                        {!scanError && (
                            <div className="mb-4 p-3 bg-slate-800 rounded-full">
                                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                            </div>
                        )}

                        {!scanError ? (
                            <>
                                <h3 className="text-white text-lg font-bold mb-1">Ready to Scan</h3>
                                <button
                                    onClick={() => startScanning()}
                                    className="mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition transform flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Start
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center">
                                <p className="text-red-400 text-sm mb-4">{scanError.replace('Camera Error:', '')}</p>
                                <button onClick={() => startScanning()} className="px-4 py-2 bg-slate-700 text-white text-sm font-bold rounded-full">Retry</button>
                            </div>
                        )}
                    </div>
                )}

                {/* Laser Overlay */}
                {isScanning && (
                    <div className="absolute inset-0 pointer-events-none z-20">
                        <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-white/50 rounded-tl-lg"></div>
                        <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-white/50 rounded-tr-lg"></div>
                        <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-white/50 rounded-bl-lg"></div>
                        <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-white/50 rounded-br-lg"></div>
                        <div className="scan-overlay opacity-50 h-0.5 bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]"></div>
                    </div>
                )}

                {/* Camera Switcher */}
                {isScanning && cameras.length > 1 && (
                    <button
                        onClick={handleSwitchCamera}
                        className="absolute top-4 right-4 z-30 bg-black/40 backdrop-blur-md border border-white/20 text-white p-2 rounded-full active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                )}

                {/* Scanning Active Indicator - Top Overlay */}
                {isScanning && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white/90 text-[10px] font-bold tracking-wider shadow-lg animate-pulse uppercase">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
                            Scanning Active
                        </div>
                    </div>
                )}
            </div>

            {/* Result Card Layout - PERSISTENT */}
            <div className="w-full">
                {scanResult && (
                    <div className="w-full animate-fade-in-up mb-4">
                        <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <h3 className="text-lg font-bold text-green-700 leading-tight mb-1">{scanResult.message}</h3>

                            {scanResult.student && (
                                <div className="mt-3 w-full bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <div className="text-xl font-bold text-slate-800">{scanResult.student.name}</div>
                                    <div className="text-sm font-mono text-slate-500">{scanResult.student.rollNo}</div>
                                    <div className="text-xs text-slate-400 mt-1">{scanResult.student.branch}</div>
                                </div>
                            )}

                            {/* Timestamp */}
                            <div className="mt-2 text-xs text-slate-300">
                                Scanned at {scanResult.timestamp}
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Error Card - Persistent */}
            {scanError && (
                <div className="w-full animate-fade-in-up mb-4">
                    <div className="bg-red-50 rounded-2xl p-5 shadow-lg border border-red-100 flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <h3 className="text-lg font-bold text-red-700 leading-tight mb-2">Registration Error</h3>
                        <p className="text-red-800 font-medium text-sm bg-red-100/50 px-3 py-2 rounded-lg break-all">
                            {scanError}
                        </p>
                        <div className="mt-2 text-xs text-red-400">
                            Scan another to retry
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Scanner;
