"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TeamCard from '@/components/TeamCard';
import Modal from '@/components/Modal';

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
  createdBy?: string;
}

// Invite interface
interface Invite {
  _id: string;
  teamId: string;
  teamName: string;
  walletAddress: string;
  status: 'pending' | 'accepted' | 'rejected';
}

const TeamsPage = () => {
  const router = useRouter();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessingInvite, setIsProcessingInvite] = useState(false);
  
  // Fetch user data, teams, and invites
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('authToken');
        if (!token) {
          router.push('/');
          return;
        }
        
        // Decode token to get wallet address
        let decodedToken: { walletAddress: string };
        try {
          decodedToken = JSON.parse(atob(token));
          setWalletAddress(decodedToken.walletAddress);
        } catch (error) {
          console.error('Error decoding token:', error);
          router.push('/');
          return;
        }
        
        // Fetch teams
        const teamsResponse = await fetch('/api/teams', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!teamsResponse.ok) {
          throw new Error('Failed to fetch teams');
        }
        
        const teamsData = await teamsResponse.json();
        setTeams(teamsData.teams || []);
        
        // Fetch invites
        const invitesResponse = await fetch(`/api/invites?walletAddress=${decodedToken.walletAddress}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (invitesResponse.ok) {
          const invitesData = await invitesResponse.json();
          setInvites(invitesData.invites || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [router]);
  
  // Handle team deletion
  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;
    
    try {
      setIsDeleting(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/');
        return;
      }
      
      const response = await fetch(`/api/teams/${teamToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete team');
      }
      
      // Remove the deleted team from the list
      setTeams(teams.filter(team => team.id !== teamToDelete.id));
      setIsDeleteModalOpen(false);
      setTeamToDelete(null);
    } catch (error: any) {
      console.error('Error deleting team:', error);
      setError(error.message || 'Failed to delete team. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (team: Team) => {
    setTeamToDelete(team);
    setIsDeleteModalOpen(true);
  };
  
  // Handle invite response (accept/decline)
  const handleInviteResponse = async (inviteId: string, status: 'accepted' | 'rejected') => {
    try {
      setIsProcessingInvite(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/');
        return;
      }
      
      const response = await fetch('/api/invites', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inviteId,
          status
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${status === 'accepted' ? 'accept' : 'decline'} invite`);
      }
      
      // Remove the processed invite from the list
      setInvites(invites.filter(invite => invite._id !== inviteId));
      
      // If accepted, refresh teams list
      if (status === 'accepted') {
        const teamsResponse = await fetch('/api/teams', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          setTeams(teamsData.teams || []);
        }
      }
    } catch (error: any) {
      console.error('Error processing invite:', error);
      setError(error.message || 'Failed to process invite. Please try again.');
    } finally {
      setIsProcessingInvite(false);
    }
  };

  // Filter teams - handle the edge case where there might be teams created by an account with empty wallet address
  const myCreatedTeams = teams.filter(team => team.createdBy === walletAddress || team.createdBy === "");
  const teamsImIn = teams.filter(team => team.createdBy !== walletAddress && team.createdBy !== "" && 
    team.members.some(member => member.walletAddress === walletAddress));

  // State for active tab
  const [activeTab, setActiveTab] = useState<'created' | 'joined' | 'invites'>('created');
  
  // Count of pending invites for badge
  const pendingInvitesCount = invites.length;

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col">
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md mx-4 mt-4">
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f0b90b]"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md flex-1">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-white">
            <button
              onClick={() => setActiveTab('created')}
              className={`flex items-center px-6 py-4 text-sm font-bold ${
                activeTab === 'created'
                  ? 'text-[#f0b90b] border-b-2 border-[#f0b90b]'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              My Teams
              <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-bold">
                {myCreatedTeams.length}/5
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('joined')}
              className={`flex items-center px-6 py-4 text-sm font-bold ${
                activeTab === 'joined'
                  ? 'text-[#f0b90b] border-b-2 border-[#f0b90b]'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Joined Teams
              <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-bold">
                {teamsImIn.length}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('invites')}
              className={`flex items-center px-6 py-4 text-sm font-bold ${
                activeTab === 'invites'
                  ? 'text-[#f0b90b] border-b-2 border-[#f0b90b]'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Invites
              {pendingInvitesCount > 0 && (
                <span className="ml-2 bg-[#f0b90b] text-white px-2 py-0.5 rounded-full text-xs font-bold">
                  {pendingInvitesCount}
                </span>
              )}
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {/* My Teams Tab */}
            {activeTab === 'created' && (
              <div>
                {myCreatedTeams.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {myCreatedTeams.map(team => (
                      <div key={team.id} className="relative group transition-all duration-300 hover:shadow-lg">
                        <div className="block">
                          <TeamCard team={team} />
                        </div>
                        <div className="absolute inset-0 backdrop-blur-0 group-hover:backdrop-blur-sm transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => openDeleteModal(team)}
                            className="bg-red-600 text-white p-2 rounded-full shadow-lg transform transition-transform hover:scale-110"
                            aria-label="Delete team"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 text-center border border-gray-200 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Teams Created</h3>
                    <p className="text-gray-600 mb-6 font-bold">You haven't created any teams yet</p>
                    <button 
                      onClick={() => router.push('/')}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-[#f0b90b] hover:bg-[#e5b00a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f0b90b]"
                    >
                      Create a Team
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Joined Teams Tab */}
            {activeTab === 'joined' && (
              <div>
                {teamsImIn.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {teamsImIn.map(team => (
                      <div key={team.id} className="transition-all duration-300 hover:shadow-lg">
                        <TeamCard team={team} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 text-center border border-gray-200 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Teams Joined</h3>
                    <p className="text-gray-600 font-bold">You haven't joined any teams yet</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Invites Tab */}
            {activeTab === 'invites' && (
              <div>
                {invites.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {invites.map(invite => (
                      <div key={invite._id} className="bg-white p-6 rounded-lg border border-neutral-200 shadow hover:border-[#f0b90b] transition-all duration-300">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-[#f0b90b]/20 flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#f0b90b]" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{invite.teamName}</h3>
                            <p className="text-sm text-gray-500 font-bold">Team Invitation</p>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 font-bold">You've been invited to join this team</p>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleInviteResponse(invite._id, 'accepted')}
                            disabled={isProcessingInvite}
                            className="flex-1 px-4 py-2 bg-[#f0b90b] text-white text-sm rounded-md hover:bg-[#e5b00a] transition-colors font-bold"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleInviteResponse(invite._id, 'rejected')}
                            disabled={isProcessingInvite}
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300 transition-colors font-bold"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 text-center border border-gray-200 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Invites</h3>
                    <p className="text-gray-600 font-bold">You don't have any team invitations</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)} 
        title="Delete Team"
      >
        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-gray-700 font-bold mb-2">You are about to delete:</p>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#f0b90b]/20 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#f0b90b]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <span className="text-gray-900 font-bold">{teamToDelete?.name}</span>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            Deleting this team will remove all associated data, including member information and tournament registrations.
          </p>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="flex items-center overflow-hidden rounded-md p-2 text-left outline-none transition-all duration-300 ease-in-out hover:bg-gray-100 border border-gray-300 text-gray-700 h-8 text-sm justify-center"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              <span className="font-bold">Cancel</span>
            </button>
            <button
              type="button"
              className="flex items-center overflow-hidden rounded-md p-2 text-left outline-none transition-all duration-300 ease-in-out hover:bg-red-600/90 border border-red-600 bg-red-600 text-white h-8 text-sm justify-center"
              onClick={handleDeleteTeam}
              disabled={isDeleting}
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  <span className="font-bold">Deleting...</span>
                </>
              ) : (
                <span className="font-bold">Delete Team</span>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeamsPage;
