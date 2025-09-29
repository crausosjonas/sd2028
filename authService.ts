import { User } from '../types';

// This URL is now managed by an environment variable for production deployment.
// In Render's static site settings, you must set VITE_API_BASE_URL to your live backend service URL.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  // This error will be thrown during the build process if the environment variable is not set,
  // preventing a broken deployment.
  throw new Error("VITE_API_BASE_URL is not defined. Please set it in your environment variables.");
}

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

/**
 * Sends the Facebook access token to the backend server for validation and login/signup.
 * @param accessToken The access token from the Facebook login.
 * @returns The user data from the backend database.
 */
export const sendAccessTokenToBackend = async (accessToken: string): Promise<User> => {
  console.log(`Sending access token to backend at ${API_BASE_URL}`);
  
  const response = await fetch(`${API_BASE_URL}/auth/facebook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken }),
  });

  return handleResponse(response);
};

/**
 * Fetches the list of all users from the backend.
 * @returns An array of all users.
 */
export const getUsers = async (): Promise<User[]> => {
  console.log(`Fetching all users from backend at ${API_BASE_URL}.`);
  
  const response = await fetch(`${API_BASE_URL}/users`);
  
  return handleResponse(response);
};

/**
 * Sends a request to the backend to update a specific user's role.
 * @param userId The ID of the user to update.
 * @param newRole The new role to assign ('convenor' or 'member').
 * @returns The updated user data.
 */
export const updateUserRole = async (userId: number, newRole: 'convenor' | 'member'): Promise<User> => {
  console.log(`Sending request to backend at ${API_BASE_URL} to update user ${userId} to role ${newRole}`);

  const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role: newRole }),
  });

  return handleResponse(response);
};
