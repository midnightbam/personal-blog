import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-[#F9F8F6] border-b border-gray-200">
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="text-xl sm:text-2xl font-bold text-gray-900 hover:opacity-80 transition-opacity"
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
          <div className="hidden lg:flex items-center gap-4">
            {/* ✅ Link to Login */}
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-base bg-white text-gray-900 font-medium rounded-full border-2 border-gray-900 hover:bg-gray-100 hover:border-gray-400 transition-colors"
            >
              Log in
            </button>

            <button 
              onClick={() => navigate('/signup')}
              className="px-6 py-2 text-base bg-[#26231E] text-white font-medium rounded-full hover:bg-[#75716B] transition-colors"
            >
              Sign up
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 space-y-3">
            {/* ✅ Link to Login (Mobile) */}
            <button 
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 text-base bg-white text-gray-900 font-medium rounded-full border-2 border-gray-900 hover:bg-gray-100 transition-colors"
            >
              Log in
            </button>

            <button 
              onClick={() => navigate('/signup')}
              className="w-full px-6 py-3 text-base bg-[#26231E] text-white font-medium rounded-full hover:bg-[#75716B] transition-colors"
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
