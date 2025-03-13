'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

// Define team interface
interface Team {
  id: string;
  name: string;
  members: {
    id: string;
    name: string;
    walletAddress: string;
    status?: 'pending' | 'accepted' | 'rejected';
  }[];
}

interface NavbarProps {
  isLoggedIn: boolean;
  walletAddress: string;
  onConnectWallet: () => void;
  onLogout: () => void;
  teams?: Team[];
}

const Navbar = ({ 
  isLoggedIn, 
  walletAddress, 
  onConnectWallet, 
  onLogout,
  teams = []
}: NavbarProps) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  
  // Toggle user dropdown
  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <nav className={styles.navbar}>
      <div className="w-full flex justify-between items-center">
        {/* Logo - Far Left */}
        <div className="flex-none">
          <Link href="/" className={styles.logo}>
            <div className="flex items-center">
              <span className="font-bold text-[#91c9a6]" style={{ fontFamily: 'var(--font-dm-mono)' }}>GrokCII</span>
            </div>
          </Link>
        </div>
        
        {/* Empty div for spacing */}
        <div className="flex-1"></div>
        
        {/* Navigation Links and Wallet - Far Right */}
        <div className="flex-none">
          <div className="flex items-center space-x-4">
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/how-it-works"
                className={`${styles.navLink} text-sm px-4 py-2 whitespace-nowrap`}
                style={{ color: '#91c9a6' }}
              >
                How It Works
              </Link>
              <Link 
                href="/tokenize"
                className={`${styles.navLink} text-sm px-4 py-2 whitespace-nowrap`}
                style={{ color: '#91c9a6' }}
              >
                Tokenize
              </Link>
              <Link 
                href="https://x.com/GrokCII" 
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.navLink} text-sm px-4 py-2 whitespace-nowrap`}
                style={{ color: '#91c9a6' }}
              >
                Follow Us
              </Link>
            </div>
            
            {/* Wallet */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                {/* Wallet Button with Dropdown */}
                <div className="relative" ref={userDropdownRef}>
                  <button 
                    onClick={toggleUserDropdown}
                    className={`${styles.walletButton} flex items-center gap-2 overflow-hidden rounded-md border border-[#91c9a6] text-[#91c9a6] h-8 text-sm px-2`}
                    style={{ fontFamily: 'var(--font-dm-mono)' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path>
                      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
                    </svg>
                    <span className="truncate max-w-[120px]" title={walletAddress}>
                      {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto size-4">
                      <path d="m7 15 5 5 5-5"></path>
                      <path d="m7 9 5-5 5 5"></path>
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 min-w-48 rounded-lg overflow-hidden border border-gray-700 p-1 shadow-md z-50" style={{ fontFamily: 'var(--font-dm-mono)', backgroundColor: '#030617', color: '#ffffff' }}>
                      {/* Wallet Address Header */}
                      <div className="p-2">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[#91c9a6]">
                            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path>
                            <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
                          </svg>
                          <span className="text-sm">{walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}</span>
                        </div>
                      </div>
                      
                      {/* Separator */}
                      <div className="-mx-1 my-1 h-px bg-gray-200"></div>
                      
                      {/* Logout Option */}
                      <div className="p-2">
                        <button
                          onClick={onLogout}
                          className="flex items-center gap-2 text-sm w-full text-left"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" x2="9" y1="12" y2="12"></line>
                          </svg>
                          <span>Log out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={onConnectWallet}
                className="flex items-center overflow-hidden rounded-md border border-[#91c9a6] text-[#91c9a6] h-8 text-sm px-2 hover:bg-[#91c9a6]/10 transition-colors"
                style={{ fontFamily: 'var(--font-dm-mono)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" x2="3" y1="12" y2="12"></line>
                </svg>
                <span className="ml-2 font-bold">Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
