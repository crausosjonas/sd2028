// Fix for `import.meta.env` TypeScript error. This directive includes Vite's client types.
/// <reference types="vite/client" />

import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import UserProfile from './components/UserProfile';
import LikePage from './components/LikePage';
import { sendAccessTokenToBackend } from './services/authService';
import { User } from './types';

// Extend the Window interface to include FB
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
    <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
);


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSdkReady, setIsSdkReady] = useState<boolean>(false);
  const [isLikeStepComplete, setIsLikeStepComplete] = useState<boolean>(false);
  
  const facebookAppId = '771219535782623';

  // Check for existing session on app load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('facebookUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem('facebookUser');
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const handleLoginSuccess = useCallback(async (accessToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await sendAccessTokenToBackend(accessToken);
      setUser(userData);
      localStorage.setItem('facebookUser', JSON.stringify(userData));
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
      localStorage.removeItem('facebookUser');
      if (window.FB) {
        window.FB.logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    window.fbAsyncInit = function() {
      window.FB.init({
        appId      : facebookAppId,
        cookie     : true,
        xfbml      : true,
        version    : 'v19.0'
      });
      setIsSdkReady(true);
    };
    
    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s) as HTMLScriptElement; js.id = id;
       js.src = "https://connect.facebook.net/en_US/sdk.js";
       if (fjs && fjs.parentNode) {
         fjs.parentNode.insertBefore(js, fjs);
       }
     }(document, 'script', 'facebook-jssdk'));

  }, []);
  
  const handleLoginFailure = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };
  
  const handleLoginClick = () => {
    setError(null);
    
    if (!isSdkReady) {
        setError("Facebook SDK is still initializing. Please wait a moment and try again.");
        return;
    }
    
    window.FB.login(function(response: any) {
      if (response.authResponse) {
        console.log('Successfully logged in with Facebook.');
        handleLoginSuccess(response.authResponse.accessToken);
      } else {
        console.log('User cancelled login or did not fully authorize.');
        handleLoginFailure('Login was cancelled or not authorized.');
      }
    }, { 
        scope: 'public_profile,email,pages_show_list' 
      });
  };
  
  const handleLogout = () => {
    // Always clear the local session first
    localStorage.removeItem('facebookUser');
  
    if (window.FB) {
      // Check Facebook's login status to prevent errors
      window.FB.getLoginStatus((response: any) => {
        if (response.status === 'connected') {
          // If the user is connected to Facebook, log them out
          window.FB.logout(() => {
            setUser(null);
          });
        } else {
          // If they aren't connected, just clear the app's user state
          setUser(null);
        }
      });
    } else {
      // If the SDK isn't loaded, just clear the app's user state
      setUser(null);
    }
  };
  
  const handleLikeStepComplete = () => {
    setIsLikeStepComplete(true);
  };

  if (isInitializing) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <UserProfile user={user} onLogout={handleLogout} />;
  }

  if (!isLikeStepComplete) {
    return <LikePage onContinue={handleLikeStepComplete} />;
  }

  return <LoginPage onLoginClick={handleLoginClick} isLoading={isLoading} error={error} isSdkReady={isSdkReady} />;
};

export default App;