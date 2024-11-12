import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs'; // Import bcryptjs for password hashing

export async function POST(req) {
    const { email, password } = await req.json();

    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('attendmate');
    const collection = db.collection('students');

    // Query using `studentEmail`
    const user = await collection.findOne({ studentEmail: email });

    if (!user) {
        client.close();
        return new Response(JSON.stringify({ message: 'Invalid email or password' }), {
            status: 401,
        });
    }

    // Compare the hashed password stored in the database with the provided password
    // const isMatch = await bcrypt.compare(password, user.password);
    const isMatch = password === user.password; //temp | havent made the change to bcrypt yet

    if (!isMatch) {
        client.close();
        return new Response(JSON.stringify({ message: 'Invalid email or password' }), {
            status: 401,
        });
    }

    // Successful login response with user data
    client.close();
    return new Response(JSON.stringify({ 
        message: 'Login successful!',
        studentId: user.studentId,
        studentName: user.studentName,
        points: user.points,
        classes: user.classes
    }), {
        status: 200,
    });
}
