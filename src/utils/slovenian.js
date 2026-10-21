/**
 * Slovenian noun plurals: ena naloga, dve nalogi, tri naloge, pet nalog.
 *
 * `count` drives which form is returned, so the sentence never has to guess.
 */
export function plural(count, one, two, few, many) {
  if (count === 1) return one;
  if (count === 2) return two;
  if (count === 3 || count === 4) return few;
  return many;
}

/** "3 naloge" — the noun alone, already inflected for the count. */
export function countedNoun(count, one, two, few, many) {
  return `${count} ${plural(count, one, two, few, many)}`;
}
