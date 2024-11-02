// components/InfoModal.js
import React from "react";
import { FaTimes } from "react-icons/fa";

const InfoModal = ({ setShowModal }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 backdrop-blur-sm z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative w-11/12 md:w-1/2">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-gray-800"
          onClick={() => setShowModal(false)}
        >
          <FaTimes size={20} />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
            Privacy Notice
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 text-center">
            We respect your privacy. This application processes images directly
            in your browser.
            <br />
            <strong>No images or data are uploaded to any server.</strong>
            <br />
            All processing is done locally on your device.
          </p>
          <div className="flex items-center text-blue-500">
            <svg
              className="w-12 h-12 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a6 6 0 016 6v2.586l.707.707A1 1 0 0117 12h-3a1 1 0 110-2h1V8a4 4 0 00-8 0v2h1a1 1 0 110 2H3a1 1 0 01-.707-1.707L3 10.586V8a6 6 0 016-6z" />
              <path d="M6 14a4 4 0 118 0v1h-8v-1z" />
            </svg>
            <span className="text-xl font-semibold">
              Your data is safe with us.
            </span>
          </div>
          {/* Close Button */}
          <button
            onClick={() => setShowModal(false)}
            className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
