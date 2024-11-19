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
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA')); // State for selected date
  const [currentWeather, setCurrentWeather] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [students, setStudents] = useState<Student[] | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  //Student Type Definition
  type Student = {
    selected: any;
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentPicture: string; // Add a field for profile picture URL
    classes: {
        classId: string;
        classPoints: number;
        attendance: {
            scheduledTime: string;
            checkInTime: string;
            status: string;
            points: number;
        }[];
    }[];
  };

  // Mock student data
  
  const [presentStudents, setPresentStudents] = useState<string[]>([]);
  const [absentStudents, setAbsentStudents] = useState<string[]>([]);

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
        className={`fixed top-0 right-0 w-64 bg-blue-600 text-white transition-transform transform ${
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



    // Fetch weather data initially and then every 60 seconds (1 minute)
    useEffect(() => {
      getWeather(); // Initial fetch
      const intervalId = setInterval(getWeather, 600000); // Update every 10 minutes

      // Cleanup the interval on component unmount
      return () => clearInterval(intervalId);
  }, []);

  const [myActiveTab, mySetActiveTab] = useState('home'); // Track active tab
  const renderContent = () => {
    switch (myActiveTab) {
      case 'home':
        return (
            <div>
            {teacher ? (
            <h2 className="text-6xl font-extrabold text-center mb-6">Welcome, {teacher.teacherName}</h2>
            ) : (
            <h2 className="text-4xl font-semibold text-center mb-6">Loading...</h2>
            )}

            <h2 className="text-2xl font-black text-center mb-6 text-red-500">
                {selectedClass ? (
                new Date(selectedDate + 'T00:00:00') < new Date(new Date().toLocaleDateString('en-CA') + 'T00:00:00') ? (
                  <span className="text-yellow-500">
                  Viewing Class {selectedClass} on {new Date(selectedDate + 'T00:00:00').toLocaleDateString()}
                  </span>
                ) : (
                  <span className="animate-pulse text-green-500">
                  Currently Managing Class {selectedClass}...
                  </span>
                )
                ) : (
                <>
                  What would you like to do today?
                  <br />
                  <span className="animate-pulse">Select a class</span>
                </>
                )}
            </h2>

            <div className="mt-6 flex justify-center space-x-4">
              <button
              onClick={toggleManageClassesModal}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
              >
              Select Class
              </button>
              <div>
              <label htmlFor="date" className="block text-lg font-bold mb-2">Select Date:</label>
              <input
                type="date"
                id="date"
                name="date"
                className="p-2 border rounded-md"
                value={selectedDate || new Date().toISOString().split('T')[0]}
                onChange={async (e) => {
                setSelectedDate(e.target.value);
                console.log('Selected date:', e.target.value);
                }}
                max={new Date().toLocaleDateString('en-CA')} // Prevent future dates
              />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2">Weather</h3>
              <p className="text-gray-600">{'Loading weather data...'}</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Weather</h3>
              {weatherData ? (
                <div>
                  <p className="text-gray-600">Temperature: {Math.round(weatherData.data.current.temperature2m)} °F</p>
                  <p className="text-gray-600">Wind Speed: {Math.round(weatherData.data.current.windSpeed10m)} MPH</p>
                  <p className="text-gray-600">Rain Percentage: {Math.round(weatherData.data.hourly.averagePrecipitation)}%</p>
                
                </div>
              ) : (
                <p className="text-gray-600">Loading weather data...</p>
              )}
            </div>
            

            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">Traffic Patterns</h3>
              <p className="text-gray-600">Moderate traffic on main roads</p>
            </div>
          </div>
        );

        case 'students':
          return <div>
                <div className="flex justify-between mb-4">
                <div className="flex-1 text-center bg-gray-200 py-2 rounded-l-lg">
                <h3 className="font-bold text-xl">Total</h3>
                <p>{students ? students.filter(student => {
                  const attendanceForDate = student.classes[0].attendance.find(
                    (attendance) => new Date(attendance.scheduledTime).toLocaleDateString('en-CA') === selectedDate
                  );
                  return attendanceForDate;
                  }).length : 0}</p>
                </div>
                <div className="flex-1 text-center bg-gray-200 py-2">
                <h3 className="font-bold text-xl">Remaining</h3>
                <p>{students ? students.filter(student => {
                  const attendanceForDate = student.classes[0].attendance.find(
                    (attendance) => new Date(attendance.scheduledTime).toLocaleDateString('en-CA') === selectedDate
                  );
                  return attendanceForDate && attendanceForDate.status !== 'present';
                  }).length : 0}</p>
                </div>
                <div className="flex-1 text-center bg-gray-200 py-2 rounded-r-lg">
                <h3 className="font-bold text-xl">Present</h3>
                <p>{students ? students.filter(student => {
                  const attendanceForDate = student.classes[0].attendance.find(
                    (attendance) => new Date(attendance.scheduledTime).toLocaleDateString('en-CA') === selectedDate
                  );
                  return attendanceForDate && attendanceForDate.status === 'present';
                  }).length : 0}</p>
                </div>
                </div>
              
              <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Student Name</th>
                  <th className="py-2 px-4 border-b text-right cursor-pointer" onClick={() => sortStudents('status')}>
                  Status
                  </th>
                  <th className="py-2 px-4 border-b text-right cursor-pointer" onClick={() => sortStudents('points')}>
                  Points
                  </th>
                  <th className="py-2 px-4 border-b text-right">Actions</th>
                </tr>
                </thead>
                <tbody>
                    {students && students.map((student, index) => {
                    const attendanceForDate = student.classes[0].attendance.find(
                      (attendance) => new Date(attendance.scheduledTime).toLocaleDateString('en-CA') === selectedDate
                    );
                    console.log(attendanceForDate);

                    if (!attendanceForDate) {
                      return null;
                    }

                    return (
                      <tr key={index} className={`hover:bg-green-100 ${student.selected ? 'bg-green-200' : ''}`}>
                      <td className="py-2 px-4 border-b text-left">{student.studentName}</td>
                      <td className="py-2 px-4 border-b text-right">
                        {attendanceForDate.status === 'present' ? 'Present' : 'Absent'}
                      </td>
                      <td className="py-2 px-4 border-b text-right">{attendanceForDate.points}</td>
                      <td className="py-2 px-4 border-b text-right relative">
                        <button
                          onClick={async () => {
                            const updatedStudents = students?.map((s, i) => i === index ? { ...s, selected: !s.selected } : s) || [];
                            setStudents(updatedStudents.filter((student): student is Student => student !== undefined));
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                        ...
                        </button>
                        {student.selected && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50" style={{ position: 'fixed', top: '50%', transform: 'translateY(-50%)' }}>
                          <div className="p-2 font-bold border-b">Override</div>
                          <button
                          onClick={async () => {
                            let updatedStatus = 'present';
                            if (attendanceForDate.status === 'present') {
                              updatedStatus = 'absent';}
                            const updatedStudents = students?.map((s, i) => {
                              if (i === index) {
                              const updatedAttendance = s.classes[0].attendance.map((att) =>
                                att.scheduledTime.split('T')[0] === selectedDate
                                ? { ...att, status: updatedStatus }
                                : att
                              );
                              const isPresent = presentStudents.includes(s.studentName);
                              if (isPresent) {
                              absentStudents.push(s.studentName);
                              presentStudents.splice(presentStudents.indexOf(s.studentName), 1);
                              } else {
                              presentStudents.push(s.studentName);
                              absentStudents.splice(absentStudents.indexOf(s.studentName), 1);
                              return { ...s, classes: [{ ...s.classes[0], attendance: updatedAttendance }] };
                              }
                            }
                            return s;
                            }) || [];

                          setStudents(updatedStudents);
                            
                          const attendanceStatus = presentStudents.includes(student.studentName) ? 'present' : 'absent';
                          await updateAttendance(
                          student.studentId,
                          selectedClass!,
                          new Date(selectedDate),
                          updatedStatus,
                          attendanceForDate.points
                          );
                            // setStudents(updatedStudents);
                            // const updatedStudentsClose = students?.map((s, i) => i === index ? { ...s, selected: false } : s) || [];
                            // setStudents(updatedStudentsClose);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                          {attendanceForDate.status === 'present' ? 'Mark Absent' : 'Mark Present'}
                          </button>
                          <div className="p-2 border-t">
                          <label className="block text-sm font-bold mb-1">Edit Points</label>
                          <input
                            type="number"
                            value={attendanceForDate.points}
                            onChange={async (e) => {
                            const updatedStudents = students?.map((s, i) => {
                              if (i === index) {
                              const updatedAttendance = s.classes[0].attendance.map((att) =>
                                att.scheduledTime.split('T')[0] === selectedDate
                                ? { ...att, points: parseInt(e.target.value) }
                                : att
                              );
                              return { ...s, classes: [{ ...s.classes[0], attendance: updatedAttendance }] };
                              }
                              return s;
                            }) || [];
                            setStudents(updatedStudents);
                            const attendanceStatus = presentStudents.includes(student.studentName) ? 'present' : 'absent';
                            await updateAttendance(
                              student.studentId,
                              selectedClass!,
                              new Date(selectedDate),
                              attendanceStatus,
                              parseInt(e.target.value)
                              );
                            }}
                            className="w-full p-1 border rounded-md"
                          />
                          </div>
                          <button
                          onClick={() => {
                            const updatedStudents = students?.map((s, i) => i === index ? { ...s, selected: false } : s) || [];
                            setStudents(updatedStudents);
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 p-1 border"
                          >
                          Close
                          </button>
                        </div>
                        )}
                      </td>
                      </tr>
                    );
                    })}
                </tbody>
              </table>
            </div>
          </div>;
      case 'scan':
        return <QrScanner />;
      case 'reports':
        return ( 
        <div>
          <div className="flex justify-between mb-4">
          <div className="flex-1 text-center bg-gray-200 py-2 rounded-l-lg">
          <h3 className="font-bold text-xl">Total</h3>
          <p>{students ? students.filter(student => {
            const attendanceForDate = student.classes[0].attendance.find(
              (attendance) => new Date(attendance.scheduledTime).toLocaleDateString('en-CA') === selectedDate
            );
            return attendanceForDate;
            }).length : 0}</p>
          </div>
          <div className="flex-1 text-center bg-gray-200 py-2">
          <h3 className="font-bold text-xl">Absent</h3>
          <p>{students ? students.filter(student => {
            const attendanceForDate = student.classes[0].attendance.find(
              (attendance) => new Date(attendance.scheduledTime).toLocaleDateString('en-CA') === selectedDate
            );
            return attendanceForDate && attendanceForDate.status !== 'present';
            }).length : 0}</p>
          </div>
          <div className="flex-1 text-center bg-gray-200 py-2 rounded-r-lg">
          <h3 className="font-bold text-xl">Present</h3>
          <p>{students ? students.filter(student => {
            const attendanceForDate = student.classes[0].attendance.find(
              (attendance) => new Date(attendance.scheduledTime).toLocaleDateString('en-CA') === selectedDate
            );
            return attendanceForDate && attendanceForDate.status === 'present';
            }).length : 0}</p>
          </div>
          </div>
          <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-left">Student Name</th>
                  <th className="py-2 px-4 border-b text-left">ID</th>
                  <th className="py-2 px-4 border-b text-right">Check-In Time</th>
                  <th className="py-2 px-4 border-b text-right">Status</th>
                  <th className="py-2 px-4 border-b text-right">Points</th>
                </tr>
                {/* list all students */}
                {students && students.map((student, index) => {
                  const attendanceForDate = student.classes[0].attendance.find(
                    (attendance) => new Date(attendance.scheduledTime).toLocaleDateString('en-CA') === selectedDate
                  );

                  if (!attendanceForDate) {
                    return null;
                  }

                  return (
                    <tr key={index}>
                      <td className="py-2 px-4 border-b text-left">{student.studentName}</td>
                      <td className="py-2 px-4 border-b text-left">{student.studentId}</td>
                      <td className="py-2 px-4 border-b text-right">
                        {new Date(attendanceForDate.checkInTime).toLocaleString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true,
                        })}
                      </td>
                        <td className="py-2 px-4 border-b text-right">
                        {attendanceForDate.status.charAt(0).toUpperCase() + attendanceForDate.status.slice(1)}
                        </td>
                      <td className="py-2 px-4 border-b text-right">{attendanceForDate.points}</td>
                    </tr>
                  );
                })}
                </thead>
              </table>
            </div>
            {/* Create Report button for absent / present / late students (include late in present students) */}
        </div>);
      default:
        return null;
    }
  };

  const sortStudents = (criteria: 'status' | 'points') => {
    if (students) {
      const sortedStudents = [...students].sort((a, b) => {
        if (criteria === 'status') {
          const aStatus = presentStudents.includes(a.studentName) ? 'Present' : 'Absent';
          const bStatus = presentStudents.includes(b.studentName) ? 'Present' : 'Absent';
          return aStatus.localeCompare(bStatus);
        } else if (criteria === 'points') {
          const aAttendance = a.classes[0].attendance.find(
            (attendance) => new Date(attendance.scheduledTime).toLocaleDateString('en-CA') === selectedDate
          );
          const bAttendance = b.classes[0].attendance.find(
            (attendance) => new Date(attendance.scheduledTime).toLocaleDateString('en-CA') === selectedDate
          );
          return (aAttendance?.points || 0) - (bAttendance?.points || 0);
        }
        return 0;
      });
      setStudents(sortedStudents.reverse());
    }
  };

const handleClassSelect = async (classId: string) => {
    setSelectedClass(classId);
    setIsClassesModalOpen(false);

    console.log('Selected class:', classId);

    const res = await fetch('/api/getstudentsbycoursename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseName: classId }), // Ensure key matches server-side expectations
    });

    const data = await res.json();

    if (res.ok) {
        setStudents(data); // Assuming data is an array of students
        const present = data.filter((student: Student) => 
            student.classes[0].attendance.some(att => att.status === 'present' && new Date(att.scheduledTime).toLocaleDateString('en-CA') === selectedDate)
        ).map((student: Student) => student.studentName);
        const absent = data.filter((student: Student) => 
            student.classes[0].attendance.some(att => att.status === 'absent' && new Date(att.scheduledTime).toLocaleDateString('en-CA') === selectedDate)
        ).map((student: Student) => student.studentName);
        setPresentStudents(present);
        setAbsentStudents(absent);
        console.log(data);
    } else {
        console.error(data.message); // Log error to console for debugging
        setStudents([]);
        setPresentStudents([]);
        setAbsentStudents([]);
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
      setWeatherData(data);
      return { success: true, message: data.message };
  } catch (error) {
      console.error('Error in updateAttendance function:', error);
      return { success: false, message: 'An error occurred while updating attendance' };
  }
};

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

  return (
    <div className="flex min-h-screen bg-gray-50 relative text-black">
      <div className="flex-grow bg-white">
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
          {selectedClass && (
            <span className="ml-4 text-lg font-semibold animate-pulse">
              Managing {selectedClass}
            </span>
          )}
          </div>
            <div className="flex items-center space-x-7">
            <div className="text-base font-bold">
                <p id="live-time"></p>
                <script>
                {`
                  if (typeof window !== 'undefined') {
                    setInterval(() => {
                      document.getElementById('live-time').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long' }) + ' ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
                    }, 1000);
                  }
                `}
                </script>
            </div>
            {/* <input
              type="text"
              placeholder="Search..."
              className="p-2 rounded-md text-black"
            />
            <button className="bg-white text-blue-600 p-2 rounded-md">
              Search
            </button> */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="bg-blue-600 text-white p-2 rounded-md font-bold"
            >
              {sidebarOpen ? 'Close Profile' : 'Open Profile'}
            </button>
            </div>
        </header>

        <div className="flex flex-wrap items-center space-x-2 w-full p-5">
          <button
            onClick={() => mySetActiveTab('home')}
            className={`text-sm md:text-lg font-semibold py-2 px-2 md:px-4 rounded-md flex-1 h-12 ${myActiveTab === 'home' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
          >
            Home
          </button>
          <div className="h-8 border-l-2 border-gray-500"></div>
          <button
            onClick={() => selectedClass && mySetActiveTab('students')}
            className={`text-sm md:text-lg font-semibold py-2 px-2 md:px-4 rounded-md flex-1 h-12 ${myActiveTab === 'students' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'} ${!selectedClass ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            See Students
          </button>
          <div className="h-8 border-l-2 border-gray-500"></div>
            <button
            onClick={() => selectedClass && (new Date(selectedDate + 'T00:00:00').getTime() === new Date(new Date().toLocaleDateString('en-CA') + 'T00:00:00').getTime()) && mySetActiveTab('scan')}
            className={`text-sm md:text-lg font-semibold py-2 px-2 md:px-4 rounded-md flex-1 h-12 ${myActiveTab === 'scan' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'} ${!selectedClass || (new Date(selectedDate + 'T00:00:00').getTime() !== new Date(new Date().toLocaleDateString('en-CA') + 'T00:00:00').getTime()) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
            Scan
            </button>
          <div className="h-8 border-l-2 border-gray-500"></div>
          <button
            onClick={() => selectedClass && mySetActiveTab('reports')}
            className={`text-sm md:text-lg font-semibold py-2 px-2 md:px-4 rounded-md flex-1 h-12 ${myActiveTab === 'reports' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'} ${!selectedClass ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Reports
          </button>
        </div>

        <div className={`w-full h-2 ${
          selectedClass 
            ? (new Date(selectedDate + 'T00:00:00').getTime() === new Date(new Date().toLocaleDateString('en-CA') + 'T00:00:00').getTime()) 
              ? 'bg-green-500' 
              : 'bg-yellow-500' 
            : 'bg-red-500'
        } animate-pulse`}></div>

        {/* <main className="flex-grow p-6">
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
        </main> */}

        <main className="flex-grow p-6">{renderContent()}</main>

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
                    {students && students.map((student, index) => (
                      <li key={index}>{student.studentName}</li>
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