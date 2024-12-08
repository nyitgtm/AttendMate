// components/QrScanner.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import CameraScaner from './QrReader';
import QrReader from './QrReader';

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

/**
 * QrScanner component allows teachers to scan QR codes to register student attendance.
 * 
 * @component
 * @param {QrScannerProps} props - The props for the QrScanner component.
 * @param {string} props.classId - The ID of the class for which attendance is being taken.
 * 
 * @returns {JSX.Element} The rendered QrScanner component.
 * 
 * @example
 * <QrScanner classId="class123" />
 * 
 * @remarks
 * This component uses the `useState` and `useEffect` hooks to manage state and side effects.
 * It also uses `useRef` to manage the input element for scanning.
 * 
 * @function findStudents
 * Fetches the list of students for the given class ID.
 * 
 * @function handleInputChange
 * Handles changes to the input field for scan data.
 * 
 * @function handleKeyPress
 * Handles the Enter key press event to process the scan data.
 * 
 * @function handleStartScanning
 * Starts the scanning process.
 * 
 * @function handleStopScanning
 * Stops the scanning process.
 * 
 * @function updateAttendance
 * Updates the attendance record for a student.
 * 
 * @state {string} scanData - The data from the QR code scan.
 * @state {React.RefObject<HTMLInputElement>} inputRef - Reference to the input element.
 * @state {string} notification - Notification message to display to the user.
 * @state {boolean} isScanning - Flag indicating whether scanning is in progress.
 * @state {Student[] | null} students - List of students in the class.
 * @state {string} notificationColor - Color of the notification message.
 * @state {boolean} openQr - Flag indicating whether the camera scanner is open.
 */
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
            let typeOfScan: string, studentId: string, date: string;
            if (scanData.length == 10) {
                typeOfScan = "QRCODE";
                studentId = scanData.substring(3,11);
                date = new Date().toLocaleString();
            } else {
                [typeOfScan, studentId, date] = scanData.split('$');
                console.log('Type of Scan:', typeOfScan);
                console.log('Student ID:', studentId);
                console.log('Date:', date);
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

    const [openQr, setOpenQr] = useState<boolean>(false);

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

            const audio = new Audio('/bell.mp3');
            audio.play();
      
            const data = await res.json();
            return { success: true, message: data.message };
        } catch (error) {
            console.error('Error in updateAttendance function:', error);
            return { success: false, message: 'An error occurred while updating attendance' };
        }
      };

    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-xl text-black font-semibold text-center">{isScanning ? "Currently scanning... Please don't press any key or leave this page." : "Click your Scanning Options"}</h1>
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
            {!openQr && (
                <>
                    {!isScanning ? (
                        <button className="text-black border-solid border-2 border-black mt-5 px-5 py-2 text-lg cursor-pointer" onClick={handleStartScanning}>
                            Start Physical Scanners
                        </button>
                    ) : (
                        <button className="text-red-600 border-solid border-2 border-red-600 mt-5 px-5 py-2 text-lg cursor-pointer" onClick={handleStopScanning}>
                            Stop Scanning
                        </button>
                    )}
                    {!isScanning && <p className="py-5"> OR </p>}
                </>
            )}

            {!isScanning && <button className="px-5 py-2 text-lg cursor-pointer border-2 border-solid" onClick={() => { setOpenQr(!openQr); setIsScanning(!openQr); }}>
                {openQr ? "Close" : "Start"} Camera Scanner
            </button>}
            {openQr && 
            <div>
            <div className="flex justify-center">
                <button className="text-red-600 border-solid border-2 border-red-600 mt-5 py-2 px-5 text-lg cursor-pointer" onClick={() => { handleStopScanning(); setOpenQr(!openQr); }} >
                    Stop Camera Scanner
                </button>
            </div>
            <QrReader myClassId={classId} />
            </div>}
        </div>
    );
};

export default QrScanner;
