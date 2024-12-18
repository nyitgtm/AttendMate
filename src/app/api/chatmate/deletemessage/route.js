import { MongoClient } from 'mongodb';

/**
 * Handles the POST request to delete a message and its replies from the chat log.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<Response>} - The response object indicating the result of the operation.
 *
 * @async
 * @function POST
 *
 * @throws {Error} - Throws an error if there is an issue connecting to the database or processing the request.
 */
export async function POST(req) {
    const { classId, message, sender } = await req.json();

    let client;

    try {
        client = await MongoClient.connect(process.env.MONGODB_URI2);
        const db = client.db('attendmate2');

        // Find the chat log by classId
        const chatlog = await db.collection('messages').findOne({
            classId: classId
        });

        // Check if chat log is found
        if (!chatlog) {
            return new Response(JSON.stringify({ message: 'Chat log not found' }), { status: 404 });
        }

        console.log("Chat log fiubd");

        // Remove the message by text and sender
        await db.collection('messages').updateOne(
            { classId: classId },
            { $pull: { messages: { sender: sender, text: message } } }
        );

        // Remove replies associated with the message
        await db.collection('messages').updateMany(
            { classId: classId },
            { $pull: { 'messages.$[].replies': { sender: sender, text: message } } }
        );

        return new Response(JSON.stringify({ message: 'Message and its replies deleted successfully' }), {
            status: 200
        });
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
    } finally {
        if (client) {
            client.close();
        }
    }
}