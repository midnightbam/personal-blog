import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import UserNavbar from './UserNavbar';

const NavBar = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Show loading state while checking auth
  if (loading) {
    return (
      <nav className="sticky top-0 z-50 bg-[#F9F8F6] border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-2 sm:py-2.5">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/')}
              className="text-lg sm:text-xl font-bold text-gray-900 hover:opacity-80 transition-opacity"
            >
              Bamboo<span className="text-[#12B279]">.</span>
            </button>
            
            {/* Loading indicator */}
            <div className="w-20 h-8 bg-gray-200 animate-pulse rounded-full"></div>
          </div>
        </div>
      </nav>
    );
  }

  // Show UserNavbar if user is logged in
  if (user) {
    return <UserNavbar />;
  }

  // Show regular NavBar if user is not logged in
  return (
    <nav className="sticky top-0 z-50 bg-[#F9F8F6] border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-2 sm:py-2.5">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="text-lg sm:text-xl font-bold text-gray-900 hover:opacity-80 transition-opacity"
          >
            hh<span className="text-[#12B279]">.</span>
          </button>
          
          {/* Mobile Menu Icon */}
          <button 
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <button 
              onClick={() => navigate('/login')}
              className="px-5 py-1.5 text-sm bg-white text-gray-900 font-medium rounded-full border-2 border-gray-900 hover:bg-gray-100 hover:border-gray-400 transition-colors"
            >
              Log in
            </button>

            <button 
              onClick={() => navigate('/signup')}
              className="px-5 py-1.5 text-sm bg-[#26231E] text-white font-medium rounded-full hover:bg-[#75716B] transition-colors"
            >
              Sign up
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-gray-200 space-y-2">
            <button 
              onClick={() => {
                navigate('/login');
                setIsMobileMenuOpen(false);
              }}
              className="w-full px-5 py-2 text-sm bg-white text-gray-900 font-medium rounded-full border-2 border-gray-900 hover:bg-gray-100 transition-colors"
            >
              Log in
            </button>

            <button 
              onClick={() => {
                navigate('/signup');
                setIsMobileMenuOpen(false);
              }}
              className="w-full px-5 py-2 text-sm bg-[#26231E] text-white font-medium rounded-full hover:bg-[#75716B] transition-colors"
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;