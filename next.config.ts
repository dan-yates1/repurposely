import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'picsum.photos',
      'via.placeholder.com',
      'placehold.co',
      'placekitten.com',
      'placeimg.com',
      'randomuser.me',
      'lh3.googleusercontent.com'
    ],
  }
};

export default nextConfig;
