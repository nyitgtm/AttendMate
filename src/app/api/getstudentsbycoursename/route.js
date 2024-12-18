import { MongoClient } from 'mongodb';

/**
 * Handles the POST request to get students by course name.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - The response object containing the list of students or an error message.
 *
 * @throws {Error} - Throws an error if there is an issue with the database connection or query.
 */
export async function POST(req) {
    try {
        // Extract the course name from the request body
        const { courseName } = await req.json();

        // Connect to the database
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db('attendmate');

        // Query the database for students who have this course in their classes array
        const students = await db.collection('students').find({
            'classes.classId': courseName // Adjust the query field to match your schema
        }).toArray();

        client.close();

        // Check if any students were found
        if (students.length === 0) {
            return new Response(JSON.stringify({ message: 'No students found' }), {
                status: 404,
            });
        }

        // Return the list of students as JSON
        return new Response(JSON.stringify(students), {
            status: 200,
        });
    } catch (error) {
        console.error('Error in API route:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), {
            status: 500,
        });
    }
}
