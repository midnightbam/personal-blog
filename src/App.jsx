import React from 'react';
import NavBar from './components/NavBar';
import HeroSection from './components/HeroSection';

const App = () => {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <HeroSection />
    </div>
  );
};

export default App;