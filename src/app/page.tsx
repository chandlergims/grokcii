"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import TournamentBracket from "../components/TournamentBracket";
import TeamCard from "../components/TeamCard";
import Modal from "../components/Modal";
import Button from "../components/Button";
import EventWindowsSlider from "../components/EventWindowsSlider";
import CountdownTimer from "../components/CountdownTimer";

// Sample event data
const today = new Date();
const currentDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

const sampleEventSessions = [
  {
    id: 'bracket1',
    title: 'Tournament 1',
    date: currentDate,
    startTime: '07:00 PM',
    endTime: '10:00 PM',
  },
  {
    id: 'bracket2',
    title: 'Tournament 2',
    date: '3/9/2025',
    startTime: '06:00 PM',
    endTime: '09:00 PM',
  },
  {
    id: 'bracket3',
    title: 'Tournament 3',
    date: '3/14/2025',
    startTime: '07:00 PM',
    endTime: '10:00 PM',
  },
  {
    id: 'bracket4',
    title: 'Tournament 4',
    date: '3/16/2025',
    startTime: '06:00 PM',
    endTime: '09:00 PM',
  },
  {
    id: 'bracket5',
    title: 'Tournament 5',
    date: '3/23/2025',
    startTime: '07:00 PM',
    endTime: '10:00 PM',
  },
  {
    id: 'bracket6',
    title: 'Tournament 6',
    date: '3/30/2025',
    startTime: '06:00 PM',
    endTime: '09:00 PM',
  },
  {
    id: 'bracket7',
    title: 'Tournament 7',
    date: '4/6/2025',
    startTime: '07:00 PM',
    endTime: '10:00 PM',
  },
  {
    id: 'bracket8',
    title: 'Tournament 8',
    date: '4/13/2025',
    startTime: '06:00 PM',
    endTime: '09:00 PM',
  },
  {
    id: 'bracket9',
    title: 'Tournament 9',
    date: '4/20/2025',
    startTime: '07:00 PM',
    endTime: '10:00 PM',
  },
  {
    id: 'bracket10',
    title: 'Tournament 10',
    date: '4/27/2025',
    startTime: '06:00 PM',
    endTime: '09:00 PM',
  },
];

// Add TypeScript declarations for Phantom wallet
declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom: boolean;
        connect: () => Promise<{ publicKey: { toString: () => string } }>;
        disconnect: () => Promise<void>;
      };
    };
  }
}

// Define types for team members
interface TeamMember {
  id: string;
  name: string;
  walletAddress: string;
}

// Define types for the team
interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  twitterLink: string; // Changed from optional to required
  bannerUrl: string; // Changed from optional to required
}

export default function Home() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalTeamCount, setTotalTeamCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newWalletAddresses, setNewWalletAddresses] = useState<string[]>(Array(5).fill(''));
  const [walletErrors, setWalletErrors] = useState<string[]>(Array(5).fill(''));
  const [twitterLink, setTwitterLink] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);

  // Function to validate Solana wallet address
  const isSolanaAddress = (address: string): boolean => {
    // Solana addresses are base58 encoded and 32-44 characters long
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
  };

  // Function to open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setNewTeamName('');
    setNewWalletAddresses(Array(5).fill(''));
    setWalletErrors(Array(5).fill(''));
    setTwitterLink('');
    setFormError(null);
    setBannerImage(null);
  };

  // Function to add a new wallet address field
  const addWalletAddressField = () => {
    if (newWalletAddresses.length < 10) {
      setNewWalletAddresses([...newWalletAddresses, '']);
      setWalletErrors([...walletErrors, '']);
    }
  };

  // Function to update a wallet address
  const updateWalletAddress = (index: number, value: string) => {
    const updatedAddresses = [...newWalletAddresses];
    updatedAddresses[index] = value;
    setNewWalletAddresses(updatedAddresses);
    
    // Validate the wallet address
    const updatedErrors = [...walletErrors];
    if (value.trim() && !isSolanaAddress(value.trim())) {
      updatedErrors[index] = 'Invalid Solana address';
    } else {
      updatedErrors[index] = '';
    }
    setWalletErrors(updatedErrors);
  };

  // Function to remove a wallet address field
  const removeWalletAddressField = (index: number) => {
    if (newWalletAddresses.length > 5) {
      const updatedAddresses = [...newWalletAddresses];
      updatedAddresses.splice(index, 1);
      setNewWalletAddresses(updatedAddresses);
      
      const updatedErrors = [...walletErrors];
      updatedErrors.splice(index, 1);
      setWalletErrors(updatedErrors);
    }
  };

  // Function to create a new team
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Validate team name
    if (!newTeamName.trim()) {
      setFormError("Team name is required");
      return;
    }
    
    // Validate Twitter link
    if (!twitterLink.trim()) {
      setFormError("Twitter handle is required");
      return;
    }
    
    // Validate banner image
    if (!bannerImage) {
      setFormError("Banner image is required");
      return;
    }
    
    // Filter out empty wallet addresses
    const validWalletAddresses = newWalletAddresses.filter(address => address.trim() !== '');
    
    // Validate minimum number of wallet addresses
    if (validWalletAddresses.length < 5) {
      setFormError(`At least 5 wallet addresses are required. You provided ${validWalletAddresses.length}.`);
      return;
    }
    
    // Validate all wallet addresses are valid Solana addresses
    const invalidAddresses = validWalletAddresses.filter(address => !isSolanaAddress(address.trim()));
    if (invalidAddresses.length > 0) {
      setFormError(`${invalidAddresses.length} invalid Solana wallet address(es). Please check and try again.`);
      return;
    }
    
    // Create team members from wallet addresses
    const members: TeamMember[] = validWalletAddresses.map((address, index) => ({
      id: `member-${Date.now()}-${index}`,
      name: `Member ${index + 1}`,
      walletAddress: address.trim()
    }));

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', newTeamName);
      formData.append('members', JSON.stringify(members));
      formData.append('twitterLink', twitterLink.trim());
      formData.append('bannerImage', bannerImage);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      // Create team via API
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setFormError(errorData.error || 'Failed to create team');
        return;
      }
      
      // Fetch updated teams
      fetchTeams();
      closeModal();
    } catch (error) {
      console.error('Error creating team:', error);
      setFormError('An error occurred while creating the team');
    }
  };
  
  // State for active tournament and join tournament functionality
  const [activeTournament, setActiveTournament] = useState<{
    id: string;
    name: string;
    teams: Team[];
    startDate: string;
  } | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isJoiningTournament, setIsJoiningTournament] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Function to fetch teams
  const fetchTeams = async (query: string = '') => {
    try {
      setIsLoading(true);
      
      let url = '/api/teams';
      const queryParams = new URLSearchParams();

      if (query.trim()) {
        queryParams.append('search', query);
      } else {
        queryParams.append('limit', '5'); // Only limit when no search query
      }

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams);
        setTotalTeamCount(data.totalCount);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to fetch active tournament
  const fetchActiveTournament = async () => {
    try {
      const response = await fetch('/api/tournaments/active');
      if (response.ok) {
        const data = await response.json();
        setActiveTournament(data.tournament);
      }
    } catch (error) {
      console.error('Error fetching active tournament:', error);
    }
  };
  
  // Function to fetch user's teams
  const fetchMyTeams = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const response = await fetch('/api/teams/my-teams', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMyTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Error fetching user teams:', error);
    }
  };
  
  // Function to open join tournament modal
  const openJoinModal = () => {
    fetchMyTeams();
    setIsJoinModalOpen(true);
    setSelectedTeamId(null);
    setJoinError(null);
  };
  
  // Function to close join tournament modal
  const closeJoinModal = () => {
    setIsJoinModalOpen(false);
    setSelectedTeamId(null);
    setJoinError(null);
  };
  
  // Function to join tournament
  const handleJoinTournament = async () => {
    if (!selectedTeamId) {
      setJoinError('Please select a team');
      return;
    }
    
    try {
      setIsJoiningTournament(true);
      setJoinError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const response = await fetch('/api/tournaments/join', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamId: selectedTeamId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join tournament');
      }
      
      // Refresh tournament data
      fetchActiveTournament();
      closeJoinModal();
      
      // Show success message
      alert('Successfully joined tournament!');
    } catch (error: any) {
      console.error('Error joining tournament:', error);
      setJoinError(error.message || 'Failed to join tournament');
    } finally {
      setIsJoiningTournament(false);
    }
  };
  
 
  
  // Fetch teams and active tournament on component mount
  useEffect(() => {
    fetchTeams();
    fetchActiveTournament();
  }, []);
  
  // Trigger search when query changes
  useEffect(() => {
    // Debounce search to avoid too many API calls
    const debounceTimeout = setTimeout(() => {
      fetchTeams(searchQuery);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  // We no longer need the handleAddMember function since we removed that functionality from TeamCard
  
  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check for auth token on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <>
      {/* Tournament Selector - Full width at the very top with no padding */}
      <EventWindowsSlider 
        eventId="fnf-tournaments"
        sessions={sampleEventSessions}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Teams Section */}
        <div className="mb-12">
          <div className="mb-6 flex justify-between items-center">
            <div className="rounded-md border border-neutral-200 bg-white text-neutral-950 shadow px-4 py-3 flex flex-col gap-1 hover:border-[#f0b90b] transition-all duration-300">
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-sm font-bold">Registered Teams</p>
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-center">{totalTeamCount}</p>
              </div>
            </div>
            
            {/* Cash Prize */}
            <div className="rounded-md border border-neutral-200 bg-white text-neutral-950 shadow px-4 py-3 flex flex-col gap-1 hover:border-[#f0b90b] transition-all duration-300">
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-sm font-bold">Cash Prize</p>
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-center"><span className="text-[#f0b90b]">30 SOL</span></p>
              </div>
            </div>
            
            {/* Next Tournament */}
            <div className="rounded-md border border-neutral-200 bg-white text-neutral-950 shadow px-4 py-3 flex flex-col gap-1 hover:border-[#f0b90b] transition-all duration-300">
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-sm font-bold">Next Tournament</p>
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-center">
                  {/* Extract just the time display from CountdownTimer */}
                  <CountdownTimer targetHour={12} targetMinute={0} />
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
              </div>
              <input
                type="text"
                className="block w-full p-2 pl-10 pr-10 text-sm text-gray-900 border border-[#f0b90b]/30 rounded-lg bg-white focus:outline-none"
                placeholder="Search FNF teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setSearchQuery('')}
                >
                  <svg 
                    className="w-4 h-4 text-gray-500 hover:text-[#f0b90b] transition-colors" 
                    aria-hidden="true" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Create Team Button */}
            <button
              onClick={openModal}
              className="flex items-center overflow-hidden rounded-md p-2 text-left outline-none transition-all duration-300 ease-in-out hover:bg-[#f0b90b]/10 border border-[#f0b90b] text-[#f0b90b] h-8 text-sm justify-center cursor-pointer w-full md:w-auto font-bold"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              <span>Create FNF</span>
            </button>
          </div>
          
          <div>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f0b90b]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Show all teams */}
                {teams.map(team => (
                  <TeamCard 
                    key={team.id} 
                    team={team} 
                  />
                ))}
                {teams.length === 0 && (
                  <div className="col-span-5 text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                    {searchQuery ? (
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-gray-500">No teams found matching "<span className="font-medium">{searchQuery}</span>"</p>
                      </div>
                    ) : (
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <p className="text-gray-500">No teams created yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Tournament Section - Bracket only */}
        <div className="mb-12">
          {/* Tournament Bracket */}
          <TournamentBracket 
          />
        </div>
        
        {/* Login Modal is now handled by NavbarContainer */}
        
        {/* Create Team Modal */}
        <Modal isOpen={isModalOpen} onClose={closeModal} title="Create New FNF Team">
          <form onSubmit={handleCreateTeam} className="space-y-6">
            {/* Banner Preview */}
            <div className="relative h-32 rounded-lg overflow-hidden bg-white border border-gray-300">
              {bannerImage && (
                <img 
                  src={URL.createObjectURL(bannerImage)} 
                  alt="Team banner" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              {/* Black background overlay removed */}
              <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-center">
                <h3 className="text-sm font-bold text-black" style={{ fontFamily: 'var(--font-dm-mono)' }}>{newTeamName || "Your Team Name"}</h3>
                {twitterLink && (
                  <a 
                    href={twitterLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-black hover:text-[#f0b90b] transition-colors p-1 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Team Info */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="teamName" className="block text-sm font-bold text-gray-700 mb-1">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="teamName"
                    type="text"
                    placeholder="Enter team name"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#f0b90b] focus:border-[#f0b90b]"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="twitterLink" className="block text-sm font-bold text-gray-700 mb-1">
                    Twitter @ <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="twitterLink"
                    type="text"
                    placeholder="Username"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#f0b90b] focus:border-[#f0b90b]"
                    value={twitterLink.replace('https://x.com/', '')}
                    onChange={(e) => {
                      // Store just the username, but with the full URL for the href
                      const username = e.target.value.trim().replace('@', '');
                      setTwitterLink(username ? `https://x.com/${username}` : '');
                    }}
                    required
                  />
                  <p className="text-xs font-bold text-gray-600 mt-1">Enter username without @</p>
                </div>
                
                <div>
                  <label htmlFor="bannerImage" className="block text-sm font-bold text-gray-700 mb-1">
                    Banner Image <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="bannerImage"
                    type="file"
                    accept="image/*"
                    className="w-full p-2 bg-white border border-gray-300 rounded text-gray-800 file:mr-4 file:py-1 file:px-4 file:rounded file:border file:border-[#f0b90b] file:text-[#f0b90b] file:bg-transparent hover:file:bg-[#f0b90b]/10 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setBannerImage(e.target.files[0]);
                      }
                    }}
                    required
                  />
                  <p className="text-xs font-bold text-gray-600 mt-1">Recommended size: 1200 x 400 pixels</p>
                </div>
              </div>
              
              {/* Right Column - Team Members */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Solana Wallet Addresses <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {newWalletAddresses.map((address, index) => (
                    <div key={index} className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Enter Solana wallet address"
                          className={`flex-1 p-2.5 bg-white border ${walletErrors[index] ? 'border-red-500' : 'border-gray-300'} rounded text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#f0b90b] focus:border-[#f0b90b] text-xs`}
                          value={address}
                          onChange={(e) => updateWalletAddress(index, e.target.value)}
                          required={index < 5}
                        />
                        {newWalletAddresses.length > 5 && (
                          <button
                            type="button"
                            onClick={() => removeWalletAddressField(index)}
                            className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {walletErrors[index] && (
                        <p className="text-xs text-red-500 mt-1">{walletErrors[index]}</p>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addWalletAddressField}
                  className="mt-2 text-xs font-bold text-[#f0b90b] hover:text-[#e5b00a] flex items-center transition-colors"
                  disabled={newWalletAddresses.length >= 10}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Add another wallet address
                </button>
              </div>
            </div>
            
            {/* Error Message */}
            {formError && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded">
                <p className="text-sm font-bold">{formError}</p>
              </div>
            )}
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-2">
              <button
                type="button"
                onClick={closeModal}
                className="flex items-center overflow-hidden rounded-md p-2 text-left outline-none transition-all duration-300 ease-in-out hover:bg-gray-100 border border-gray-300 text-gray-700 h-8 text-sm justify-center"
                style={{ fontFamily: 'var(--font-dm-mono)' }}
              >
                <span className="font-bold">Cancel</span>
              </button>
              <button
                type="submit"
                className="flex items-center overflow-hidden rounded-md p-2 text-left outline-none transition-all duration-300 ease-in-out hover:bg-[#f0b90b]/10 border border-[#f0b90b] text-[#f0b90b] h-8 text-sm justify-center font-bold"
                style={{ fontFamily: 'var(--font-dm-mono)' }}
              >
                <span>Create Team</span>
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
}
