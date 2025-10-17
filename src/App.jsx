import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';
import ArticleSection from './components/ArticleSection';
import SignUpForm from './components/SignUpForm';
import LoginForm from './components/LoginForm'; 
import RegistrationSuccess from './components/RegistrationSuccess';
import UserNavbar from './components/UserNavbar';
import Profile from "./components/Profile";
import ResetPassword from "./components/ResetPassword";
import ViewPost from "./pages/ViewPostPage"; 

const HomePage = () => (
  <>
    <HeroSection />
    <ArticleSection />
  </>
);

const SignUpPage = () => (
  <>
    <SignUpForm />
  </>
);

const LoginPage = () => (
  <>
    <LoginForm />
  </>
);

const App = () => {
  // ✅ Check login status
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Router>
      <div className="min-h-screen bg-white flex flex-col">
        {/* ✅ Conditionally render navbar */}
        {user ? <UserNavbar /> : <NavBar />}

        {/* ✅ Page content */}
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/success" element={<RegistrationSuccess />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/post/:postId" element={<ViewPost />} /> 
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