import { useEffect } from 'react';
import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from '../config';

const OG_IMAGE = absoluteUrl('/scribe-og.png');

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

/**
 * Per-page metadata: title, description, canonical address, Open Graph and
 * Twitter card. Every page gets its own — a shared default would be the same
 * description on every URL.
 */
export function useSeo({ title, description = SITE_DESCRIPTION, path = '/', type = 'website' } = {}) {
  useEffect(() => {
    const fullTitle = title === SITE_NAME ? title : `${title} — ${SITE_NAME}`;
    const canonical = absoluteUrl(path);

    document.title = fullTitle;
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: 'index, follow' });
    upsertLink('canonical', canonical);

    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'sl_SI' });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: OG_IMAGE });
    upsertMeta('meta[property="og:image:width"]', { property: 'og:image:width', content: '1200' });
    upsertMeta('meta[property="og:image:height"]', { property: 'og:image:height', content: '630' });
    upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: 'Scribe — vidi, kaj moraš naučiti še danes.' });

    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: OG_IMAGE });
  }, [title, description, path, type]);
}

/**
 * Structured data belongs in the head, where a crawler looks for it first.
 * React renders the page body, so the script tag is placed explicitly.
 */
export function useJsonLd(data) {
  useEffect(() => {
    if (!data) return undefined;
    let element = document.head.querySelector('script[type="application/ld+json"]');
    if (!element) {
      element = document.createElement('script');
      element.setAttribute('type', 'application/ld+json');
      document.head.appendChild(element);
    }
    element.textContent = JSON.stringify(data);
    return () => element.remove();
  }, [data]);
}
