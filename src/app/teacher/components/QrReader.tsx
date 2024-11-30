import { useEffect, useRef, useState } from "react";
import "./QrStyles.css";
import QrScanner from "qr-scanner";

type Student = {
    selected: any;
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentPicture: string;
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
    myClassId: string | null;
}

const QrReader: React.FC<QrScannerProps> = ({ myClassId }) => {
    const scanner = useRef<QrScanner>();
    const videoEl = useRef<HTMLVideoElement>(null);
    const qrBoxEl = useRef<HTMLDivElement>(null);
    const [qrOn, setQrOn] = useState<boolean>(true);
    const [scannedResult, setScannedResult] = useState<string | undefined>("");
    const [students, setStudents] = useState<Student[] | null>(null);
    const [notification, setNotification] = useState('');
    const [notificationColor, setNotificationColor] = useState('');

    const onScanSuccess = (result: QrScanner.ScanResult) => {
        console.log(result);
        setScannedResult(result?.data);
        handleScanData(result?.data);
    };

    const onScanFail = (err: string | Error) => {
        console.log(err);
    };

    useEffect(() => {
        const loadStudents = async () => {
            if (myClassId) {
                await findStudents(myClassId);
            }
        };
        loadStudents();
    }, [myClassId]);

    useEffect(() => {
        if (students) {
            console.log('Students loaded:', students);
        }
    }, [students]);

    const handleScanData = async (data: string) => {
        if (!myClassId) {
            console.error('Class ID is null');
            return;
        }
        if (!data) return;

        let typeOfScan: string, studentId: string, date: string;
        if (data.length > 36 && data.length < 38) {
            [typeOfScan, studentId, date] = data.split('$');
        } else {
            setNotification('Invalid scan data format. Please try again.');
            setNotificationColor('#FF0000');
            return;
        }

        if (!typeOfScan || !studentId || !date) {
            setNotification('Invalid scan data format. Please try again.');
            setNotificationColor('#FF0000');
            return;
        }

        if (typeOfScan !== 'QRCODE') {
            setNotification('Invalid scan type. Please try again.');
            setNotificationColor('#FF0000');
            return;
        }

        if (studentId.length !== 7) {
            setNotification('Invalid student ID length. Please try again.');
            setNotificationColor('#FF0000');
            return;
        }

        const scanDate = new Date(date);
        const currentDate = new Date(new Date().toLocaleString());
        const timeDifference = (currentDate.getTime() - scanDate.getTime()) / 1000;

        if (isNaN(scanDate.getTime()) || timeDifference > 3) {
            setNotification('Invalid or expired scan date. Please try again.');
            setNotificationColor('#FF0000');
            return;
        }

        setNotification(`Scan registered for student ID: ${studentId}`);
        setNotificationColor('#0C0');
        updateAttendance(studentId, myClassId, scanDate, 'present', 5);
        const audio = new Audio('/bell.mp3');
        audio.play();
    };

    const findStudents = async (classId: string) => {    
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

    useEffect(() => {
        if (videoEl?.current && !scanner.current) {
            scanner.current = new QrScanner(videoEl?.current, onScanSuccess, {
                onDecodeError: onScanFail,
                preferredCamera: "user",
                highlightScanRegion: true,
                highlightCodeOutline: true,
                overlay: qrBoxEl?.current || undefined,
                maxScansPerSecond: 1 // Adjust this value to make scanning slower
            });

            scanner?.current
                ?.start()
                .then(() => setQrOn(true))
                .catch((err) => {
                    if (err) setQrOn(false);
                });
        }

        return () => {
            if (!videoEl?.current) {
                scanner?.current?.stop();
            }
        };
    }, []);

    return (
        <div className="qr-reader">
            <video ref={videoEl}></video>
            <div ref={qrBoxEl} className="qr-box">
                <img
                    src={"/qr-frame.svg"}
                    alt="Qr Frame"
                    width={256}
                    height={256}
                    className="qr-frame"
                />
            </div>
            {scannedResult && (
                <p
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        zIndex: 99999,
                        color: "white",
                    }}
                >
                    Scanned Result: {scannedResult}
                </p>
            )}
            {notification && (
                <p
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        zIndex: 99999,
                        color: notificationColor,
                    }}
                >
                    {notification}
                </p>
            )}
        </div>
    );
};

export default QrReader;