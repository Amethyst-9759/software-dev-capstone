import { randomUUID } from 'node:crypto';

const BOOKINGS = 100_000;
const LOOKUPS = 500;

const bookings = [];
const bookingMap = new Map();

for (let i = 0; i < BOOKINGS; i++) {
  const booking = {
    id: randomUUID(),
    reference: `REF-${i}`
  };

  bookings.push(booking);
  bookingMap.set(booking.reference, booking);
}

const targets = [];

for (let i = 0; i < LOOKUPS; i++) {
  targets.push(`REF-${BOOKINGS - i - 1}`);
}

let start = performance.now();

for (const ref of targets) {
  bookings.find(
    booking => booking.reference === ref
  );
}

let end = performance.now();

console.log(
  `Array.find: ${(end - start).toFixed(2)} ms`
);

start = performance.now();

for (const ref of targets) {
  bookingMap.get(ref);
}

end = performance.now();

console.log(
  `Map.get: ${(end - start).toFixed(2)} ms`
);

console.log(
  `Bookings: ${BOOKINGS}, Lookups: ${LOOKUPS}`
);