'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TeacherLanding() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); // State for modal
  const [activeTab, setActiveTab] = useState<'present' | 'absent'>('present'); // Active tab state
  const sidebarRef = useRef<HTMLDivElement | null>(null); // Ref for sidebar
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
      return null; // Return nothing if there's no teacher data
    }

    return (
      <div
        ref={sidebarRef} // Assign the ref to the sidebar div
        className={`fixed top-0 right-0 w-64 bg-blue-600 text-white p-6 space-y-8 transition-transform transform ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Profile Information */}
        <div className="text-center">
          <h3 className="text-xl font-semibold">{teacher.teacherName}</h3>
          <p className="text-sm">{teacher.teacherId}</p>
        </div>

        {/* Logout Button */}
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

  // Close sidebar if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false); // Close the sidebar if clicked outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch teacher data from localStorage
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
    setIsReportModalOpen(true); // Open the modal when the button is clicked
  };

  const handleCloseModal = () => {
    setIsReportModalOpen(false); // Close the modal
  };

  const handleTabChange = (tab: 'present' | 'absent') => {
    setActiveTab(tab); // Switch between tabs
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

  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {/* Main Content */}
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

          {/* Button to open/close the sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-blue-600 text-white p-2 rounded-md"
          >
            {sidebarOpen ? 'Close Profile' : 'Open Profile'}
          </button>
        </header>

        <main className="flex-grow p-6 text-black">
          {teacher ? (
            <h2 className="text-2xl font-semibold text-center mb-6">Welcome, {teacher.teacherName}</h2>
          ) : (
            <h2 className="text-2xl font-semibold text-center mb-6">Loading...</h2>
          )}

          <h2 className="text-lg font-semibold text-center mb-6 text-red-500">
            What would you like to do today? <br /> 
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/teacher/classes">
              <div className="p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition">
                <h3 className="text-lg font-bold mb-2">Manage Classes</h3>
                <p className="text-gray-600">View and manage your classes.</p>
              </div>
            </Link>
            <Link href="/teacher/attendance">
              <div className="p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition">
                <h3 className="text-lg font-bold mb-2">Track Attendance</h3>
                <p className="text-gray-600">Monitor student attendance easily.</p>
              </div>
            </Link>
            <div
              onClick={handleGenerateReport}
              className="p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition cursor-pointer"
            >
              <h3 className="text-lg font-bold mb-2">Generate Reports</h3>
              <p className="text-gray-600">Create attendance and performance reports.</p>
            </div>
            <Link href="/teacher/scanner">
              <div className="p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition">
                <h3 className="text-lg font-bold mb-2">Scan QR Codes</h3>
                <p className="text-gray-600">Scan attendance of students</p>
              </div>
            </Link>
          </div>
        </main>

        <footer className="bg-gray-200 text-center py-4">
          <p className="text-sm">&copy; 2024 AttendMate. All rights reserved.</p>
        </footer>
      </div>

      {/* Sidebar */}
      <Sidebar teacher={teacher} />

      {/* Modal for Generate Report */}
      {isReportModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-center">Generate Attendance Report</h3>
            </div>

            {/* Tabs for Present and Absent */}
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

            {/* Print and Close Buttons */}
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
