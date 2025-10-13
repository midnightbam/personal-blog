import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';
import ArticleSection from './components/ArticleSection';
import SignUpForm from './components/SignUpForm';
import LoginForm from './components/LoginForm'; // ✅ import login form

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <ArticleSection />
    </>
  );
};

const SignUpPage = () => {
  return (
    <>
      <SignUpForm />
    </>
  );
};

const LoginPage = () => {
  return (
    <>
      <LoginForm />
    </>
  );
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-white flex flex-col">
        {/* ✅ Navbar always at top */}
        <NavBar />

        {/* ✅ Page content */}
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>

        {/* ✅ Footer always at bottom */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
export { NavBar, HeroSection, Footer };
