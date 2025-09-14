// Environment-based configuration
// Development: Uses localhost defaults
// Production: Uses environment variables (set via .env or deployment config)
const backendServer = import.meta.env.VITE_BACKEND_SERVER || 'http://localhost:8888/';
const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000/';

export const API_BASE_URL = backendServer + 'api/';
export const BASE_URL = backendServer;
export const WEBSITE_URL = frontendUrl;
export const DOWNLOAD_BASE_URL = backendServer + 'download/';
export const ACCESS_TOKEN_NAME = 'x-auth-token';
export const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL || BASE_URL;
