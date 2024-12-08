import { MongoClient } from 'mongodb';

/**
 * Handles the POST request to remove a course from a student's classes.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - The response object indicating the result of the operation.
 *
 * @async
 * @function POST
 *
 * @throws {Error} - Throws an error if there is an issue connecting to the database or processing the request.
 *
 * @example
 * // Example request body:
 * // {
 * //   "studentId": "12345",
 * //   "courseId": "67890"
 * // }
 *
 * @description
 * This function performs the following steps:
 * 1. Parses the request body to extract `studentId` and `courseId`.
 * 2. Connects to the MongoDB database using the connection string from environment variables.
 * 3. Finds the student by `studentId` in the `students` collection.
 * 4. If the student is not found, returns a 404 response.
 * 5. Removes the specified course from the student's `classes` array.
 * 6. Updates the student's `classes` array in the database.
 * 7. Returns a 200 response with a success message and the updated classes array.
 * 8. Handles any errors by returning a 500 response with an error message.
 * 9. Closes the database connection in the `finally` block.
 */
export async function POST(req) {
    const { studentId, courseId } = await req.json();

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

        // Remove the course from the student's classes array
        const updatedClasses = student.classes.filter(classData => classData.classId !== courseId);

        // Update the student's classes array in the database
        await db.collection('students').updateOne(
            { studentId: studentId },
            { $set: { classes: updatedClasses } }
        );

        // Successful response
        return new Response(JSON.stringify({
            message: 'Course removed from student\'s classes',
            studentId: student.studentId,
            updatedClasses
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