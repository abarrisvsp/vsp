/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'chenrpjikelutxchsvqs.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: 'visionarysoundproductions.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;
