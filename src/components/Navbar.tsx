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
            <img src="/logo.png" alt="FantasyFNF Logo" className="h-8" />
          </Link>
        </div>
        
        {/* Empty div for spacing */}
        <div className="flex-1"></div>
        
        {/* Navigation Links and Wallet - Far Right */}
        <div className="flex-none">
          <div className="flex items-center space-x-4">
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn && (
                <Link 
                  href="/teams" 
                  className={`${styles.navLink} text-sm px-4 py-2`}
                >
                  Manage Teams
                </Link>
              )}
              <Link 
                href="/docs" 
                className={`${styles.navLink} text-sm px-4 py-2`}
              >
                Docs
              </Link>
              <Link 
                href="https://x.com/FantasyFNF" 
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.navLink} text-sm px-4 py-2 whitespace-nowrap`}
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
                    className={`${styles.walletButton} flex items-center gap-2 overflow-hidden rounded-md border border-[#f0b90b] text-[#f0b90b] h-8 text-sm px-2`}
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
                    <div className="absolute right-0 mt-2 min-w-48 rounded-lg overflow-hidden border border-gray-200 bg-white p-1 text-gray-800 shadow-md z-50" style={{ fontFamily: 'var(--font-dm-mono)' }}>
                      {/* Wallet Address Header */}
                      <div className="p-2">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[#f0b90b]">
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
                className="flex items-center overflow-hidden rounded-md p-2 text-left outline-none transition-all duration-300 ease-in-out hover:text-sidebar-active focus-visible:ring-2 active:text-sidebar-foreground-accent disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 data-[active=true]:font-medium data-[active=true]:text-sidebar-active data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-active group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 border border-[#f0b90b] text-[#f0b90b] hover:bg-[#f0b90b]/10 h-8 text-sm w-full justify-center gap-0"
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
