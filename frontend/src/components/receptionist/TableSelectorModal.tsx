import { X } from 'lucide-react';

interface TableSelectorModalProps {
  isOpen: boolean;
  bookingId: string | null;
  bookings: any[];
  tables: any[];
  onClose: () => void;
  onAssignTable: (bookingId: string, tableId: string) => void;
  getAvailableTables: (booking: any) => any[];
}

export const TableSelectorModal = ({
  isOpen,
  bookingId,
  bookings,
  tables,
  onClose,
  onAssignTable,
  getAvailableTables,
}: TableSelectorModalProps) => {
  if (!isOpen || !bookingId) return null;

  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) return null;

  const availableTables = getAvailableTables(booking);

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

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'modalIn 0.3s ease-out' }}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Select Table</h3>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">{booking.guestName}</h4>
              <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>👥 {booking.numberOfGuests} guests</span>
                <span>📅 {formatDateTime(booking.startTime)}</span>
              </div>
            </div>

            {availableTables.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableTables.map(table => (
                  <button
                    key={table.id}
                    onClick={() => {
                      onAssignTable(booking.id, table.id);
                      onClose();
                    }}
                    className="p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 transform hover:scale-105"
                  >
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">Table {table.number}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{table.capacity} seats</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400 font-semibold">No available tables for this booking</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-md transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
