import { DATABASE_URL, API_SECRET } from './firebase';

export const fetchWithErrorHandling = async (method, path, data = null) => {
  const url = `${DATABASE_URL}/${path}.json?auth=${API_SECRET}`;
  try {
    console.log(`Sending ${method} request to ${url}`, data || '');
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (data) {
      options.body = JSON.stringify(data);
    }
    const response = await fetch(url, options);
    const text = await response.text();
    console.log(`Response from ${url}: status=${response.status}, body=${text || 'No response body'}`);
    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}: ${text || 'No response body'}`;
      if (response.status === 401) {
        errorMessage = 'Unauthorized: Invalid API secret';
      } else if (response.status === 404 || (text === '' && method === 'GET')) {
        errorMessage = 'User data not found';
      } else {
        errorMessage = 'An error occurred, please try again later';
      }
      throw new Error(errorMessage);
    }
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch (jsonError) {
      console.error(`JSON parse error for ${url}:`, jsonError.message);
      throw new Error('Invalid JSON response');
    }
  } catch (error) {
    console.error(`Error in ${method} on ${path}:`, error.message);
    throw error;
  }
};