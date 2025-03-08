"use client";
import React, { useState, useEffect, useRef } from 'react';
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
}

const EditTeamPage = () => {
  const router = useRouter();
  const params = useParams();
  const teamId = params.id as string;
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [name, setName] = useState('');
  const [twitterLink, setTwitterLink] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [memberName, setMemberName] = useState('');
  const [memberWallet, setMemberWallet] = useState('');
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

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
        setName(data.team.name);
        setTwitterLink(data.team.twitterLink || '');
        setMembers(data.team.members || []);
        if (data.team.bannerUrl) {
          setBannerPreview(data.team.bannerUrl);
        }
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

  // Handle banner image selection
  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBannerPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Add team member
  const addMember = () => {
    if (memberName.trim() && memberWallet.trim()) {
      setMembers([
        ...members,
        {
          id: Date.now().toString(),
          name: memberName.trim(),
          walletAddress: memberWallet.trim(),
          status: 'pending'
        }
      ]);
      setMemberName('');
      setMemberWallet('');
    }
  };

  // Remove team member
  const removeMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/');
        return;
      }
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('members', JSON.stringify(members));
      if (twitterLink.trim()) {
        formData.append('twitterLink', twitterLink.trim());
      }
      if (bannerImage) {
        formData.append('bannerImage', bannerImage);
      }
      
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update team');
      }
      
      // Redirect to team page
      router.push(`/teams/${teamId}`);
    } catch (error: any) {
      console.error('Error updating team:', error);
      setError(error.message || 'Failed to update team. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          <p>Team not found or you don't have permission to edit it.</p>
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
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Edit Team</h1>
          <Link 
            href={`/teams/${teamId}`}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Back to Team
          </Link>
        </div>
        
        {/* Edit Form */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 shadow-lg border border-[#2a2a2a]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Banner Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Team Banner</label>
              <div 
                className="w-full h-40 border-2 border-dashed border-gray-700 rounded-lg overflow-hidden relative cursor-pointer hover:border-gray-500 transition-colors"
                onClick={triggerFileInput}
                style={{
                  backgroundImage: bannerPreview ? `url(${bannerPreview})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!bannerPreview && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs">Click to upload banner image</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleBannerSelect}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Recommended size: 1200 x 400 pixels</p>
            </div>

            {/* Team Name */}
            <div>
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-300 mb-1">
                Team Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="teamName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#232323] border border-[#333] rounded p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter team name"
                required
              />
            </div>

            {/* Twitter Link */}
            <div>
              <label htmlFor="twitterLink" className="block text-sm font-medium text-gray-300 mb-1">
                Twitter @ (Optional)
              </label>
              <input
                type="text"
                id="twitterLink"
                value={twitterLink.replace('https://x.com/', '')}
                onChange={(e) => {
                  // Store just the username, but with the full URL for the href
                  const username = e.target.value.trim().replace('@', '');
                  setTwitterLink(username ? `https://x.com/${username}` : '');
                }}
                className="w-full bg-[#232323] border border-[#333] rounded p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Username"
              />
              <p className="text-xs text-gray-500 mt-1">Enter username without @</p>
            </div>

            {/* Team Members */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Team Members
                </label>
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
              
              {/* Add Member Form */}
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="flex-1 bg-[#232323] border border-[#333] rounded p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Member name"
                />
                <input
                  type="text"
                  value={memberWallet}
                  onChange={(e) => setMemberWallet(e.target.value)}
                  className="flex-1 bg-[#232323] border border-[#333] rounded p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Wallet address"
                />
                <button
                  type="button"
                  onClick={addMember}
                  className="bg-[#333] text-white p-2 rounded hover:bg-[#444] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {/* Members List */}
              {members.length > 0 ? (
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {members.map(member => (
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
                        </div>
                        <p className="text-gray-400 text-xs truncate max-w-[200px]" title={member.walletAddress}>
                          {member.walletAddress.substring(0, 6)}...{member.walletAddress.substring(member.walletAddress.length - 4)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMember(member.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm text-center py-3 bg-[#1e1e1e] rounded">
                  No team members added yet
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                New team members will receive invites to join your team
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex space-x-3">
              <Link
                href={`/teams/${teamId}`}
                className="flex-1 py-2.5 rounded text-white font-medium bg-gray-700 hover:bg-gray-600 transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className={`flex-1 py-2.5 rounded text-white font-medium ${
                  isSubmitting || !name.trim() 
                    ? 'bg-gray-700 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 transition-colors'
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTeamPage;
