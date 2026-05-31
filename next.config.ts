import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'search.pstatic.net' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img1.daumcdn.net' },
      { protocol: 'https', hostname: 'th.bing.com' },
      { protocol: 'https', hostname: 'blogfiles.naver.net' },
    ],
  },
};

export default nextConfig;
