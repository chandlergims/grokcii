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

// GET /api/auth/me - Get current user
export async function GET(request: NextRequest) {
  const client = new MongoClient(uri);
  
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header is required' }, 
        { status: 401 }
      );
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Decode token
    let decodedToken;
    try {
      // Use Buffer for server-side decoding
      const decoded = Buffer.from(token, 'base64').toString();
      decodedToken = JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding token:', error);
      return NextResponse.json(
        { error: 'Invalid token format' }, 
        { status: 401 }
      );
    }
    
    // Extract wallet address from token
    const walletAddress = decodedToken.walletAddress;
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Invalid token: missing wallet address' }, 
        { status: 401 }
      );
    }
    
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection<User>('users');
    
    // Get user
    const user = await usersCollection.findOne({ walletAddress });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
    }
    
    // Check for team invites
    const invitesCollection = db.collection('invites');
    const invites = await invitesCollection.find({ 
      walletAddress: walletAddress,
      status: 'pending'
    }).toArray();
    
    return NextResponse.json({ 
      user,
      invites
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  } finally {
    await client.close();
  }
}
