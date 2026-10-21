/**
 * The two themes the app ships with. Dark is the default — it is the mode a
 * student actually studies in, and the one the aurora palette was drawn for.
 */
export const THEMES = [
  { id: 'noc', name: 'Noč', description: 'Temni vid z aurora barvami — za učenje zvečer.' },
  { id: 'dnevnik', name: 'Dnevnik', description: 'Svetli vid — za urejanje v dnevnem času.' },
];

export const DEFAULT_THEME = 'noc';

const THEME_IDS = THEMES.map((theme) => theme.id);

/** Themes saved by earlier versions of the app, mapped onto the new ids. */
const LEGACY_THEMES = {
  tabla: 'dnevnik',
  'tabla-temna': 'noc',
};

export function normalizeThemeId(value) {
  if (THEME_IDS.includes(value)) return value;
  if (value && LEGACY_THEMES[value]) return LEGACY_THEMES[value];
  return null;
}
