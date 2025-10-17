import React from 'react';
import { AlertCircle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-8 rounded-full border-4 border-black flex items-center justify-center">
          <AlertCircle size={48} className="text-black" />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold mb-8">Page Not Found</h1>

        {/* Button */}
        <button
          onClick={() => window.location.href = '/'}
          className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium text-lg"
        >
          Go To Homepage
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;