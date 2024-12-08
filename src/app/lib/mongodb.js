// lib/mongodb.js

import { MongoClient } from 'mongodb';

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local');
}

const options = {};

// Only create a new MongoClient instance in development
if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new MongoClient(process.env.MONGODB_URI, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(process.env.MONGODB_URI, options);
    clientPromise = client.connect();
}

/**
 * A promise that resolves to a MongoDB client instance.
 * This promise is used to ensure that the MongoDB client is initialized and connected before any database operations are performed.
 *
 * @type {Promise<MongoClient>}
 */
export default clientPromise;
