export default function TeacherLogin() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="flex flex-col items-center justify-center py-10 bg-blue-700 text-white shadow-lg">
        <h1 className="text-4xl font-bold">Teacher Login - AttendMate</h1>
        <p className="mt-4 text-lg max-w-lg text-center">
          Access attendance tools and monitor student participation.
        </p>
      </header>

      <main className="flex-grow flex items-center justify-center py-12 px-6">
        <div className="max-w-md w-full bg-white p-8 shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold text-center text-gray-800">Teacher Login</h2>

          <form className="mt-6 space-y-6">
            <div>
              <label htmlFor="teacherEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                id="teacherEmail"
                placeholder="teacher@example.com"
                className="w-full mt-2 p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label htmlFor="teacherPassword" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="teacherPassword"
                placeholder="••••••••"
                className="w-full mt-2 p-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-700 text-white font-semibold rounded-md hover:bg-blue-800 transition duration-200"
            >
              Login as Teacher
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
