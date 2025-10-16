import { create } from 'zustand';

export interface Reservation {
  id: string;
  tableId: string;
  branchId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  numberOfGuests: number;
  reservationStart: string;
  reservationEnd: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
}

interface ReservationState {
  reservations: Reservation[];
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;
  getReservationsByTable: (tableId: string) => Reservation[];
  getReservationsByBranch: (branchId: string) => Reservation[];
}

const STORAGE_KEY = 'reservations';

const loadReservations = (): Reservation[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveReservations = (reservations: Reservation[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
};

export const useReservationStore = create<ReservationState>((set, get) => ({
  reservations: loadReservations(),

  addReservation: (reservation) => {
    const newReservation: Reservation = {
      ...reservation,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const reservations = [...get().reservations, newReservation];
    saveReservations(reservations);
    set({ reservations });
  },

  updateReservation: (id, updates) => {
    const reservations = get().reservations.map((reservation) =>
      reservation.id === id ? { ...reservation, ...updates } : reservation
    );
    saveReservations(reservations);
    set({ reservations });
  },

  deleteReservation: (id) => {
    const reservations = get().reservations.filter((reservation) => reservation.id !== id);
    saveReservations(reservations);
    set({ reservations });
  },

  getReservationsByTable: (tableId) => {
    return get().reservations.filter(
      (reservation) => reservation.tableId === tableId && reservation.status === 'confirmed'
    );
  },

  getReservationsByBranch: (branchId) => {
    return get().reservations.filter((reservation) => reservation.branchId === branchId);
  },
}));
