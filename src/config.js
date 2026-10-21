/**
 * Site-wide constants.
 *
 * SITE_URL is the public address of the Vercel deployment. It drives the
 * canonical tags, the Open Graph cards, robots.txt and sitemap.xml — if the
 * site ever moves, this is the one line to change.
 */
export const SITE_URL = 'https://smartstudyslo.vercel.app';

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
