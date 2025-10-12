import React from 'react';
import { Linkedin, Github, Globe } from 'lucide-react';
const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-6">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Get in touch section */}
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">Get in touch</span>
            <div className="flex items-center gap-3">
              <a 
                href="https://www.linkedin.com/in/punyanuch-kaewsidam-509947289/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Linkedin size={20} />
              </a>
              <a 
                href="https://github.com/midnightbam" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Github size={20} />
              </a>
              <a 
                href="https://your-website.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Globe size={20} />
              </a>
            </div>
          </div>

          {/* Home page link */}
          <div>
            <a href="/" className="text-gray-700 hover:text-gray-900 font-medium hover:underline transition-colors">
              Home page
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;