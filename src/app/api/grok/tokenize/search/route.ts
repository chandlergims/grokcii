import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

// GET handler to search for tokenized characters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ tokenizedCharacters: [] });
    }

    const db = await connectToDatabase();
    const collection = db.collection('grokCharacters');

    // Search for tokenized characters that match the query in name, story, or tokenAddress
    const tokenizedCharacters = await collection.find({
      tokenAddress: { $exists: true }, // Only include tokenized characters
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { story: { $regex: query, $options: 'i' } },
        { tokenAddress: { $regex: query, $options: 'i' } }
      ]
    })
    .sort({ tokenizedAt: -1 })
    .limit(20)
    .toArray();

    return NextResponse.json({ tokenizedCharacters });
  } catch (error) {
    console.error('Error in tokenized characters search API route:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
