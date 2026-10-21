/**
 * Site-wide constants.
 *
 * TODO(vsebina): SITE_URL is the final public address. It is not known yet —
 * the app ships to both GitHub Pages and Vercel, and the two have different
 * hostnames. Change it here once, and the canonical tags, Open Graph cards,
 * robots.txt and sitemap.xml all follow.
 */
export const SITE_URL = 'https://smartstudy.vercel.app';

export const SITE_NAME = 'SmartStudy';

export const SITE_DESCRIPTION =
  'Predmeti, naloge, preverjanja, urnik in kartice v enem pregledu. Za dijake in študente.';

/** Absolute URL for a path on this site. */
export function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString();
}

/** The public pages that belong in the sitemap and the footer. */
export const PUBLIC_ROUTES = [
  { path: '/', priority: '1.0' },
  { path: '/pravilnik-o-zasebnosti', priority: '0.3' },
  { path: '/impressum', priority: '0.3' },
  { path: '/dostopnost', priority: '0.3' },
  { path: '/login', priority: '0.5' },
  { path: '/register', priority: '0.7' },
];
