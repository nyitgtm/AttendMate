import { MongoClient } from 'mongodb';

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