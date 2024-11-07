// src/app/api/auth/login/route.js (if you're using Next.js 13 with the app directory)
// OR
// pages/api/auth/login.js (for Next.js projects with the pages directory)

import { MongoClient } from 'mongodb';

export async function POST(req) {
    const { email, password } = await req.json();

    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db('teachers');
    const collection = db.collection('logins');

    const user = await collection.findOne({ email });

    if (!user || user.password !== password) {
        client.close();
        return new Response(JSON.stringify({ message: 'Invalid email or password' }), {
            status: 401,
        });
    }

    client.close();
    return new Response(JSON.stringify({ message: 'Login successful!' }), {
        status: 200,
    });
}

// In older versions of Next.js (or in the pages directory), use:
// export default async function handler(req, res) {
//     if (req.method !== 'POST') return res.status(405).end();
//     // The rest of the code above goes here, using res.json({}) instead of `new Response(...)`.
// }
