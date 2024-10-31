// components/Loader.js
import React from "react";

const Loader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 backdrop-blur-sm z-50">
    <div className="flex flex-col items-center">
      <svg
        className="animate-spin h-16 w-16 text-blue-500 mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        ></path>
      </svg>
      <p className="text-white text-xl font-semibold">Analyzing Image...</p>
    </div>
  </div>
);

export default Loader;
