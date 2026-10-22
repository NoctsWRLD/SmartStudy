/**
 * Friend codes.
 *
 * A code is a short handle for one account, so a student can find the right
 * classmate even when several of them share a first and last name. The code is
 * the document id in the `userCodes` collection, so a lookup is one read and
 * two accounts can never share one.
 *
 * The alphabet skips the characters that are easy to confuse when a code is
 * read aloud or copied from a screen: I, L, O, 0 and 1.
 */
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 6;

/** Upper-case the code and drop everything that is not in the alphabet. */
export function normalizeCode(value) {
  if (typeof value !== 'string') return '';
  return value
    .toUpperCase()
    .split('')
    .filter((character) => CODE_ALPHABET.includes(character))
    .join('');
}

/** A code is valid when it is exactly the right length and uses the alphabet. */
export function isValidCode(value) {
  const normalized = normalizeCode(value);
  return normalized.length === CODE_LENGTH;
}

/**
 * Generate a code. `random` can be injected so the generator can be tested
 * without depending on the platform's randomness.
 */
export function generateCode(random = Math.random) {
  let code = '';
  for (let index = 0; index < CODE_LENGTH; index += 1) {
    const position = Math.floor(random() * CODE_ALPHABET.length);
    code += CODE_ALPHABET[position] ?? CODE_ALPHABET[0];
  }
  return code;
}

/**
 * The document id of the request between two accounts. Sorting the ids makes
 * the id identical from both sides, so one pair can only ever have one request
 * document — a second attempt fails instead of creating a duplicate.
 */
export function requestPairId(uidA, uidB) {
  return [uidA, uidB].sort().join('_');
}

/**
 * A short, non-reversible hint of a code, shown next to a name so a student
 * can match it with the code a classmate sent them. The full code is never
 * listed — codes are not enumerable.
 */
export function codeHint(code) {
  if (typeof code !== 'string' || code.length !== CODE_LENGTH) return '';
  return `${code.slice(0, 2)}••••${code.slice(-2)}`;
}
