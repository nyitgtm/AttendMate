"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import Link from 'next/link';
import QRCode from "qrcode";

type Student = {
    studentId: string;
    studentName: string;
    studentEmail: string;
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

/**
 * Dashboard component for the student dashboard page.
 * 
 * @returns {JSX.Element} The rendered dashboard component.
 * 
 * @component
 * 
 * @example
 * return (
 *   <Dashboard />
 * )
 * 
 * @remarks
 * This component handles the student dashboard functionalities including:
 * - Fetching and displaying student data.
 * - Generating and displaying QR codes.
 * - Handling geolocation to check if the student is within a certain radius.
 * - Fetching and displaying weather data.
 * - Allowing students to join or leave classes.
 * - Displaying attendance history and leaderboard.
 * 
 * @function
 * @name Dashboard
 * 
 * @typedef {Object} Student
 * @property {string} studentId - The ID of the student.
 * @property {string} studentName - The name of the student.
 * @property {string} studentEmail - The email of the student.
 * @property {Array<Class>} classes - The classes the student is enrolled in.
 * 
 * @typedef {Object} Class
 * @property {string} classId - The ID of the class.
 * @property {Array<Attendance>} attendance - The attendance records for the class.
 * 
 * @typedef {Object} Attendance
 * @property {string} scheduledTime - The scheduled time of the class.
 * @property {string} checkInTime - The check-in time of the student.
 * @property {string} status - The attendance status (e.g., "present", "absent").
 * @property {number} points - The points awarded for the attendance.
 * 
 * @typedef {Object} WeatherData
 * @property {Object} data - The weather data object.
 * @property {Object} data.current - The current weather data.
 * @property {number} data.current.temperature2m - The current temperature in Fahrenheit.
 * @property {number} data.current.windSpeed10m - The current wind speed in MPH.
 * @property {Object} data.hourly - The hourly weather data.
 * @property {number} data.hourly.averagePrecipitation - The average precipitation percentage.
 * 
 * @typedef {Object} StudentPoints
 * @property {string} studentName - The name of the student.
 * @property {Array<Class>} classes - The classes the student is enrolled in.
 * @property {number} totalPoints - The total points the student has earned.
 * 
 * @typedef {Object} FetchResult
 * @property {boolean} success - Indicates if the fetch operation was successful.
 * @property {string} message - The message returned from the fetch operation.
 * 
 * @typedef {Object} JoinClassResult
 * @property {boolean} success - Indicates if the join class operation was successful.
 * @property {string} message - The message returned from the join class operation.
 * 
 * @typedef {Object} LeaveClassResult
 * @property {boolean} success - Indicates if the leave class operation was successful.
 * @property {string} message - The message returned from the leave class operation.
 * 
 * @typedef {Object} ConfirmLogoutResult
 * @property {boolean} confirm - Indicates if the logout was confirmed.
 * 
 * @typedef {Object} QRCodeResult
 * @property {string} url - The URL of the generated QR code.
 * 
 * @typedef {Object} GeolocationPosition
 * @property {Object} coords - The coordinates object.
 * @property {number} coords.latitude - The latitude of the current position.
 * @property {number} coords.longitude - The longitude of the current position.
 * 
 * @typedef {Object} DistanceResult
 * @property {number} distance - The calculated distance in miles.
 * 
 * @typedef {Object} RenderContentProps
 * @property {string} myActiveTab - The currently active tab.
 * @property {Function} mySetActiveTab - Function to set the active tab.
 * @property {Student} student - The student data.
 * @property {string} qrCode - The generated QR code URL.
 * @property {boolean} isWithinRadius - Indicates if the student is within the required radius.
 * @property {Array<Attendance>} filteredAttendance - The filtered attendance records.
 * @property {Array<StudentPoints>} studentsPoints - The points of students in the selected course.
 * @property {WeatherData} weatherData - The weather data.
 * @property {string} inviteCode - The invite code for joining a class.
 * @property {string} selectedClass - The selected class for filtering attendance.
 * @property {string} selectedDate - The selected date for filtering attendance.
 * @property {string} selectedCourse - The selected course for displaying the leaderboard.
 * @property {boolean} showCheckmark - Indicates if the checkmark should be shown.
 * @property {Function} fetchStudentData - Function to fetch student data.
 * @property {Function} generateQRCode - Function to generate a QR code.
 * @property {Function} confirmLogout - Function to confirm logout.
 * @property {Function} getWeather - Function to fetch weather data.
 * @property {Function} joinClass - Function to join a class.
 * @property {Function} leaveClass - Function to leave a class.
 * @property {Function} deg2rad - Function to convert degrees to radians.
 * @property {Function} getDistanceFromLatLonInMiles - Function to calculate distance between two coordinates in miles.
 * @property {Function} renderContent - Function to render the content based on the active tab.
 */
export default function Dashboard() {
    const [student, setStudent] = useState<Student | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [showCheckmark, setShowCheckmark] = useState(false);

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
    const fetchStudentData = async (givenStudentId: string) => {
        try {
            const res = await fetch('/api/getstudentbyid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: givenStudentId }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                return;
            }

            const data: Student = await res.json();
            const { studentId, studentName, studentEmail, classes } = data;

            if (data) {
                localStorage.setItem("studentData", JSON.stringify(data));
                setStudent(data);
                generateQRCode(data.studentId);
            } else {
                // router.push("/student");
                alert("this Error fetching student data.");
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
            router.push("/student");
        }
    };

    const generateQRCode = (studentId: string) => {
        const intervalId = setInterval(() => {
            const timestamp = new Date().toLocaleString();
            const qrData = `QRCODE$${studentId}$${timestamp}`;
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
                                setIsWithinRadius(true);
                            }
                        });
                    }
                    setIsWithinRadius(false);
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

            const filteredAttendance = student?.classes?.length
                ? student.classes.flatMap((cls) =>
                    cls.attendance
                        ? cls.attendance
                            .filter((att) => new Date(att.scheduledTime) <= new Date())
                            .map((att) => ({
                                ...att,
                                classId: cls.classId,
                                classPoints: cls.attendance.reduce((acc, att) => acc + att.points, 0),
                            }))
                        : []
                )
                .filter((att) => {
                    const matchesClass = selectedClass ? att.classId === selectedClass : true;
                    const matchesDate = selectedDate ? new Date(att.scheduledTime).toLocaleDateString('en-US', { timeZone: 'UTC' }) === new Date(selectedDate).toLocaleDateString('en-US', { timeZone: 'UTC' }) : true;
                    return matchesClass && matchesDate;
                })
                    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
                : [];


const [myActiveTab, mySetActiveTab] = useState('home'); // Track active tab


const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
const [inviteCode, setInviteCode] = useState<string>('');
const [studentsPoints, setStudentsPoints] = useState<Student[]>([]);

useEffect(() => {
    if (selectedCourse) {
        const fetchStudentsPoints = async () => {
            const res = await fetch('/api/getstudentsbycoursename', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseName: selectedCourse }),
            });
            const data = await res.json();
            setStudentsPoints(data);
        };
        fetchStudentsPoints();
    }
}, [selectedCourse]);

const [weatherData, setWeatherData] = useState<any | null>(null);
const getWeather = async () => {
    try {
        const res = await fetch('/api/getweather', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
  
        if (!res.ok) {
            const errorData = await res.json();
            console.error('Error Getting Weather:', errorData.message);
            return { success: false, message: errorData.message };
        }
  
        const data = await res.json();
        setWeatherData(data);
        return { success: true, message: data.message };
    } catch (error) {
        console.error('Error in weather function:', error);
        return { success: false, message: 'An error occurred while getting weather' };
    }
  };

  useEffect(() => {
    if (!weatherData) {
      getWeather();
    }
  }, [weatherData]);

const joinClass = async (requestedClassId: string) => {
    const res = await fetch('/api/joincourse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student?.studentId, courseId: requestedClassId }),
    });
    const data = await res.json();
    if (data.success) {
        if (student?.studentId) {
            fetchStudentData(student.studentId);
        }
        setInviteCode('');
    }
    return data;
}

const leaveClass = async (requestedClassId: string) => {
    try {
    const res = await fetch('/api/removestudent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student?.studentId, courseId: requestedClassId }),
    });
    const data = await res.json();
    
    alert("You have left the class.");
    setSelectedClass(null);
        if (student?.studentId) {
            fetchStudentData(student.studentId);
        }
    } catch (error) {
        console.error('Error in leaveClass function:', error);
        return { success: false, message: 'An error occurred while leaving class' };
    }}


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
                            <Image src={'/attendmatelogoblack.png'} alt="Profile" width={96} height={96} className="w-24 h-24" />
                            <h2 className="text-2xl font-semibold">{student.studentName}</h2>
                            <p className="text-gray-500">{student.studentEmail}</p>
                        </div>
                        <button
                            onClick={() => {
                                fetchStudentData(student.studentId);
                                setShowCheckmark(true);
                                setTimeout(() => setShowCheckmark(false), 2000); // Hide checkmark after 2 seconds
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 flex items-center"
                        >
                            Refresh
                            {showCheckmark && (
                                <span className="ml-2 text-green-500">
                                    ✔
                                </span>
                            )}
                        </button>
                        
                        <input
                            type="text"
                            placeholder="Enter invite code"
                            className="p-2 border rounded-md"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                        />
                        <button
                            onClick={async () => {
                                const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                                const originalClassId = inviteCode.split('').map((char) => {
                                    const index = alphabet.indexOf(char.toUpperCase());
                                    if (index === -1) return char;
                                    return alphabet[(index - 7 + alphabet.length) % alphabet.length];
                                }).join('');
                                const result = await joinClass(originalClassId);
                                if (result) {
                                    setInviteCode('');
                                    setShowCheckmark(true);
                                    setTimeout(() => setShowCheckmark(false), 2000);
                                } else {
                                    setInviteCode('');
                                    setShowCheckmark(false);
                                }
                                if (!result.success) {
                                    alert(result.message);
                                }
                            }}
                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300"
                        >
                            Join Class
                        </button>
                        <button
                            onClick={() => router.push('/student/chatbox')}
                            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-300"
                        >
                            Open Chat
                        </button>
                        <div>
                            <h3 className="text-lg font-bold mb-2">Weather</h3>
                            {weatherData && weatherData.data && weatherData.data.current && weatherData.data.hourly ? (
                            <div className="flex items-center space-x-4 h-24">
                                <img src="/weathericon.png" alt="Weather Icon" className="w-20 h-20" />
                                <div>
                                <p className="text-gray-600">
                                Temperature: {weatherData.data.current.temperature2m !== undefined ? Math.round(weatherData.data.current.temperature2m) : 'N/A'} °F
                                </p>
                                <p className="text-gray-600">
                                Wind Speed: {weatherData.data.current.windSpeed10m !== undefined ? Math.round(weatherData.data.current.windSpeed10m) : 'N/A'} MPH
                                </p>
                                <p className="text-gray-600">
                                Rain Percentage: {weatherData.data.hourly.averagePrecipitation !== undefined ? Math.round(weatherData.data.hourly.averagePrecipitation) : 'N/A'}%
                                </p>
                                </div>
                            </div>
                            ) : (
                            <p className="text-gray-600">Loading weather data...</p>
                            )}
                            {!weatherData && <p>Loading weather data...</p>}
                        </div>
                        <div className="flex items-center space-x-2">
                            <p className="text-lg font-semibold">
                                Total Points: {student.classes.reduce((acc, cls) => acc + cls.attendance.reduce((attAcc, att) => attAcc + att.points, 0), 0)}
                            </p>
                            <p className="text-lg font-semibold">Total Classes: {student.classes.length}</p>
                        </div>
                        <div className="flex flex-col items-start space-y-2">
                            <h3 className="text-lg font-semibold">Class Points</h3>
                            {student.classes.map((cls) => (
                                <div key={cls.classId} className="flex items-center space-x-2">
                                    <p className="text-lg">{cls.classId}:</p>
                                <p className="text-lg font-semibold">
                                    Points: {cls.attendance.reduce((acc, att) => acc + att.points, 0)}
                                </p>
                                </div>
                            ))}
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
                                                <p>{scheduledTime.toDateString()} {scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
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
                                <p className="text-lg font-semibold">
                                    Total Points: {student.classes.reduce((acc, cls) => acc + cls.attendance.reduce((attAcc, att) => attAcc + att.points, 0), 0)}
                                </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="flex flex-col items-center space-y-2">
                                <h1 className="text-5xl font-semibold">Location Required</h1>
                                <p className="text-lg font-semibold">You are not near NYIT yet to receive the QR code. Please come within 3 miles.</p>
                                
                                <p className="text-lg font-semibold text-center">Please avoid texting while driving. <br /> You can send an email with your location below.</p>
                                <a href="mailto:?subject=Excuse For Lateness&body=Excuse my Lateness" className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition duration-300">Send Email</a>
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
                {selectedClass && (
                        <button
                            onClick={() => leaveClass(selectedClass)}
                            className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-700 transition duration-300"
                        > Leave Class </button>
                    )}
                </div>

                <table className="min-w-full bg-white">
                <thead>
                    <tr>
                    <th className="py-2 px-4 border-b text-left">Date</th>
                    <th className="py-2 px-4 border-b text-left">Check-In Time</th>
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
                        <td className="py-2 px-4 border-b">{new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="py-2 px-4 border-b">{att.classId}</td>
                        <td className="py-2 px-4 border-b">{att.status.charAt(0).toUpperCase() + att.status.slice(1)}</td>
                        <td className="py-2 px-4 border-b">{att.points}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            );
        case 'leaderboard':
            return (
                <div className="flex flex-col items-center space-y-4">
                    <h2 className="text-2xl font-semibold">Leaderboard</h2>
                    <div className="flex flex-col items-start space-y-2">
                        <label htmlFor="courseSelect" className="text-lg font-semibold">Select Course</label>
                        <select
                            id="courseSelect"
                            className="p-2 border rounded-md"
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            {!selectedCourse && <option value="">Select a course</option>}
                            {student.classes.map((cls) => (
                                <option key={cls.classId} value={cls.classId}>
                                    {cls.classId}
                                </option>
                            ))}
                        </select>
                    </div>
                    {selectedCourse && (
                        <p className="text-lg font-semibold">Displaying leaderboard for class {selectedCourse}</p>
                    )}
                    {studentsPoints.length > 0 && (
                        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                            <thead className="bg-green-600 text-white">
                                <tr>
                                    <th className="py-2 px-4 border-b text-left">Student Name</th>
                                    <th className="py-2 px-4 border-b text-left">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentsPoints
                                    .map((studentPoint) => ({
                                        ...studentPoint,
                                        totalPoints: (studentPoint.classes.find((cls) => cls.classId === selectedCourse)?.attendance.reduce((acc, att) => acc + att.points, 0) ?? 0)
                                    }))
                                    .sort((a, b) => b.totalPoints - a.totalPoints)
                                    .map((studentPoint, index) => (
                                    <tr
                                        key={studentPoint.studentName}
                                        className={`${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'} hover:bg-gray-300 h-12`}
                                    >
                                        <td className={`py-2 px-4 border-b flex items-center h-12${index === 0 ? 'text-yellow-500 h-16 animate-pulse' : ''}`}>
                                            {index === 0 && (
                                                <>
                                                    <span className="text-yellow-500 font-bold">#1</span>
                                                    <Image src="/trophysymbol.svg" alt="Trophy" width={24} height={24} className="mr-2" />
                                                </>
                                            )}
                                            {studentPoint.studentName} {studentPoint.studentName === student.studentName ? "(You)" : ""}
                                        </td>
                                        <td className="py-2 px-4 border-b">{studentPoint.totalPoints}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
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
