"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

// Team member interface
interface TeamMember {
  id: string;
  name: string;
  walletAddress: string;
  status?: 'pending' | 'accepted' | 'rejected';
}

// Team interface
interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  twitterLink?: string;
  bannerUrl?: string;
  createdBy: string;
}

const TeamPage = () => {
  const router = useRouter();
  const params = useParams();
  const teamId = params.id as string;
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fetch team data
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/');
          return;
        }
        
        // Get current user's wallet address
        const decodedToken = JSON.parse(Buffer.from(token, 'base64').toString());
        const currentWalletAddress = decodedToken.walletAddress;
        
        const response = await fetch(`/api/teams/${teamId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch team data');
        }
        
        const data = await response.json();
        setTeam(data.team);
        
        // Check if current user is the team owner
        setIsOwner(data.team.createdBy === currentWalletAddress);
      } catch (error) {
        console.error('Error fetching team:', error);
        setError('Failed to load team data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (teamId) {
      fetchTeam();
    }
  }, [teamId, router]);
  
  // Handle team deletion
  const handleDeleteTeam = async () => {
    try {
      setIsDeleting(true);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/');
        return;
      }
      
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete team');
      }
      
      // Redirect to teams page
      router.push('/teams');
    } catch (error) {
      console.error('Error deleting team:', error);
      setError('Failed to delete team. Please try again.');
      setIsDeleting(false);
      setIsConfirmDeleteOpen(false);
    }
  };
  
  // Handle leaving team
  const handleLeaveTeam = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/');
        return;
      }
      
      const response = await fetch(`/api/teams/${teamId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to leave team');
      }
      
      // Redirect to teams page
      router.push('/teams');
    } catch (error) {
      console.error('Error leaving team:', error);
      setError('Failed to leave team. Please try again.');
      setIsLeaveModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
        <div className="flex justify-center">
          <Link href="/teams" className="text-blue-400 hover:text-blue-300">
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-900 text-yellow-200 p-4 rounded-lg mb-6">
          <p>Team not found or you don't have permission to view it.</p>
        </div>
        <div className="flex justify-center">
          <Link href="/teams" className="text-blue-400 hover:text-blue-300">
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Team Banner */}
        <div 
          className="w-full h-48 md:h-64 rounded-lg mb-6 relative overflow-hidden"
          style={{
            backgroundImage: team.bannerUrl 
              ? `url(${team.bannerUrl})` 
              : 'linear-gradient(135deg, #1a237e 0%, #4a148c 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          
          {/* Team name and actions */}
          <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-md mb-1">{team.name}</h1>
              {team.twitterLink && (
                <a 
                  href={team.twitterLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <span className="text-sm">Twitter</span>
                </a>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex space-x-2">
              {isOwner ? (
                <>
                  <Link 
                    href={`/teams/${teamId}/edit`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    Edit Team
                  </Link>
                  <button
                    onClick={() => setIsConfirmDeleteOpen(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  Leave Team
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Team Members Section */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 shadow-lg border border-[#2a2a2a]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Team Members</h2>
            <div className="flex space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
                <span className="h-2 w-2 bg-green-400 rounded-full mr-1"></span>
                Accepted
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300">
                <span className="h-2 w-2 bg-yellow-400 rounded-full mr-1"></span>
                Pending
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900 text-red-300">
                <span className="h-2 w-2 bg-red-400 rounded-full mr-1"></span>
                Declined
              </span>
            </div>
          </div>
          
          {/* Members List */}
          {team.members.length > 0 ? (
            <ul className="space-y-2">
              {team.members.map(member => (
                <li key={member.id} className="bg-[#232323] p-3 rounded flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <p className="text-white text-sm font-medium">{member.name}</p>
                      {member.status && (
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                          member.status === 'accepted' ? 'bg-green-900 text-green-300' : 
                          member.status === 'rejected' ? 'bg-red-900 text-red-300' : 
                          'bg-yellow-900 text-yellow-300'
                        }`}>
                          {member.status === 'accepted' ? 'Accepted' : 
                           member.status === 'rejected' ? 'Declined' : 
                           'Pending'}
                        </span>
                      )}
                      {member.walletAddress === team.createdBy && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-blue-900 text-blue-300">
                          Owner
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs truncate max-w-[200px]" title={member.walletAddress}>
                      {member.walletAddress.substring(0, 6)}...{member.walletAddress.substring(member.walletAddress.length - 4)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm text-center py-3 bg-[#1e1e1e] rounded">
              No team members yet
            </p>
          )}
        </div>
        
        {/* Back to Teams */}
        <div className="mt-6 flex justify-center">
          <Link href="/teams" className="text-blue-400 hover:text-blue-300">
            Back to Teams
          </Link>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/70">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Delete Team</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this team? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="flex-1 py-2.5 rounded text-white font-medium bg-gray-700 hover:bg-gray-600 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeam}
                className="flex-1 py-2.5 rounded text-white font-medium bg-red-600 hover:bg-red-700 transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Team'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Leave Team Confirmation Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/70">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Leave Team</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to leave this team?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="flex-1 py-2.5 rounded text-white font-medium bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveTeam}
                className="flex-1 py-2.5 rounded text-white font-medium bg-red-600 hover:bg-red-700 transition-colors"
              >
                Leave Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;
