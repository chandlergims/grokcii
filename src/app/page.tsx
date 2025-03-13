"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Modal from "../components/Modal";

// Define types for Grok character
interface GrokCharacter {
  _id: string;
  walletAddress: string;
  name: string;
  asciiArt: string;
  story: string;
  createdAt: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [grokCharacter, setGrokCharacter] = useState<GrokCharacter | null>(null);
  const [allCharacters, setAllCharacters] = useState<GrokCharacter[]>([]);
  const [isGrokLoading, setIsGrokLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<GrokCharacter | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  
  // Function to open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  // Function to open character detail modal
  const openDetailModal = (character: GrokCharacter) => {
    setSelectedCharacter(character);
    setIsDetailModalOpen(true);
  };

  // Function to close character detail modal
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCharacter(null);
  };
  
  // Function to check login status and load character
  const checkLoginAndLoadCharacter = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // Decode token to get wallet address
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        const address = decoded.walletAddress;
        
        if (address) {
          setWalletAddress(address);
          setIsLoggedIn(true);
          
          // Load the character for this wallet
          loadCharacter(address);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      setIsLoggedIn(false);
      setWalletAddress('');
      setGrokCharacter(null);
    }
  };
  
  // Check if user is logged in on component mount and load characters
  useEffect(() => {
    // Load all characters
    loadAllCharacters();
    
    // Check login status
    checkLoginAndLoadCharacter();
    
    // Set up storage event listener to detect login/logout
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        checkLoginAndLoadCharacter();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for login detection within the same window
    const handleLoginEvent = () => {
      checkLoginAndLoadCharacter();
    };
    
    window.addEventListener('login', handleLoginEvent);
    window.addEventListener('logout', handleLoginEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('login', handleLoginEvent);
      window.removeEventListener('logout', handleLoginEvent);
    };
  }, []);
  
  // Function to load all characters
  const loadAllCharacters = async () => {
    try {
      const response = await fetch('/api/grok/all');
      if (response.ok) {
        const data = await response.json();
        setAllCharacters(data.characters);
      }
    } catch (error) {
      console.error('Error loading all characters:', error);
    }
  };
  
  // Function to search characters
  const searchCharacters = async (query: string) => {
    if (!query.trim()) {
      loadAllCharacters();
      return;
    }
    
    try {
      setIsSearching(true);
      const response = await fetch(`/api/grok/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setAllCharacters(data.characters);
      }
    } catch (error) {
      console.error('Error searching characters:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Effect to handle search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchCharacters(searchQuery);
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);
  
  // Function to load character for a wallet
  const loadCharacter = async (address: string) => {
    try {
      setIsGrokLoading(true);
      const response = await fetch(`/api/grok?walletAddress=${address}`);
      if (response.ok) {
        const data = await response.json();
        setGrokCharacter(data.character);
        
        // Refresh all characters after loading user's character
        loadAllCharacters();
      }
    } catch (error) {
      console.error('Error loading character:', error);
    } finally {
      setIsGrokLoading(false);
    }
  };
  
  // Function to create a Grok character
  const createGrokCharacter = async (forceRefresh = false) => {
    if (!isLoggedIn || !walletAddress) {
      alert("You must be logged in to create a GrokCII character");
      return;
    }
    
    try {
      setIsGrokLoading(true);
      
      const url = forceRefresh 
        ? `/api/grok?walletAddress=${walletAddress}&refresh=true`
        : `/api/grok?walletAddress=${walletAddress}`;
        
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setGrokCharacter(data.character);
      } else {
        throw new Error("Failed to create GrokCII character");
      }
    } catch (error) {
      console.error('Error creating GrokCII character:', error);
      alert("Failed to create GrokCII character. Please try again.");
    } finally {
      setIsGrokLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Info Box - Positioned in top left */}
      <div className="relative">
        <div className="absolute top-0 left-0 w-64 p-3 rounded-lg border border-[#91c9a6] shadow-md z-10" 
          style={{ backgroundColor: 'rgba(3, 6, 23, 0.95)' }}>
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-bold" style={{ color: '#91c9a6' }}>About GrokCII</h3>
            <div className="text-xs text-[#91c9a6] cursor-pointer hover:text-white">ⓘ</div>
          </div>
          <p className="text-xs mb-1" style={{ color: '#ffffff', lineHeight: '1.2' }}>
            Every wallet gets a unique ASCII character generated by Grok AI with a name and backstory.
          </p>
          <p className="text-xs" style={{ color: '#ffffff', lineHeight: '1.2' }}>
            <span className="font-bold" style={{ color: '#91c9a6' }}>Tokenize:</span> Turn your character into an SPL token on Solana and join the ecosystem!
          </p>
        </div>
      </div>
      
      
      {/* User's Character Card (if logged in) */}
      <div className="mt-4 mb-6">
        <div className="relative mb-3">
          <h2 className="text-lg font-bold text-center" style={{ color: '#91c9a6' }}>Your Character</h2>
          {showErrorMessage && (
            <p className="text-red-500 text-xs text-center mt-1 animate-pulse">You already have a character</p>
          )}
        </div>
        
        {/* Generate Character button removed - characters auto-create on login */}
        
        {isGrokLoading ? (
          <div className="max-w-xs mx-auto flex justify-center items-center h-40 rounded-md border border-[#91c9a6] shadow" style={{ backgroundColor: '#1E1E2E', color: '#91c9a6' }}>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#91c9a6]"></div>
          </div>
        ) : grokCharacter ? (
          <div 
            className="max-w-xs mx-auto rounded-md border border-[#91c9a6] shadow px-4 py-3 flex flex-col gap-1 hover:border-[#91c9a6] transition-all duration-300 cursor-pointer"
            style={{ backgroundColor: '#1E1E2E', color: '#91c9a6' }}
            onClick={() => openDetailModal(grokCharacter)}
          >
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col">
                <p className="text-sm font-bold" style={{ color: '#91c9a6' }}>{grokCharacter.name}</p>
              </div>
              <div className="flex flex-col">
                <Link
                  href="/tokenize"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="text-xs text-[#91c9a6] hover:text-[#91c9a6] transition-colors cursor-pointer"
                >
                  Tokenize
                </Link>
              </div>
            </div>
            
            {/* ASCII Art - fixed height with scroll */}
            <div className="h-24 overflow-auto rounded p-1 my-1" style={{ backgroundColor: '#1E1E2E' }}>
              <pre className="whitespace-pre font-mono text-[10px] text-center" style={{ color: '#91c9a6' }}>{grokCharacter.asciiArt}</pre>
            </div>
            
            {/* Story */}
            <div className="flex flex-col">
              <p className="text-xs italic line-clamp-2" style={{ color: '#91c9a6' }}>{grokCharacter.story}</p>
            </div>
          </div>
        ) : (
          <div className="max-w-xs mx-auto flex justify-center items-center h-40 rounded-md border border-[#91c9a6] shadow p-4" style={{ backgroundColor: '#1E1E2E' }}>
            <p className="text-sm" style={{ color: '#91c9a6' }}>Connect your wallet to generate a character</p>
          </div>
        )}
      </div>
      
      {/* All Characters Section */}
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-3 text-center" style={{ color: '#91c9a6' }}>GrokCII Characters (20 Most Recent)</h2>
        
        {/* Search Input - Moved here */}
        <div className="max-w-md mx-auto mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input
              type="text"
              className="block w-full p-2 pl-10 pr-10 text-sm border border-[#91c9a6] rounded-lg focus:outline-none"
              style={{ backgroundColor: '#1E1E2E', color: '#91c9a6' }}
              placeholder="Search GrokCII characters..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={() => setSearchQuery('')}
              >
                <svg 
                  className="w-4 h-4 text-gray-500 hover:text-[#91c9a6] transition-colors" 
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
        </div>
        
        {isSearching ? (
          <div className="flex justify-center my-4 h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#91c9a6]"></div>
          </div>
        ) : allCharacters.length === 0 ? (
          <div className="text-center my-8" style={{ color: '#91c9a6' }}>
            {searchQuery ? `No GrokCII characters found matching "${searchQuery}"` : "No GrokCII characters found"}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {allCharacters.map((character) => (
              <div 
                key={character._id.toString()} 
                className="rounded-md border border-[#91c9a6] shadow px-4 py-3 flex flex-col gap-1 hover:border-[#91c9a6] transition-all duration-300 cursor-pointer"
                style={{ backgroundColor: '#1E1E2E', color: '#91c9a6' }}
                onClick={() => openDetailModal(character)}
              >
                <div className="flex flex-row items-center justify-between">
                  <div className="flex flex-col">
                      <p className="text-sm font-bold truncate" style={{ color: '#91c9a6' }}>{character.name}</p>
                  </div>
                </div>
                
                  {/* ASCII Art - fixed height with scroll */}
                  <div className="h-24 overflow-auto rounded p-1 my-1" style={{ backgroundColor: '#1E1E2E' }}>
                    <pre className="whitespace-pre font-mono text-[10px] text-center" style={{ color: '#91c9a6' }}>{character.asciiArt}</pre>
                  </div>
                
                {/* Story */}
                <div className="flex flex-col">
                  <p className="text-xs italic line-clamp-2" style={{ color: '#91c9a6' }}>{character.story}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Character Detail Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={closeDetailModal} title={selectedCharacter?.name || "Character Details"}>
        {selectedCharacter && (
          <div className="w-full">
            <div className="p-4 rounded-md mb-4 overflow-x-auto" style={{ backgroundColor: '#1E1E2E' }}>
              <pre className="whitespace-pre font-mono text-sm text-center" style={{ color: '#91c9a6' }}>{selectedCharacter.asciiArt}</pre>
            </div>
            <p className="mb-4" style={{ color: '#91c9a6' }}>{selectedCharacter.story}</p>
            <div className="flex justify-end">
              <button
                onClick={closeDetailModal}
                className="flex items-center overflow-hidden rounded-md p-2 text-left outline-none transition-all duration-300 ease-in-out hover:bg-[#1E1E2E] border border-[#91c9a6] h-8 text-sm justify-center cursor-pointer"
                style={{ color: '#91c9a6', fontFamily: 'var(--font-dm-mono)' }}
              >
                <span className="font-bold">Close</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
