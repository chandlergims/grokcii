"use client";
import { useState, useEffect } from 'react';
import TeamCard from "../../components/TeamCard";

// Define types for team members
interface TeamMember {
  id: string;
  name: string;
  walletAddress: string;
  status?: 'pending' | 'accepted' | 'rejected';
}

// Define types for the team
interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  twitterLink?: string;
  bannerUrl?: string;
}

export default function RegisteredTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch teams
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        
        // Filter teams where all members have accepted the invite
        const registeredTeams = data.teams.filter((team: Team) => {
          // Check if all members have accepted
          return team.members.every(member => member.status === 'accepted');
        });
        
        setTeams(registeredTeams);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch teams on component mount
  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-white">Registered Teams</h2>
          <p className="text-gray-400 mt-2">Teams with all members confirmed</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse flex space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        ) : (
          <div>
            {teams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {teams.map(team => (
                  <TeamCard 
                    key={team.id} 
                    team={team} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-400">No registered teams found</p>
                <p className="text-gray-500 text-sm mt-2">Teams will appear here when all members have accepted their invites</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
