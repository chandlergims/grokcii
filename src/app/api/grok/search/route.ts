import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET handler to search for characters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ characters: [] });
    }

    const db = await connectToDatabase();
    const collection = db.collection('grokCharacters');

    // Search for characters that match the query in name or story
    const characters = await collection.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { story: { $regex: query, $options: 'i' } }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();

    return NextResponse.json({ characters });
  } catch (error) {
    console.error('Error in Grok search API route:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
