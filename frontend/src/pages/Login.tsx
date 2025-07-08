import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Inventory Management System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in with your Microsoft account to continue
          </p>
        </div>
        <div>
          <button
            onClick={login}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 21 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 1H1V10H10V1Z" fill="#F25022"/>
              <path d="M20 1H11V10H20V1Z" fill="#7FBA00"/>
              <path d="M10 11H1V20H10V11Z" fill="#00A4EF"/>
              <path d="M20 11H11V20H20V11Z" fill="#FFB900"/>
            </svg>
            Sign in with Microsoft
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;