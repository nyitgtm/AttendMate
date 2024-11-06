export default function StudentLogin() {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="flex flex-col items-center justify-center py-10 bg-green-600 text-white shadow-lg">
          <h1 className="text-4xl font-bold">Student Login - AttendMate</h1>
          <p className="mt-4 text-lg max-w-lg text-center">
            Check in for attendance and view your records.
          </p>
        </header>
  
        <main className="flex-grow flex items-center justify-center py-12 px-6">
          <div className="max-w-md w-full bg-white p-8 shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold text-center text-gray-800">Student Login</h2>
  
            <form className="mt-6 space-y-6">
              <div>
                <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  id="studentEmail"
                  placeholder="student@example.com"
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label htmlFor="studentPassword" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  id="studentPassword"
                  placeholder="••••••••"
                  className="w-full mt-2 p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
  
              <button
                type="submit"
                className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition duration-200"
              >
                Login as Student
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }
  