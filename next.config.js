/** @type {import('next').NextConfig} */
const nextConfig = {
  // 실험적 기능 최소화
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  
  // 이미지 최적화
  images: {
    domains: [],
  },
};

module.exports = nextConfig;
