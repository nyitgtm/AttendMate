"use client"; // Ensure this component is rendered on the client-side

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function StudentLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch('/api/auth/studentlogin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        let data;
        try {
            data = await res.json();
        } catch (error) {
            data = { message: 'Invalid response from server' };
        }

        if (res.ok) {
            // Save student data to localStorage after successful login
            localStorage.setItem("studentData", JSON.stringify({
                studentId: data.studentId,
                studentName: data.studentName,
                classes: data.classes,
            }));

            // Redirect to dashboard after saving data
            router.push("/student/dashboard");
        } else {
            setMessage(data.message); // Handle errors
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <header className="flex flex-col bg-green-600 text-white shadow-lg">
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
                    <h1 className="text-4xl font-bold">AttendMate <br /> Student Login </h1>
                    <p className="text-lg text-center">
                        Check in for attendance <br /> and view your records.
                    </p>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center py-12 px-6">
                <div className="max-w-md w-full bg-white p-8 shadow-md rounded-lg">
                    <h2 className="text-2xl font-semibold text-center text-gray-800">Student Login</h2>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        <div>
                            <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="email"
                                id="studentEmail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full mt-2 p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="studentPassword" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                id="studentPassword"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-2 p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition duration-200"
                        >
                            Login as Student
                        </button>
                        <p className="text-center text-gray-600">New here?</p>
                        <button
                            type="button"
                            onClick={() => router.push('/student/create-account')}
                            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200 mt-4"
                        >
                            Create Account
                        </button>
                    </form>
                    {message && <p className="mt-4 text-center text-red-600">{message}</p>}
                </div>
            </main>
        </div>
    );
}
