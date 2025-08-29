/** @type {import('next').NextConfig} */
const nextConfig = {
  // Essential security
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pms-s3-images.s3.us-east-1.amazonaws.com",
        pathname: "/**", // Allowing all paths
      },
    ],
  },

  reactStrictMode: true, 
};

export default nextConfig;
