export interface ReservationResponseDto {
  reservationId?: string;
  branchId?: string;
  areaTableId?: string;
  startTime?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  guestNumber?: number;
  note?: string;
  status?: 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'CANCELLED' | string;
  createdAt?: string;
}

export interface CreateReservationRequestDto {
  branchId?: string;
  areaTableId?: string | null;
  startTime: string; // ISO string
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  guestNumber?: number;
  note?: string | null;
}

export type ReservationApiList = ReservationResponseDto[];
