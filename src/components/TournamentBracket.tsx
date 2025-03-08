"use client";
import React from 'react';
import {
  SingleEliminationBracket,
  Match,
  createTheme
} from '@g-loot/react-tournament-brackets';
import { ReactSVGPanZoom } from 'react-svg-pan-zoom';
import styles from './TournamentBracket.module.css';

interface TournamentBracketProps {
  teams?: string[];
  tournamentNumber?: string;
  tournamentDate?: string;
}

// Function to generate tournament matches
const generateMatches = () => {
  // Get current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split('T')[0];
  
  // All empty spots will have empty string
  const emptyName = '';
  
  // Generate first round matches
  return [
    {
      id: 1,
      name: 'Round 1 - Match 1',
      nextMatchId: 9,
      tournamentRoundText: '1',
      startTime: currentDate,
      state: 'DONE',
      participants: [
        {
          id: 'p1',
          resultText: '',
          isWinner: true,
          status: null,
          name: emptyName // Team 1
        },
        {
          id: 'p2',
          resultText: '',
          isWinner: false,
          status: null,
          name: emptyName // Team 2
        }
      ]
    },
    {
      id: 2,
      name: 'Round 1 - Match 2',
      nextMatchId: 9,
      tournamentRoundText: '1',
      startTime: currentDate,
      state: 'DONE',
      participants: [
        {
          id: 'p3',
          resultText: '',
          isWinner: true,
          status: null,
          name: emptyName // Team 3
        },
        {
          id: 'p4',
          resultText: '',
          isWinner: false,
          status: null,
          name: emptyName // Team 4
        }
      ]
    },
    {
      id: 3,
      name: 'Round 1 - Match 3',
      nextMatchId: 10,
      tournamentRoundText: '1',
      startTime: currentDate,
      state: 'DONE',
      participants: [
        {
          id: 'p5',
          resultText: '',
          isWinner: true,
          status: null,
          name: emptyName // Team 5
        },
        {
          id: 'p6',
          resultText: '',
          isWinner: false,
          status: null,
          name: emptyName // Team 6
        }
      ]
    },
    {
      id: 4,
      name: 'Round 1 - Match 4',
      nextMatchId: 10,
      tournamentRoundText: '1',
      startTime: currentDate,
      state: 'DONE',
      participants: [
        {
          id: 'p7',
          resultText: '',
          isWinner: true,
          status: null,
          name: emptyName // Team 7
        },
        {
          id: 'p8',
          resultText: '',
          isWinner: false,
          status: null,
          name: emptyName // Team 8
        }
      ]
    },
    {
      id: 5,
      name: 'Round 1 - Match 5',
      nextMatchId: 11,
      tournamentRoundText: '1',
      startTime: currentDate,
      state: 'DONE',
      participants: [
        {
          id: 'p9',
          resultText: '',
          isWinner: true,
          status: null,
          name: emptyName
        },
        {
          id: 'p10',
          resultText: '',
          isWinner: false,
          status: null,
          name: emptyName
        }
      ]
    },
    {
      id: 9,
      name: 'Round 2 - Match 1',
      nextMatchId: 13,
      tournamentRoundText: '2',
      startTime: currentDate,
      state: 'DONE',
      participants: [
        {
          id: 'p1',
          resultText: '',
          isWinner: true,
          status: null,
          name: emptyName // No team in round 2 yet
        },
        {
          id: 'p3',
          resultText: '',
          isWinner: false,
          status: null,
          name: emptyName
        }
      ]
    },
    {
      id: 10,
      name: 'Round 2 - Match 2',
      nextMatchId: 13,
      tournamentRoundText: '2',
      startTime: currentDate,
      state: 'DONE',
      participants: [
        {
          id: 'p5',
          resultText: '',
          isWinner: true,
          status: null,
          name: emptyName
        },
        {
          id: 'p7',
          resultText: '',
          isWinner: false,
          status: null,
          name: emptyName
        }
      ]
    },
    {
      id: 11,
      name: 'Round 2 - Match 3',
      nextMatchId: 14,
      tournamentRoundText: '2',
      startTime: currentDate,
      state: 'DONE',
      participants: [
        {
          id: 'p9',
          resultText: '',
          isWinner: true,
          status: null,
          name: emptyName
        },
        {
          id: 'p11',
          resultText: '',
          isWinner: false,
          status: null,
          name: emptyName
        }
      ]
    },
    {
      id: 13,
      name: 'Final',
      nextMatchId: null,
      tournamentRoundText: '3',
      startTime: currentDate,
      state: 'DONE',
      participants: [
        {
          id: 'p1',
          resultText: '',
          isWinner: true,
          status: null,
          name: emptyName // No team in final yet
        },
        {
          id: 'p5',
          resultText: '',
          isWinner: false,
          status: null,
          name: emptyName
        }
      ]
    }
  ];
};

// Create a light theme
const lightTheme = createTheme({
  textColor: { main: '#333', highlighted: '#000', dark: '#666' },
  matchBackground: { wonColor: '#f8f8f8', lostColor: '#f8f8f8' }, // Same color for both won and lost
  score: { background: { wonColor: '#f8f8f8', lostColor: '#f8f8f8' } }, // Same color for both won and lost
  border: { color: '#ddd', highlightedColor: '#aaa' },
  roundHeader: { backgroundColor: '#f0b90b', color: '#FFF' },
  connectorColor: '#ccc',
  connectorColorHighlight: '#999',
  svgBackground: '#ffffff'
});

const TournamentBracket: React.FC<TournamentBracketProps> = ({ tournamentNumber, tournamentDate }) => {
  // Generate matches
  const matches = generateMatches();
  
  // Format current date for display
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Check if we're on the events page (props are passed) or the main page (no props)
  const isEventsPage = tournamentNumber !== undefined;

  return (
    <div className="mb-12">
      <div className="mb-8 text-center">
        {isEventsPage ? (
          <>
            <h2 className="text-2xl font-semibold text-gray-800">Tournament {tournamentNumber}</h2>
            <p className="text-gray-600 text-sm mt-1">Current Tournament: {tournamentDate}</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-gray-800">Tournament 1</h2>
            <p className="text-gray-600 text-sm mt-1">Current Tournament: {formattedDate}</p>
          </>
        )}
      </div>
      
      <div className={styles.bracketContainer}>
        <div className={styles.bracketWrapper + " border border-gray-200 rounded-lg"}>
          <SingleEliminationBracket
            matches={matches}
            matchComponent={Match}
            theme={lightTheme}
            options={{
              style: {
                roundHeader: {
                  backgroundColor: lightTheme.roundHeader.backgroundColor,
                  color: lightTheme.roundHeader.color,
                  fontWeight: 'bold',
                },
                connectorColor: lightTheme.connectorColor,
                connectorColorHighlight: lightTheme.connectorColorHighlight,
              }
            }}
          svgWrapper={({ children }: { children: React.ReactNode }) => (
            <div style={{ maxWidth: '100%', maxHeight: '800px' }}>
              <svg 
                width="100%"
                height="800"
                viewBox="0 0 1600 800"
                style={{ background: lightTheme.svgBackground }}
              >
                {children}
              </svg>
            </div>
          )}
          />
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;
