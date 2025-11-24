import { Clock, Users, Check, X, Trash2, Mail } from 'lucide-react';

interface BookingCardProps {
  booking: any;
  index: number;
  tables: any[];
  branchId: string | null;
  onApprove: (bookingId: string) => void;
  onCancel: (bookingId: string) => void;
  onSelectTable: (bookingId: string) => void;
  getAvailableTables: (booking: any) => any[];
}

export const BookingCard = ({
  booking,
  index,
  tables,
  branchId,
  onApprove,
  onCancel,
  onSelectTable,
  getAvailableTables,
}: BookingCardProps) => {
  const availableTables = getAvailableTables(booking);
  const assignedTable = booking.tableId ? tables.find(t => t.id === booking.tableId) : null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      approved: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      cancelled: 'bg-destructive text-destructive-foreground',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div
      className="p-5 rounded-lg border border-border bg-card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      style={{
        animation: `slideIn 0.4s ease-out ${index * 0.1}s both`
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{booking.guestName}</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="flex items-center gap-2">
              <span>📞</span>
              <span>{booking.guestPhone || '—'}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <span>{booking.guestEmail || '—'}</span>
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${getStatusColor(booking.status)}`}>
          {booking.status.toUpperCase()}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Start Time</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDateTime(booking.startTime)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Users className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Party Size</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {booking.numberOfGuests} {booking.numberOfGuests !== 1 ? 'Guests' : 'Guest'}
            </p>
          </div>
        </div>

        {booking.specialRequests && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Special Requests</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">📝 {booking.specialRequests}</p>
          </div>
        )}
      </div>

      {booking.status === 'pending' && (
        <div className="space-y-2 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">
            Matching Tables ({availableTables.length})
          </p>
          {availableTables.length > 0 ? (
            <div className="max-h-40 overflow-y-auto pr-2">
              <div className="flex flex-col gap-2">
                {availableTables.map(t => (
                  <span key={t.id} className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-md text-xs font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 shadow-sm">
                    {t.number} • {t.capacity} seats
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
              ❌ No matching tables
            </p>
          )}
        </div>
      )}

      {booking.status === 'confirmed' && assignedTable && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            ✓ Assigned to <span className="text-green-600 dark:text-green-400">{assignedTable.number}</span>
          </p>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {booking.status === 'pending' && (
          <>
            <button
              onClick={() => onApprove(booking.id)}
              className="flex-1 min-w-fit px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105"
            >
              <Check className="h-4 w-4" />
              <span>Approve</span>
            </button>
            <button
              onClick={() => onCancel(booking.id)}
              className="flex-1 min-w-fit px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </>
        )}

        {booking.status === 'approved' && (
          <>
            <button
              onClick={() => onSelectTable(booking.id)}
              disabled={availableTables.length === 0}
              className="flex-1 min-w-fit px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white disabled:text-gray-500 dark:disabled:text-gray-400 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105 disabled:transform-none"
            >
              <Check className="h-4 w-4" />
              <span>Select Table</span>
            </button>
            <button
              onClick={() => onCancel(booking.id)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        )}

        {booking.status === 'confirmed' && (
          <button
            onClick={() => onCancel(booking.id)}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105"
          >
            <Trash2 className="h-4 w-4" />
            <span>Cancel Booking</span>
          </button>
        )}
      </div>
    </div>
  );
};
