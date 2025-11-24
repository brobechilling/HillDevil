import { useCallback } from 'react';
import { Calendar, X } from 'lucide-react';

interface NewReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    reservation: any;
    onReservationChange: (field: string, value: any) => void;
    availableTables: any[];
    branchInfo: any;
    validationError: string;
    onValidationErrorChange: (error: string) => void;
    branchId: string | null;
}

export const NewReservationModal = ({
    isOpen,
    onClose,
    onSubmit,
    reservation,
    onReservationChange,
    availableTables,
    branchInfo,
    validationError,
    onValidationErrorChange,
    branchId,
}: NewReservationModalProps) => {
    const handleInputChange = useCallback((field: string, value: any) => {
        onReservationChange(field, value);
        if (field === 'start_time') {
            onValidationErrorChange('');
        }
    }, [onReservationChange, onValidationErrorChange]);

    if (!isOpen) return null;

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
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">New Reservation</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Customer Name <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={reservation.customer_name}
                            onChange={(e) => handleInputChange('customer_name', e.target.value)}
                            placeholder="Enter customer name"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Phone Number <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="tel"
                                value={reservation.customer_phone}
                                onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                                placeholder="Enter phone number"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={reservation.customer_email}
                                onChange={(e) => handleInputChange('customer_email', e.target.value)}
                                placeholder="Enter email address"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Number of Guests <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={reservation.guest_number}
                                onChange={(e) => handleInputChange('guest_number', parseInt(e.target.value) || 1)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Reservation Date & Time <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={reservation.start_time}
                                onChange={(e) => handleInputChange('start_time', e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            {branchInfo && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Branch hours: {branchInfo.openingTime.slice(0, 5)} - {branchInfo.closingTime.slice(0, 5)}
                                </p>
                            )}
                        </div>
                    </div>

                    {validationError && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-md text-sm">
                            {validationError}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Special Requests / Notes
                        </label>
                        <textarea
                            value={reservation.note}
                            onChange={(e) => handleInputChange('note', e.target.value)}
                            placeholder="Any special requests or notes..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                        />
                    </div>

                    {reservation.start_time && reservation.guest_number && (
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Select Table (Optional)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {availableTables
                                    .filter(t => t.branchId === branchId && t.capacity >= reservation.guest_number && t.status === 'available')
                                    .map(table => (
                                        <button
                                            key={table.id}
                                            type="button"
                                            onClick={() => handleInputChange('table_id', table.id === reservation.table_id ? '' : table.id)}
                                            className={`p-3 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${reservation.table_id === table.id
                                                ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20 shadow-md'
                                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-orange-400'
                                                }`}
                                        >
                                            <div className="text-lg font-bold text-gray-900 dark:text-white">{table.number}</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">{table.capacity} seats</div>
                                        </button>
                                    ))}
                            </div>
                            {availableTables.filter(t => t.branchId === branchId && t.capacity >= reservation.guest_number && t.status === 'available').length === 0 && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">No available tables for {reservation.guest_number} guests</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-md transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md flex items-center gap-2 transition-all duration-200"
                    >
                        <Calendar className="h-4 w-4" />
                        Create Reservation
                    </button>
                </div>
            </div>
        </div>
    );
};
