import { DATABASE_URL, auth } from './firebase';

export const fetchWithErrorHandling = async (method, path, data = null) => {
  if (!DATABASE_URL) {
    throw new Error('Firebase DATABASE_URL is not configured in firebase.js.');
  }
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User is not authenticated. Please sign in again.');
    }
    const idToken = await user.getIdToken(true); // Force refresh token
    console.log('ID Token:', idToken); // Debugging

    const response = await fetch(`${DATABASE_URL}/${path}.json?auth=${idToken}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : null,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
    }
    const result = await response.json();
    return result === null ? {} : result; // Handle null response
  } catch (error) {
    console.error(`Fetch error for ${method} ${path}:`, error);
    throw new Error(`Failed to ${method} data at ${path}: ${error.message}`);
  }
};