// components/QrScanner.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';

const QrScanner = () => {
    const [scanData, setScanData] = useState('');
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [notification, setNotification] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        if (isScanning && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isScanning]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setScanData(e.target.value);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && scanData.trim() !== '' && isScanning) {
            setNotification(`Scan registered: ${scanData}`);
            setScanData('');
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
                setNotification('');
            }, 2000);
        }
    };

    const handleStartScanning = () => {
        setIsScanning(true);
    };

    const handleStopScanning = () => {
        setIsScanning(false);
    };

    return (
        <div>
            <h1 className="text-xl text-black font-semibold">{isScanning ? "Currently scanning... Please don't press any key or leave this page." : "Click 'Start Scanning' to begin."}</h1>
            {isScanning && <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4 my-5"></div>}
            <input
                ref={inputRef}
                type="text"
                value={scanData}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }}
                autoFocus={isScanning}
            />
            {notification && <div style={{ marginTop: '20px', fontSize: '18px', color: '#0f0' }}>{notification}</div>}
            {!isScanning ? (
                <button className="text-black border-solid border-2 border-black" onClick={handleStartScanning} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
                    Start Scanning
                </button>
            ) : (
                <button className="text-red-600 border-solid border-2 border-red-600" onClick={handleStopScanning} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
                    Stop Scanning
                </button>
            )}
        </div>
    );
};

export default QrScanner;
