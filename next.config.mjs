/** @type {import('next').NextConfig} */
const nextConfig = {
    // Removed 'output: export' to allow dynamic routes
    images: {
      unoptimized: true, // Keep this for better image handling
    },
  };
  
  export default nextConfig;
  