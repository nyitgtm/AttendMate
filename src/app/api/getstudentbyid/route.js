import { MongoClient } from 'mongodb';

/**
 * Handles the POST request to retrieve a student by their ID.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - The response object containing the student data or an error message.
 *
 * @async
 * @function POST
 *
 * @throws {Error} - Throws an error if there is an issue connecting to the database or processing the request.
 *
 * @example
 * // Example request body
 * // {
 * //   "studentId": "12345"
 * // }
 *
 * @example
 * // Example successful response
 * // {
 * //   "message": "Student found",
 * //   "studentId": "12345",
 * //   "studentName": "John Doe",
 * //   "studentEmail": "john.doe@example.com",
 * //   "macAddress": "00:1A:2B:3C:4D:5E",
 * //   "points": 100,
 * //   "classes": [
 * //     {
 * //       "classId": "67890",
 * //       "classPoints": 50,
 * //       "attendance": [
 * //         {
 * //           "scheduledTime": "2023-01-01T10:00:00.000Z",
 * //           "checkInTime": "2023-01-01T10:05:00.000Z",
 * //           "points": 10
 * //         }
 * //       ]
 * //     }
 * //   ]
 * // }
 *
 * @example
 * // Example error response
 * // {
 * //   "message": "Student not found"
 * // }
 */
export async function POST(req) {
    const { studentId } = await req.json();

    let client;

    try {
        client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db('attendmate');

        // Find the student by studentId
        const student = await db.collection('students').findOne({
            studentId: studentId
        });

        // Check if student is found
        if (!student) {
            return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });
        }

        // Convert MongoDB's native types to normal types (e.g., `points` from `$numberInt`)
        const points = student.points?.$numberInt ? parseInt(student.points.$numberInt) : (student.points || 0);
        const classes = student.classes ? student.classes.map((classData) => ({
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

        // Successful response with student data
        return new Response(JSON.stringify({
            message: 'Student found',
            studentId: student.studentId,
            studentName: student.studentName,
            studentEmail: student.studentEmail,
            macAddress: student.macAddress,
            points,
            classes
        }), {
            status: 200,
        });
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    } finally {
        if (client) {
            client.close();
        }
    }
}
