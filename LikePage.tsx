import React, { useEffect } from 'react';

interface LikePageProps {
  onContinue: () => void;
}

const LikePage: React.FC<LikePageProps> = ({ onContinue }) => {
  // When this component mounts, we explicitly ask the Facebook SDK to parse
  // the page for social plugins. This ensures the 'Like' button renders correctly
  // when added to the DOM dynamically by React.
  useEffect(() => {
    if (window.FB) {
      window.FB.XFBML.parse();
    }
  }, []);

  const pageUrl = "https://www.facebook.com/114262977520946";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-gray-800 dark:via-gray-900 dark:to-blue-900 p-4">
      <div className="w-full max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden text-center transform transition-all hover:scale-105 duration-300">
        <div className="p-8 md:p-10">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">One More Step!</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Please like our page to continue.</p>
          
          <div className="my-8 flex justify-center" aria-label="Facebook Like button container">
            {/* This is the Facebook 'Like' button plugin */}
            <div 
              className="fb-like" 
              data-href={pageUrl} 
              data-width="" 
              data-layout="button_count" 
              data-action="like" 
              data-size="large" 
              data-share="false">
            </div>
          </div>
          
          <button
            onClick={onContinue}
            className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300 font-semibold text-lg"
            aria-label="Continue to login"
          >
            Continue to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LikePage;
