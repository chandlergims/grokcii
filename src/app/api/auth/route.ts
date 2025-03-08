import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// MongoDB connection string
const uri = process.env.MONGODB_URI || "mongodb+srv://test123:Ltd0HC5UDEIPAkVH@cluster0.hxfim.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = 'fnfantasy';

// Define user interface
interface User {
  _id?: ObjectId;
  walletAddress: string;
  createdAt: Date;
  teams: string[];
  notifications: any[];
}

// Define invite interface
interface Invite {
  _id?: ObjectId;
  teamId: string;
  teamName: string;
  walletAddress: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

// POST /api/auth - Authenticate a user
export async function POST(request: NextRequest) {
  const client = new MongoClient(uri);
  
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' }, 
        { status: 400 }
      );
    }
    
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection<User>('users');
    
    // Check if user exists
    let user = await usersCollection.findOne({ walletAddress: body.walletAddress });
    
    // If user doesn't exist, create a new one
    if (!user) {
      const newUser: User = {
        walletAddress: body.walletAddress,
        createdAt: new Date(),
        teams: [],
        notifications: []
      };
      
      const result = await usersCollection.insertOne(newUser);
      newUser._id = result.insertedId;
      user = newUser as any; // Type assertion to avoid TypeScript error
    }
    
    // Check for team invites
    const invitesCollection = db.collection<Invite>('invites');
    const invites = await invitesCollection.find({ 
      walletAddress: body.walletAddress,
      status: 'pending'
    }).toArray();
    
    // Create token using Buffer for consistent encoding/decoding
    const token = Buffer.from(JSON.stringify({
      walletAddress: body.walletAddress,
      timestamp: new Date().getTime()
    })).toString('base64');
    
    // Return user data and invites
    return NextResponse.json({
      user,
      invites,
      token
    }, { status: 200 });
  } catch (error) {
    console.error('Error authenticating user:', error);
    return NextResponse.json({ error: 'Failed to authenticate user' }, { status: 500 });
  } finally {
    await client.close();
  }
}
