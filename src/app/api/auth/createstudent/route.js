import { MongoClient } from 'mongodb';

export async function POST(req) {
    const { studentId, studentName, studentEmail, password } = await req.json();

    let client;

    try {
        client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db('attendmate');

        // Check someone has the same studentId or studentEmail
        const studentExists = await db.collection('students').findOne({ $or: [{ studentId }, { studentEmail }] });
        if (studentExists) {
            return new Response(JSON.stringify({ message: 'Student already exists' }), { status: 400 });
        }

        // Create a new student object
        const newStudent = {
            studentId,
            studentName,
            studentEmail,
            password, // ensure to hash the password before storing it
            macAddress: '',
            classes: []
        };

        // Insert the new student into the database
        const result = await db.collection('students').insertOne(newStudent);

        // Successful response with the created student data
        return new Response(JSON.stringify({
            message: 'Student created successfully',
            student: newStudent
        }), {
            status: 201,
        });
    } catch (error) {
        return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    } finally {
        if (client) {
            client.close();
        }
    }
}