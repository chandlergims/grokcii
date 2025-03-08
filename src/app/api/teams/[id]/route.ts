import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// MongoDB connection string
const uri = process.env.MONGODB_URI || "mongodb+srv://test123:Ltd0HC5UDEIPAkVH@cluster0.hxfim.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = 'fnfantasy';

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
  createdAt: Date;
}

// GET /api/teams/:id - Get a specific team
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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
  { params }: { params: { id: string } }
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
  { params }: { params: { id: string } }
) {
  const client = new MongoClient(uri);
  
  try {
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
