// Central SEO/identity config for Visionary Sound Productions.
// Single source of truth for site URL, business NAP, and brand defaults so
// metadata, sitemap, robots, and JSON-LD all agree.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://visionarysoundproductions.com'
).replace(/\/$/, '');

export const SITE = {
  name: 'Visionary Sound Productions',
  shortName: 'VSP',
  url: SITE_URL,
  // Used as the metadata fallback description across pages.
  tagline: 'Full-service event production. Stage, lighting, sound, and video.',
  description:
    'Owner-operated event production company. Stage, lighting, sound, and video for weddings, mitzvahs, school dances, and corporate events across Metro Detroit, the Midwest, and nationwide since 2004.',
  founderName: 'Aaron Barris',
  foundingYear: '2004',
  email: 'Aaron@VisionarySoundProductions.com',
  // City/region for LocalBusiness markup. Commerce Township per the About page.
  // NOTE: postalCode 48382 is Commerce Township's ZIP — confirm it's correct.
  address: {
    locality: 'Commerce Township',
    region: 'MI',
    regionName: 'Michigan',
    postalCode: '48382',
    country: 'US',
  },
  serviceArea: 'Metro Detroit · Midwest · Nationwide',
  // Areas served as discrete entities for LocalBusiness.areaServed.
  areasServed: ['Metro Detroit', 'Michigan', 'Midwest', 'United States'],
  ogLocale: 'en_US',
} as const;

export const SOCIAL_PROFILES: string[] = [
  // These feed LocalBusiness.sameAs (entity disambiguation signal).
  // Add Instagram / YouTube / Google Business Profile URLs here as they exist.
  'https://www.facebook.com/VisionarySoundProductionsLLC/',
];

export const PRESS_MENTIONS = [
  'PLSN Showtime',
  'Mobile Beat',
  'Lighting & Sound America',
  'Mitzvah Market',
];
