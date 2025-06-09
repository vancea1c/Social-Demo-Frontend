import React from "react";
import { Link } from "react-router-dom";

const Goodbye: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen  px-4">
    <h1 className="text-3xl font-bold text-gray-50 mb-4">Farewell 👋</h1>
    <p className="text-gray-50 mb-6">
      Your account has been permanently deleted. We’re sorry to see you go.
    </p>
    <Link
      to="/"
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-150"
    >
      Return to Home
    </Link>
  </div>
);

export default Goodbye;
