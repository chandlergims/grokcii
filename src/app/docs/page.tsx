"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div>
            <h1 className="text-4xl font-bold mb-6">FantasyFNF Overview</h1>
            <div className="text-gray-500 text-base mb-8">The definitive guide to the FantasyFNF platform</div>
            
            <div className="prose max-w-none">
              <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                FantasyFNF is a sophisticated competitive trading platform that leverages the concept of traditional fantasy sports leagues, applying it to financial trading performance metrics rather than athletic statistics.
              </p>
              
              <div className="bg-[#f0b90b]/10 p-6 rounded-lg border-l-4 border-[#f0b90b] my-8">
                <p className="text-gray-700 leading-relaxed text-lg">
                  Participants establish teams (designated as FantasyFNFs) comprising 5-10 members. These teams engage in competitive tournaments where performance is evaluated based on trading metrics. The Cielo Finance API provides comprehensive tracking of each member&apos;s PnL (Profit and Loss), with the aggregated performance determining tournament advancement and ultimate victory.
                </p>
              </div>
              
              <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                Successful teams are awarded substantial financial incentives in the form of SOL tokens, creating both a competitive environment and significant potential for financial gain.
              </p>
              
              <div className="mt-12">
                <h2 className="text-3xl font-semibold mb-6">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-xl mb-3">Team-Based Competition</h3>
                    <p className="text-gray-600 text-base">Form teams of 5-10 traders and compete against other teams based on combined performance.</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-xl mb-3">Performance Tracking</h3>
                    <p className="text-gray-600 text-base">Real-time tracking of trading performance through the Cielo Finance API.</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-xl mb-3">Tournament Structure</h3>
                    <p className="text-gray-600 text-base">Compete in structured tournaments with brackets and elimination rounds.</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-xl mb-3">Cash Prizes</h3>
                    <p className="text-gray-600 text-base">Win cash prizes based on your team&apos;s performance in tournaments.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'teams':
        return (
          <div>
            <h1 className="text-4xl font-bold mb-6">Team Management</h1>
            <div className="text-gray-500 text-base mb-8">Comprehensive guide to creating, joining, and managing FantasyFNF teams</div>
            
            <div className="prose max-w-none">
              <h2 className="text-3xl font-semibold mt-10 mb-6">Creating a Team</h2>
              <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                To create a FantasyFNF team, click the &quot;Create FantasyFNF&quot; button on the home page. You&apos;ll need to provide:
              </p>
              <ul className="list-disc pl-8 mb-8 space-y-3 text-lg">
                <li className="text-gray-700">Team name</li>
                <li className="text-gray-700">5-10 valid Solana wallet addresses for team members</li>
                <li className="text-gray-700">Twitter handle (required)</li>
                <li className="text-gray-700">Banner image (required)</li>
              </ul>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 my-8 shadow-sm">
                <div className="flex items-start">
                  <div className="bg-[#f0b90b]/20 p-2 rounded-full mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#f0b90b]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base text-gray-700 font-medium">Note</p>
                    <p className="text-base text-gray-600">Each team member must accept their invitation before they can participate in tournaments.</p>
                  </div>
                </div>
              </div>
              
              <h2 className="text-3xl font-semibold mt-10 mb-6">Team Requirements</h2>
              <ul className="list-disc pl-8 mb-8 space-y-3 text-lg">
                <li className="text-gray-700">Minimum of 5 members</li>
                <li className="text-gray-700">Maximum of 10 members</li>
                <li className="text-gray-700">Each member must accept their invitation to join the team</li>
                <li className="text-gray-700">Each wallet address must be a valid Solana address</li>
                <li className="text-gray-700">Team must have a Twitter handle</li>
                <li className="text-gray-700">Team must have a banner image</li>
              </ul>
              
              <h2 className="text-3xl font-semibold mt-10 mb-6">Managing Teams</h2>
              <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                Once logged in, you can manage your teams by clicking on &quot;Manage Teams&quot; in the navigation bar. From there, you can:
              </p>
              <ul className="list-disc pl-8 mb-8 space-y-3 text-lg">
                <li className="text-gray-700">View your teams</li>
                <li className="text-gray-700">Edit team details</li>
                <li className="text-gray-700">View pending invitations</li>
                <li className="text-gray-700">Remove team members</li>
              </ul>
              
            </div>
          </div>
        );
      case 'tournaments':
        return (
          <div>
            <h1 className="text-4xl font-bold mb-6">Tournament Structure</h1>
            <div className="text-gray-500 text-base mb-8">Detailed information on tournament formats, progression, and prize distribution</div>
            
            <div className="prose max-w-none">
              <h2 className="text-3xl font-semibold mt-10 mb-6">How Tournaments Work</h2>
              <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                Tournaments in FantasyFNF are structured competitions where teams compete against each other based on their trading performance. Each tournament has a specific timeframe, and teams are matched in brackets.
              </p>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 my-8 shadow-sm">
                <h3 className="font-medium text-xl mb-4">Tournament Timeline</h3>
                <ol className="list-decimal pl-8 space-y-3 text-lg">
                  <li className="text-gray-700">Registration period opens</li>
                  <li className="text-gray-700">Teams register and are seeded into brackets</li>
                  <li className="text-gray-700">Tournament begins with first round matches</li>
                  <li className="text-gray-700">Teams advance through brackets based on performance</li>
                  <li className="text-gray-700">Finals determine the overall winner</li>
                  <li className="text-gray-700">Prizes are distributed to winners</li>
                </ol>
              </div>
              
              <h2 className="text-3xl font-semibold mt-10 mb-6">Joining a Tournament</h2>
              <ul className="list-disc pl-8 mb-8 space-y-3 text-lg">
                <li className="text-gray-700">Each tournament is limited to 8 fully verified FantasyFNF teams</li>
                <li className="text-gray-700">All team members must accept their invitations before a team can join a tournament</li>
                <li className="text-gray-700">Teams can register for tournaments through the Events page or directly from tournament announcements</li>
                <li className="text-gray-700">Teams are accepted on a first-come, first-served basis until the tournament fills up</li>
              </ul>
              
              <div className="bg-[#f0b90b]/10 p-6 rounded-lg border-l-4 border-[#f0b90b] my-8">
                <div className="flex items-start">
                  <div className="bg-[#f0b90b]/20 p-2 rounded-full mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#f0b90b]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base text-gray-700 font-medium">Important</p>
                    <p className="text-base text-gray-600">A fully verified FantasyFNF team means all members have accepted their invitations and the team has a valid Twitter handle and banner image.</p>
                  </div>
                </div>
              </div>
              
              <h2 className="text-3xl font-semibold mt-10 mb-6">Tournament Progression</h2>
              <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                Teams advance through tournament brackets based on their performance. The Cielo Finance API tracks each member&apos;s PnL (Profit and Loss), and the combined team performance determines the winner of each match-up.
              </p>
              
              <h2 className="text-3xl font-semibold mt-10 mb-6">Prizes</h2>
              <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                Tournament winners receive cash prizes, with the amount varying based on the tournament&apos;s size. Prize distribution is typically announced before the tournament begins.
              </p>
              
              <div className="bg-[#f0b90b]/10 p-6 rounded-lg border-l-4 border-[#f0b90b] my-8">
                <p className="text-gray-700 leading-relaxed text-lg">
                  Prize pools can range from 30 SOL for smaller tournaments to much larger amounts for major events.
                </p>
              </div>
              
              <h2 className="text-3xl font-semibold mt-10 mb-6">Prize Distribution</h2>
              <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                When a team wins a tournament, the prize is distributed equally among all team members. This ensures that every participant receives a fair share of the rewards for their contribution to the team&apos;s success.
              </p>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 my-8 shadow-sm">
                <h3 className="font-medium text-xl mb-4">Current Distribution Model</h3>
                <p className="text-gray-700 mb-3 text-lg">For a team of 5 members winning a 30 SOL prize:</p>
                <div className="bg-gray-50 p-4 rounded font-mono text-base">
                  Individual Prize = Total Prize / Number of Members
                  <br />
                  Individual Prize = 30 SOL / 5 = 6 SOL per member
                </div>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                In the future, we may introduce alternative distribution models that take into account individual performance metrics. This could reward team members based on their specific contributions to the team&apos;s overall success.
              </p>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 my-8 shadow-sm">
                <div className="flex items-start">
                  <div className="bg-[#f0b90b]/20 p-2 rounded-full mr-4 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#f0b90b]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base text-gray-700 font-medium">Future Considerations</p>
                    <p className="text-base text-gray-600">We are exploring performance-based distribution models that would reward individual traders based on metrics such as PnL contribution, risk management, and consistency. Any changes to the prize distribution model will be announced well in advance of implementation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'performance':
        return (
          <div>
            <h1 className="text-4xl font-bold mb-6">Performance Analytics</h1>
            <div className="text-gray-500 text-base mb-8">Advanced metrics and methodologies for measuring trading performance</div>
            
            <div className="prose max-w-none">
              <h2 className="text-3xl font-semibold mt-10 mb-6">Cielo Finance API Integration</h2>
              <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                FantasyFNF uses the Cielo Finance API to track the trading performance of each team member. This API provides real-time data on:
              </p>
              <ul className="list-disc pl-8 mb-8 space-y-3 text-lg">
                <li className="text-gray-700">Individual PnL (Profit and Loss)</li>
                <li className="text-gray-700">Trading volume</li>
                <li className="text-gray-700">Position sizes</li>
                <li className="text-gray-700">Entry and exit points</li>
              </ul>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 my-8 shadow-sm">
                <p className="text-base text-gray-700 font-medium mb-3">API Response Example</p>
                <pre className="bg-gray-800 text-gray-100 p-5 rounded-lg overflow-x-auto">
                  <code className="text-base">{`{
  "trader": "8xj7dE4Jd3V2xQUZ...",
  "performance": {
    "totalPnL": 2.45,
    "percentageGain": 12.3,
    "tradeCount": 17,
    "averagePosition": 0.5,
    "largestWin": 1.2,
    "largestLoss": 0.4
  },
  "timestamp": "2025-03-07T21:34:12Z"
}`}</code>
                </pre>
              </div>
              
              <h2 className="text-3xl font-semibold mt-10 mb-6">Team Performance Calculation</h2>
              <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                A team&apos;s overall performance is calculated by combining the PnL of all team members. This combined score is then used to determine the winner when competing against another team in a tournament.
              </p>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200 my-8 shadow-sm">
                <h3 className="font-medium text-xl mb-4">Performance Formula</h3>
                <p className="text-gray-700 mb-3 text-lg">The basic formula for team performance is:</p>
                <div className="bg-gray-50 p-4 rounded font-mono text-base">
                  Team Score = Σ(Member PnL × Weight Factor)
                </div>
                <p className="text-gray-700 mt-3 text-base">Where the weight factor may adjust based on position size, risk taken, or other factors.</p>
              </div>
              
              <h2 className="text-3xl font-semibold mt-10 mb-6">Performance Metrics</h2>
              <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                Various metrics are used to evaluate performance, including:
              </p>
              <ul className="list-disc pl-8 mb-8 space-y-3 text-lg">
                <li className="text-gray-700">Total PnL</li>
                <li className="text-gray-700">Percentage gain/loss</li>
                <li className="text-gray-700">Risk-adjusted returns</li>
                <li className="text-gray-700">Consistency of performance</li>
              </ul>
            </div>
          </div>
        );
      default:
        return <div>Select a section from the sidebar to view documentation.</div>;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-72 md:min-h-screen border-r border-gray-200 flex-shrink-0 bg-gray-50 md:sticky md:top-0 md:h-screen">
        <div className="sticky top-0 p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-center">
            <img src="/logo.png" alt="FantasyFNF Logo" className="h-12" />
          </div>
        </div>
        <nav className="p-6">
          <div className="mb-6 text-sm font-medium text-gray-500 uppercase tracking-wider">Getting Started</div>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveSection('overview')}
                className={`w-full text-left px-4 py-3 rounded-md text-base transition-colors ${
                  activeSection === 'overview' 
                    ? 'bg-[#f0b90b]/10 text-[#f0b90b] font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Overview
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('teams')}
                className={`w-full text-left px-4 py-3 rounded-md text-base transition-colors ${
                  activeSection === 'teams' 
                    ? 'bg-[#f0b90b]/10 text-[#f0b90b] font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Teams
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('tournaments')}
                className={`w-full text-left px-4 py-3 rounded-md text-base transition-colors ${
                  activeSection === 'tournaments' 
                    ? 'bg-[#f0b90b]/10 text-[#f0b90b] font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Tournaments
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('performance')}
                className={`w-full text-left px-4 py-3 rounded-md text-base transition-colors ${
                  activeSection === 'performance' 
                    ? 'bg-[#f0b90b]/10 text-[#f0b90b] font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Performance Tracking
              </button>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-10 max-w-5xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
}
