import { MongoClient } from 'mongodb';
import { send } from 'process';

export async function POST(req) {
    const { classId, message, sender, isReply, replyingSender, replyingText } = await req.json();

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

        // Check if the message is a reply
        if (isReply) {
            // Find the message to reply to
            const messageToReplyTo = chatlog.messages.find(m => m.sender === replyingSender && m.text === replyingText);

            // Check if the message to reply to is found
            if (!messageToReplyTo) {
                return new Response(JSON.stringify({ message: 'Message to reply to not found' }), { status: 404 });
            }

            // Create a new reply object
            const newReply = {
                sender: sender,
                text: message,
            };

            // Update the message to reply to with the new reply
            await db.collection('messages').updateOne(
                { classId: classId, 'messages.sender': replyingSender, 'messages.text': replyingText },
                { $push: { 'messages.$.replies': newReply } }
            );

            return new Response(JSON.stringify({ message: 'Reply sent successfully' }), {
                status: 200
            });
        }

        // Create a new message object
        const newMessage = {
            sender: sender,
            text: message,
            replies: [],
        };

        // Update the chat log with the new message
        await db.collection('messages').updateOne(
            { classId: classId },
            { $push: { messages: newMessage } }
        );

        return new Response(JSON.stringify({ message: 'Message sent successfully' }), {
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
