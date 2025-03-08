import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// MongoDB connection string
const uri = process.env.MONGODB_URI || "mongodb+srv://test123:Ltd0HC5UDEIPAkVH@cluster0.hxfim.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = 'fnfantasy';

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
    let walletAddress;
    try {
      const decoded = JSON.parse(atob(token));
      walletAddress = decoded.walletAddress;
    } catch (error) {
      console.error('Error decoding token:', error);
      return NextResponse.json(
        { error: 'Invalid token format' }, 
        { status: 401 }
      );
    }
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Invalid token: missing wallet address' }, 
        { status: 401 }
      );
    }
    
    await client.connect();
    const db = client.db(dbName);
    const teamsCollection = db.collection('teams');
    
    // Find all teams where the user is a member or creator
    const teams = await teamsCollection.find({
      $or: [
        { createdBy: walletAddress },
        { 'members.walletAddress': walletAddress }
      ]
    }).toArray();
    
    // Add id field for frontend
    const teamsWithIds = teams.map(team => ({
      ...team,
      id: team._id.toString()
    }));
    
    return NextResponse.json({ teams: teamsWithIds });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' }, 
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
