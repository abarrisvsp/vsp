/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Force HTTPS for 2 years incl. subdomains (safe once the domain is live on Vercel HTTPS).
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Stop MIME-type sniffing.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Disallow framing (clickjacking protection).
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Send origin only on cross-origin requests.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Lock down powerful APIs we don't use.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Note: a Content-Security-Policy is intentionally omitted here — it needs to be
  // authored and tested against Supabase, Google Fonts, and inline JSON-LD before
  // enabling, or it will break the site.
];

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'chenrpjikelutxchsvqs.supabase.co', pathname: '/storage/v1/object/public/**' },
      { protocol: 'https', hostname: 'visionarysoundproductions.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;
