/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable the development indicators (like the "Fast Refresh" indicator)
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
};

module.exports = nextConfig; 