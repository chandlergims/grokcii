"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Modal from "@/components/Modal";

// Define types for Grok character
interface GrokCharacter {
  _id: string;
  walletAddress: string;
  name: string;
  asciiArt: string;
  story: string;
  createdAt: string;
  tokenAddress?: string;
  tokenizedAt?: string;
}

export default function TokenizePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [grokCharacter, setGrokCharacter] = useState<GrokCharacter | null>(null);
  const [tokenAddress, setTokenAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenizedCharacters, setTokenizedCharacters] = useState<GrokCharacter[]>([]);
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<GrokCharacter | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filteredCharacters, setFilteredCharacters] = useState<GrokCharacter[]>([]);
  
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
  
  // Check if user is logged in on component mount
  useEffect(() => {
    const checkAuth = () => {
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
    
    checkAuth();
    loadTokenizedCharacters();
    
    // Set up storage event listener to detect login/logout
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for login detection within the same window
    const handleLoginEvent = () => {
      checkAuth();
    };
    
    window.addEventListener('login', handleLoginEvent);
    window.addEventListener('logout', handleLoginEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('login', handleLoginEvent);
      window.removeEventListener('logout', handleLoginEvent);
    };
  }, []);
  
  // Function to load character for a wallet
  const loadCharacter = async (address: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/grok?walletAddress=${address}`);
      if (response.ok) {
        const data = await response.json();
        setGrokCharacter(data.character);
        
        // If character already has a token address, set it in the form
        if (data.character.tokenAddress) {
          setTokenAddress(data.character.tokenAddress);
        }
      }
    } catch (error) {
      console.error('Error loading character:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to load tokenized characters
  const loadTokenizedCharacters = async () => {
    try {
      const response = await fetch('/api/grok/tokenize');
      if (response.ok) {
        const data = await response.json();
        setTokenizedCharacters(data.tokenizedCharacters || []);
        setFilteredCharacters(data.tokenizedCharacters || []);
      }
    } catch (error) {
      console.error('Error loading tokenized characters:', error);
    }
  };
  
  // Function to search tokenized characters
  const searchTokenizedCharacters = async (query: string) => {
    if (!query.trim()) {
      setFilteredCharacters(tokenizedCharacters);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const response = await fetch(`/api/grok/tokenize/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setFilteredCharacters(data.tokenizedCharacters || []);
      } else {
        // If API call fails, fall back to client-side filtering
        const lowercaseQuery = query.toLowerCase();
        const results = tokenizedCharacters.filter(character => 
          character.name.toLowerCase().includes(lowercaseQuery) || 
          character.story.toLowerCase().includes(lowercaseQuery) ||
          character.tokenAddress?.toLowerCase().includes(lowercaseQuery)
        );
        
        setFilteredCharacters(results);
      }
    } catch (error) {
      console.error('Error searching characters:', error);
      // Fall back to client-side filtering on error
      const lowercaseQuery = query.toLowerCase();
      const results = tokenizedCharacters.filter(character => 
        character.name.toLowerCase().includes(lowercaseQuery) || 
        character.story.toLowerCase().includes(lowercaseQuery) ||
        character.tokenAddress?.toLowerCase().includes(lowercaseQuery)
      );
      
      setFilteredCharacters(results);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Effect to handle search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchTokenizedCharacters(searchQuery);
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, tokenizedCharacters]);
  
  // Function to tokenize character
  const tokenizeCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn || !walletAddress) {
      setErrorMessage("You must be logged in to tokenize your character");
      return;
    }
    
    if (!tokenAddress) {
      setErrorMessage("Please enter a valid SPL token address");
      return;
    }
    
    try {
      setIsTokenizing(true);
      setErrorMessage('');
      setSuccessMessage('');
      
      const response = await fetch('/api/grok/tokenize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          tokenAddress,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to tokenize character');
        return;
      }
      
      // Update the character with the token address
      setGrokCharacter(data.character);
      setSuccessMessage('Character tokenized successfully!');
      
      // Reload tokenized characters
      loadTokenizedCharacters();
    } catch (error) {
      console.error('Error tokenizing character:', error);
      setErrorMessage('An error occurred while tokenizing your character');
    } finally {
      setIsTokenizing(false);
    }
  };
  
  // Function to visit pump.fun for a token
  const visitPumpFun = (tokenAddress: string) => {
    window.open(`https://pump.fun/coin/${tokenAddress}`, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center" style={{ color: '#91c9a6' }}>Tokenize Your GrokCII Character</h1>
      
      {!isLoggedIn ? (
        <div className="max-w-md mx-auto p-6 rounded-lg border border-[#91c9a6] shadow-md" style={{ backgroundColor: '#1E1E2E' }}>
          <p className="text-center mb-4" style={{ color: '#ffffff' }}>
            Please connect your wallet to tokenize your GrokCII character.
          </p>
        </div>
      ) : (
        <div>
          {/* Your Character Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-3 text-center" style={{ color: '#91c9a6' }}>Your Character</h2>
            
            {isLoading ? (
              <div className="max-w-xs mx-auto">
                <div className="rounded-md border border-[#91c9a6] shadow px-4 py-3 flex flex-col gap-1 mb-4" style={{ backgroundColor: '#1E1E2E', color: '#91c9a6' }}>
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-col">
                      <div className="h-4 w-24 rounded bg-[#91c9a6]/20 animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* ASCII Art placeholder */}
                  <div className="h-24 overflow-auto rounded p-1 my-1 flex items-center justify-center" style={{ backgroundColor: '#1E1E2E' }}>
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#91c9a6]"></div>
                  </div>
                  
                  {/* Story placeholder */}
                  <div className="flex flex-col">
                    <div className="h-3 w-full rounded bg-[#91c9a6]/20 animate-pulse"></div>
                    <div className="h-3 w-3/4 rounded bg-[#91c9a6]/20 animate-pulse mt-1"></div>
                  </div>
                </div>
                
                <div className="rounded-md border border-[#91c9a6] shadow p-4" style={{ backgroundColor: '#1E1E2E' }}>
                  <div className="h-4 w-32 rounded bg-[#91c9a6]/20 animate-pulse mb-4"></div>
                  <div className="h-10 w-full rounded bg-[#91c9a6]/20 animate-pulse mb-4"></div>
                  <div className="h-3 w-3/4 rounded bg-[#91c9a6]/20 animate-pulse mb-6"></div>
                  <div className="h-10 w-full rounded bg-[#91c9a6]/20 animate-pulse"></div>
                </div>
              </div>
            ) : grokCharacter ? (
              <div className="max-w-xs mx-auto">
                <div className="rounded-md border border-[#91c9a6] shadow px-4 py-3 flex flex-col gap-1 hover:border-[#91c9a6] transition-all duration-300 cursor-pointer mb-4"
                  style={{ backgroundColor: '#1E1E2E', color: '#91c9a6' }}
                  onClick={() => grokCharacter.tokenAddress ? visitPumpFun(grokCharacter.tokenAddress) : openDetailModal(grokCharacter)}
                >
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-bold" style={{ color: '#91c9a6' }}>{grokCharacter.name}</p>
                    </div>
                    {grokCharacter.tokenAddress && (
                      <div className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(145, 201, 166, 0.2)', color: '#91c9a6', border: '1px solid #91c9a6' }}>
                        Tokenized
                      </div>
                    )}
                  </div>
                  
                  {/* ASCII Art - fixed height with scroll */}
                  <div className="h-24 overflow-auto rounded p-1 my-1" style={{ backgroundColor: '#1E1E2E' }}>
                    <pre className="whitespace-pre font-mono text-[10px] text-center" style={{ color: '#91c9a6' }}>{grokCharacter.asciiArt}</pre>
                  </div>
                  
                  {/* Story */}
                  <div className="flex flex-col">
                    <p className="text-xs italic line-clamp-2" style={{ color: '#91c9a6' }}>{grokCharacter.story}</p>
                  </div>
                  
                  {grokCharacter.tokenAddress && (
                    <div className="mt-2 text-xs text-center" style={{ color: '#91c9a6' }}>
                      Click to view on Pump.fun
                    </div>
                  )}
                </div>
                
                {!grokCharacter.tokenAddress && (
                  <form onSubmit={tokenizeCharacter} className="rounded-md border border-[#91c9a6] shadow p-4" style={{ backgroundColor: '#1E1E2E' }}>
                    <div className="mb-4">
                      <label htmlFor="tokenAddress" className="block text-sm font-medium mb-1" style={{ color: '#91c9a6' }}>
                        SPL Token Address
                      </label>
                      <input
                        type="text"
                        id="tokenAddress"
                        className="w-full p-2 rounded-md border focus:outline-none"
                        style={{ backgroundColor: '#030617', color: '#ffffff', borderColor: '#91c9a6' }}
                        placeholder="Enter your SPL token address"
                        value={tokenAddress}
                        onChange={(e) => setTokenAddress(e.target.value)}
                        required
                      />
                      <p className="text-xs mt-1" style={{ color: '#91c9a6' }}>
                        Enter the SPL token address for your GrokCII character
                      </p>
                    </div>
                    
                    {errorMessage && (
                      <div className="mb-4 p-2 rounded-md" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#91c9a6', border: '1px solid rgba(220, 38, 38, 0.3)' }}>
                        {errorMessage}
                      </div>
                    )}
                    
                    {successMessage && (
                      <div className="mb-4 p-2 rounded-md" style={{ backgroundColor: 'rgba(145, 201, 166, 0.2)', color: '#91c9a6' }}>
                        {successMessage}
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      className="w-full py-2 px-4 rounded-md font-bold transition-colors"
                      style={{ 
                        backgroundColor: isTokenizing ? 'rgba(145, 201, 166, 0.5)' : 'rgba(145, 201, 166, 0.2)', 
                        color: '#91c9a6',
                        border: '1px solid #91c9a6'
                      }}
                      disabled={isTokenizing}
                    >
                      {isTokenizing ? 'Tokenizing...' : 'Tokenize Character'}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="max-w-xs mx-auto flex justify-center items-center h-40 rounded-md border border-[#91c9a6] shadow p-4" style={{ backgroundColor: '#1E1E2E' }}>
                <p className="text-sm" style={{ color: '#91c9a6' }}>No character found for your wallet address</p>
              </div>
            )}
          </div>
          
          {/* Tokenized Characters Section */}
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-3 text-center" style={{ color: '#91c9a6' }}>Tokenized Characters</h2>
            
            {/* Search Input */}
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
                  placeholder="Search tokenized characters..."
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
            ) : tokenizedCharacters.length === 0 ? (
              <div className="text-center my-8" style={{ color: '#91c9a6' }}>
                No tokenized characters yet
              </div>
            ) : filteredCharacters.length === 0 ? (
              <div className="text-center my-8" style={{ color: '#91c9a6' }}>
                No tokenized characters found matching "{searchQuery}"
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredCharacters.map((character) => (
                  <div 
                    key={character._id.toString()} 
                    className="rounded-md border border-[#91c9a6] shadow px-4 py-3 flex flex-col gap-1 hover:border-[#91c9a6] transition-all duration-300 cursor-pointer"
                    style={{ backgroundColor: '#1E1E2E', color: '#91c9a6' }}
                    onClick={() => visitPumpFun(character.tokenAddress!)}
                  >
                    <div className="flex flex-row items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-sm font-bold truncate" style={{ color: '#91c9a6' }}>{character.name}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          visitPumpFun(character.tokenAddress!);
                        }}
                        className="text-xs px-2 py-1 rounded-md"
                        style={{ 
                          backgroundColor: 'rgba(145, 201, 166, 0.2)', 
                          color: '#91c9a6',
                          border: '1px solid #91c9a6'
                        }}
                      >
                        Pump
                      </button>
                    </div>
                    
                    {/* ASCII Art - fixed height with scroll */}
                    <div className="h-20 overflow-auto rounded p-1 my-1" style={{ backgroundColor: '#1E1E2E' }}>
                      <pre className="whitespace-pre font-mono text-[8px] text-center" style={{ color: '#91c9a6' }}>{character.asciiArt}</pre>
                    </div>
                    
                    {/* Token Address */}
                    <div className="flex flex-col">
                      <p className="text-xs truncate" style={{ color: '#91c9a6' }}>
                        {character.tokenAddress?.substring(0, 6)}...{character.tokenAddress?.substring(character.tokenAddress.length - 4)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Character Detail Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={closeDetailModal} title={selectedCharacter?.name || "Character Details"}>
        {selectedCharacter && (
          <div className="w-full">
            <div className="p-4 rounded-md mb-4 overflow-x-auto" style={{ backgroundColor: '#1E1E2E' }}>
              <pre className="whitespace-pre font-mono text-sm text-center" style={{ color: '#91c9a6' }}>{selectedCharacter.asciiArt}</pre>
            </div>
            <p className="mb-4" style={{ color: '#91c9a6' }}>{selectedCharacter.story}</p>
            {selectedCharacter.tokenAddress && (
              <div className="mb-4">
                <p className="text-sm mb-2" style={{ color: '#91c9a6' }}>
                  <span className="font-bold">Token Address:</span> {selectedCharacter.tokenAddress}
                </p>
                <button
                  onClick={() => visitPumpFun(selectedCharacter.tokenAddress!)}
                  className="py-2 px-4 rounded-md font-bold transition-colors"
                  style={{ 
                    backgroundColor: 'rgba(145, 201, 166, 0.2)', 
                    color: '#91c9a6',
                    border: '1px solid #91c9a6'
                  }}
                >
                  View on Pump.fun
                </button>
              </div>
            )}
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
