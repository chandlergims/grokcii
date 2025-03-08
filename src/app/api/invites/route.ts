import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// MongoDB connection string
const uri = process.env.MONGODB_URI || "mongodb+srv://test123:Ltd0HC5UDEIPAkVH@cluster0.hxfim.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = 'fnfantasy';

// Define invite interface
interface Invite {
  _id?: ObjectId;
  teamId: string;
  teamName: string;
  walletAddress: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

// POST /api/invites - Create a new invite
export async function POST(request: NextRequest) {
  const client = new MongoClient(uri);
  
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.teamId || !body.teamName || !body.walletAddress) {
      return NextResponse.json(
        { error: 'Team ID, team name, and wallet address are required' }, 
        { status: 400 }
      );
    }
    
    await client.connect();
    const db = client.db(dbName);
    const invitesCollection = db.collection<Invite>('invites');
    
    // Check if invite already exists
    const existingInvite = await invitesCollection.findOne({
      teamId: body.teamId,
      walletAddress: body.walletAddress,
      status: 'pending'
    });
    
    if (existingInvite) {
      return NextResponse.json(
        { error: 'Invite already exists' }, 
        { status: 409 }
      );
    }
    
    // Create invite
    const invite: Invite = {
      teamId: body.teamId,
      teamName: body.teamName,
      walletAddress: body.walletAddress,
      status: 'pending',
      createdAt: new Date()
    };
    
    const result = await invitesCollection.insertOne(invite);
    
    return NextResponse.json(
      { 
        message: 'Invite created successfully', 
        inviteId: result.insertedId,
        invite 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// PATCH /api/invites - Update invite status
export async function PATCH(request: NextRequest) {
  const client = new MongoClient(uri);
  
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.inviteId || !body.status) {
      return NextResponse.json(
        { error: 'Invite ID and status are required' }, 
        { status: 400 }
      );
    }
    
    // Validate status
    if (!['accepted', 'rejected'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Status must be either "accepted" or "rejected"' }, 
        { status: 400 }
      );
    }
    
    await client.connect();
    const db = client.db(dbName);
    const invitesCollection = db.collection<Invite>('invites');
    
    // Get the current invite
    const currentInvite = await invitesCollection.findOne({ _id: new ObjectId(body.inviteId) });
    
    if (!currentInvite) {
      return NextResponse.json(
        { error: 'Invite not found' }, 
        { status: 404 }
      );
    }
    
    // If the invite is already accepted, don't allow changing it
    if (currentInvite.status === 'accepted' && body.status === 'rejected') {
      return NextResponse.json(
        { error: 'Cannot leave a team after accepting an invite' }, 
        { status: 400 }
      );
    }
    
    // Update invite status
    const result = await invitesCollection.updateOne(
      { _id: new ObjectId(body.inviteId) },
      { $set: { status: body.status } }
    );
    
    // If invite is accepted, add user to team
    if (body.status === 'accepted') {
      // Update member status in the team
      const teamsCollection = db.collection('teams');
      await teamsCollection.updateOne(
        { 
          _id: new ObjectId(currentInvite.teamId),
          "members.walletAddress": currentInvite.walletAddress
        },
        { $set: { "members.$.status": "accepted" } }
      );
      
      // Add team to user's teams
      const usersCollection = db.collection('users');
      await usersCollection.updateOne(
        { walletAddress: currentInvite.walletAddress },
        { $addToSet: { teams: currentInvite.teamId } },
        { upsert: true }
      );
    }
    
    return NextResponse.json(
      { message: `Invite ${body.status}` }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating invite:', error);
    return NextResponse.json({ error: 'Failed to update invite' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// GET /api/invites - Get invites for a wallet address
export async function GET(request: NextRequest) {
  const client = new MongoClient(uri);
  
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' }, 
        { status: 400 }
      );
    }
    
    await client.connect();
    const db = client.db(dbName);
    const invitesCollection = db.collection<Invite>('invites');
    
    // Get invites for wallet address
    const invites = await invitesCollection.find({ 
      walletAddress,
      status: 'pending'
    }).toArray();
    
    return NextResponse.json({ invites }, { status: 200 });
  } catch (error) {
    console.error('Error fetching invites:', error);
    return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 });
  } finally {
    await client.close();
  }
}
