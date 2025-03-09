import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/tournaments/bracket
// Get the current tournament bracket teams
export async function GET(req: NextRequest) {
  try {
    const db = await connectToDatabase();
    
    // Get the most recent tournament bracket
    const bracket = await db.collection('brackets').findOne(
      {},
      { sort: { createdAt: -1 } }
    );
    
    if (!bracket) {
      return NextResponse.json({ bracketTeams: [] });
    }
    
    return NextResponse.json({ bracketTeams: bracket.teams });
  } catch (error) {
    console.error('Error fetching tournament bracket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament bracket' },
      { status: 500 }
    );
  }
}

// POST /api/tournaments/bracket
// Update the tournament bracket teams
export async function POST(req: NextRequest) {
  try {
    const db = await connectToDatabase();
    const { bracketTeams } = await req.json();
    
    // Validate the request
    if (!Array.isArray(bracketTeams)) {
      return NextResponse.json(
        { error: 'Invalid bracket teams format' },
        { status: 400 }
      );
    }
    
    // Get the current user from the auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    let walletAddress;
    
    try {
      // Decode token to get wallet address
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      walletAddress = decoded.walletAddress;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const ADMIN_WALLETS = [
      'AEnb3z3o8NoVH5r7ppVWXw2DCu84S8n1L5MsP1Hpz5wT'
    ];
    
    if (!ADMIN_WALLETS.includes(walletAddress)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    // Create or update the tournament bracket
    const result = await db.collection('brackets').insertOne({
      teams: bracketTeams,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: walletAddress
    });
    
    return NextResponse.json({
      success: true,
      bracketTeams,
      message: 'Tournament bracket updated successfully'
    });
  } catch (error) {
    console.error('Error updating tournament bracket:', error);
    return NextResponse.json(
      { error: 'Failed to update tournament bracket' },
      { status: 500 }
    );
  }
}
