// /**
//  * Get the backend API URL based on environment
//  * In production, uses the production API URL
//  * In development, uses localhost or the VITE_API_URL env variable
//  */
// export const getApiUrl = () => {
//   // Check if we're in production (not localhost)
//   const isProduction = typeof window !== 'undefined' && 
//     window.location.hostname !== 'localhost' && 
//     window.location.hostname !== '127.0.0.1';

//   // If environment variable is set, use it
//   if (import.meta.env.VITE_API_URL) {
//     return import.meta.env.VITE_API_URL;
//   }

//   // In production, use the production API URL
//   if (isProduction) {
//     // Current active backend on Render
//     return 'https://inavora-cwg3.onrender.com';
//   }

//   // In development, use localhost
//   return 'http://localhost:4000';
// };

// /**
//  * Get the Socket.IO URL based on environment
//  * In production, uses the production API URL
//  * In development, uses localhost or the VITE_SOCKET_URL env variable
//  */
// export const getSocketUrl = () => {
//   // Check if we're in production (not localhost)
//   const isProduction = typeof window !== 'undefined' && 
//     window.location.hostname !== 'localhost' && 
//     window.location.hostname !== '127.0.0.1';

//   // If environment variable is set, use it
//   if (import.meta.env.VITE_SOCKET_URL) {
//     return import.meta.env.VITE_SOCKET_URL;
//   }

//   // In production, use the production API URL
//   if (isProduction) {
//     // Current active backend on Render
//     return 'https://inavora-cwg3.onrender.com';
//   }

//   // In development, use localhost (default port 4000 for socket.io)
//   return 'http://localhost:4000';
// };

// /**
//  * Get the Chatbot API URL based on environment
//  * In production, uses the production chatbot URL (Render)
//  * In development, uses localhost:5000 or the VITE_CHATBOT_URL env variable
//  */
// export const getChatbotUrl = () => {
//   // Check if we're in production (not localhost)
//   const isProduction = typeof window !== 'undefined' && 
//     window.location.hostname !== 'localhost' && 
//     window.location.hostname !== '127.0.0.1';

//   // If environment variable is set, use it
//   if (import.meta.env.VITE_CHATBOT_URL) {
//     return import.meta.env.VITE_CHATBOT_URL;
//   }

//   // In production, use the production chatbot URL (update this with your Render URL)
//   if (isProduction) {
//     return 'https://inavora-chatbot.onrender.com'; // Replace with your actual Render chatbot URL
//   }

//   // In development, use localhost:5000 (default Flask port)
//   return 'http://127.0.0.1:5000';
// };



/**
 * Centralized environment configuration
 * All production URLs must come from VITE_ environment variables.
 * Development falls back to localhost if not defined.
 */

const isProduction = import.meta.env.PROD;

/**
 * Internal helper to safely resolve environment URLs
 */
const resolveUrl = (envKey, devFallback) => {
  const value = import.meta.env[envKey];

  // Use env value if provided
  if (value && value.trim() !== '') {
    return value;
  }

  // In development, allow fallback
  if (!isProduction) {
    return devFallback;
  }

  // In production, fail loudly if missing
  throw new Error(`${envKey} is not defined in production environment`);
};

/**
 * Backend API URL
 */
export const getApiUrl = () => {
  return resolveUrl('VITE_API_URL', 'http://localhost:4000');
};

/**
 * Socket.IO URL
 */
export const getSocketUrl = () => {
  return resolveUrl('VITE_SOCKET_URL', 'http://localhost:4000');
};

/**
 * Chatbot API URL
 */
export const getChatbotUrl = () => {
  return resolveUrl('VITE_CHATBOT_URL', 'http://127.0.0.1:5000');
};