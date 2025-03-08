import { MongoClient, ServerApiVersion } from 'mongodb';

// MongoDB connection string
const uri = process.env.MONGODB_URI || "mongodb+srv://test123:Ltd0HC5UDEIPAkVH@cluster0.hxfim.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// MongoDB client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Database name
const dbName = 'fnfantasy';

// Connect to MongoDB
export async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db(dbName);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Disconnect from MongoDB
export async function disconnectFromDatabase() {
  try {
    await client.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
}

// Get MongoDB client
export function getClient() {
  return client;
}
