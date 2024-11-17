"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import Link from 'next/link';
import QRCode from "qrcode";
import Calendar from 'react-calendar'; // Import the react-calendar component
import 'react-calendar/dist/Calendar.css'; // Import the calendar styles

type Student = {
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentPicture: string; // Add a field for profile picture URL
    classes: {
        classId: string;
        classPoints: number;
        attendance: {
            status: string;
            scheduledTime: string;
        }[];
    }[];
};

export default function Dashboard() {
    const [student, setStudent] = useState<Student | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [showClasses, setShowClasses] = useState(false);
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false); // State to manage logout popup
    const [isCalendarOpen, setIsCalendarOpen] = useState(false); // State to handle the calendar modal visibility
    const [highlightedDates, setHighlightedDates] = useState<Date[]>([]); // State for highlighted attendance dates

    const router = useRouter();

    useEffect(() => {
        const studentData = JSON.parse(localStorage.getItem("studentData") || "{}");
        if (!studentData?.studentId) {
            router.push("/student");
        } else {
            setStudent(studentData);
            generateQRCode(studentData.studentId);
        }

        // Generate random highlighted dates for the calendar (example)
        const randomDates = generateRandomDates();
        setHighlightedDates(randomDates);
    }, [router]);

    const generateQRCode = (studentId: string) => {
        const intervalId = setInterval(() => {
            const timestamp = Date.now();
            const qrData = `${studentId}000${timestamp}`;
            QRCode.toDataURL(qrData, (error, url) => {
                if (!error) setQrCode(url);
            });
        }, 1000);
        return () => clearInterval(intervalId);
    };

    const toggleProfileSidebar = () => setIsProfileOpen(!isProfileOpen);
    const toggleClassesView = () => setShowClasses(!showClasses);
    const toggleCalendarView = () => setIsCalendarOpen(!isCalendarOpen);

    const handleLogout = () => {
        setShowLogoutConfirmation(true);
    };

    const confirmLogout = (confirm: boolean) => {
        if (confirm) {
            localStorage.removeItem("studentData"); // Clear student data
            router.push("/"); // Redirect to landing page
        } else {
            setShowLogoutConfirmation(false); // Hide the confirmation dialog
        }
    };

    // Function to generate random attendance dates for demonstration
    const generateRandomDates = () => {
        const randomDates: Date[] = [];
        for (let i = 0; i < 10; i++) {
            const randomDay = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28));
            randomDates.push(randomDay);
        }
        return randomDates;
    };

    if (!student) {
        return <p>Loading student data...</p>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header */}
            <header className="flex flex-col bg-green-600 text-white shadow-lg">
                <div className='m-2'>
                    <Link href="/">
                        <Image
                            src="/attendmatelogo.png"
                            alt="AttendMate Logo"
                            width={50}
                            height={50}
                            className="object-contain"
                        />
                    </Link>
                </div>
                <div className="flex flex-col text-center py-5">
                    <h1 className="text-4xl font-bold">AttendMate Dashboard</h1>
                    <p className="text-lg">Welcome, {student.studentName}!</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow p-6">
                {/* QR Code Section */}
                <section className="flex flex-col items-center mb-10">
                    <h3 className="text-lg font-semibold text-gray-800">Your QR Code (updates every second):</h3>
                    {qrCode ? (
                        <img src={qrCode} alt="Student QR Code" className="border-2 border-gray-300 p-2 rounded w-40 h-40" />
                    ) : (
                        <p>Loading QR code...</p>
                    )}
                </section>

                {/* Conditional Classes Section */}
                {showClasses && (
                    <section className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Your Attendance and Points</h2>
                        {student.classes.map((classItem, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg shadow-sm mb-4">
                                <h3 className="text-xl font-medium text-gray-800">{classItem.classId}</h3>
                                <p className="text-gray-700"><strong>Points:</strong> {classItem.classPoints}</p>
                                <div className="mt-2 space-y-2">
                                    <strong className="text-gray-700">Attendance:</strong>
                                    {classItem.attendance.map((entry, idx) => (
                                        <p key={idx} className="text-gray-600">
                                            {entry.status} on {new Date(entry.scheduledTime).toLocaleString()}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </section>
                )}
            </main>

            {/* Profile Sidebar */}
            {isProfileOpen && (
                <aside className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg p-6 border-l border-gray-300">
                    <button onClick={toggleProfileSidebar} className="absolute top-4 right-4 text-gray-500 font-bold">
                        X
                    </button>
                    <div className="flex justify-center mb-6">
                        <img 
                            src={student.studentPicture || "/default-profile.png"} 
                            alt="Profile Picture" 
                            className="w-24 h-24 rounded-full border-2 border-gray-300"
                        />
                    </div>
                    <h2 className="text-2xl font-semibold mb-4 text-black">Profile</h2>
                    <p className="text-black mb-2"><strong>Name:</strong> {student.studentName}</p>
                    <p className="text-black mb-2"><strong>Email:</strong> {student.studentEmail}</p>
                    <p className="text-black mb-4"><strong>ID:</strong> {student.studentId}</p>
                    <button 
                        onClick={handleLogout}
                        className="mt-auto w-full py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                    >
                        Logout
                    </button>
                </aside>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <p className="text-black font-semibold mb-4">Are you sure you want to logout?</p>
                        <div className="flex justify-around">
                            <button
                                onClick={() => confirmLogout(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => confirmLogout(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Calendar Modal */}
            {isCalendarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center text-black">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <button
                            onClick={() => setIsCalendarOpen(false)}
                            className="absolute top-4 right-4 text-black-500 font-bold"
                        >
                            X
                        </button>
                        <h3 className="text-center text-xl font-semibold mb-4">Attendance Calendar</h3>
                        <Calendar
                            value={new Date()}
                            tileClassName={({ date }) => 
                                highlightedDates.some(d => 
                                    d.getDate() === date.getDate() && 
                                    d.getMonth() === date.getMonth() && 
                                    d.getFullYear() === date.getFullYear()) ? 'highlighted' : ''
                            }
                        />
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-4">
                <Link href="/" className="text-green-600 font-semibold py-2 px-4 border-2 border-gray-300 rounded-md hover:bg-green-100 transition">
                    Home
                </Link>
                <button onClick={toggleProfileSidebar} className="text-green-600 font-semibold py-2 px-4 border-2 border-gray-300 rounded-md hover:bg-green-100 transition">
                    Profile
                </button>
                <button onClick={toggleClassesView} className="text-green-600 font-semibold py-2 px-4 border-2 border-gray-300 rounded-md hover:bg-green-100 transition">
                    Classes
                </button>
                <button onClick={toggleCalendarView} className="text-green-600 font-semibold py-2 px-4 border-2 border-gray-300 rounded-md hover:bg-green-100 transition">
                    Attendance
                </button>
            </nav>

            <style jsx>{`
                .react-calendar__tile.highlighted {
                    background-color: #4CAF50;
                    color: white;
                    border-radius: 50%;
                    font-weight: bold;
                }

                .react-calendar__tile {
                    color: black;
                }
            `}</style>
        </div>
    );
}
