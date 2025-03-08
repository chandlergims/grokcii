"use client";
import React, { useState, useRef } from 'react';

// Button component to trigger the create team modal
export const CreateTeamButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button
      className="px-4 py-2 bg-transparent border border-gray-700 text-gray-300 rounded hover:bg-gray-800 hover:border-gray-600 transition-colors text-sm flex items-center"
      onClick={onClick}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
      New Team
    </button>
  );
};

// Team member interface
interface TeamMember {
  id: string;
  name: string;
  walletAddress: string;
}

// Form props interface
interface CreateTeamFormProps {
  onSubmit: (data: {
    name: string;
    members: TeamMember[];
    twitterLink?: string;
    bannerImage?: File;
  }) => void;
  isSubmitting: boolean;
}

// Main form component
const CreateTeamForm: React.FC<CreateTeamFormProps> = ({ onSubmit, isSubmitting }) => {
  // Form state
  const [name, setName] = useState('');
  const [twitterLink, setTwitterLink] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [memberName, setMemberName] = useState('');
  const [memberWallet, setMemberWallet] = useState('');
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          walletAddress: memberWallet.trim()
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({
        name: name.trim(),
        members,
        twitterLink: twitterLink.trim() || undefined,
        bannerImage: bannerImage || undefined
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Banner Image Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Team Banner</label>
        <div 
          className="w-full h-32 border-2 border-dashed border-gray-700 rounded-lg overflow-hidden relative cursor-pointer hover:border-gray-500 transition-colors"
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
          Twitter Link (Optional)
        </label>
        <input
          type="url"
          id="twitterLink"
          value={twitterLink}
          onChange={(e) => setTwitterLink(e.target.value)}
          className="w-full bg-[#232323] border border-[#333] rounded p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://twitter.com/yourteam"
        />
      </div>

      {/* Team Members */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Team Members
        </label>
        
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
          <ul className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
            {members.map(member => (
              <li key={member.id} className="bg-[#232323] p-2 rounded flex justify-between items-center">
                <div>
                  <p className="text-white text-sm">{member.name}</p>
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
          Team members will receive invites to join your team
        </p>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className={`w-full py-2.5 rounded text-white font-medium ${
            isSubmitting || !name.trim() 
              ? 'bg-gray-700 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 transition-colors'
          }`}
        >
          {isSubmitting ? 'Creating Team...' : 'Create Team'}
        </button>
      </div>
    </form>
  );
};

export default CreateTeamForm;
