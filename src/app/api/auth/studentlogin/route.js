import { MongoClient } from 'mongodb';

/**
 * Handles the POST request for student login.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - The response object containing the login result.
 *
 * @async
 * @function POST
 *
 * @example
 * // Example usage:
 * const response = await POST(request);
 * const data = await response.json();
 * console.log(data.message); // 'Login successful!' or 'Invalid email or password'
 *
 * @throws {Error} - Throws an error if there is an issue with the database connection or query.
 */
export async function POST(req) {
    const { email, password } = await req.json();

    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('attendmate');
    const collection = db.collection('students');

    // Query using `studentEmail`
    const user = await collection.findOne({ studentEmail: email });

    if (!user) {
        client.close();
        return new Response(JSON.stringify({ message: 'Invalid email or password' }), {
            status: 401,
        });
    }

    // Compare the hashed password stored in the database with the provided password
    const isMatch = password === user.password; // Temp | haven't made the change to bcrypt yet

    if (!isMatch) {
        client.close();
        return new Response(JSON.stringify({ message: 'Invalid email or password' }), {
            status: 401,
        });
    }

    // Convert MongoDB's native types to normal types (e.g., `points` from `$numberInt`)
    const points = user.points?.$numberInt ? parseInt(user.points.$numberInt) : (user.points || 0);
    const classes = user.classes ? user.classes.map((classData) => ({
        classId: classData.classId,
        classPoints: classData.classPoints?.$numberInt ? parseInt(classData.classPoints.$numberInt) : (classData.classPoints || 0),
        attendance: classData.attendance.map((attendanceRecord) => {
            // Correctly format the scheduledTime and checkInTime if they are in MongoDB's $date format
            const scheduledTime = attendanceRecord.scheduledTime?.$date
                ? new Date(attendanceRecord.scheduledTime.$date).toISOString()
                : attendanceRecord.scheduledTime
                    ? new Date(attendanceRecord.scheduledTime).toISOString()
                    : null;
            const checkInTime = attendanceRecord.checkInTime?.$date
                ? new Date(attendanceRecord.checkInTime.$date).toISOString()
                : attendanceRecord.checkInTime
                    ? new Date(attendanceRecord.checkInTime).toISOString()
                    : null;

            return {
                ...attendanceRecord,
                scheduledTime,
                checkInTime,
                points: attendanceRecord.points?.$numberInt ? parseInt(attendanceRecord.points.$numberInt) : (attendanceRecord.points || 0)
            };
        }),
    })) : [];

    // Successful login response with user data
    client.close();
    return new Response(JSON.stringify({
        message: 'Login successful!',
        studentId: user.studentId,
        studentName: user.studentName,
        email: user.studentEmail,
        macAddress: user.macAddress,
        points,
        classes
    }), {
        status: 200,
    });
}
