"use client";
import React from 'react';

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

interface TeamCardProps {
  team: Team;
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  return (
    <div className="rounded-md border border-neutral-200 bg-white h-[320px] flex flex-col shadow transition-all duration-300 hover:border-[#f0b90b] cursor-pointer">
      {/* Banner Image */}
      <div className="h-24 w-full relative overflow-hidden">
        {team.bannerUrl ? (
          <img 
            src={team.bannerUrl} 
            alt={`${team.name} banner`} 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(252, 248, 240, 1) 50%, rgba(250, 243, 221, 1) 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderBottom: '1px solid rgba(240, 185, 11, 0.2)'
            }}
          ></div>
        )}
        {/* Team name and Twitter link */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-center">
          <h3 className="text-sm font-bold text-black" style={{ fontFamily: 'var(--font-dm-mono)' }}>{team.name}</h3>
          {team.twitterLink && (
            <a 
              href={team.twitterLink} 
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
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-bold text-gray-700">Team Members</h4>
          <span className="text-xs text-gray-500">{team.members.length} {team.members.length === 1 ? 'member' : 'members'}</span>
        </div>
        {team.members.length > 0 ? (
          <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar">
            <ul className="space-y-1.5">
              {team.members.map(member => (
                <li key={member.id} className="bg-gray-100 p-2 rounded-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-gray-800 text-xs font-bold">{member.name}</span>
                      {member.status && (
                        <div className="flex items-center ml-2">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                            member.status === 'accepted' ? 'bg-green-500' : 
                            member.status === 'rejected' ? 'bg-red-500' : 
                            'bg-yellow-500'
                          }`}></span>
                          <span className={`ml-1.5 text-xs ${
                            member.status === 'accepted' ? 'text-green-600' : 
                            member.status === 'rejected' ? 'text-red-600' : 
                            'text-yellow-600'
                          }`}>
                            {member.status === 'accepted' ? 'Accepted' : 
                             member.status === 'rejected' ? 'Declined' : 
                             'Pending'}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-gray-600 text-xs truncate ml-2 max-w-[100px]" title={member.walletAddress}>
                      {member.walletAddress.substring(0, 4)}...{member.walletAddress.substring(member.walletAddress.length - 4)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-xs">No team members yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamCard;
