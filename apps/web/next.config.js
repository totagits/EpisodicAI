/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // GitHub Pages serves from /EpisodicAI/ subpath
  basePath: isProd ? '/EpisodicAI' : '',
  assetPrefix: isProd ? '/EpisodicAI/' : '',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
