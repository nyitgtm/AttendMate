import { MongoClient } from 'mongodb';

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