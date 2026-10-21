/** Page titles for the signed-in app, keyed by route. */
export const PAGE_TITLES = {
  '/dashboard': 'Domov',
  '/tasks': 'Naloge',
  '/subjects': 'Predmeti',
  '/exams': 'Preverjanja',
  '/flashcards': 'Kartice',
  '/schedule': 'Urnik',
  '/chat': 'Klepet',
  '/friends': 'Prijatelji',
  '/profile': 'Moj profil',
  '/settings': 'Nastavitve',
};

export function getPageTitle(pathname) {
  return PAGE_TITLES[pathname] || 'SmartStudy';
}
