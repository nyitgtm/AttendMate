import { MongoClient } from 'mongodb';

/**
 * Handles the POST request to add a new attendance instance for a course.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - The response object indicating the result of the operation.
 *
 * @throws {Error} - Throws an error if there is an issue with the database connection or the request processing.
 *
 * The request body should contain:
 * @typedef {Object} RequestBody
 * @property {string} courseId - The ID of the course.
 * @property {string} scheduledTime - The scheduled time for the attendance instance.
 *
 * The response will be:
 * @typedef {Object} ResponseBody
 * @property {string} message - The message indicating the result of the operation.
 *
 * Possible response statuses:
 * - 200: Attendance instances added successfully.
 * - 404: No students found in the course.
 * - 500: Internal server error.
 */
export async function POST(req) {
    try {
        // Parse the request body
        const { courseId, scheduledTime } = await req.json();

        // Connect to the database
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db('attendmate');

        // Find all students in the course
        const students = await db.collection('students').find({ 'classes.classId': courseId }).toArray();

        // Check if students are found
        if (students.length === 0) {
            return new Response(JSON.stringify({ message: 'No students found in the course' }), { status: 404 });
        }

        // Iterate over each student and add the attendance instance
        for (const student of students) {
            const classIndex = student.classes.findIndex(cls => cls.classId === courseId);
            if (classIndex !== -1) {
            const newAttendance = {
                scheduledTime: new Date(new Date(scheduledTime).setDate(new Date(scheduledTime).getDate())).toISOString(),
                checkInTime: null,
                absent: null,
                points: 0
            };

            // Check if the attendance instance already exists
            const attendanceExists = student.classes[classIndex].attendance.some(att => att.scheduledTime === newAttendance.scheduledTime);
            if (attendanceExists) {
                continue; // Skip if the attendance instance already exists
            }

            student.classes[classIndex].attendance = [...student.classes[classIndex].attendance, newAttendance];

            // Save the updated student record
            await db.collection('students').updateOne(
                { studentId: student.studentId },
                { $set: { 'classes': student.classes } }
            );
            }
        }

        client.close();

        return new Response(JSON.stringify({ message: 'Attendance instances added successfully' }), { status: 200 });

    } catch (error) {
        console.error('Error in API route:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}