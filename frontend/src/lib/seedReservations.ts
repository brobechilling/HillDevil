import { Booking } from '@/store/bookingStore';
import { Reservation } from '@/store/reservationStore';

export function seedReservations(branchId: string): void {
  // Seed bookings
  const BOOKING_KEY = 'mock_bookings';
  const existingBookings = localStorage.getItem(BOOKING_KEY);
  
  if (existingBookings) {
    const bookings = JSON.parse(existingBookings);
    if (bookings.some((b: Booking) => b.branchId === branchId)) {
      // Skip bookings if already seeded
    }
  }

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const mockReservations: Booking[] = [
    {
      id: `${branchId}-booking-1`,
      branchId,
      branchName: 'Current Branch',
      guestName: 'Alice Johnson',
      guestEmail: 'alice.j@email.com',
      guestPhone: '+1 234 567 8901',
      bookingDate: formatDate(today),
      bookingTime: '18:00',
      numberOfGuests: 4,
      items: [],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'pending',
    },
    {
      id: `${branchId}-booking-2`,
      branchId,
      branchName: 'Current Branch',
      guestName: 'Bob Smith',
      guestEmail: 'bob.smith@email.com',
      guestPhone: '+1 234 567 8902',
      bookingDate: formatDate(today),
      bookingTime: '19:30',
      numberOfGuests: 2,
      items: [],
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      status: 'pending',
    },
    {
      id: `${branchId}-booking-3`,
      branchId,
      branchName: 'Current Branch',
      guestName: 'Carol Williams',
      guestEmail: 'carol.w@email.com',
      guestPhone: '+1 234 567 8903',
      bookingDate: formatDate(tomorrow),
      bookingTime: '20:00',
      numberOfGuests: 6,
      items: [],
      createdAt: new Date(Date.now() - 10800000).toISOString(),
      status: 'approved',
    },
    {
      id: `${branchId}-booking-4`,
      branchId,
      branchName: 'Current Branch',
      guestName: 'David Brown',
      guestEmail: 'david.b@email.com',
      guestPhone: '+1 234 567 8904',
      bookingDate: formatDate(dayAfter),
      bookingTime: '18:30',
      numberOfGuests: 8,
      items: [],
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      status: 'confirmed',
    },
    {
      id: `${branchId}-booking-5`,
      branchId,
      branchName: 'Current Branch',
      guestName: 'Emma Davis',
      guestEmail: 'emma.d@email.com',
      guestPhone: '+1 234 567 8905',
      bookingDate: formatDate(dayAfter),
      bookingTime: '19:00',
      numberOfGuests: 3,
      items: [],
      createdAt: new Date(Date.now() - 18000000).toISOString(),
      status: 'confirmed',
    },
  ];

  const allBookings = existingBookings ? JSON.parse(existingBookings) : [];
  const updatedBookings = [...allBookings, ...mockReservations];
  localStorage.setItem(BOOKING_KEY, JSON.stringify(updatedBookings));

  // Seed table reservations with two reservations for Table 1
  const RESERVATION_KEY = 'reservations';
  const existingReservations = localStorage.getItem(RESERVATION_KEY);
  
  if (existingReservations) {
    const reservations = JSON.parse(existingReservations);
    if (reservations.some((r: Reservation) => r.branchId === branchId)) {
      return; // Already seeded
    }
  }

  // Get the first table ID for this branch
  const tables = JSON.parse(localStorage.getItem('tables') || '[]');
  const firstTable = tables.find((t: any) => t.branchId === branchId);
  
  if (!firstTable) return;

  const mockTableReservations: Reservation[] = [
    {
      id: `${branchId}-reservation-1`,
      tableId: firstTable.id,
      branchId,
      guestName: 'Michael Johnson',
      guestEmail: 'michael.j@email.com',
      guestPhone: '+1 234 567 8910',
      numberOfGuests: 4,
      reservationStart: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      reservationEnd: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      status: 'confirmed',
      notes: 'Anniversary celebration, please prepare a special table setup',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: `${branchId}-reservation-2`,
      tableId: firstTable.id,
      branchId,
      guestName: 'Sarah Williams',
      guestEmail: 'sarah.w@email.com',
      guestPhone: '+1 234 567 8911',
      numberOfGuests: 2,
      reservationStart: new Date(Date.now() + 10800000).toISOString(), // 3 hours from now
      reservationEnd: new Date(Date.now() + 14400000).toISOString(), // 4 hours from now
      status: 'confirmed',
      notes: 'Birthday dinner, vegetarian preference',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  const allReservations = existingReservations ? JSON.parse(existingReservations) : [];
  const updatedReservations = [...allReservations, ...mockTableReservations];
  localStorage.setItem(RESERVATION_KEY, JSON.stringify(updatedReservations));
}
