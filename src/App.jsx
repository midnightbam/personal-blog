import React from 'react';
import NavBar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';
import ArticleSection from './components/ArticleSection';

const App = () => {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <HeroSection />
      <ArticleSection />
      <Footer />
      
    </div>
  );
};

export default App;
export { NavBar, HeroSection, Footer };