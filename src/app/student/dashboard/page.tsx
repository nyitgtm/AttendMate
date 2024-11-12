"use client"; // Ensure this component is rendered on the client-side

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode"; // Import the QRCode library

type Student = {
    studentId: string;
    studentName: string;
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
    const [qrCode, setQrCode] = useState<string | null>(null); // State to store the QR code image URL
    const router = useRouter();

    useEffect(() => {
        // Fetch the student data from localStorage
        const studentData = JSON.parse(localStorage.getItem("studentData") || "{}");
        console.log("Retrieved Student Data:", studentData);

        if (!studentData?.studentId) {
            console.log("No student data found, redirecting to login");
            router.push("/student"); // Redirect to login if no data is found
        } else {
            setStudent(studentData); // Set student data in the state
            generateQRCode(studentData.studentId); // Generate QR code when student data is available
        }
    }, [router]);

    const generateQRCode = (studentId: string) => {
        // Use setInterval to update the QR code every second
        const intervalId = setInterval(() => {
            // Get the current timestamp to make the QR code unique
            const timestamp = Date.now();

            // Define the QR data with the student ID and timestamp
            const qrData = `${studentId}000${timestamp}`; //temp made to test and see if it works
            // change in the future to be more secure

            // Generate the QR code
            QRCode.toDataURL(qrData, (error, url) => {
                if (error) {
                    console.error("Error generating QR Code:", error);
                    return;
                }
                setQrCode(url); // Set the generated QR code as the image URL
            });
        }, 1000); // Update every 1000 ms (1 second)

        // Cleanup interval when the component unmounts
        return () => clearInterval(intervalId);
    };

    if (!student) {
        return <p>Loading student data...</p>; // Optional loading message while data is being fetched
    }

    return (
        <div className="container">
            <h1>Welcome, {student.studentName}</h1>
            <h2>Your Attendance and Points</h2>

            {/* Render QR code for this student */}
            <div>
                <h3>Your QR Code (updated every second):</h3>
                {qrCode ? (
                    <img src={qrCode} alt="Student QR Code" /> // Display the QR code
                ) : (
                    <p>Loading QR code...</p> // Display loading text while QR code is being generated
                )}
            </div>

            <div>
                {student.classes.map((classItem, index) => (
                    <div key={index}>
                        <h3>{classItem.classId}</h3>
                        <div>
                            <strong>Points:</strong> {classItem.classPoints}
                        </div>
                        <div>
                            <strong>Attendance:</strong>
                            {classItem.attendance.map((entry, idx) => (
                                <div key={idx}>
                                    {entry.status} at {new Date(entry.scheduledTime).toLocaleString()}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
