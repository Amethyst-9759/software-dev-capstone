import { DomainError } from './errors.js';
import { newId, newReference } from './ids.js';
import { Queue } from './waitlistQueue.js';

function assertNonEmptyString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new DomainError(
      'VALIDATION',
      `${field} must be a non-empty string`
    );
  }
}

function assertPositiveInteger(value, field) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new DomainError(
      'VALIDATION',
      `${field} must be a positive integer`
    );
  }
}

function assertMoney(value, field) {
  if (!Number.isInteger(value) || value < 0) {
    throw new DomainError(
      'VALIDATION',
      `${field} must be whole cents`
    );
  }
}

export function createStore() {
  return {
    events: new Map(),
    tiers: new Map(),
    bookings: [],
    bookingsById: new Map(),
    bookingsByReference: new Map()
  };
}

export function createEvent(
  store,
  { title, city, venue, date }
) {
  assertNonEmptyString(title, 'title');
  assertNonEmptyString(city, 'city');
  assertNonEmptyString(venue, 'venue');
  assertNonEmptyString(date, 'date');

  const event = {
    id: newId(),
    title,
    city,
    venue,
    date,
    tiers: []
  };

  store.events.set(event.id, event);

  return event;
}

export function addTier(
  store,
  eventId,
  { name, priceCents, capacity }
) {
  const event = store.events.get(eventId);

  if (!event) {
    throw new DomainError(
      'NOT_FOUND',
      'Event not found'
    );
  }

  assertNonEmptyString(name, 'name');
  assertMoney(priceCents, 'priceCents');
  assertPositiveInteger(capacity, 'capacity');

  const tier = {
    id: newId(),
    eventId,
    name,
    priceCents,
    capacity,
    sold: 0,
    waitlist: new Queue()
  };

  store.tiers.set(tier.id, tier);
  event.tiers.push(tier.id);

  return tier;
}

export function bookTickets(
  store,
  {
    attendeeName,
    tierId,
    quantity
  }
) {
  assertNonEmptyString(attendeeName, 'attendeeName');

  if (!Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 10) {
    throw new DomainError(
      'VALIDATION',
      'quantity must be between 1 and 10'
    );
  }

  const tier = store.tiers.get(tierId);

  if (!tier) {
    throw new DomainError(
      'NOT_FOUND',
      'Tier not found'
    );
  }

  const available = tier.capacity - tier.sold;

  if (available < quantity) {
    throw new DomainError(
      'SOLD_OUT',
      'Not enough tickets available'
    );
  }

  tier.sold += quantity;

  const booking = {
    id: newId(),
    reference: newReference(),
    attendeeName,
    tierId,
    quantity,
    cancelled: false
  };

  store.bookings.push(booking);
  store.bookingsById.set(booking.id, booking);
  store.bookingsByReference.set(
    booking.reference,
    booking
  );

  return booking;
}

export function cancelBooking(
  store,
  reference
) {
  assertNonEmptyString(reference, 'reference');

  const booking =
    store.bookingsByReference.get(reference);

  if (!booking) {
    throw new DomainError(
      'NOT_FOUND',
      'Booking not found'
    );
  }

  if (booking.cancelled) {
    throw new DomainError(
      'VALIDATION',
      'Booking already cancelled'
    );
  }

  const tier = store.tiers.get(booking.tierId);

  tier.sold -= booking.quantity;
  booking.cancelled = true;

  return {
    booking,
    nextInLine: tier.waitlist.peek()
  };
}

export function findBookingByReference(
  store,
  reference
) {
  assertNonEmptyString(reference, 'reference');

  return (
    store.bookingsByReference.get(reference) ??
    null
  );
}

export function joinWaitlist(
  store,
  {
    tierId,
    attendeeName
  }
) {
  const tier = store.tiers.get(tierId);

  if (!tier) {
    throw new DomainError(
      'NOT_FOUND',
      'Tier not found'
    );
  }

  assertNonEmptyString(attendeeName, 'attendeeName');

  const entry = {
    attendeeName,
    joinedAt: Date.now()
  };

  tier.waitlist.enqueue(entry);

  return entry;
}