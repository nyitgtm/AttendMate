// components/QrScanner.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';

type Student = {
    selected: any;
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentPicture: string; // Add a field for profile picture URL
    classes: {
        classId: string;
        attendance: {
            scheduledTime: string;
            checkInTime: string;
            status: string;
            points: number;
        }[];
    }[];
  };

interface QrScannerProps {

    classId: string | null;
  
}

const QrScanner: React.FC<QrScannerProps> = ({ classId }) => {
    const [scanData, setScanData] = useState('');
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [notification, setNotification] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [students, setStudents] = useState<Student[] | null>(null);
    const [notificationColor, setNotificationColor] = useState('');

    const findStudents = async (classId: string) => {
        console.log('Selected class:', classId);
    
        const res = await fetch('/api/getstudentsbycoursename', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseName: classId }), // Ensure key matches server-side expectations
        });
    
        const data = await res.json();
    
        if (res.ok) {
            setStudents(data); // Assuming data is an array of students
            console.log(data);
        } else {
            console.error(data.message); // Log error to console for debugging
            setStudents([]);
        }
    };

    useEffect(() => {
        if (isScanning && inputRef.current) {
            inputRef.current.focus();
        }
        if (classId) {
            findStudents(classId);
        }
    }, [isScanning]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setScanData(e.target.value);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && scanData.trim() !== '' && isScanning) {
            if (![10, 36, 37, 38].includes(scanData.trim().length)) {
                setNotification('Invalid scan data. Please try again.');
                setNotificationColor('#FF0000');
                setScanData('');
                return;
            }

            let typeOfScan: string, studentId: string, date: string;
            if (scanData.length == 10) {
                typeOfScan = "QRCODE";
                studentId = scanData.substring(3,11);
                date = new Date().toLocaleString();
            } else {
                [typeOfScan, studentId, date] = scanData.split('$');
            }

            if (!typeOfScan || !studentId || !date) {
                setNotification('Invalid scan data format. Please try again.');
                setNotificationColor('#FF0000');
                setScanData('');
                return;
            }

            if (typeOfScan !== 'QRCODE') {
                setNotification('Invalid scan type. Please try again.');
                setNotificationColor('#FF0000');
                setScanData('');
                return;
            }

            if (studentId.length !== 7) {
                setNotification('Invalid student ID length. Please try again.');
                setNotificationColor('#FF0000');
                setScanData('');
                return;
            }

            let student: Student | undefined;
            if (students) {
                const currStudent = students.find((student) => student.studentId === studentId);
                if (!currStudent) {
                    setNotification('Student not found. Please try again.');
                    setNotificationColor('#FF0000');
                    setScanData('');
                    return;
                }
                else {
                    console.log('Student found:', currStudent);
                    student = currStudent;
                }
            }
            else {
                console.log('Students not loaded yet.');
            }

            const scanDate = new Date(date);
            const currentDate = new Date(new Date().toLocaleString());
            const timeDifference = (currentDate.getTime() - scanDate.getTime()) / 1000;

            if (isNaN(scanDate.getTime()) || timeDifference > 2) {
                setNotification('Invalid or expired scan date. Please try again.');
                setNotificationColor('#FF0000');
                setScanData('');
                return;
            }

            // You can now use typeOfScan, studentId, and date as needed
            console.log('Type of Scan:', typeOfScan);
            console.log('Student ID:', studentId);
            console.log('Date:', date);

            if (student) {
                setNotification(`Scan registered: ${student.studentName} (${student.studentId})`);
                setNotificationColor('#0C0');
                if (classId) {
                    updateAttendance(studentId, classId, scanDate, 'present', 5);
                } else {
                    console.error('Class ID is null');
                }
            }
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


    const updateAttendance = async (studentId: string, classId: string, date: Date, status: string, points: number) => {
        try {
            const res = await fetch('/api/updatestudentattendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, classId, date, status, points })
            });
      
            console.log("STATUS" + res.status);
      
            if (!res.ok) {
                const errorData = await res.json();
                console.error('Error updating attendance:', errorData.message);
                return { success: false, message: errorData.message };
            }
      
            const data = await res.json();
            return { success: true, message: data.message };
        } catch (error) {
            console.error('Error in updateAttendance function:', error);
            return { success: false, message: 'An error occurred while updating attendance' };
        }
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
            <div style={{ marginTop: '20px', fontSize: '18px', color: notificationColor }}>{notification}</div>
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
