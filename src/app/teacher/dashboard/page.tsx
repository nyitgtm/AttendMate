'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TeacherLanding() {
  const [teacherName, setTeacherName] = useState('');
  const router = useRouter();
  
  type Teacher = {
    teacherId: string; // Unique identifier for the teacher
    teacherName: string; // Teacher's full name
    teacherEmail: string; // Teacher's email address
    password: string; // Hashed password (Note: sensitive data should be handled securely)
    classes: {
      classId: string; // Unique identifier for the class
      className: string; // Name of the class
    }[]; // Array of classes the teacher is associated with
  };
  

  useEffect(() => {
    const storedData = localStorage.getItem('teacherData');

    if (storedData) {
      const { teacherName } = JSON.parse(storedData);
      setTeacherName(teacherName);
    } else {
      router.push('/teacher/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('teacherData');
    router.push('/teacher');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="flex items-center justify-between bg-blue-600 text-white shadow-lg p-4">
        <div className='flex items-center'>
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
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md"
        >
          Logout
        </button>
      </header>

      <main className="flex-grow p-6 text-black">
        <h2 className="text-2xl font-semibold text-center mb-6">Welcome, {teacherName}</h2>
        <h2 className="text-lg font-semibold text-center mb-6 text-red-500">What would you like to do today? <br></br> None of the buttons work as of right now, didnt program them</h2>
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
          <Link href="/teacher/reports">
            <div className="p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition">
              <h3 className="text-lg font-bold mb-2">Generate Reports</h3>
              <p className="text-gray-600">Create attendance and performance reports.</p>
            </div>
          </Link>
        </div>
      </main>

      <footer className="bg-gray-200 text-center py-4">
        <p className="text-sm">&copy; 2024 AttendMate. All rights reserved.</p>
      </footer>
    </div>
  );
}
