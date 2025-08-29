/* @type {import('next').NextConfig} */
const nextConfig = {
  // Essential security
  poweredByHeader: false,
  
  // Image optimization (keep this for your S3 images)
  images: {
    domains: ['pms-s3-images.s3.us-east-1.amazonaws.com'],
  },
  
  // Basic performance
  compress: true,
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
