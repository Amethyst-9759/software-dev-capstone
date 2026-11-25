import { randomUUID, randomBytes } from 'node:crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function newId() {
  return randomUUID();
}

export function newReference() {
  const bytes = randomBytes(6);

  let result = '';

  for (const byte of bytes) {
    result += ALPHABET[byte % ALPHABET.length];
  }

  return `${result.slice(0, 3)}-${result.slice(3)}`;
}