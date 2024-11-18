'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QrScanner from '../components/QrScanner';

export default function TeacherLanding() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'present' | 'absent'>('present');
  const [isScanning, setIsScanning] = useState(false);
  const [isMiniboxVisible, setMiniboxVisible] = useState(false);
  const [isClassesModalOpen, setIsClassesModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | null>(null); // State for selected class
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Teacher Type Definition
  type Teacher = {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
    password: string;
    classes: {
      classId: string;
      className: string;
    }[];
  };

  // Mock student data
  const presentStudents = ['Student A', 'Student B', 'Student E'];
  const absentStudents = ['Student C', 'Student D'];

  // Sidebar component
  const Sidebar = ({ teacher }: { teacher: Teacher | null }) => {
    const router = useRouter();

    const handleLogout = () => {
      localStorage.removeItem('teacherData');
      router.push('/teacher');
    };

    if (!teacher) {
      return null;
    }

    return (
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-64 bg-blue-600 text-white p-6 space-y-8 transition-transform transform ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="text-center">
          <h3 className="text-xl font-semibold">{teacher.teacherName}</h3>
          <p className="text-sm">{teacher.teacherId}</p>
        </div>
        <div className="space-y-4 mt-4">
          <button
        onClick={handleLogout}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md"
          >
        Logout
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const storedData = localStorage.getItem('teacherData');

    if (storedData) {
      const teacherData = JSON.parse(storedData);
      setTeacher(teacherData);
    } else {
      router.push('/teacher/login');
    }
  }, [router]);

  const handleGenerateReport = () => {
    if (selectedClass) {
      setIsReportModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsReportModalOpen(false);
  };

  const handleTabChange = (tab: 'present' | 'absent') => {
    setActiveTab(tab);
  };

  const handlePrintReport = () => {
    const printContent = document.getElementById('report-content');
    if (printContent) {
      const printWindow = window.open('', '', 'height=500,width=800');
      printWindow?.document.write('<html><head><title>Attendance Report</title></head><body>');
      printWindow?.document.write(printContent?.innerHTML || '');
      printWindow?.document.write('</body></html>');
      printWindow?.document.close();
      printWindow?.print();
    }
  };

  const handleScanQRCode = () => {
    if (selectedClass) {
      setIsScanning(true);
      setTimeout(() => {}, 3000);
    }
  };

  const handleCloseScanBox = () => {
    setIsScanning(false);
  };

  const toggleMinibox = () => {
    setMiniboxVisible(!isMiniboxVisible);
  };

  const toggleManageClassesModal = () => {
    setIsClassesModalOpen(!isClassesModalOpen);
  };

  const handleClassSelect = (classId: string) => {
    setSelectedClass(classId);
    setIsClassesModalOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 relative text-black">
      <div className="flex-grow bg-white p-6">
        <header className="flex items-center justify-between bg-blue-600 text-white shadow-lg p-4">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/attendmatelogo.png"
                alt="AttendMate Logo"
                width={50}
                height={50}
                className="object-contain w-[50px] sm:w-[60px] md:w-[70px] lg:w-[80px] xl:w-[90px]"
              />
            </Link>
            <h1 className="ml-4 text-xl font-bold">AttendMate - Teacher Dashboard</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-blue-600 text-white p-2 rounded-md"
          >
            {sidebarOpen ? 'Close Profile' : 'Open Profile'}
          </button>
        </header>

        <main className="flex-grow p-6">
          {teacher ? (
            <h2 className="text-4xl font-extrabold text-center mb-6">Welcome, {teacher.teacherName}</h2>
          ) : (
            <h2 className="text-3xl font-semibold text-center mb-6">Loading...</h2>
          )}

            <h2 className="text-lg font-black text-center mb-6 text-red-500">
                {selectedClass ? (
                <span className="animate-pulse">Currently Managing Class {selectedClass}...</span>
                ) : (
              <>
                What would you like to do today?
                <br />
                <span className="animate-pulse">Select a class</span>
              </>
              )}
            </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              onClick={toggleManageClassesModal}
              className="p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition cursor-pointer"
            >
              <h3 className="text-lg font-bold mb-2">Manage Classes</h3>
              <p className="text-gray-600">View and manage your courses.</p>
            </div>

            <div
              onClick={selectedClass ? toggleMinibox : undefined}
              className={`p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition cursor-pointer w-full ${
              !selectedClass ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <h3 className="text-lg font-bold mb-2">Track Attendance</h3>
              <p className="text-gray-600">Click to track attendance.</p>
            </div>

            <div
              onClick={handleGenerateReport}
              className={`p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition cursor-pointer ${
                !selectedClass ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <h3 className="text-lg font-bold mb-2">Generate Reports</h3>
              <p className="text-gray-600">Create attendance and performance reports.</p>
            </div>

            <div
              onClick={handleScanQRCode}
              className={`p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition cursor-pointer ${
                !selectedClass ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <h3 className="text-lg font-bold mb-2">Scan QR Codes</h3>
              <p className="text-gray-600">Scan attendance of students</p>
            </div>
          </div>
        </main>

        <footer className="bg-gray-200 text-center py-4 fixed bottom-5 w-full">
          <p className="text-sm">&copy; 2024 AttendMate. All rights reserved.</p>
        </footer>
      </div>

      <Sidebar teacher={teacher} />

      {isMiniboxVisible && (
        <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 bg-white p-6 shadow-lg rounded-lg z-50 w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw]">
          <div className="flex justify-between items-center mb-4">
            <div className="w-1/2 text-center bg-blue-600 text-white py-2 rounded-l-lg">
              <h3 className="font-bold text-xl">Present</h3>
            </div>
            <div className="w-1/2 text-center bg-blue-600 text-white py-2 rounded-r-lg">
              <h3 className="font-bold text-xl">Absent</h3>
            </div>
          </div>

          <div className="flex">
            <div className="w-1/2 border-r-2 pr-4">
              <ul className="list-disc pl-5">
                {presentStudents.map((student, index) => (
                  <li key={index} className="flex items-center mb-2">
                    <span>{student}</span>
                    <span className="ml-2 text-green-600">✅</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-1px bg-gray-400"></div>

            <div className="w-1/2 pl-4">
              <ul className="list-disc pl-5">
                {absentStudents.map((student, index) => (
                  <li key={index} className="flex items-center mb-2">
                    <span>{student}</span>
                    <span className="ml-2 text-red-600">❌</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={toggleMinibox}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md mt-4"
          >
            Close
          </button>
        </div>
      )}

      {isScanning && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <QrScanner />
            <button
              onClick={handleCloseScanBox}
              className="mt-4 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isClassesModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <div className="mb-4">
              <h3 className="text-xl font-semibold">Manage Classes</h3>
              <p className="text-gray-600">Your courses</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <ul>
              {teacher && teacher.classes.map((teacherClass, index) => (
                <li
                key={index}
                onClick={() => handleClassSelect(teacherClass.classId)}
                className="py-3 px-6 border-b border-gray-200 text-lg font-semibold cursor-pointer hover:bg-gray-100 transition-all duration-200"
                >
                {teacherClass.classId + ": " + teacherClass.className}
                </li>
              ))}
              <li
                key="remove-class"
                onClick={() => {
                setSelectedClass(null);
                toggleManageClassesModal();
                }}
                className="py-3 px-6 border-b border-gray-200 text-lg font-semibold cursor-pointer hover:bg-red-100 transition-all duration-200 text-red-600"
              >
                Remove Current Class
              </li>
              </ul>
            </div>

            <button
              onClick={() => alert("Add a new course functionality coming soon!")}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md mt-4 hover:bg-blue-700 transition duration-200"
            >
              Add a Course
            </button>

            <button
              onClick={toggleManageClassesModal}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isReportModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-center">Generate Attendance Report</h3>
            </div>

            <div className="flex justify-center space-x-4 mb-4">
              <button
                onClick={() => handleTabChange('present')}
                className={`py-2 px-4 ${activeTab === 'present' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'} rounded-md`}
              >
                Present
              </button>
              <button
                onClick={() => handleTabChange('absent')}
                className={`py-2 px-4 ${activeTab === 'absent' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'} rounded-md`}
              >
                Absent
              </button>
            </div>

            <div id="report-content" className="mb-4">
              {activeTab === 'present' ? (
                <div>
                  <h4 className="text-lg font-semibold">Present Students</h4>
                  <ul className="list-disc pl-5">
                    {presentStudents.map((student, index) => (
                      <li key={index}>{student}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div>
                  <h4 className="text-lg font-semibold">Absent Students</h4>
                  <ul className="list-disc pl-5">
                    {absentStudents.map((student, index) => (
                      <li key={index}>{student}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={handlePrintReport}
                className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Print Report
              </button>
              <button
                onClick={handleCloseModal}
                className="py-2 px-4 bg-gray-400 text-white rounded-md hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}