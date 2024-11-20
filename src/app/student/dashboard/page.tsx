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

    const router = useRouter();

    useEffect(() => {
        const studentData = JSON.parse(localStorage.getItem("studentData") || "{}");
        if (!studentData?.studentId) {
            router.push("/student");
        } else {
            setStudent(studentData);
            generateQRCode(studentData.studentId);
        }
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

    const confirmLogout = (confirm: boolean) => {
        if (confirm) {
            localStorage.removeItem("studentData"); // Clear student data
            router.push("/"); // Redirect to landing page
        } else {
            alert("Logout cancelled.");
        }
    };

    const [isWithinRadius, setIsWithinRadius] = useState(false);

            useEffect(() => {
                const intervalId = setInterval(() => {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((position) => {
                            const userLat = position.coords.latitude;
                            const userLng = position.coords.longitude;
                            const targetLat = 40.7376092; // Replace with the target latitude
                            const targetLng = -73.7134038; // Replace with the target longitude
                            const distance = getDistanceFromLatLonInMiles(userLat, userLng, targetLat, targetLng);
                            if (distance <= 3) {
                                setIsWithinRadius(true);
                                clearInterval(intervalId);
                            } else {
                                setIsWithinRadius(false);
                            }
                        });
                    }
                }, 1000);

                return () => clearInterval(intervalId);
            }, []);

            const deg2rad = (deg: number) => {
                return deg * (Math.PI / 180);
            };

            const getDistanceFromLatLonInMiles = (lat1: number, lon1: number, lat2: number, lon2: number) => {
                const R = 3958.8; // Radius of the Earth in miles
                const dLat = deg2rad(lat2 - lat1);
                const dLon = deg2rad(lon2 - lon1);
                const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distance = R * c;
                return distance;
            };


            const [selectedClass, setSelectedClass] = useState<string | null>(null);
            const [selectedDate, setSelectedDate] = useState<string | null>(null);

            const filteredAttendance = student?.classes
            .flatMap((cls) =>
                cls.attendance.map((att) => ({
                ...att,
                classId: cls.classId,
                classPoints: cls.classPoints,
                }))
            )
            .filter((att) => {
                const matchesClass = selectedClass ? att.classId === selectedClass : true;
                const matchesDate = selectedDate ? new Date(att.scheduledTime).toLocaleDateString('en-US', { timeZone: 'UTC' }) === new Date(selectedDate).toLocaleDateString('en-US', { timeZone: 'UTC' }) : true;
                return matchesClass && matchesDate;
            })
            .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());

            


const [myActiveTab, mySetActiveTab] = useState('home'); // Track active tab

if (!student) {
    return <p>Loading student data...</p>;
}
const renderContent = () => {
    switch (myActiveTab) {
        case 'home':
            return (
                <div className="bg-white-600">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="flex flex-col items-center space-y-2">
                            <h1 className="text-5xl font-semibold">Welcome {student.studentName}!</h1>
                            <img src={'/attendmatelogoblack.png'} alt="Profile" className="w-24 h-24" />
                            <h2 className="text-2xl font-semibold">{student.studentName}</h2>
                            <p className="text-gray-500">{student.studentEmail}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <p className="text-lg font-semibold">Total Points: {student.classes.reduce((acc, cur) => acc + cur.classPoints, 0)}</p>
                            <p className="text-lg font-semibold">Total Classes: {student.classes.length}</p>
                        </div>
                        <div className="flex flex-col items-center space-y-2">
                            {/* <h3 className="text-lg font-semibold">Attendance</h3> */}
                            <div className="flex items-center space-x-2">
                                <div className="flex flex-col items-start space-y-2">
                                    <p className="text-lg font-semibold">Upcoming Classes <br />...</p>
                                    {student.classes.map((cls) => cls.attendance.map((att) => {
                                        const scheduledTime = new Date(att.scheduledTime);
                                        return scheduledTime >= new Date() ? (
                                            <div className="flex items-center space-x-2" key={att.scheduledTime}>
                                                <p>{scheduledTime.toDateString()}</p>
                                                <p>{att.status}</p>
                                            </div>
                                        ) : null;
                                    }))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        case 'scan':
            return (
                <div>
                    {isWithinRadius ? (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="flex flex-col items-center space-y-2">
                                <h1 className="text-5xl font-semibold">Scan QR Code</h1>
                            </div>
                            <div className="flex flex-col items-center space-y-2">
                                <img src={qrCode || ''} alt="QR Code" className="w-60 h-60" style={{ userSelect: 'none', pointerEvents: 'none' }} />
                                <div className="flex flex-col items-center space-x-2">
                                    <h2 className="text-2xl font-semibold">{student.studentName}</h2>
                                    <div className="font-semibold">{new Date().toLocaleString()}</div>
                                    <p className="text-lg font-semibold">Total Points: {student.classes.reduce((acc, cur) => acc + cur.classPoints, 0)}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="flex flex-col items-center space-y-2">
                                <h1 className="text-5xl font-semibold">Location Required</h1>
                                <p className="text-lg font-semibold">You are not near NYIT yet to receive the QR code. Please come within 3 miles.</p>
                                
                                <p className="text-lg font-semibold text-center">Please avoid texting while driving. <br /> You can send an email with your location below.</p>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300">Send Email</button>
                            </div>
                        </div>
                    )}
                </div>
            );
        case 'history':
            return (
            <div className="overflow-x-auto">
                <div className="flex flex-col items-center space-y-4">
                <h2 className="text-2xl font-semibold">Filter Attendance</h2>
                <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
                    <div className="flex flex-col items-start space-y-2">
                    <label htmlFor="classSelect" className="text-lg font-semibold">Select Class</label>
                    <select
                        id="classSelect"
                        className="p-2 border rounded-md"
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="">All Classes</option>
                        {student.classes.map((cls) => (
                        <option key={cls.classId} value={cls.classId}>
                            {cls.classId}
                        </option>
                        ))}
                    </select>
                    </div>
                    <div className="flex flex-col items-start space-y-2">
                    <label htmlFor="dateSelect" className="text-lg font-semibold">Select Date</label>
                    <input
                        type="date"
                        id="dateSelect"
                        className="p-2 border rounded-md"
                        max={new Date().toISOString().split("T")[0]} // Prevent future dates
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    </div>
                </div>
                </div>

                <table className="min-w-full bg-white">
                <thead>
                    <tr>
                    <th className="py-2 px-4 border-b text-left">Date</th>
                    <th className="py-2 px-4 border-b text-left">Class</th>
                    <th className="py-2 px-4 border-b text-left">Status</th>
                    <th className="py-2 px-4 border-b text-left">Points</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAttendance?.map((att, index) => (
                    <tr
                        key={`${att.scheduledTime}-${att.classId}`}
                        className={`${
                        index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'
                        } hover:bg-gray-300`}
                    >
                        <td className="py-2 px-4 border-b">{new Date(att.scheduledTime).toDateString()}</td>
                        <td className="py-2 px-4 border-b">{att.classId}</td>
                        <td className="py-2 px-4 border-b">{att.status.charAt(0).toUpperCase() + att.status.slice(1)}</td>
                        <td className="py-2 px-4 border-b">{att.classPoints}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            );
        case 'leaderboard':
            return (
                <div>USE API FROM TEACHER SIDE!!!!! </div>
            );
        default:
            return <div></div>;
    }
};

    return (
    <div className="min-h-screen bg-white relative text-black">
        {/* Header */}
        <header className="flex items-center justify-between bg-green-600 text-white p-4">
            <div className="flex items-center space-x-2">
                <Image
                    src="/attendmatelogo.png"
                    alt="Logo"
                    width={40}
                    height={40}
                />
                <h1 className="text-xl font-semibold">Student Dashboard - {student.studentName.split(' ')[0]} ({student.studentId})</h1>
            </div>
            <div className="flex items-center space-x-4">
                <div className="font-semibold">{new Date().toLocaleString()}</div>
                <button onClick={() => confirmLogout(true)} className="bg-red-500 text-white px-4 py-2 rounded-md">Logout</button>
            </div>
        </header>

        {/* Navigation */}
        <div className="flex flex-wrap items-center space-x-2 w-full p-5">
            <button
            onClick={() => mySetActiveTab('home')}
            className={`text-sm md:text-lg font-semibold py-2 px-2 md:px-4 rounded-md flex-1 h-12 ${myActiveTab === 'home' ? 'bg-green-600 text-white' : 'bg-gray-200 text-black'} hover:bg-gray-700 hover:text-white shadow-md`}
            >
            Home
            </button>
            <div className="h-8 border-l-2 border-gray-500"></div>
            <button
            onClick={() => mySetActiveTab('scan')}
            className={`text-sm md:text-lg font-semibold py-2 px-2 md:px-4 rounded-md flex-1 h-12 ${myActiveTab === 'scan' ? 'bg-green-600 text-white' : 'bg-gray-200 text-black'} hover:bg-gray-700 hover:text-white shadow-md`}
            >
            Scan
            </button>
            <div className="h-8 border-l-2 border-gray-500"></div>
            <button
            onClick={() => mySetActiveTab('history')}
            className={`text-sm md:text-lg font-semibold py-2 px-2 md:px-4 rounded-md flex-1 h-12 ${myActiveTab === 'history' ? 'bg-green-600 text-white' : 'bg-gray-200 text-black'} hover:bg-gray-700 hover:text-white shadow-md`}
            >
            History
            </button>
            <div className="h-8 border-l-2 border-gray-500"></div>
            <button
            onClick={() => mySetActiveTab('leaderboard')}
            className={`text-sm md:text-lg font-semibold py-2 px-2 md:px-4 rounded-md flex-1 h-12 ${myActiveTab === 'leaderboard' ? 'bg-green-600 text-white' : 'bg-gray-200 text-black'} hover:bg-gray-700 hover:text-white shadow-md`}
            >
            Leaderboard
            </button>
        </div>
        
        <main className="flex-grow p-6">{renderContent()}</main>
    </div>
    );
}
