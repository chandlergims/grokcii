import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// MongoDB connection string
const uri = process.env.MONGODB_URI || "mongodb+srv://test123:Ltd0HC5UDEIPAkVH@cluster0.hxfim.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = 'fnfantasy';

export async function GET(request: NextRequest) {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const tournamentsCollection = db.collection('tournaments');
    const teamsCollection = db.collection('teams');
    
    // Get the active tournament
    const activeTournament = await tournamentsCollection.findOne({ status: 'active' });
    
    if (!activeTournament) {
      // If no active tournament exists, return empty response
      return NextResponse.json({ tournament: null });
    }
    
    // Get teams in the tournament
    const teamIds = activeTournament.teams || [];
    const objectIds = teamIds.map((id: string) => new ObjectId(id));
    
    const teams = objectIds.length > 0 
      ? await teamsCollection.find({ _id: { $in: objectIds } }).toArray()
      : [];
    
    // Add id field and calculate status for frontend
    const teamsWithIds = teams.map(team => {
      // Calculate team status based on member invites
      let status = 'verified';
      
      // Check if all members have accepted their invites
      if (team.members && team.members.length > 0) {
        const pendingMembers = team.members.filter((member: any) => 
          member.status === 'pending' || !member.status
        );
        
        if (pendingMembers.length > 0) {
          status = 'unverified';
        }
      }
      
      return {
        ...team,
        id: team._id.toString(),
        status
      };
    });
    
    // Format tournament for frontend
    const formattedTournament = {
      ...activeTournament,
      id: activeTournament._id.toString(),
      teams: teamsWithIds
    };
    
    return NextResponse.json({ tournament: formattedTournament });
  } catch (error) {
    console.error('Error fetching active tournament:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active tournament' }, 
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
