import {
  createStore,
  createEvent,
  addTier,
  bookTickets,
  cancelBooking,
  joinWaitlist,
  findBookingByReference
} from '../src/domain/inventory.js';

import { DomainError } from '../src/domain/errors.js';

const store = createStore();

const event = createEvent(store, {
  title: 'NodeConf',
  city: 'Lagos',
  venue: 'Civic Centre',
  date: '2027-01-15'
});

const tier = addTier(store, event.id, {
  name: 'General',
  priceCents: 5000,
  capacity: 3
});

console.log('Event created.');

const ada = bookTickets(store, {
  attendeeName: 'Ada',
  tierId: tier.id,
  quantity: 2
});

console.log(
  `Ada booked 2 tickets. Reference: ${ada.reference}`
);

try {
  bookTickets(store, {
    attendeeName: 'Bayo',
    tierId: tier.id,
    quantity: 2
  });
} catch (error) {
  if (error instanceof DomainError) {
    console.log(
      `Bayo booking refused: ${error.code}`
    );
  }
}

const chioma = bookTickets(store, {
  attendeeName: 'Chioma',
  tierId: tier.id,
  quantity: 1
});

console.log(
  `Chioma booked the final seat (${chioma.reference}).`
);

joinWaitlist(store, {
  tierId: tier.id,
  attendeeName: 'David'
});

joinWaitlist(store, {
  tierId: tier.id,
  attendeeName: 'Efe'
});

console.log(
  'David and Efe joined the waitlist.'
);

const found = findBookingByReference(
  store,
  ada.reference
);

console.log(
  `Found booking: ${found.attendeeName}`
);

const result = cancelBooking(
  store,
  ada.reference
);

console.log(
  'Ada cancelled her booking.'
);

console.log(
  `Next in line: ${result.nextInLine.attendeeName}`
);