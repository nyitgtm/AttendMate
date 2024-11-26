import { MongoClient } from 'mongodb';

export async function POST(req) {
    try {
        // Parse the request body
        const { teacherId, classId, className } = await req.json();

        // Connect to the database
        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db('attendmate');

    // Find the teacher by teacherId
    const teacher = await db.collection('teachers').findOne({ teacherId });

    if (!teacher) {
        client.close();
        throw new Error('Teacher not found');
    }

    // Check if the class with the same classId already exists
    const classExists = teacher.classes.some(cls => cls.classId === classId);

    if (classExists) {
        client.close();
        throw new Error('Class already exists');
    }

    // Add the new class to the teacher's classes array
    await db.collection('teachers').updateOne(
        { teacherId },
        { $push: { classes: { classId, className } } }
    );

    client.close();
    return new Response(JSON.stringify({ success: 'Class added successfully' }), { status: 200 });
}
catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
}
}