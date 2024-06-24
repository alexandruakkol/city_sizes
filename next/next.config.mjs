/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    maps_key: process.env.REACT_APP_GMAPS_API_KEY, // pulls from .env file
  },
};

export default nextConfig;
