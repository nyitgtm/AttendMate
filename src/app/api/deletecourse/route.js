import { MongoClient } from 'mongodb';

/**
 * Handles the POST request to delete a class from a teacher's schedule and all students' schedules.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - The response object indicating the result of the operation.
 *
 * @throws {Error} - Throws an error if the teacher or class is not found, or if there is a database connection issue.
 */
export async function POST(req) {
    try {
        // Parse the request body
        const { teacherId, classId } = await req.json();

        // Connect to the database
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db('attendmate');

        // Find the teacher by teacherId
        const teacher = await db.collection('teachers').findOne({ teacherId });

        if (!teacher) {
            client.close();
            throw new Error('Teacher not found');
        }

        // Check if the class with the classId exists
        const classExists = teacher.classes.some(cls => cls.classId === classId);

        if (!classExists) {
            client.close();
            throw new Error('Class not found');
        }
        // Remove the class from all students' classes array
        await db.collection('students').updateMany(
            { 'classes.classId': classId },
            { $pull: { classes: { classId } } }
        );

        // Remove the class from the teacher's classes array
        await db.collection('teachers').updateOne(
            { teacherId },
            { $pull: { classes: { classId } } }
        );

        client.close();
        return new Response(JSON.stringify({ success: 'Class deleted successfully' }), { status: 200 });
    }
    catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}