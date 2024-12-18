'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QrScanner from '../components/QrScanner';

/**
 * TeacherLanding component represents the main dashboard for teachers.
 * It includes various states and functionalities such as managing classes,
 * tracking attendance, generating reports, and fetching weather data.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 *
 * @typedef {Object} Teacher
 * @property {string} teacherId - The unique identifier for the teacher.
 * @property {string} teacherName - The name of the teacher.
 * @property {string} teacherEmail - The email of the teacher.
 * @property {string} password - The password of the teacher.
 * @property {Array<{classId: string, className: string}>} classes - The classes managed by the teacher.
 *
 * @typedef {Object} Student
 * @property {any} selected - The selected state of the student.
 * @property {string} studentId - The unique identifier for the student.
 * @property {string} studentName - The name of the student.
 * @property {string} studentEmail - The email of the student.
 * @property {string} studentPicture - The URL of the student's profile picture.
 * @property {Array<{classId: string, attendance: Array<{scheduledTime: string, checkInTime: string, status: string, points: number}>}>} classes - The classes attended by the student.
 *
 * @typedef {Object} WeatherData
 * @property {Object} data - The weather data.
 * @property {Object} data.current - The current weather data.
 * @property {number} data.current.temperature2m - The current temperature in Fahrenheit.
 * @property {number} data.current.windSpeed10m - The current wind speed in MPH.
 * @property {Object} data.hourly - The hourly weather data.
 * @property {number} data.hourly.averagePrecipitation - The average precipitation percentage.
 *
 * @typedef {Object} Attendance
 * @property {string} scheduledTime - The scheduled time for the class.
 * @property {string} checkInTime - The check-in time for the student.
 * @property {string} status - The attendance status of the student (e.g., 'present', 'absent').
 * @property {number} points - The points awarded for attendance.
 *
 * @typedef {Object} Class
 * @property {string} classId - The unique identifier for the class.
 * @property {string} className - The name of the class.
 *
 * @typedef {Object} Report
 * @property {string} studentName - The name of the student.
 * @property {string} studentId - The unique identifier for the student.
 * @property {string} checkInTime - The check-in time for the student.
 * @property {string} status - The attendance status of the student.
 * @property {number} points - The points awarded for attendance.
 *
 * @typedef {Object} Tab
 * @property {'home' | 'students' | 'scan' | 'reports'} myActiveTab - The active tab in the dashboard.
 *
 * @typedef {Object} SidebarProps
 * @property {Teacher | null} teacher - The teacher data.
 *
 * @typedef {Object} ModalProps
 * @property {boolean} isOpen - The state of the modal (open or closed).
 * @property {Function} onClose - The function to close the modal.
 *
 * @typedef {Object} WeatherProps
 * @property {WeatherData | null} weatherData - The weather data.
 *
 * @typedef {Object} AttendanceProps
 * @property {Array<Student> | null} students - The list of students.
 * @property {Array<string>} presentStudents - The list of present students.
 * @property {Array<string>} absentStudents - The list of absent students.
 *
 * @typedef {Object} ClassProps
 * @property {Array<Class>} classes - The list of classes.
 *
 * @typedef {Object} ReportProps
 * @property {Array<Report>} reports - The list of reports.
 *
 * @typedef {Object} TabProps
 * @property {Tab} myActiveTab - The active tab in the dashboard.
 *
 * @typedef {Object} DateProps
 * @property {string} selectedDate - The selected date.
 * @property {string | null} selectedTime - The selected time.
 *
 * @typedef {Object} ErrorProps
 * @property {string | null} error - The error message.
 *
 * @typedef {Object} SidebarRef
 * @property {HTMLDivElement | null} sidebarRef - The reference to the sidebar element.
 *
 * @typedef {Object} RouterProps
 * @property {Function} router - The router function.
 *
 * @typedef {Object} ModalState
 * @property {boolean} isReportModalOpen - The state of the report modal (open or closed).
 * @property {boolean} isClassesModalOpen - The state of the classes modal (open or closed).
 * @property {boolean} isAddCourseModalOpen - The state of the add course modal (open or closed).
 * @property {boolean} isMiniboxVisible - The state of the minibox (visible or hidden).
 * @property {boolean} isScanning - The state of the scanning box (open or closed).
 *
 * @typedef {Object} State
 * @property {Teacher | null} teacher - The teacher data.
 * @property {boolean} sidebarOpen - The state of the sidebar (open or closed).
 * @property {boolean} isReportModalOpen - The state of the report modal (open or closed).
 * @property {'present' | 'absent'} activeTab - The active tab in the report modal.
 * @property {boolean} isScanning - The state of the scanning box (open or closed).
 * @property {boolean} isMiniboxVisible - The state of the minibox (visible or hidden).
 * @property {boolean} isClassesModalOpen - The state of the classes modal (open or closed).
 * @property {string | null} selectedClass - The selected class.
 * @property {string} selectedDate - The selected date.
 * @property {string | null} selectedTime - The selected time.
 * @property {WeatherData | null} weatherData - The weather data.
 * @property {Array<Student> | null} students - The list of students.
 * @property {Array<string>} presentStudents - The list of present students.
 * @property {Array<string>} absentStudents - The list of absent students.
 * @property {string | null} error - The error message.
 * @property {HTMLDivElement | null} sidebarRef - The reference to the sidebar element.
 * @property {Function} router - The router function.
 * @property {boolean} isAddCourseModalOpen - The state of the add course modal (open or closed).
 * @property {string} myActiveTab - The active tab in the dashboard.
 */
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
    if (!weatherData) {
      getWeather();
    }
  }, [weatherData]);

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
      const intervalId = setInterval(getWeather, 60000); 

      // Cleanup the interval on component unmount
      return () => clearInterval(intervalId);
  }, []);

  const [myActiveTab, mySetActiveTab] = useState('home'); // Track active tab
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const renderContent = () => {
    switch (myActiveTab) {
      case 'home':
        async function handleDeleteClass(selectedClass: string) {
          try {
            const res = await fetch('/api/deletecourse', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ teacherId: teacher!.teacherId, classId: selectedClass })
            });

            if (!res.ok) {
              const errorData = await res.json();
              console.error('Error deleting course:', errorData.message);
              return { success: false, message: errorData.message };
            }

            const data = await res.json();
            setTeacher((prevTeacher) => {
              if (prevTeacher) {
          return {
            ...prevTeacher,
            classes: prevTeacher.classes.filter((cls) => cls.classId !== selectedClass)
          };
              }
              return prevTeacher;
            });
            setSelectedClass(null);
            return { success: true, message: data.message };
          } catch (error) {
            console.error('Error in handleDeleteClass function:', error);
            return { success: false, message: 'An error occurred while deleting the course' };
          }
        }
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
                    <>
                        <span className="animate-pulse text-green-500">
                        Currently Managing Class {selectedClass}...
                        </span>
                        <br />
                        <span className="text-lg font-semibold text-black">
                        Invite Code: {selectedClass.split('').map((char) => {
                          const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                          const index = alphabet.indexOf(char.toUpperCase());
                          if (index === -1) return char;
                          return alphabet[(index + 7) % alphabet.length];
                        }).join('')}
                        </span>
                        <br />
                    </>
                  )
                ) : (
                <>
                  What would you like to do today?
                  <br />
                  <span className="animate-pulse">Select a class</span>
                </>
                )}
            {selectedClass && new Date(selectedDate + 'T00:00:00').toISOString().split('T')[0] === new Date().toISOString().split('T')[0] && (
                <div className='space-x-5'>
                <button
                  onClick={() => {
                  if (selectedClass) {
                    const confirmDelete = window.confirm(`Are you sure you want to delete the class ${selectedClass}?`);
                    if (confirmDelete) {
                    handleDeleteClass(selectedClass);
                    }
                  }
                  }}
                  className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-200"
                >
                  Delete Class
                </button>
                <button
                  onClick={() => router.push('/teacher/chatbox')}
                  className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition duration-200"
                >
                  Open Chat
                </button>
                </div>
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
              />
              {new Date(selectedDate + 'T00:00:00') > new Date(new Date().toLocaleDateString('en-CA') + 'T00:00:00') && selectedClass &&(
                <button
                  onClick={() => {
                    handleAddClassDate();
                  }}
                  className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200 m-4"
                >
                  Add Meeting
                </button>
              )}
              {new Date(selectedDate) > new Date(new Date().toLocaleDateString('en-CA') + 'T00:00:00') && (
                <div className="mt-4">
                  <label htmlFor="time" className="block text-lg font-bold mb-2">Select Time:</label>
                  <input
                  type="time"
                  id="time"
                  name="time"
                  className="p-2 border rounded-md"
                    onChange={(e) => {
                      const selectedTime = e.target.value;
                      setSelectedTime(selectedTime);
                    }}
                  />
                  </div>
                )}
              </div>
            </div>



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
            

            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">Traffic Patterns</h3>
              <p className="text-gray-600">Moderate traffic on main roads</p>
            </div>

          <div className="mt-6"></div>

            {selectedClass && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">All Students ({students?.length})</h3>
                  <button
                    onClick={() => handleClassSelect(selectedClass!)}
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
                  >
                    Refresh
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b text-left">Student Name</th>
                        <th className="py-2 px-4 border-b text-right">Student ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students && students.map((student, index) => (
                        <tr key={index} className={`${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'} hover:bg-gray-200`}>
                          <td className="py-2 px-4 border-b text-left">{student.studentName}</td>
                          <td className="py-2 px-4 border-b text-right">{student.studentId}</td>
                        <td className="py-2 px-4 border-b text-right">
                          <button
                            onClick={() => {
                              const confirmDelete = window.confirm(`Are you sure you want to remove ${student.studentName}?`);
                              if (confirmDelete) {
                                removeStudent(student.studentId);
                              }
                            }}
                            className="bg-red-600 text-white py-1 px-2 rounded-md hover:bg-red-700 transition duration-200"
                          >
                            Delete
                          </button>
                        </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        );

        case 'students':
          return <div>
                <div className="flex justify-between mb-4">
                <div className="flex-1 text-center bg-gray-200 py-2 rounded-l-lg">
                <h3 className="font-bold text-xl">Total</h3>
                <p>{students ? students.length : 0}</p>
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
                          {attendanceForDate.status === 'present' ? 'Mark Absent' : attendanceForDate.status === 'absent' ? 'Mark Present' : 'Mark Late'}
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
                            const attendanceStatus = presentStudents.includes(student.studentName) ? 'present' : absentStudents.includes(student.studentName) ? 'absent' : 'late';
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
        return <QrScanner classId={selectedClass} />;
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
                        {attendanceForDate.checkInTime ? new Date(attendanceForDate.checkInTime).toLocaleString('en-US', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true,
                        }) : '-'}
                      </td>
                        <td className="py-2 px-4 border-b text-right">
                        {attendanceForDate && attendanceForDate.status ? attendanceForDate.status.charAt(0).toUpperCase() + attendanceForDate.status.slice(1) : 'N/A'}
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
        //console.error(data.message); // Log error to console for debugging
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

const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
const handleAddCourse = async (classId: string, className: string) => {
  try {
    const res = await fetch('/api/addcourse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId: teacher!.teacherId, classId: classId, className: className })
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Error adding course:', errorData.message);
      return { success: false, message: errorData.message };
    }

    const data = await res.json();
    setTeacher((prevTeacher) => {
      if (prevTeacher) {
        return {
          ...prevTeacher,
          classes: [...prevTeacher.classes, { classId, className }]
        };
      }
      return prevTeacher;
    });
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Error in handleAddCourse function:', error);
    return { success: false, message: 'An error occurred while adding the course' };
  }
};

const handleAddClassDate = async () => {
  try {
    const res = await fetch('/api/addcoursedate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: selectedClass, scheduledTime: new Date(selectedDate + 'T' + (selectedTime || '00:00')) })
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Error adding course date:', errorData.message);
      return { success: false, message: errorData.message };
    }
    alert('Class date added successfully');
  } catch (error) {
    console.error('Error in handleAddClassDate function:', error);
    return { success: false, message: 'An error occurred while adding the class date' };
  }}

const removeStudent = async (studentId: string) => {
  try {
    const res = await fetch('/api/removestudent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: studentId, courseId: selectedClass })
    });

    if (!res.ok) {
      const errorData = await res.json();
      // console.error('Error removing student:', errorData.message);
      alert('Error removing student');
      return { success: false, message: errorData.message };
    }
    else {
      alert('Student removed successfully');
    }
  } catch (error) {
    console.error('Error in removeStudent function:', error);
    return { success: false, message: 'An error occurred while removing the student' };
  }}


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
            onClick={() => {
              if (selectedClass) {
                handleClassSelect(selectedClass);
                mySetActiveTab('students');
              }
            }}
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
        <div className="h-10"></div>
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
            {/* <QrScanner /> */}
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
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                  <th className="py-2 px-4 border-b text-left">Class</th>
                  <th className="py-2 px-4 border-b text-left">Invite Code</th>
                  </tr>
                </thead>
                <tbody>
                  {teacher && teacher.classes.map((teacherClass, index) => {
                  const shiftBy = 7;
                  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                  const mixedClassId = teacherClass.classId
                    .split('')
                    .map((char) => {
                      const index = alphabet.indexOf(char.toUpperCase());
                      if (index === -1) return char; // If character is not in the alphabet array, return it as is
                      return alphabet[(index + shiftBy) % alphabet.length];
                    })
                    .join('');
                  return (
                    <tr
                    key={index}
                    onClick={() => handleClassSelect(teacherClass.classId)}
                    className="cursor-pointer hover:bg-gray-100 transition-all duration-200"
                    >
                    <td className="py-3 px-6 border-b text-lg font-semibold">{teacherClass.classId + ": " + teacherClass.className}</td>
                    <td className="py-3 px-6 border-b text-lg font-semibold">{mixedClassId}</td>
                    </tr>
                  );
                  })}
                </tbody>
                </table>
              <li
                key="remove-class"
                onClick={() => {
                setSelectedClass(null);
                toggleManageClassesModal();
                }}
                className={`py-3 px-6 border-b border-gray-200 text-lg font-semibold  ${selectedClass ? 'hover:bg-red-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'} transition-all duration-200 text-red-600`}
              >
                Remove Current Selection
              </li>
              </ul>
            </div>

            <button
              onClick={() => {
                setIsAddCourseModalOpen(true);
              }}
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

      {isAddCourseModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <div className="mb-4">
              <h3 className="text-xl font-semibold">Add a New Course</h3>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                let classId = formData.get('classId') as string;
                classId = classId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                const className = formData.get('className') as string;
                const result = await handleAddCourse(classId, className);
                if (result.success) {
                  setIsAddCourseModalOpen(false);
                } else {
                  setError(result.message);
                }
              }}
            >
              <div className="mb-4">
                <label htmlFor="classId" className="block text-sm font-bold mb-2">
                  Class ID
                </label>
                <input
                  type="text"
                  id="classId"
                  name="classId"
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="className" className="block text-sm font-bold mb-2">
                  Class Name
                </label>
                <input
                  type="text"
                  id="className"
                  name="className"
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              {error && <p className="text-red-600 mb-4">{error}</p>}
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddCourseModalOpen(false)}
                  className="py-2 px-4 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}