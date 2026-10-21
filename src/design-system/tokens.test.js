/**
 * The design system's contract.
 *
 * Two things are checked here, both of which are easy to break by eye:
 *   1. Every foreground/background token pairing meets WCAG AA.
 *   2. The dark theme is a complete token swap — it defines every token the
 *      light theme defines, so a component never needs a theme override.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');

function readBlock(selector) {
  const start = css.indexOf(`${selector} {`);
  expect(start, `missing block ${selector}`).toBeGreaterThan(-1);
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  const body = css.slice(open + 1, close);
  const tokens = {};
  for (const match of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    tokens[match[1]] = match[2].trim();
  }
  return tokens;
}

const light = readBlock(':root');
const dark = readBlock(":root[data-theme='noc']");
const highContrast = readBlock(":root[data-contrast='high']");

function parseColor(value) {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const int = parseInt(hex[1], 16);
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
  }
  const rgb = value.match(/^rgb\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/i);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return null;
}

function luminance([r, g, b]) {
  const channel = (value) => {
    const s = value / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(foreground, background) {
  const a = luminance(parseColor(foreground));
  const b = luminance(parseColor(background));
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

const THEMES = [
  ['light', light],
  ['dark', dark],
];

/**
 * A token is theme-scoped when its value is a colour. Motion, radius and
 * easing are global and live in `:root` only — they must not be duplicated
 * per theme, and they must not be mistaken for a missing dark value.
 */
function isThemeScoped(value) {
  return /^#/.test(value) || /^rgb\(/.test(value) || value.includes('var(--rp-aurora-');
}

describe('token system', () => {
  it('defines the same token set in both themes (dark is a swap, not a second sheet)', () => {
    const scoped = Object.entries(light).filter(([, value]) => isThemeScoped(value)).map(([token]) => token);
    const missing = scoped.filter((token) => !(token in dark));
    expect(missing).toEqual([]);
  });

  it('keeps the high-contrast overrides inside the base token set', () => {
    const stray = Object.keys(highContrast).filter((token) => !(token in light));
    expect(stray).toEqual([]);
  });

  it.each(THEMES)('%s theme — text tiers on every surface meet WCAG AA', (_name, tokens) => {
    const surfaces = ['rp-canvas', 'rp-panel', 'rp-raised', 'rp-overlay'];
    for (const surface of surfaces) {
      for (const tier of ['rp-text', 'rp-subtle', 'rp-muted']) {
        const ratio = contrast(tokens[tier], tokens[surface]);
        expect(ratio, `${tier} on ${surface} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it.each(THEMES)('%s theme — the primary action meets WCAG AA', (_name, tokens) => {
    const ratio = contrast(tokens['rp-accent-ink'], tokens['rp-accent']);
    expect(ratio, `accent-ink on accent is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
  });

  it.each(THEMES)('%s theme — accent and status colours read as text on the canvas', (_name, tokens) => {
    for (const role of ['rp-accent', 'rp-warn', 'rp-danger', 'rp-success', 'rp-info']) {
      const ratio = contrast(tokens[role], tokens['rp-canvas']);
      expect(ratio, `${role} on canvas is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(THEMES)('%s theme — every subject hue reads on the canvas and on a card', (_name, tokens) => {
    for (let index = 1; index <= 10; index += 1) {
      const hue = tokens[`rp-subject-${index}`];
      expect(hue, `subject ${index} is not defined`).toBeTruthy();
      for (const surface of ['rp-canvas', 'rp-raised']) {
        const ratio = contrast(hue, tokens[surface]);
        expect(ratio, `subject ${index} on ${surface} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('keeps the aurora gradient wired to three distinct stops in both themes', () => {
    for (const [name, tokens] of THEMES) {
      const stops = [tokens['rp-aurora-1'], tokens['rp-aurora-2'], tokens['rp-aurora-3']];
      expect(stops.every(Boolean), `${name} is missing an aurora stop`).toBe(true);
      expect(new Set(stops).size, `${name} aurora stops are not distinct`).toBe(3);
      expect(tokens['rp-aurora']).toContain('var(--rp-aurora-1)');
    }
  });
});
