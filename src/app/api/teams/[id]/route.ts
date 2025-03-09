import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// MongoDB connection string
const uri = process.env.MONGODB_URI || "mongodb+srv://test123:Ltd0HC5UDEIPAkVH@cluster0.hxfim.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = 'fnfantasy';

// Admin wallet addresses with special permissions
const ADMIN_WALLETS = [
  'AEnb3z3o8NoVH5r7ppVWXw2DCu84S8n1L5MsP1Hpz5wT'
];

// Define team member interface
interface TeamMember {
  id: string;
  name: string;
  walletAddress: string;
}

// Define team interface
interface Team {
  _id?: ObjectId;
  name: string;
  members: TeamMember[];
  twitterLink?: string;
  bannerUrl?: string;
  createdAt: Date;
  createdBy: string;
}

// GET /api/teams/:id - Get a specific team
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // Ensuring the type of params is correct
) {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const teamsCollection = db.collection<Team>('teams');

    // Get team
    const team = await teamsCollection.findOne({ _id: new ObjectId(params.id) });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ team }, { status: 200 });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// PATCH /api/teams/:id - Update a team
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } } // Same here, correctly typing the params
) {
  const client = new MongoClient(uri);

  try {
    const body = await request.json();

    await client.connect();
    const db = client.db(dbName);
    const teamsCollection = db.collection<Team>('teams');

    // Create update object
    const updateData: Partial<Team> = {};

    if (body.name) updateData.name = body.name;
    if (body.twitterLink !== undefined) updateData.twitterLink = body.twitterLink;

    // Update team
    const result = await teamsCollection.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Get updated team
    const updatedTeam = await teamsCollection.findOne({ _id: new ObjectId(params.id) });

    return NextResponse.json(
      {
        message: 'Team updated successfully',
        team: updatedTeam
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// DELETE /api/teams/:id - Delete a team
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } } // Same fix for params
) {
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
      const decoded = Buffer.from(token, 'base64').toString();
      const decodedJson = JSON.parse(decoded);
      walletAddress = decodedJson.walletAddress;
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
    
    // Check if user is an admin
    const isAdmin = ADMIN_WALLETS.includes(walletAddress);

    await client.connect();
    const db = client.db(dbName);
    const teamsCollection = db.collection<Team>('teams');

    // Get team first to get member wallets
    const team = await teamsCollection.findOne({ _id: new ObjectId(params.id) });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to delete this team
    // Allow if user is an admin or the team creator
    if (!isAdmin && team.createdBy !== walletAddress) {
      return NextResponse.json(
        { error: 'You are not authorized to delete this team' },
        { status: 403 }
      );
    }

    // Delete team
    await teamsCollection.deleteOne({ _id: new ObjectId(params.id) });

    // Remove team from users' teams
    const usersCollection = db.collection('users');
    const memberWallets = team.members.map(member => member.walletAddress);
    const teamIdString = team._id.toString();

    await usersCollection.updateMany(
      { walletAddress: { $in: memberWallets } },
      { $pull: { teams: teamIdString } as any }
    );

    // Delete all invites for this team
    const invitesCollection = db.collection('invites');
    await invitesCollection.deleteMany({ teamId: teamIdString });

    return NextResponse.json(
      { message: 'Team deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
  } finally {
    await client.close();
  }
}
