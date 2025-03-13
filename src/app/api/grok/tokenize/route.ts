import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST /api/grok/tokenize - Add or update token address for a character
export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const body = await req.json();
    const { walletAddress, tokenAddress } = body;

    // Validate input
    if (!walletAddress || !tokenAddress) {
      return NextResponse.json(
        { error: 'Wallet address and token address are required' },
        { status: 400 }
      );
    }

    // Validate token address format (basic check for Solana address)
    // More permissive regex to allow for various token address formats
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,50}$/.test(tokenAddress)) {
      return NextResponse.json(
        { error: 'Invalid Solana token address format' },
        { status: 400 }
      );
    }

    // Connect to the database
    const db = await connectToDatabase();

    // Find the character by wallet address
    const character = await db.collection('grokCharacters').findOne({ walletAddress });

    if (!character) {
      return NextResponse.json(
        { error: 'Character not found for this wallet address' },
        { status: 404 }
      );
    }

    // Update the character with the token address
    await db.collection('grokCharacters').updateOne(
      { walletAddress },
      { $set: { tokenAddress, tokenizedAt: new Date() } }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Character tokenized successfully',
      character: {
        ...character,
        tokenAddress,
        tokenizedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error tokenizing character:', error);
    return NextResponse.json(
      { error: 'Failed to tokenize character' },
      { status: 500 }
    );
  }
}

// GET /api/grok/tokenize - Get all tokenized characters
export async function GET() {
  try {
    // Connect to the database
    const db = await connectToDatabase();

    // Find all tokenized characters
    const tokenizedCharacters = await db
      .collection('grokCharacters')
      .find({ tokenAddress: { $exists: true } })
      .sort({ tokenizedAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json({ tokenizedCharacters });
  } catch (error) {
    console.error('Error fetching tokenized characters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokenized characters' },
      { status: 500 }
    );
  }
}
