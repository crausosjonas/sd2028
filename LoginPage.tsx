import React from 'react';
import FacebookIcon from './icons/FacebookIcon';

interface LoginPageProps {
  onLoginClick: () => void;
  isLoading: boolean;
  error: string | null;
  isSdkReady: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginClick, isLoading, error, isSdkReady }) => {
  const getButtonContent = () => {
    if (!isSdkReady && !error) {
      return (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Initializing...
        </>
      );
    }
    if (isLoading) {
      return (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Logging In...
        </>
      );
    }
    return (
      <>
        <FacebookIcon className="w-6 h-6 mr-3" />
        Login with Facebook
      </>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-gray-800 dark:via-gray-900 dark:to-blue-900 p-4">
      <div className="w-full max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden text-center transform transition-all hover:scale-105 duration-300">
        <div className="p-8 md:p-10">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Welcome Back!</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Sign in to continue to your account.</p>
          
          <button
            onClick={onLoginClick}
            disabled={isLoading || !isSdkReady}
            className="w-full inline-flex items-center justify-center px-4 py-3 bg-[#1877F2] text-white rounded-lg shadow-md hover:bg-[#166eab] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2] transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <span className="font-semibold text-lg inline-flex items-center">
              {getButtonContent()}
            </span>
          </button>
          
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 px-2">
            As part of the login, Facebook may ask for permission to view your Pages. If you don't have any Pages, you can simply proceed.
          </p>

          {error && (
            <p className="mt-6 text-sm text-red-500 bg-red-100 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-md">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;