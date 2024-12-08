import { MongoClient } from 'mongodb';

/**
 * Handles the POST request to update student attendance.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - The response object indicating the result of the operation.
 *
 * @throws {Error} - Throws an error if there is an issue with the database connection or query execution.
 *
 * @example
 * // Example request body:
 * // {
 * //   "studentId": "12345",
 * //   "classId": "67890",
 * //   "date": "2023-10-05T00:00:00.000Z",
 * //   "status": "present",
 * //   "points": 10
 * // }
 *
 * @description
 * This function updates the attendance record for a student in a specific class on a given date.
 * If the attendance record for the specified date does not exist, it creates a new one.
 * If the attendance record exists, it updates the status and points.
 * The function connects to a MongoDB database, finds the student and class, and updates the attendance record accordingly.
 */
export async function POST(req) {
    try {
        // Parse the request body
        const { studentId, classId, date, status, points } = await req.json();

        // Connect to the database
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db('attendmate');

        // Parse the date for matching
        const dateRegex = new RegExp(`^${date.slice(0, 10)}`); // Match only the first 10 characters (YYYY-MM-DD)

        console.log('Query Inputs:', { studentId, classId, date, status, points });

        // Find the student by studentId
        const student = await db.collection('students').findOne({
            studentId: studentId,
            'classes.classId': classId,
        });

        // Check if student is found
        if (!student) {
            return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });
        }

        // Find the class index within the classes array
        const classIndex = student.classes.findIndex(cls => cls.classId === classId);
        if (classIndex === -1) {
            return new Response(JSON.stringify({ message: 'Class not found in student record' }), { status: 404 });
        }

        // Find the attendance index within the selected class's attendance array
        const attendanceIndex = student.classes[classIndex].attendance.findIndex(att => {
            const attendanceDate = new Date(att.scheduledTime).toISOString().slice(0, 10);
            return attendanceDate === date.slice(0, 10); // Compare only the date part (YYYY-MM-DD)
        });

        // If the attendance record is not found, create a new one
        if (attendanceIndex === -1) {
            const newAttendance = {
                scheduledTime: new Date(date),
                status: status,
                points: points,
                checkInTime: new Date()
            };
            student.classes[classIndex].attendance = [...student.classes[classIndex].attendance, newAttendance];
        } else {
            // Update the attendance status and points
            student.classes[classIndex].attendance[attendanceIndex].status = status;
            student.classes[classIndex].attendance[attendanceIndex].points = points;
            student.classes[classIndex].attendance[attendanceIndex].checkInTime = new Date();
        }

        // Save the updated student record
        const result = await db.collection('students').updateOne(
            { studentId: studentId },
            { $set: { 'classes': student.classes } } // Update the entire 'classes' array with the modified class
        );

        client.close();

        if (result.modifiedCount === 0) {
            return new Response(JSON.stringify({ message: 'Failed to update attendance' }), { status: 500 });
        }

        return new Response(JSON.stringify({ message: 'Attendance updated successfully' }), { status: 200 });

    } catch (error) {
        console.error('Error in API route:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}
