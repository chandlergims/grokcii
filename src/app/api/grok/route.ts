import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Document } from 'mongodb';

// Define the GrokCharacter interface
interface GrokCharacter extends Document {
  walletAddress: string;
  name: string;
  asciiArt: string;
  story: string;
  createdAt: Date;
}

// xAI API key
const XAI_API_KEY = 'xai-crMb2OlwpYnHvXnQoGGX64vfGWMw2E53UihY0sPmxOOOSX1ZrWQXx4wMBSUBoJGKZlI7BwomfMiMNP27';

// Function to generate a random ASCII character with name and story
async function generateGrokCharacter(): Promise<{ name: string; asciiArt: string; story: string }> {
  try {
    const prompt = `Generate a unique fantasy character with the following:
1. A creative fantasy name
2. An ASCII art representation of the character (maximum 20 lines)
3. A short backstory (2-3 sentences)

Format the response exactly like this:
NAME: [character name]
ASCII:
[ASCII art]
STORY: [character backstory]`;

    // Use the correct xAI API endpoint
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages: [
          {
            role: 'system',
            content: 'You are a creative assistant that generates unique fantasy characters with ASCII art.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error from xAI API:', errorData);
      console.error('Response status:', response.status, response.statusText);
      console.error('Request details:', {
        url: 'https://api.x.ai/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${XAI_API_KEY.substring(0, 10)}...` // Log partial key for debugging
        }
      });
      throw new Error(`xAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    // Extract the generated text from the response
    const generatedText = data.choices[0].message.content.trim();

    // Parse the generated text to extract name, ASCII art, and story
    const nameMatch = generatedText.match(/NAME:\s*(.+?)(?=\nASCII:|$)/);
    const asciiMatch = generatedText.match(/ASCII:\n([\s\S]+?)(?=\nSTORY:|$)/);
    const storyMatch = generatedText.match(/STORY:\s*(.+?)$/);

    return {
      name: nameMatch ? nameMatch[1].trim() : 'Unknown Character',
      asciiArt: asciiMatch ? asciiMatch[1].trim() : 'No ASCII art available',
      story: storyMatch ? storyMatch[1].trim() : 'No story available'
    };
  } catch (error) {
    console.error('Error generating Grok character:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    // Return a fallback character if the API call fails
    return {
      name: 'Fallback Character',
      asciiArt: `
   /\\_/\\
  ( o.o )
   > ^ <`,
      story: 'A mysterious character from the digital realm. Their true origins are unknown.'
    };
  }
}

// Function to generate a random ASCII character with name and story with history context
async function generateGrokCharacterWithHistory(previousNames: string[] = []): Promise<{ name: string; asciiArt: string; story: string }> {
  try {
    let historyContext = '';
    if (previousNames.length > 0) {
      historyContext = `\nPreviously generated character names: ${previousNames.join(', ')}.\nDO NOT reuse any of these names. Create a completely new and unique name.`;
    }
    
    const prompt = `Generate a unique fantasy character with the following:
1. A creative fantasy name that is completely unique
2. An ASCII art representation of the character (maximum 20 lines)
3. A short backstory (2-3 sentences)${historyContext}

Format the response exactly like this:
NAME: [character name]
ASCII:
[ASCII art]
STORY: [character backstory]`;

    // Use the correct xAI API endpoint
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages: [
          {
            role: 'system',
            content: 'You are a creative assistant that generates unique fantasy characters with ASCII art. Never repeat character names you have created before.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.9, // Slightly higher temperature for more randomness
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error from xAI API:', errorData);
      console.error('Response status:', response.status, response.statusText);
      console.error('Request details:', {
        url: 'https://api.x.ai/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${XAI_API_KEY.substring(0, 10)}...` // Log partial key for debugging
        }
      });
      throw new Error(`xAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    // Extract the generated text from the response
    const generatedText = data.choices[0].message.content.trim();

    // Parse the generated text to extract name, ASCII art, and story
    const nameMatch = generatedText.match(/NAME:\s*(.+?)(?=\nASCII:|$)/);
    const asciiMatch = generatedText.match(/ASCII:\n([\s\S]+?)(?=\nSTORY:|$)/);
    const storyMatch = generatedText.match(/STORY:\s*(.+?)$/);

    return {
      name: nameMatch ? nameMatch[1].trim() : 'Unknown Character',
      asciiArt: asciiMatch ? asciiMatch[1].trim() : 'No ASCII art available',
      story: storyMatch ? storyMatch[1].trim() : 'No story available'
    };
  } catch (error) {
    console.error('Error generating Grok character:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    // Return a fallback character if the API call fails
    return {
      name: 'Fallback Character',
      asciiArt: `
   /\\_/\\
  ( o.o )
   > ^ <`,
      story: 'A mysterious character from the digital realm. Their true origins are unknown.'
    };
  }
}

// GET handler to retrieve a character for a wallet address
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const forceRefresh = searchParams.get('refresh') === 'true';

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const db = await connectToDatabase();
    const collection = db.collection('grokCharacters');

    // Check if a character already exists for this wallet address
    let character = await collection.findOne<GrokCharacter>({ walletAddress });
    
    // Get previous names to avoid duplicates (from history if available)
    const previousNames: string[] = [];
    if (character && character.name) {
      previousNames.push(character.name);
    }
    
    // If no character exists or force refresh is requested, generate one
    if (!character || forceRefresh) {
      const generatedCharacter = await generateGrokCharacterWithHistory(previousNames);
      
      const newCharacter = {
        walletAddress,
        ...generatedCharacter,
        createdAt: new Date()
      };
      
      if (character && character._id) {
        // Update existing character
        await collection.updateOne(
          { _id: character._id },
          { $set: {
              name: generatedCharacter.name,
              asciiArt: generatedCharacter.asciiArt,
              story: generatedCharacter.story,
              createdAt: new Date()
            }
          }
        );
        
        // Get the updated character
        character = await collection.findOne<GrokCharacter>({ _id: character._id });
      } else {
        // Insert new character
        const result = await collection.insertOne(newCharacter);
        character = {
          _id: result.insertedId,
          ...newCharacter
        } as GrokCharacter;
      }
    }

    return NextResponse.json({ character });
  } catch (error) {
    console.error('Error in Grok API route:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
