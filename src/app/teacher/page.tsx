'use client';

import { useState } from 'react';

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
      <header className="flex flex-col items-center justify-center py-10 bg-blue-600 text-white shadow-lg">
        <h1 className="text-4xl font-bold">Teacher Login - AttendMate</h1>
        <p className="mt-4 text-lg max-w-lg text-center">
          Log in to manage your classes and attendance records.
        </p>
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
