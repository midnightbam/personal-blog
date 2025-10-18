import { TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F8F6]">
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="h-32 w-32 bg-white rounded-full flex items-center justify-center border-8 border-black">
              <span className="text-6xl font-bold text-black">!</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-black">Page Not Found</h1>
          <button
            onClick={handleGoHome}
            className="px-10 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-base font-medium"
          >
            Go To Homepage
          </button>
        </div>
      </main>
    </div>
  );
}