'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TeacherLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/auth/teacherlogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      setMessage('Failed to parse response');
      return;
    }

    if (response.ok) {
      // Save teacher data to localStorage after successful login
      localStorage.setItem("teacherData", JSON.stringify({
        teacherId: data.teacherId,
        teacherName: data.teacherName,
        classes: data.classes,
      }));

      // Redirect to dashboard after saving data
      router.push("/teacher/dashboard");
    } else {
      setMessage(data.message); // Handle errors
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="flex flex-col bg-blue-600 text-white shadow-lg">
        <div className='m-2'>
          <Link href="/">
            <Image
              src="/attendmatelogo.png"
              alt="AttendMate Logo"
              width={50}
              height={50}
              className="mr-4 object-contain w-[50px] sm:w-[60px] md:w-[70px] lg:w-[80px] xl:w-[90px]"
            />
          </Link>
        </div>

        <div className="flex flex-col text-center py-5">
          <h1 className="text-4xl font-bold">AttendMate <br /> Teacher Login </h1>
          <p className="text-lg text-center">
            Log in to manage your classes <br /> and attendance records.
          </p>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-12 px-6">
        <div className="max-w-md w-full bg-white p-8 shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold text-center text-gray-800">Teacher Login</h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <label htmlFor="teacherEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                id="teacherEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="teacherPassword" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="teacherPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
            >
              Login as Teacher
            </button>
          </form>
          {message && <p className="mt-4 text-center text-red-600">{message}</p>}
        </div>
      </main>
    </div>
  );
}
