// JSON-LD builders. Each returns a plain object to be serialized into a
// <script type="application/ld+json"> tag (see components/seo/JsonLd.tsx).
import { SITE, SITE_URL, SOCIAL_PROFILES } from './config';
import type { BlogPost, Faq } from '@/lib/types';

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
// Single canonical node for the owner — referenced by both founder and blog author
// so AI/search treat them as one entity.
export const PERSON_ID = `${SITE_URL}/#${SITE.founderName.toLowerCase().replace(/\s+/g, '-')}`;

/** The shared Person node for Aaron Barris. */
export function personSchema() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SITE.founderName,
    jobTitle: 'Owner & Lead Designer',
    url: `${SITE_URL}/about`,
    worksFor: { '@id': ORG_ID },
  };
}

export function organizationSchema(opts?: { phone?: string }) {
  return {
    '@context': 'https://schema.org',
    // EntertainmentBusiness is the closest LocalBusiness subtype for an event
    // production company; keep LocalBusiness too for the broader signal.
    '@type': ['LocalBusiness', 'EntertainmentBusiness'],
    '@id': ORG_ID,
    name: SITE.name,
    url: SITE_URL,
    description: SITE.description,
    foundingDate: SITE.foundingYear,
    founder: { '@id': PERSON_ID },
    email: SITE.email,
    ...(opts?.phone ? { telephone: opts.phone } : {}),
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    areaServed: SITE.areasServed.map((name) => ({ '@type': 'Place', name })),
    ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : {}),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE.name,
    url: SITE_URL,
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function serviceSchema(opts: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}${opts.path}/#service`,
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    provider: { '@id': ORG_ID },
    areaServed: SITE.areasServed.map((name) => ({ '@type': 'Place', name })),
  };
}

export function faqSchema(faqs: Faq[]) {
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function blogPostingSchema(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_image_url ?? undefined,
    datePublished: post.date ?? undefined,
    dateModified: post.updated_at ?? post.date ?? undefined,
    url: `${SITE_URL}/blog/${post.slug}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
    author: { '@id': PERSON_ID },
    publisher: { '@id': ORG_ID },
  };
}
