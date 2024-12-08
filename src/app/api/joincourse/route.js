import { MongoClient } from 'mongodb';

/**
 * Handles the POST request to enroll a student in a course.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - The response object indicating the result of the operation.
 *
 * @throws {Error} - Throws an error if there is an issue with the database connection or query.
 *
 * @async
 */
export async function POST(req) {
    try {
        // Parse the request body
        const body = await req.json();
        const studentId = body.studentId;
        const courseId = body.courseId;

        if (!studentId || !courseId) {
            return new Response(JSON.stringify({ message: 'Invalid request body' }), { status: 400 });
        }

        // Connect to the database
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db('attendmate');

        // Find the student by studentId
        const student = await db.collection('students').findOne({ studentId: studentId });

        // Check if student is found
        if (!student) {
            return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });
        }

        // Check if the student is already enrolled in the course
        const isEnrolled = Array.isArray(student.classes) && student.classes.some(cls => cls.classId === courseId);
        if (isEnrolled) {
            return new Response(JSON.stringify({ message: 'Student already enrolled in the course' }), { status: 400 });
        }

        // Check if the course exists in the teachers' classes
        const teacher = await db.collection('teachers').findOne({ 'classes.classId': courseId });

        if (!teacher) {
            return new Response(JSON.stringify({ message: 'Course not found in any teacher\'s classes' }), { status: 404 });
        }

        // Add the courseId to the student's classes
        const newClass = {
            classId: courseId,
            attendance: []
        };
        if (!Array.isArray(student.classes)) {
            student.classes = [];
        }
        student.classes.push(newClass);

        // Save the updated student record
        const result = await db.collection('students').updateOne(
            { studentId: studentId },
            { $set: { classes: student.classes } }
        );

        client.close();

        if (result.modifiedCount === 0) {
            return new Response(JSON.stringify({ message: 'Failed to enroll in the course' }), { status: 500 });
        }

        return new Response(JSON.stringify({ message: 'Enrolled in the course successfully' }), { status: 200 });

    } catch (error) {
        console.error('Error in API route:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}