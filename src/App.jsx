// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginForm from './components/LoginForm';
import SignUpPage from './pages/SignupPage';
import RegistrationSuccessPage from './pages/RegistrationSuccessPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import ViewPostPage from './pages/ViewPostPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminLayout from './components/AdminLayout';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from "@/components/ui/sonner";

// Layout wrapper for public pages
function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Routes>
          {/* Public routes with NavBar and Footer */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><LoginForm /></PublicLayout>} />
          <Route path="/signup" element={<PublicLayout><SignUpPage /></PublicLayout>} />
          <Route path="/registration-success" element={<PublicLayout><RegistrationSuccessPage /></PublicLayout>} />
          <Route path="/reset-password" element={<PublicLayout><ResetPasswordPage /></PublicLayout>} />
          
          {/* Protected user routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <PublicLayout><ProfilePage /></PublicLayout>
              </ProtectedRoute>
            } 
          />
          <Route path="/post/:id" element={<PublicLayout><ViewPostPage /></PublicLayout>} />

          {/* Redirect admin login to regular login - admins use the same login page */}
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />

          {/* Protected admin routes WITHOUT NavBar and Footer */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout />
              </ProtectedRoute>
            } 
          />

          {/* 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;