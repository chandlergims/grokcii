import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// MongoDB connection string
const uri = process.env.MONGODB_URI || "mongodb+srv://test123:Ltd0HC5UDEIPAkVH@cluster0.hxfim.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = 'fnfantasy';

export async function POST(request: NextRequest) {
  const client = new MongoClient(uri);
  
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    let walletAddress = '';
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract token
      const token = authHeader.split(' ')[1];
      
      // Decode token
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
    } else {
      return NextResponse.json(
        { error: 'Authorization header is required' }, 
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { teamId } = body;
    
    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' }, 
        { status: 400 }
      );
    }
    
    await client.connect();
    const db = client.db(dbName);
    const teamsCollection = db.collection('teams');
    const tournamentsCollection = db.collection('tournaments');
    
    // Check if team exists
    const team = await teamsCollection.findOne({ _id: new ObjectId(teamId) });
    
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' }, 
        { status: 404 }
      );
    }
    
    // Check if user is a member of the team
    const isMember = team.members.some((member: any) => member.walletAddress === walletAddress);
    const isCreator = team.createdBy === walletAddress;
    
    if (!isMember && !isCreator) {
      return NextResponse.json(
        { error: 'You are not a member or creator of this team' }, 
        { status: 403 }
      );
    }
    
    // Get the active tournament
    const activeTournament = await tournamentsCollection.findOne({ status: 'active' });
    
    if (!activeTournament) {
      // If no active tournament exists, create one
      const newTournament = {
        name: `Tournament ${new Date().toLocaleDateString()}`,
        teams: [teamId],
        startDate: new Date(),
        status: 'active'
      };
      
      const result = await tournamentsCollection.insertOne(newTournament);
      
      return NextResponse.json(
        { 
          message: 'Successfully joined new tournament', 
          tournamentId: result.insertedId,
          tournament: {
            ...newTournament,
            id: result.insertedId.toString()
          }
        }, 
        { status: 201 }
      );
    }
    
    // Check if team is already in the tournament
    if (activeTournament.teams.includes(teamId)) {
      return NextResponse.json(
        { error: 'Team is already in this tournament' }, 
        { status: 400 }
      );
    }
    
    // Check if tournament is full (limit to 8 teams)
    if (activeTournament.teams.length >= 8) {
      return NextResponse.json(
        { error: 'Tournament is full (maximum 8 teams)' }, 
        { status: 400 }
      );
    }
    
    // Check if user is already in the tournament with another team
    // Get all teams in the tournament
    const tournamentTeamIds = activeTournament.teams || [];
    const tournamentTeams = await teamsCollection.find({
      _id: { $in: tournamentTeamIds.map((id: string) => new ObjectId(id)) }
    }).toArray();
    
    // Check if user is a member or creator of any team in the tournament
    const isAlreadyInTournament = tournamentTeams.some(tournamentTeam => {
      // Check if user is the creator
      if (tournamentTeam.createdBy === walletAddress) {
        return true;
      }
      
      // Check if user is a member
      return tournamentTeam.members.some((member: any) => member.walletAddress === walletAddress);
    });
    
    if (isAlreadyInTournament) {
      return NextResponse.json(
        { error: 'You are already in this tournament with another team' }, 
        { status: 400 }
      );
    }
    
    // Add team to tournament
    await tournamentsCollection.updateOne(
      { _id: activeTournament._id },
      { $push: { teams: teamId } }
    );
    
    return NextResponse.json(
      { 
        message: 'Successfully joined tournament', 
        tournamentId: activeTournament._id.toString()
      }, 
      { status: 200 }
    );
  } catch (error) {
    console.error('Error joining tournament:', error);
    return NextResponse.json(
      { error: 'Failed to join tournament' }, 
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
