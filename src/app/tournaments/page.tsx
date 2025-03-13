"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TournamentBracket from '@/components/TournamentBracket';

// Team interface
interface Team {
  id: string;
  name: string;
  bannerUrl?: string;
  members: {
    id: string;
    name: string;
    walletAddress: string;
    status?: 'pending' | 'accepted' | 'rejected';
  }[];
}

// Tournament interface
interface Tournament {
  id: string;
  name: string;
  teams: Team[];
  startDate: string;
  status: 'upcoming' | 'active' | 'completed';
}

const TournamentsPage = () => {
  const router = useRouter();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [verifiedTeams, setVerifiedTeams] = useState<Team[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingTournament, setIsGeneratingTournament] = useState(false);
  const [isJoiningTournament, setIsJoiningTournament] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [currentTournamentId, setCurrentTournamentId] = useState<string | null>(null);
  
  // Fetch tournaments and verified teams
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // For development, we'll set empty arrays if the API calls fail
        // This prevents the error message from showing while endpoints are being developed
        
        try {
          const token = localStorage.getItem('authToken');
          if (!token) {
            router.push('/');
            return;
          }
          
          // Fetch tournaments
          const tournamentsResponse = await fetch('/api/tournaments', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (tournamentsResponse.ok) {
            const tournamentsData = await tournamentsResponse.json();
            setTournaments(tournamentsData.tournaments || []);
          } else {
            // If API not ready, set empty array instead of throwing error
            console.warn('Tournaments API not ready yet, using empty array');
            setTournaments([]);
          }
          
          // Fetch only the user's verified teams
          const teamsResponse = await fetch('/api/teams/my-verified', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (teamsResponse.ok) {
            const teamsData = await teamsResponse.json();
            setVerifiedTeams(teamsData.teams || []);
          } else {
            // If API not ready, set empty array instead of throwing error
            console.warn('Verified teams API not ready yet, using empty array');
            setVerifiedTeams([]);
          }
        } catch (error) {
          console.warn('API error, using empty arrays:', error);
          setTournaments([]);
          setVerifiedTeams([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [router]);
  
  // Generate a new tournament with random verified teams
  const generateTournament = async () => {
    try {
      setIsGeneratingTournament(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/');
        return;
      }
      
      // Create a new tournament with random verified teams
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `Tournament ${new Date().toLocaleDateString()}`,
          randomSelection: true
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tournament');
      }
      
      const data = await response.json();
      
      // Add the new tournament to the list
      setTournaments([...tournaments, data.tournament]);
      
      // Scroll to the new tournament
      setTimeout(() => {
        document.getElementById(`tournament-${data.tournament.id}`)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      console.error('Error creating tournament:', error);
      setError(error.message || 'Failed to create tournament. Please try again.');
    } finally {
      setIsGeneratingTournament(false);
    }
  };

  // Check if there are enough verified teams for a tournament
  const hasEnoughVerifiedTeams = verifiedTeams.length >= 8;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">Current Tournament</h1>
        <p className="text-gray-400 mt-2">View the current tournament bracket and details</p>
      </div>
      
      {error && (
        <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Default Tournament Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white mb-2">GrokCII Season 1</h2>
          <p className="text-gray-200 mb-4">The official tournament for GrokCII!</p>
          
          <div className="flex space-x-3">
            <Link
              href="/"
              className="px-6 py-2 bg-white/10 text-white rounded hover:bg-white/20 transition-colors"
            >
              View Bracket
            </Link>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map(tournament => (
            <div 
              key={tournament.id} 
              id={`tournament-${tournament.id}`}
              className="bg-[#1a1a1a] rounded-lg overflow-hidden shadow-lg border border-[#2a2a2a] flex flex-col"
            >
              {/* Tournament Header with Gradient Background */}
              <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-4">
                <h2 className="text-xl font-bold text-white">{tournament.name}</h2>
                <p className="text-gray-200 text-sm mt-1">
                  {new Date(tournament.startDate).toLocaleDateString()}
                </p>
              </div>
              
              {/* Tournament Status */}
              <div className="px-4 py-3 border-b border-[#2a2a2a] flex justify-between items-center">
                <div className="flex items-center">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${
                    tournament.status === 'active' ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.7)]' :
                    tournament.status === 'completed' ? 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.7)]' :
                    'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.7)]'
                  }`}></span>
                  <span className={`text-sm ${
                    tournament.status === 'active' ? 'text-green-400' :
                    tournament.status === 'completed' ? 'text-blue-400' :
                    'text-yellow-400'
                  }`}>
                    {tournament.status === 'active' ? 'Active' :
                     tournament.status === 'completed' ? 'Completed' :
                     'Upcoming'}
                  </span>
                </div>
                <span className="text-gray-400 text-sm">{tournament.teams.length} teams</span>
              </div>
              
              {/* Tournament Info */}
              <div className="p-4 flex-grow">
                <p className="text-gray-300 text-sm mb-4">
                  {tournament.status === 'upcoming' 
                    ? 'This tournament is upcoming. Check back later for updates.' 
                    : tournament.status === 'active'
                    ? 'This tournament is currently in progress. Check the bracket on the home page.'
                    : 'This tournament has concluded. View the results on the home page.'}
                </p>
                
                {/* Action Buttons */}
                <div className="flex space-x-2 mt-auto">
                  <Link
                    href={`/tournaments/${tournament.id}`}
                    className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#1a1a1a] rounded-lg p-8 text-center border border-[#2a2a2a]">
          <h3 className="text-xl font-medium text-white mb-2">No Tournaments Available</h3>
          <p className="text-gray-400">
            There are no tournaments available at the moment.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Please check back later for upcoming tournaments.
          </p>
        </div>
      )}
      
      {/* Team Selector Modal removed */}
      
      {/* Verified Teams Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-white mb-4">Verified Teams</h2>
        {verifiedTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verifiedTeams.map(team => (
              <Link key={team.id} href={`/teams/${team.id}`} className="block">
                <div className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors">
                  <div 
                    className="h-20 w-full relative"
                    style={{
                      backgroundImage: team.bannerUrl 
                        ? `url(${team.bannerUrl})` 
                        : 'linear-gradient(135deg, #1a237e 0%, #4a148c 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                    <div className="absolute bottom-0 left-0 p-3">
                      <h3 className="text-white font-medium text-sm">{team.name}</h3>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-gray-400 text-xs">
                      {team.members.length} {team.members.length === 1 ? 'member' : 'members'} • All verified
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-[#1a1a1a] rounded-lg p-6 text-center border border-[#2a2a2a]">
            <p className="text-gray-400">No verified teams yet</p>
            <p className="text-gray-500 text-sm mt-2">
              A verified team is one where all members have accepted their invites
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentsPage;
