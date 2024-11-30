const config = {
    API_URL: import.meta.env.VITE_API_URL || 'http://143.198.62.200:3710',
    SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'ws://143.198.62.200:3710',
    MAP_API_KEY: import.meta.env.VITE_MAP_API_KEY || '',
    MAP_STYLE: import.meta.env.VITE_MapStyleID
    // Add other configuration variables as needed
  };
  
  export default config;