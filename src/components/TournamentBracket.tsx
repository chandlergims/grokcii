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
  isAdmin?: boolean;
  onTeamNameChange?: (index: number, name: string) => void;
}

// Function to generate tournament matches
const generateMatches = (teams: string[] = []) => {
  // Get current date in YYYY-MM-DD format
  const currentDate = new Date().toISOString().split('T')[0];
  
  // Helper function to get team name or empty string
  const getTeamName = (index: number) => teams[index] || '';
  
  // Generate first round matches
  return [
    {
      id: 1,
      name: 'Round 1 - Match 1',
      nextMatchId: 9,
      tournamentRoundText: '1',
      startTime: currentDate,
      participants: [
        {
          id: 'p1',
          resultText: '',
          status: null,
          name: getTeamName(0) // Team 1
        },
        {
          id: 'p2',
          resultText: '',
          status: null,
          name: getTeamName(1) // Team 2
        }
      ]
    },
    {
      id: 2,
      name: 'Round 1 - Match 2',
      nextMatchId: 9,
      tournamentRoundText: '1',
      startTime: currentDate,
      participants: [
        {
          id: 'p3',
          resultText: '',
          status: null,
          name: getTeamName(2) // Team 3
        },
        {
          id: 'p4',
          resultText: '',
          status: null,
          name: getTeamName(3) // Team 4
        }
      ]
    },
    {
      id: 3,
      name: 'Round 1 - Match 3',
      nextMatchId: 10,
      tournamentRoundText: '1',
      startTime: currentDate,
      participants: [
        {
          id: 'p5',
          resultText: '',
          status: null,
          name: getTeamName(4) // Team 5
        },
        {
          id: 'p6',
          resultText: '',
          status: null,
          name: getTeamName(5) // Team 6
        }
      ]
    },
    {
      id: 4,
      name: 'Round 1 - Match 4',
      nextMatchId: 10,
      tournamentRoundText: '1',
      startTime: currentDate,
      participants: [
        {
          id: 'p7',
          resultText: '',
          status: null,
          name: getTeamName(6) // Team 7
        },
        {
          id: 'p8',
          resultText: '',
          status: null,
          name: getTeamName(7) // Team 8
        }
      ]
    },
    {
      id: 5,
      name: 'Round 1 - Match 5',
      nextMatchId: 11,
      tournamentRoundText: '1',
      startTime: currentDate,
      participants: [
        {
          id: 'p9',
          resultText: '',
          status: null,
          name: getTeamName(8) // Team 9
        },
        {
          id: 'p10',
          resultText: '',
          status: null,
          name: getTeamName(9) // Team 10
        }
      ]
    },
    {
      id: 9,
      name: 'Round 2 - Match 1',
      nextMatchId: 13,
      tournamentRoundText: '2',
      startTime: currentDate,
      participants: [
        {
          id: 'p1',
          resultText: '',
          status: null,
          name: getTeamName(0) // Winner from Match 1
        },
        {
          id: 'p3',
          resultText: '',
          status: null,
          name: getTeamName(2) // Winner from Match 2
        }
      ]
    },
    {
      id: 10,
      name: 'Round 2 - Match 2',
      nextMatchId: 13,
      tournamentRoundText: '2',
      startTime: currentDate,
      participants: [
        {
          id: 'p5',
          resultText: '',
          status: null,
          name: getTeamName(4) // Winner from Match 3
        },
        {
          id: 'p7',
          resultText: '',
          status: null,
          name: getTeamName(6) // Winner from Match 4
        }
      ]
    },
    {
      id: 11,
      name: 'Round 2 - Match 3',
      nextMatchId: 14,
      tournamentRoundText: '2',
      startTime: currentDate,
      participants: [
        {
          id: 'p9',
          resultText: '',
          status: null,
          name: getTeamName(8) // Winner from Match 5
        },
        {
          id: 'p11',
          resultText: '',
          status: null,
          name: '' // Empty slot
        }
      ]
    },
    {
      id: 13,
      name: 'Final',
      nextMatchId: null,
      tournamentRoundText: '3',
      startTime: currentDate,
      participants: [
        {
          id: 'p1',
          resultText: '',
          status: null,
          name: getTeamName(0) // Winner from Match 1
        },
        {
          id: 'p5',
          resultText: '',
          status: null,
          name: getTeamName(4) // Winner from Match 3
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

const TournamentBracket: React.FC<TournamentBracketProps> = ({ 
  teams = [], 
  tournamentNumber, 
  tournamentDate,
  isAdmin = false,
  onTeamNameChange
}) => {
  // State for team names and modal
  const [teamNames, setTeamNames] = React.useState<string[]>(teams);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  
  // Fetch bracket teams from API on component mount
  React.useEffect(() => {
    const fetchBracketTeams = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/tournaments/bracket');
        if (response.ok) {
          const data = await response.json();
          if (data.bracketTeams && Array.isArray(data.bracketTeams)) {
            setTeamNames(data.bracketTeams);
          }
        }
      } catch (error) {
        console.error('Error fetching bracket teams:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBracketTeams();
  }, []);
  
  // Generate matches using team names
  const matches = generateMatches(teamNames);
  
  // Format current date for display
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Check if we're on the events page (props are passed) or the main page (no props)
  const isEventsPage = tournamentNumber !== undefined;
  
  // Function to handle team name change
  const handleTeamNameChange = (index: number, newName: string) => {
    if (!isAdmin) return;
    
    const newTeamNames = [...teamNames];
    newTeamNames[index] = newName;
    setTeamNames(newTeamNames);
    
    if (onTeamNameChange) {
      onTeamNameChange(index, newName);
    }
  };
  
  // Function to save bracket teams to the backend
  const saveBracketTeams = async () => {
    if (!isAdmin) return;
    
    try {
      setIsLoading(true);
      setSaveError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setSaveError('You must be logged in to save changes');
        return;
      }
      
      const response = await fetch('/api/tournaments/bracket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bracketTeams: teamNames })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save bracket teams');
      }
      
      // Close modal on success
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving bracket teams:', error);
      setSaveError(error.message || 'Failed to save bracket teams');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to open the modal
  const openModal = () => {
    if (!isAdmin) return;
    setIsModalOpen(true);
  };
  
  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSaveError(null);
  };

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
      
      {/* Admin Controls */}
      {isAdmin && (
        <div className="mb-6">
          <button
            onClick={openModal}
            className="flex items-center overflow-hidden rounded-md p-2 text-left outline-none transition-all duration-300 ease-in-out hover:bg-[#f0b90b]/10 border border-[#f0b90b] text-[#f0b90b] h-8 text-sm justify-center cursor-pointer font-bold mb-4"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            <span>Edit Tournament Participants</span>
          </button>
        </div>
      )}
      
      {/* Participants Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Edit Tournament Participants</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Team Name Editor */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Team {index + 1}</label>
                      <div className="flex">
                        <input
                          type="text"
                          value={teamNames[index] || ''}
                          onChange={(e) => handleTeamNameChange(index, e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#f0b90b] focus:border-[#f0b90b]"
                          placeholder={`Team ${index + 1}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Error Message */}
              {saveError && (
                <div className="px-4 py-4 rounded-md flex items-center bg-red-50 border border-red-300 text-red-800 mb-6">
                  <div className="mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">{saveError}</p>
                </div>
              )}
              
              {/* Modal Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex items-center overflow-hidden rounded-md p-2 text-left outline-none transition-all duration-300 ease-in-out hover:bg-gray-100 border border-gray-300 text-gray-700 h-8 text-sm justify-center"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                  disabled={isLoading}
                >
                  <span className="font-bold">Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={saveBracketTeams}
                  className="flex items-center overflow-hidden rounded-md p-2 text-left outline-none transition-all duration-300 ease-in-out hover:bg-[#f0b90b]/10 border border-[#f0b90b] text-[#f0b90b] h-8 text-sm justify-center font-bold"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#f0b90b] mr-2"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
