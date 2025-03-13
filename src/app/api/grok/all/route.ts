import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET handler to retrieve all characters
export async function GET(request: NextRequest) {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('grokCharacters');

    // Get only the 20 most recent characters
    const characters = await collection.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json({ characters });
  } catch (error) {
    console.error('Error in Grok API route:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
