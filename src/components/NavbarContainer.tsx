'use client';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Modal from './Modal';

// Define types for user
interface User {
  _id: string;
  walletAddress: string;
  teams: string[];
  createdAt: string;
}

const NavbarContainer = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch teams data
  const fetchTeams = async (token: string) => {
    try {
      const response = await fetch('/api/teams', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };
  
  // Check for existing auth token on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Decode token to get wallet address
          const decodedToken = JSON.parse(Buffer.from(token, 'base64').toString());
          const address = decodedToken.walletAddress;
          
          if (address) {
            // Fetch user data from API
            const response = await fetch('/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              setUser(data.user);
              setWalletAddress(address);
              setIsLoggedIn(true);
              
              // Fetch teams data
              await fetchTeams(token);
            } else {
              // Token is invalid, clear it
              localStorage.removeItem('authToken');
            }
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Function to handle Phantom wallet login
  const connectPhantomWallet = async () => {
    try {
      console.log("Starting wallet connection process...");
      
      // Check if Phantom is installed
      const isPhantomInstalled = window.phantom?.solana?.isPhantom;
      console.log("Phantom installed:", isPhantomInstalled);
      
      if (!isPhantomInstalled) {
        alert("Phantom wallet is not installed. Please install it from https://phantom.app/");
        return;
      }
      
      // Connect to Phantom wallet
      console.log("Attempting to connect to Phantom wallet...");
      const response = await window.phantom?.solana?.connect();
      
      if (!response) {
        throw new Error("Failed to connect to Phantom wallet");
      }
      
      console.log("Connected to Phantom wallet:", response);
      const address = response.publicKey.toString();
      console.log("Wallet address:", address);
      
      // Make API call to authenticate user
      console.log("Making API call to authenticate user...");
      const authResponse = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: address }),
      });
      
      console.log("Auth response status:", authResponse.status);
      
      // Check response content type
      const contentType = authResponse.headers.get('content-type');
      console.log("Response content type:", contentType);
      
      if (!authResponse.ok) {
        let errorMessage = authResponse.statusText;
        
        try {
          // Only try to parse as JSON if the content type is JSON
          if (contentType && contentType.includes('application/json')) {
            const errorData = await authResponse.json();
            console.error("Authentication error:", errorData);
            errorMessage = errorData.error || errorMessage;
          } else {
            // If not JSON, get the text response
            const errorText = await authResponse.text();
            console.error("Authentication error (text):", errorText);
            errorMessage = `Server returned non-JSON response: ${errorText.substring(0, 100)}...`;
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
        
        throw new Error(`Authentication failed: ${errorMessage}`);
      }
      
      // Parse the response as JSON
      let authData;
      try {
        authData = await authResponse.json();
      } catch (parseError) {
        console.error("Error parsing auth response:", parseError);
        const responseText = await authResponse.text();
        console.error("Response text:", responseText.substring(0, 200));
        throw new Error(`Failed to parse authentication response as JSON`);
      }
      console.log("Auth data received:", { ...authData, token: "REDACTED" });
      
      // Store token in localStorage
      localStorage.setItem('authToken', authData.token);
      console.log("Token stored in localStorage");
      
      // Set user data and login state
      setUser(authData.user);
      setWalletAddress(address);
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
      
      // Fetch teams data
      await fetchTeams(authData.token);
      
      console.log(`Successfully logged in with wallet: ${address}`);
    } catch (error: any) {
      console.error("Error connecting to Phantom wallet:", error);
      alert(`Failed to connect to Phantom wallet: ${error.message || 'Unknown error'}`);
    }
  };
  
  // Function to handle logout
  const handleLogout = () => {
    // Clear auth token from localStorage
    localStorage.removeItem('authToken');
    
    // Reset state
    setIsLoggedIn(false);
    setWalletAddress('');
    setUser(null);
    setTeams([]);
  };

  return (
    <>
      <Navbar 
        isLoggedIn={isLoggedIn} 
        walletAddress={walletAddress} 
        onConnectWallet={() => setIsLoginModalOpen(true)} 
        onLogout={handleLogout}
        teams={teams}
      />
      
      {/* Login Modal */}
      <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} title="Connect Wallet">
        <div className="w-full">
          <p className="text-center text-gray-700 text-sm mb-6">
            Connect your wallet to create and manage your FNF teams
          </p>
          
          {/* Phantom Wallet Button */}
          <button
            onClick={connectPhantomWallet}
            className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 mr-3 rounded-full overflow-hidden flex items-center justify-center">
                <img src="/phantom.png" alt="Phantom Wallet" className="w-full h-full object-cover" />
              </div>
              <span className="text-gray-800 text-sm">Phantom Wallet</span>
            </div>
            <span className="bg-[#f0b90b] text-xs text-white px-2 py-1 rounded">Connect</span>
          </button>
          
          <div className="text-center text-xs text-gray-500 mt-6">
            <p>Don't have Phantom wallet?</p>
            <a 
              href="https://phantom.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Download Phantom
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default NavbarContainer;
