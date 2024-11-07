'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function TeacherLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/auth/teacherlogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.success) {
      // Handle successful login (e.g., redirect)
      console.log('Login successful');
    } else {
      setError(data.message);
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
            Log in to manage your classes 
            <br />and attendance records.
          </p>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center py-12 px-6">
        <div className="max-w-md w-full bg-white p-8 shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold text-center text-gray-800">Teacher Login</h2>

          {error && <p className="text-red-500 text-center mt-4">{error}</p>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <label htmlFor="teacherEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                id="teacherEmail"
                placeholder="teacher@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="teacherPassword" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="teacherPassword"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-2 p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
            >
              Login as Teacher
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
