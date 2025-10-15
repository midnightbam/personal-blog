import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RegistrationSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/"); // redirect to homepage
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-[#F9F8F6]">
      <div className="bg-[#EFEEEB] p-12 rounded-xl shadow-md text-center max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
          Registration success
        </h2>
        <button
          onClick={() => navigate("/")}
          className="bg-[#26231E] text-white px-6 py-2 rounded-full hover:bg-[#3d3832] transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
