import React from 'react';

const NavBar = () => {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="px-8 lg:px-12 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">hh.</div>
          <div className="flex items-center gap-4">
            <button className="px-6 py-2 text-gray-900 font-medium rounded-full border-2 border-gray-900 hover:bg-gray-50 transition-colors">
              Log in
            </button>
            <button className="px-6 py-2 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors">
              Sign up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;