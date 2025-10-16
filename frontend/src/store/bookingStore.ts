// src/store/bookingStore.ts
import { create } from 'zustand';

/** ---------------- Types ---------------- **/

export interface Booking {
  id: string;                   // reservation_id
  branchId: string;             // branch_id
  areaTableId: string | null;   // area_table_id (null khi chưa gán)
  startTime: string;            // ISO datetime -> map tới start_time
  guestName: string;            // customer_name
  guestPhone: string;           // customer_phone
  numberOfGuests: number;       // guest_number
  status: 'pending' | 'approved' | 'confirmed' | 'declined';
  /** UI-only (không có trong DB reservation) */
  createdAt?: string;
}

type BookingState = {
  bookings: Booking[];

  // CRUD / Actions
  addBooking: (booking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => void;
  approveBooking: (bookingId: string) => void;            // ✅ 1 tham số
  confirmBooking: (bookingId: string) => void;
  declineBooking: (bookingId: string) => void;

  // Optional utilities
  markAsRead: (bookingId: string) => void;                // no-op (UI-only)
  getBookingsByBranch: (branchId?: string) => Booking[];
  getPendingBookings: (branchId?: string) => Booking[];
};

/** --------------- Persistence helpers --------------- **/

const STORAGE_KEY = 'mock_bookings';

const saveBookings = (bookings: Booking[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
};

// Migrate dữ liệu cũ từ localStorage (nếu trước đây bạn lưu bookingDate/bookingTime)
const loadBookings = (): Booking[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as any[];
    return parsed.map((b) => {
      // Nếu là shape cũ -> migrate sang startTime
      if (!b.startTime && b.bookingDate && b.bookingTime) {
        const iso = new Date(`${b.bookingDate}T${b.bookingTime}:00`).toISOString();
        return {
          id: String(b.id),
          branchId: b.branchId,
          areaTableId: b.areaTableId ?? null,
          startTime: iso,
          guestName: b.guestName,
          guestPhone: b.guestPhone ?? '',
          numberOfGuests: Number(b.numberOfGuests ?? 1),
          status: (b.status ?? 'pending') as Booking['status'],
          createdAt: b.createdAt ?? new Date().toISOString(),
        } as Booking;
      }
      // Nếu đã đúng shape mới
      return {
        id: String(b.id),
        branchId: b.branchId,
        areaTableId: b.areaTableId ?? null,
        startTime: b.startTime,
        guestName: b.guestName,
        guestPhone: b.guestPhone ?? '',
        numberOfGuests: Number(b.numberOfGuests ?? 1),
        status: (b.status ?? 'pending') as Booking['status'],
        createdAt: b.createdAt,
      } as Booking;
    });
  } catch {
    return [];
  }
};

/** -------------------- Store -------------------- **/

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: loadBookings(),

  addBooking: (bookingData) =>
    set((state) => {
      // areaTableId là required trong type, nhưng cho phép null khi chưa gán bàn
      const newBooking: Booking = {
        ...bookingData,
        id: Date.now().toString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      const updated = [newBooking, ...state.bookings];
      saveBookings(updated);
      return { bookings: updated };
    }),

  // ✅ Chỉ 1 tham số. Guard: chỉ approve từ 'pending'
  approveBooking: (bookingId: string) =>
    set((state) => {
      const idx = state.bookings.findIndex((b) => b.id === bookingId);
      if (idx === -1) return {};
      const current = state.bookings[idx];
      if (current.status !== 'pending') return {};

      const updated = [...state.bookings];
      updated[idx] = { ...current, status: 'approved' };

      saveBookings(updated);
      return { bookings: updated };
    }),

  // ✅ Guard: chỉ confirm từ 'approved'
  confirmBooking: (bookingId: string) =>
    set((state) => {
      const idx = state.bookings.findIndex((b) => b.id === bookingId);
      if (idx === -1) return {};
      const current = state.bookings[idx];
      if (current.status !== 'approved') return {};

      const updated = [...state.bookings];
      updated[idx] = { ...current, status: 'confirmed' };

      saveBookings(updated);
      return { bookings: updated };
    }),

  // ✅ Guard: chỉ decline từ 'pending' hoặc 'approved'
  declineBooking: (bookingId: string) =>
    set((state) => {
      const idx = state.bookings.findIndex((b) => b.id === bookingId);
      if (idx === -1) return {};
      const current = state.bookings[idx];
      if (current.status === 'confirmed' || current.status === 'declined') return {};

      const updated = [...state.bookings];
      updated[idx] = { ...current, status: 'declined' };

      saveBookings(updated);
      return { bookings: updated };
    }),

  // No-op: nếu cần đánh dấu đọc, bạn có thể thêm field UI-only (isRead) sau
  markAsRead: (_bookingId: string) => {},

  // Dùng get() thay vì useBookingStore.getState() để tránh vòng phụ thuộc
  getBookingsByBranch: (branchId?: string) => {
    const list = get().bookings;
    return branchId ? list.filter((b) => b.branchId === branchId) : list;
  },

  getPendingBookings: (branchId?: string) => {
    const list = get().bookings;
    const base = list.filter((b) => b.status === 'pending');
    return branchId ? base.filter((b) => b.branchId === branchId) : base;
  },
}));
