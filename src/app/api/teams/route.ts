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
    const teamsCollection = db.collection('teams');
    const invitesCollection = db.collection('invites');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const searchQuery = searchParams.get('search');
    const limit = limitParam ? parseInt(limitParam) : 5;
    
    // Check if this is a request for the home page (no auth header)
    // or for the user's teams page (with auth header)
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Home page request - get most recent teams or search results
      
      // Build query
      let query = {};
      
      // If search query is provided, search by team name
      if (searchQuery && searchQuery.trim() !== '') {
        query = {
          name: { $regex: searchQuery, $options: 'i' } // Case-insensitive search
        };
      }
      
      // Get total count of all teams
      const totalCount = await teamsCollection.countDocuments();
      
      // Get teams based on query
      let teamsQuery = teamsCollection.find(query).sort({ createdAt: -1 });
      
      // Only apply limit if not searching or if limit is explicitly requested
      if (!searchQuery || limitParam) {
        teamsQuery = teamsQuery.limit(limit);
      }
      
      const teams = await teamsQuery.toArray();
      
      // Add id field for frontend
      const teamsWithIds = teams.map(team => ({
        ...team,
        id: team._id.toString()
      }));
      
      return NextResponse.json({ teams: teamsWithIds, totalCount });
    } else {
      // User's teams page request - get teams for the authenticated user
      
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
      
      const usersCollection = db.collection('users');
      
      // Get user's teams
      const user = await usersCollection.findOne({ walletAddress });
      const userTeamIds = user?.teams || [];
      
      // Convert string IDs to ObjectIds
      const objectIds = userTeamIds.map((id: string) => new ObjectId(id));
      
      // Get total count of user's teams
      const totalCount = objectIds.length;
      
      // Get teams that the user is a member of
      let teamsQuery = teamsCollection.find({
        _id: { $in: objectIds }
      });
      
      // Sort by creation date (newest first)
      teamsQuery = teamsQuery.sort({ createdAt: -1 });
      
      // Limit results if specified
      if (limit) {
        teamsQuery = teamsQuery.limit(limit);
      }
      
      const teams = await teamsQuery.toArray();
      
      // Get all invites
      const invites = await invitesCollection.find({ walletAddress, status: 'pending' }).toArray();
      
      // Add status to team members
      const teamsWithStatus = teams.map(team => {
        const teamId = team._id.toString();
        
        return {
          ...team,
          id: teamId
        };
      });
      
      return NextResponse.json({ 
        teams: teamsWithStatus, 
        totalCount,
        invites
      });
    }
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  } finally {
    await client.close();
  }
}

export async function POST(request: NextRequest) {
  const client = new MongoClient(uri);
  
  try {
    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    let body;
    let bannerImage;
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData
      const formData = await request.formData();
      const name = formData.get('name') as string;
      const membersJson = formData.get('members') as string;
      const twitterLink = formData.get('twitterLink') as string;
      bannerImage = formData.get('bannerImage') as File;
      
      body = {
        name,
        members: JSON.parse(membersJson),
        twitterLink
      };
    } else {
      // Handle JSON
      body = await request.json();
    }
    
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
      }
    }
    
    await client.connect();
    const db = client.db(dbName);
    const teamsCollection = db.collection('teams');
    
    // Check if user has already created 5 teams
    const userTeamsCount = await teamsCollection.countDocuments({ createdBy: walletAddress });
    
    if (userTeamsCount >= 5) {
      return NextResponse.json(
        { error: 'You have reached the maximum limit of 5 teams. Please delete a team before creating a new one.' }, 
        { status: 400 }
      );
    }
    
    // Define team interface
    interface TeamMember {
      id: string;
      name: string;
      walletAddress: string;
      status?: 'pending' | 'accepted' | 'rejected';
    }
    
    interface Team {
      name: string;
      members: TeamMember[];
      twitterLink?: string;
      bannerUrl?: string;
      createdAt: Date;
      createdBy: string;
    }
    
    // Create team object
    const team: Team = {
      name: body.name,
      members: body.members.map((member: any) => ({
        ...member,
        status: member.walletAddress === walletAddress ? 'accepted' : 'pending'
      })),
      twitterLink: body.twitterLink || undefined,
      createdAt: new Date(),
      createdBy: walletAddress
    };
    
    // Store the banner image in the database as a base64 string
    if (bannerImage) {
      try {
        // Convert the file to a buffer
        const arrayBuffer = await bannerImage.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Convert the buffer to a base64 string
        const base64String = buffer.toString('base64');
        
        // Get the file type
        const fileType = bannerImage.type;
        
        // Create a data URL
        team.bannerUrl = `data:${fileType};base64,${base64String}`;
      } catch (error) {
        console.error('Error processing banner image:', error);
      }
    }
    
    // Insert team into database
    const result = await teamsCollection.insertOne(team);
    
    // Create invites for team members
    const invitesCollection = db.collection('invites');
    const teamId = result.insertedId.toString();
    
    // Create invites for all members except the creator
    const invites = team.members
      .filter(member => member.walletAddress !== walletAddress)
      .map(member => ({
        teamId,
        teamName: team.name,
        walletAddress: member.walletAddress,
        status: 'pending',
        createdAt: new Date()
      }));
    
    if (invites.length > 0) {
      await invitesCollection.insertMany(invites);
    }
    
    // Add team to user's teams
    const usersCollection = db.collection('users');
    await usersCollection.updateOne(
      { walletAddress },
      { $addToSet: { teams: teamId } },
      { upsert: true }
    );
    
    return NextResponse.json(
      { 
        message: 'Team created successfully', 
        teamId: result.insertedId,
        team 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  } finally {
    await client.close();
  }
}
