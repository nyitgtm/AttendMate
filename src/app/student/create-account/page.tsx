"use client"; // Ensure this component is rendered on the client-side

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

/**
 * The `StudentCreateAccount` component renders a form for creating a new student account.
 * It includes fields for email, student ID, full name, password, and password confirmation.
 * The form validates the input fields and displays appropriate error messages.
 * On successful form submission, it sends a POST request to the server to create the account.
 * If the account creation is successful, it redirects the user to the student login page.
 * 
 * @component
 * @returns {JSX.Element} The rendered component.
 * 
 * @example
 * <StudentCreateAccount />
 * 
 * @remarks
 * This component uses React hooks for state management and Next.js router for navigation.
 * It also includes basic form validation and error handling.
 */
export default function StudentCreateAccount() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [studentId, setStudentId] = useState('');
    const router = useRouter();
    const [fullName, setFullName] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        const res = await fetch('/api/auth/createstudent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: studentId, studentName: fullName, studentEmail: email, password: password}),
        });

        let data;
        try {
            data = await res.json();
        } catch (error) {
            data = { message: 'Invalid response from server' };
        }

        if (res.ok) {
            // Redirect to login page after successful account creation
            router.push("/student");
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
                    <h1 className="text-4xl font-bold">AttendMate <br /> Create Student Account </h1>
                    <p className="text-lg text-center">
                        Sign up to start tracking your attendance.
                    </p>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center py-12 px-6">
                <div className="max-w-md w-full bg-white p-8 shadow-md rounded-lg">
                    <h2 className="text-2xl font-semibold text-center text-gray-800">Create Account</h2>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        <div>
                            <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="email"
                                id="studentEmail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full mt-2 p-2 border ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'border-green-500' : 'border-red-500'} rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500`}
                                required
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student ID</label>
                            <input
                                type="text"
                                id="studentId"
                                value={studentId}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d{0,7}$/.test(value)) {
                                        setStudentId(value);
                                    }
                                }}
                                className="w-full mt-2 p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full mt-2 p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div className='py-10'>
                            <label htmlFor="studentPassword" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                id="studentPassword"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-2 p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />

                            <div className="mt-2"></div>

                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full mt-2 p-2 border ${password !== confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500`}
                                required
                            />
                        </div>

                        {message && <p className="mt-4 text-center text-red-600">{message}</p>}

                        <button
                            type="submit"
                            className={`w-full py-2 px-4 font-semibold rounded-md transition duration-200 ${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && /^\d{7}$/.test(studentId) && password && confirmPassword && fullName && password === confirmPassword ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
                            disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{7}$/.test(studentId) || !password || !confirmPassword || !fullName || password !== confirmPassword}
                        >
                            Create Account
                        </button>
                        <div className="py-5">
                            <p className="text-center text-gray-600">Already have an account?</p>
                        
                            <button
                                type="button"
                                onClick={() => router.push('/student')}
                                className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200 mt-4"
                            >
                                Login
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}