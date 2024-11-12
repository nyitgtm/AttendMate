//src/app/student/dashboard/page.tsx

"use client"; // Ensure this component is rendered on the client-side

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
    const router = useRouter();

    useEffect(() => {
        // Make sure the effect is only run client-side, after the component is mounted
        const studentData = JSON.parse(localStorage.getItem("studentData") || "{}");

        console.log("Retrieved Student Data:", studentData);

        if (!studentData?.studentId) {
            console.log("No student data found, redirecting to login");
            router.push("/student"); // Redirect to login if no data is found
        } else {
            setStudent(studentData); // Set student data in the state
        }
    }, [router]); // Empty dependency array to ensure this effect only runs on mount

    if (!student) {
        return <p>Loading student data...</p>; // Optional loading message while data is being fetched
    }

    return (
        <div className="container">
            <h1>Welcome, {student.studentName}</h1>
            <h2>Your Attendance and Points</h2>
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
