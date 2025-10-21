// NotFoundPage.jsx
import { TriangleAlert } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if we're in admin context
  const isAdminContext = location.pathname.startsWith('/admin');

  const handleGoHome = () => {
    if (isAdminContext) {
      // Stay in admin area
      navigate('/admin/dashboard', { replace: true });
    } else {
      // Go to user homepage
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-8 max-w-md">
          {/* Warning Icon */}
          <div className="relative">
            <div className="h-28 w-28 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
              <TriangleAlert className="h-16 w-16 text-white" strokeWidth={2.5} />
            </div>
          </div>
          
          {/* Page Not Found Text */}
          <h1 className="text-4xl font-bold text-black">Page Not Found</h1>
          
          {/* Go To Homepage Button */}
          <button
            onClick={handleGoHome}
            className="px-12 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-lg font-medium shadow-md"
          >
            {isAdminContext ? 'Go To Admin Dashboard' : 'Go To Homepage'}
          </button>
        </div>
      </main>
    </div>
  );
}