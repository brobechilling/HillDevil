import { useMemo, useState, useEffect, useCallback } from 'react';
import { useReservations, useCreateReservationReceptionist, useAssignTable, useUpdateReservationStatus } from '@/hooks/queries/useReservations';
import { useTables } from '@/hooks/queries/useTables';
import { useSessionStore } from '@/store/sessionStore';
import { isStaffAccountDTO } from '@/utils/typeCast';
import { Search, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { BookingCard } from '@/components/receptionist/BookingCard';
import { NewReservationModal } from '@/components/receptionist/NewReservationModal';
import { TableSelectorModal } from '@/components/receptionist/TableSelectorModal';

const ReservationsPage = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);
  const [showTableSelector, setShowTableSelector] = useState(null);
  const [newReservation, setNewReservation] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    guest_number: 2,
    start_time: '',
    note: '',
    table_id: '',
  });
  const [validationError, setValidationError] = useState<string>('');
  const [branchInfo, setBranchInfo] = useState<any>(null);

  const [bookings, setBookings] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const { user } = useSessionStore();

  const branchId = isStaffAccountDTO(user) ? user.branchId : null;

  const reservationsQuery = useReservations(branchId ?? undefined, 0, 100);
  const tablesQuery = useTables(branchId ?? undefined, 0, 200);
  const createMutation = useCreateReservationReceptionist();
  const assignTableMutation = useAssignTable();
  const updateStatusMutation = useUpdateReservationStatus();

  useEffect(() => {
    if (!reservationsQuery.data) {
      setBookings([]);
      return;
    }

    const res = reservationsQuery.data;
    const data = res && res.result ? res.result.content || res.result : res;
    const list = data && data.content ? data.content : data;

    const normalized = Array.isArray(list)
      ? list.map((r: any) => ({
        id: r.reservationId || r.id,
        reservationId: r.reservationId || r.id,
        branchId: r.branchId,
        tableId: r.areaTableId || r.tableId || null,
        guestName: r.customerName || r.guestName || '',
        guestPhone: r.customerPhone || r.guestPhone || '',
        guestEmail: r.customerEmail || r.guestEmail || '',
        numberOfGuests: r.guestNumber || r.numberOfGuests || 1,
        startTime: r.startTime ? (typeof r.startTime === 'string' ? r.startTime : r.startTime.toString()) : null,
        endTime: r.endTime || (r.startTime ? new Date(new Date(r.startTime).getTime() + 2 * 60 * 60 * 1000).toISOString() : null),
        status: (r.status || '').toString().toLowerCase(),
        specialRequests: r.note || r.specialRequests || '',
      }))
      : [];

    setBookings(normalized);
  }, [reservationsQuery.data]);

  useEffect(() => {
    if (!tablesQuery.data) {
      setTables([]);
      return;
    }

    const tblRes = tablesQuery.data;
    const tbls = tblRes && (tblRes.content || tblRes) ? (tblRes.content || tblRes) : [];
    const normalizedTables = (Array.isArray(tbls) ? tbls : []).map((t: any) => {
      // Keep backend enum values (FREE, OCCUPIED, ACTIVE, INACTIVE) for proper validation
      const status = (t.status || 'ACTIVE').toString().toUpperCase();
      return {
        id: t.id,
        number: t.tag || t.id,
        capacity: t.capacity || 0,
        status,
        branchId: branchId,
      };
    });
    setTables(normalizedTables);
  }, [tablesQuery.data, branchId]);

  // Initialize branch info only once on mount
  useEffect(() => {
    setBranchInfo({
      openingTime: '07:00:00',
      closingTime: '22:00:00',
    });
  }, []);


  const tabs = [
    { id: 'pending', label: 'Pending', icon: '⏳' },
    { id: 'approved', label: 'Approved', icon: '👍' },
    { id: 'confirmed', label: 'Confirmed', icon: '✓' },
    { id: 'cancelled', label: 'Cancelled', icon: '✕' },
  ];

  const getTabColor = (isActive: boolean) => {
    if (isActive) {
      return 'bg-primary text-primary-foreground border-primary';
    }
    return 'bg-background text-foreground border-border hover:border-primary';
  };

  const branchBookings = useMemo(() => {
    if (!branchId) return [];
    return bookings.filter(b => String(b.branchId) === String(branchId));
  }, [bookings, branchId]);

  const searchedBookings = useMemo(() => {
    if (!search.trim()) return branchBookings;

    const query = search.toLowerCase();
    return branchBookings.filter(
      b =>
        (b.guestName || '').toLowerCase().includes(query) ||
        (b.guestPhone || '').includes(query)
    );
  }, [branchBookings, search]);

  const groupedBookings = useMemo(() => {
    return {
      pending: searchedBookings.filter(b => b.status === 'pending'),
      approved: searchedBookings.filter(b => b.status === 'approved'),
      confirmed: searchedBookings.filter(b => b.status === 'confirmed'),
      cancelled: searchedBookings.filter(b => b.status === 'cancelled'),
    };
  }, [searchedBookings]);

  const getAvailableTables = (booking) => {
    // Check capacity, branch, and table must be FREE
    return tables.filter(
      t =>
        t.branchId === branchId &&
        t.capacity >= booking.numberOfGuests &&
        t.status === 'FREE'
    );
  };

  const hasTimeConflict = (newBooking, tableId, excludeBookingId = null) => {
    return branchBookings.some(b => {
      if (b.id === excludeBookingId || b.status === 'cancelled') return false;
      // Only check conflicts for this specific table
      if (!b.tableId || b.tableId !== tableId) return false;
      // Only confirmed reservations count as conflicts
      if (b.status !== 'confirmed') return false;

      const newStart = new Date(newBooking.startTime);
      const newEnd = new Date(newBooking.endTime);
      const existStart = new Date(b.startTime);
      const existEnd = new Date(b.endTime);

      return newStart < existEnd && newEnd > existStart;
    });
  };

  const handleReservationChange = useCallback((field, value) => {
    setNewReservation(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleValidationErrorChange = useCallback((error) => {
    setValidationError(error);
  }, []);

  const handleCreateReservation = useCallback(async () => {
    // Reset validation error
    setValidationError('');

    if (!newReservation.customer_name || !newReservation.customer_phone || !newReservation.start_time) {
      alert('Please fill in all required fields');
      return;
    }

    if (!branchId) {
      alert('Branch is not selected. Please ensure you are logged in as a staff/receptionist.');
      return;
    }

    // Validate reservation date & time
    if (newReservation.start_time) {
      const reservationDateTime = new Date(newReservation.start_time);
      const now = new Date();

      // Check if date is today or future
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const reservationDate = new Date(reservationDateTime.getFullYear(), reservationDateTime.getMonth(), reservationDateTime.getDate());

      if (reservationDate < today) {
        setValidationError('Reservation date must be today or in the future');
        return;
      }

      // Check if time is within branch opening/closing hours
      if (branchInfo) {
        const [openHour, openMin] = branchInfo.openingTime.split(':').map(Number);
        const [closeHour, closeMin] = branchInfo.closingTime.split(':').map(Number);
        const [resHour, resMin] = [reservationDateTime.getHours(), reservationDateTime.getMinutes()];

        const openTimeInMinutes = openHour * 60 + openMin;
        const closeTimeInMinutes = closeHour * 60 + closeMin;
        const resTimeInMinutes = resHour * 60 + resMin;

        if (resTimeInMinutes < openTimeInMinutes || resTimeInMinutes > closeTimeInMinutes) {
          setValidationError(
            `Reservation time must be between ${branchInfo.openingTime.slice(0, 5)} and ${branchInfo.closingTime.slice(0, 5)}`
          );
          return;
        }
      }
    }

    // Prepare payload expected by backend CreateReservationRequest
    // datetime-local input usually returns "YYYY-MM-DDTHH:mm" — ensure seconds are present
    let startTime = newReservation.start_time;
    if (startTime && startTime.length === 16) startTime = `${startTime}:00`;

    const payload: any = {
      branchId: branchId,
      areaTableId: newReservation.table_id || null,
      startTime: startTime,
      customerName: newReservation.customer_name,
      customerPhone: newReservation.customer_phone || null,
      customerEmail: newReservation.customer_email || null,
      guestNumber: newReservation.guest_number || 1,
      note: newReservation.note || null,
    };

    try {
      const res = await createMutation.mutateAsync(payload);
      const saved = res && res.result ? res.result : res;
      // If receptionist selected a table in the form, attempt to assign it right away
      // so backend and UI reflect a confirmed booking.
      let finalSaved = saved;
      if (newReservation.table_id) {
        try {
          const assignResp = await assignTableMutation.mutateAsync({ reservationId: saved.reservationId || saved.id, tableId: newReservation.table_id });
          finalSaved = assignResp && assignResp.result ? assignResp.result : assignResp;
        } catch (err) {
          // If assign fails, still proceed but mark as confirmed in UI to reflect receptionist intent
          console.error('Failed to auto-assign table after create', err);
          finalSaved = { ...(saved || {}), areaTableId: saved.areaTableId || newReservation.table_id, tableId: saved.tableId || newReservation.table_id, status: saved.status || 'confirmed' };
        }
      }

      const savedBooking = {
        id: finalSaved.reservationId || finalSaved.id || String(Date.now()),
        reservationId: finalSaved.reservationId || finalSaved.id,
        branchId: finalSaved.branchId || branchId,
        tableId: finalSaved.areaTableId || finalSaved.tableId || newReservation.table_id || null,
        guestName: finalSaved.customerName || newReservation.customer_name,
        guestPhone: finalSaved.customerPhone || newReservation.customer_phone,
        guestEmail: finalSaved.customerEmail || newReservation.customer_email,
        numberOfGuests: finalSaved.guestNumber || newReservation.guest_number || 1,
        startTime: finalSaved.startTime || startTime,
        endTime: finalSaved.endTime || (finalSaved.startTime ? new Date(new Date(finalSaved.startTime).getTime() + 2 * 60 * 60 * 1000).toISOString() : null),
        status: (newReservation.table_id ? 'confirmed' : (finalSaved.status || 'pending')).toString().toLowerCase(),
        specialRequests: finalSaved.note || newReservation.note || '',
      };

      setBookings(prev => [savedBooking, ...prev]);
      setShowNewReservationModal(false);
      setNewReservation({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        guest_number: 2,
        start_time: '',
        note: '',
        table_id: '',
      });
      setActiveTab(savedBooking.status === 'confirmed' ? 'confirmed' : 'pending');
    } catch (err) {
      console.error('Failed to create reservation', err);
      alert('Failed to create reservation. Please try again.');
    }
  }, [branchId, newReservation, branchInfo, createMutation, assignTableMutation]);

  const handleApprove = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    (async () => {
      try {
        // Persist status change to backend
        const resp = await updateStatusMutation.mutateAsync({ reservationId: booking.reservationId || booking.id, status: 'approved' });
        const saved = resp && resp.result ? resp.result : resp;

        setBookings(prev =>
          prev.map(b =>
            b.id === bookingId ? { ...b, status: (saved.status || 'approved').toString().toLowerCase() } : b
          )
        );
      } catch (err) {
        console.error('Failed to update reservation status', err);
        alert('Failed to update reservation status. Please try again.');
      }
    })();
  };

  const handleCancel = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    (async () => {
      try {
        const resp = await updateStatusMutation.mutateAsync({ reservationId: booking.reservationId || booking.id, status: 'CANCELLED' });
        const saved = resp && resp.result ? resp.result : resp;
        setBookings(prev =>
          prev.map(b => (b.id === bookingId ? { ...b, status: (saved.status || 'cancelled').toString().toLowerCase(), tableId: null } : b))
        );
      } catch (err) {
        console.error('Failed to cancel reservation', err);
        alert('Failed to cancel reservation. Please try again.');
      }
    })();
  };

  const handleAssignTable = (bookingId, tableId) => {
    const booking = bookings.find(b => b.id === bookingId);
    const table = tables.find(t => t.id === tableId);

    if (!booking) {
      toast({
        title: '✗ Error',
        description: 'Booking not found',
        variant: 'destructive',
      });
      return;
    }
    if (!table) {
      toast({
        title: '✗ Error',
        description: 'Table not found',
        variant: 'destructive',
      });
      return;
    }

    // Check for time conflicts on this specific table
    if (hasTimeConflict(booking, tableId, bookingId)) {
      toast({
        title: '✗ Time Conflict',
        description: `Table ${table.number} has a time conflict with another confirmed booking during this time slot.`,
        variant: 'destructive',
      });
      return;
    }

    // Persist assignment to backend then update UI
    (async () => {
      try {
        const resp = await assignTableMutation.mutateAsync({ reservationId: booking.reservationId || booking.id, tableId });
        const saved = resp && resp.result ? resp.result : resp;

        setBookings(prev =>
          prev.map(b =>
            b.id === bookingId
              ? {
                ...b,
                tableId: saved.areaTableId || saved.tableId || tableId,
                status: (saved.status || 'confirmed').toString().toLowerCase(),
              }
              : b
          )
        );
        
        toast({
          title: '✓ Success',
          description: `Table ${table.number} assigned successfully`,
        });
      } catch (err: any) {
        console.error('Failed to assign table', err);
        toast({
          title: '✗ Error',
          description: err?.response?.data?.message || 'Failed to assign table. Please try again.',
          variant: 'destructive',
        });
      }
    })();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center gap-4 flex-wrap" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Reservation Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage and track all your restaurant bookings</p>
          </div>
          <button
            onClick={() => setShowNewReservationModal(true)}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md flex items-center gap-2 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            New Reservation
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative" style={{ animation: 'fadeIn 0.6s ease-out' }}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by guest name or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap" style={{ animation: 'fadeIn 0.7s ease-out' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm border transition-all duration-300 transform hover:scale-105 ${getTabColor(activeTab === tab.id)}`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                {groupedBookings[tab.id].length}
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-96">
          {groupedBookings[activeTab as keyof typeof groupedBookings].length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {groupedBookings[activeTab as keyof typeof groupedBookings].map((booking, index) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  index={index}
                  tables={tables}
                  branchId={branchId}
                  onApprove={handleApprove}
                  onCancel={handleCancel}
                  onSelectTable={setShowTableSelector}
                  getAvailableTables={getAvailableTables}
                />
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center p-16 bg-card rounded-lg border border-border"
              style={{ animation: 'fadeIn 0.5s ease-out' }}
            >
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No {activeTab} bookings</h3>
              <p className="text-gray-600 dark:text-gray-400">There are no bookings in this category at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Reservation Modal */}
      <NewReservationModal
        isOpen={showNewReservationModal}
        onClose={() => setShowNewReservationModal(false)}
        onSubmit={handleCreateReservation}
        reservation={newReservation}
        onReservationChange={handleReservationChange}
        onValidationErrorChange={handleValidationErrorChange}
        availableTables={tables}
        branchInfo={branchInfo}
        validationError={validationError}
        branchId={branchId}
        hasTimeConflict={hasTimeConflict}
      />

      <TableSelectorModal
        isOpen={showTableSelector !== null}
        bookingId={showTableSelector}
        bookings={bookings}
        tables={tables}
        onClose={() => setShowTableSelector(null)}
        onAssignTable={handleAssignTable}
        getAvailableTables={getAvailableTables}
      />
    </div>
  );
};

export default ReservationsPage;