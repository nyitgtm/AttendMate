import { MongoClient } from 'mongodb';

export async function POST(req) {
    const { classId } = await req.json();

    let client;

    try {
        client = await MongoClient.connect(process.env.MONGODB_URI2);
        const db = client.db('attendmate2');

        // Find the student by studentId
        const chatlog = await db.collection('messages').findOne({
            classId: classId
        });

        // Check if student is found
        if (!chatlog) {
            return new Response(JSON.stringify({ message: 'Chats not found' }), { status: 404 });
        }
        
        return new Response(JSON.stringify({ messages: chatlog.messages }), {
            status: 200
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
