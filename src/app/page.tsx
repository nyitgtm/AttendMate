import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      {/* Header Section with Animations */}
      <header className="flex flex-col items-center justify-center py-8 md:py-20 bg-opacity-80 backdrop-blur-md animate-fadeIn">
        <h1 className="text-5xl font-extrabold text-center py-2 animate-slideIn">AttendMate</h1>
        <div className="w-sm max-w-xs mb-4">
          <Image
            src="/attendmatelogo.png" // Ensure your logo is placed in the public folder as 'logo.png'
            alt="AttendMate Logo"
            layout="responsive" // Ensures the image scales dynamically
            width={1} // Set width and height to 1 to use the container's width
            height={1} // Keeps aspect ratio and scales with the div
            className="object-contain" // Ensures the logo fits within the container
          />
        </div>
        <p className="mt-4 text-xl md:text-2xl max-w-lg text-center animate-fadeIn opacity-70">
          Simplify attendance tracking in your classroom. 
          <br />
          Choose your login type below to get started.
        </p>
      </header>


      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center space-y-8 px-6">
        {/* Teacher Login Link */}
        <Link href="/teacher" className="w-full max-w-sm py-4 px-8 bg-blue-700 text-white font-semibold text-xl text-center rounded-xl shadow-lg transform transition duration-300 hover:scale-105 hover:bg-blue-800 hover:shadow-xl hover:ring-2 hover:ring-blue-400 active:scale-95">
          <span className="block animate-buttonText">Teacher Login</span>
        </Link>

        {/* Student Login Link */}
        <Link href="/student" className="w-full max-w-sm py-4 px-8 bg-green-700 text-white font-semibold text-xl text-center rounded-xl shadow-lg transform transition duration-300 hover:scale-105 hover:bg-green-800 hover:shadow-xl hover:ring-2 hover:ring-green-400 active:scale-95">
          <span className="block animate-buttonText">Student Login</span>
        </Link>
        
        {/* Reviews Section */}
        <section className="w-full py-12 px-6 mt-16 bg-opacity-30 bg-white rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">What Our Users Are Saying</h2>
          
          {/* Horizontal Scrolling Container */}
          <div className="relative overflow-x-auto">
            {/* Review Cards Container */}
            <div className="flex space-x-8 pb-6">
              {/* First set of reviews */}
              <div className="w-80 flex-none bg-white p-6 rounded-xl shadow-md space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-blue-600 text-white flex items-center justify-center rounded-full font-semibold">
                    T
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center text-black">Mr. John Smith</h3>
                <p className="text-gray-600 text-center">
                  "AttendMate has truly revolutionized my classroom management. I can track attendance in real-time with ease, and my students love how quick and smooth the process is. This is hands-down the best attendance app ever!"
                </p>
              </div>

              <div className="w-80 flex-none bg-white p-6 rounded-xl shadow-md space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-600 text-white flex items-center justify-center rounded-full font-semibold">
                    S
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center text-black">Sophie Williams</h3>
                <p className="text-gray-600 text-center">
                  "As a student, I love how easy and fast it is to mark my attendance. No more waiting around! The app is user-friendly and makes the process so much more efficient. I highly recommend it!"
                </p>
              </div>

              <div className="w-80 flex-none bg-white p-6 rounded-xl shadow-md space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-red-600 text-white flex items-center justify-center rounded-full font-semibold">
                    T
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center text-black">Ms. Emily Parker</h3>
                <p className="text-gray-600 text-center">
                  "I’ve used a lot of attendance apps before, but AttendMate is by far the most efficient and intuitive. It’s a time-saver, and my students love the QR code check-in feature!"
                </p>
              </div>

              <div className="w-80 flex-none bg-white p-6 rounded-xl shadow-md space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-yellow-600 text-white flex items-center justify-center rounded-full font-semibold">
                    S
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center text-black">Alex Johnson</h3>
                <p className="text-gray-600 text-center">
                  "AttendMate is an amazing app! The QR code login makes it super fast to check in for class. No hassle, no delays. I wish all apps were this easy to use!"
                </p>
              </div>

              {/* New Reviews Added */}
              <div className="w-80 flex-none bg-white p-6 rounded-xl shadow-md space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-indigo-600 text-white flex items-center justify-center rounded-full font-semibold">
                    T
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center text-black">Dr. Kevin Foster</h3>
                <p className="text-gray-600 text-center">
                  "AttendMate has made my life as a teacher so much easier. The automated attendance system and real-time updates are a game-changer!"
                </p>
              </div>

              <div className="w-80 flex-none bg-white p-6 rounded-xl shadow-md space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-purple-600 text-white flex items-center justify-center rounded-full font-semibold">
                    S
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center text-black text-black">Rachel Adams</h3>
                <p className="text-gray-600 text-center">
                  "I use AttendMate for my virtual classes, and it's been fantastic! The QR code feature is especially useful for quick check-ins. It’s efficient and so easy to use!"
                </p>
              </div>

              <div className="w-80 flex-none bg-white p-6 rounded-xl shadow-md space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-pink-600 text-white flex items-center justify-center rounded-full font-semibold">
                    T
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center text-black">Mr. Paul Wright</h3>
                <p className="text-gray-600 text-center">
                  "I highly recommend AttendMate. It's not only quick but also has a sleek, user-friendly interface. My students appreciate how simple the attendance process has become."
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 bg-opacity-80 bg-gray-800 text-center text-gray-300">
        © {new Date().getFullYear()} AttendMate - Innovating classroom experiences
        <br />
        Built by SBT
      </footer>
    </div>
  );
}
