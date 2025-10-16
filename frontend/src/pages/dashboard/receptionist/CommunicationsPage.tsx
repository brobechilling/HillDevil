import { useState } from 'react';
import { Mail, Send, Calendar, Users, CheckCircle, AlertCircle, X } from 'lucide-react';

const CommunicationsPage = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [message, setMessage] = useState('');
  const [sentMessages, setSentMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const approvedBookings = [
    {
      id: '1',
      guestName: 'Carol Williams',
      guestEmail: 'carol@example.com',
      bookingDate: '2024-12-15',
      bookingTime: '19:00',
      numberOfGuests: 6,
      status: 'approved',
      phone: '0123456789',
    },
    {
      id: '2',
      guestName: 'John Smith',
      guestEmail: 'john@example.com',
      bookingDate: '2024-12-16',
      bookingTime: '20:00',
      numberOfGuests: 4,
      status: 'approved',
      phone: '0987654321',
    },
    {
      id: '3',
      guestName: 'Sarah Johnson',
      guestEmail: 'sarah@example.com',
      bookingDate: '2024-12-17',
      bookingTime: '19:30',
      numberOfGuests: 2,
      status: 'approved',
      phone: '0912345678',
    },
  ];

  const templates = [
    {
      id: 'confirmation',
      title: 'Reservation Confirmation',
      content: 'Your reservation has been confirmed. We look forward to welcoming you!',
    },
    {
      id: 'reminder',
      title: 'Reservation Reminder',
      content: 'This is a reminder about your reservation tomorrow. Please let us know if you need to make any changes.',
    },
    {
      id: 'unavailable',
      title: 'Table Unavailable',
      content: 'Unfortunately, we do not have tables available for your requested time. Would you like to consider an alternative time?',
    },
    {
      id: 'thank_you',
      title: 'Thank You',
      content: 'Thank you for dining with us! We hope you had a wonderful experience. Please feel free to contact us anytime.',
    },
  ];

  const showNotification = (type, title, description) => {
    setNotification({ type, title, description });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSendConfirmation = async (bookingId) => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      
      setSentMessages(prev => ({
        ...prev,
        [bookingId]: { type: 'confirmation', sentAt: new Date().toLocaleTimeString() }
      }));
      
      showNotification(
        'success',
        'Confirmation sent',
        'Reservation confirmation email sent to customer.'
      );
    } catch (error) {
      showNotification('error', 'Error', 'Failed to send confirmation.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCustomMessage = async () => {
    if (!selectedBooking) {
      showNotification('error', 'Error', 'Please select a booking first.');
      return;
    }

    if (!message.trim()) {
      showNotification('error', 'Error', 'Message cannot be empty.');
      return;
    }

    if (message.length > 500) {
      showNotification('error', 'Error', 'Message cannot exceed 500 characters.');
      return;
    }

    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      
      setSentMessages(prev => ({
        ...prev,
        [selectedBooking]: { type: 'custom', sentAt: new Date().toLocaleTimeString(), content: message }
      }));

      showNotification(
        'success',
        'Message sent',
        'Custom message sent to customer successfully.'
      );
      
      setMessage('');
      setSelectedBooking(null);
    } catch (error) {
      showNotification('error', 'Error', 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (templateContent) => {
    if (!approvedBookings.length) {
      showNotification('error', 'Error', 'No approved bookings available.');
      return;
    }

    setMessage(templateContent);
    if (!selectedBooking) {
      setSelectedBooking(approvedBookings[0].id);
    }
  };

  const currentBooking = approvedBookings.find(b => b.id === selectedBooking);
  const lastMessage = sentMessages[selectedBooking];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Customer Communications</h2>
          <p className="text-gray-600 mt-1">Manage communications with your customers</p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`p-4 rounded-lg flex items-center justify-between ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              )}
              <div>
                <p className={`font-semibold ${notification.type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
                  {notification.title}
                </p>
                <p className={`text-sm ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                  {notification.description}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Reservations */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Recent Reservations ({approvedBookings.length})
            </h3>
            <div className="space-y-3">
              {approvedBookings.map((booking) => {
                const isSelected = selectedBooking === booking.id;
                const hasSentMessage = sentMessages[booking.id];
                
                return (
                  <div 
                    key={booking.id} 
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white hover:shadow-md'
                    }`}
                    onClick={() => setSelectedBooking(booking.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{booking.guestName}</h4>
                        <p className="text-xs text-gray-500 mt-1">{booking.guestEmail}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full">
                          {booking.status}
                        </span>
                        {hasSentMessage && (
                          <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">
                            ✓ Message sent
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{booking.bookingDate} at {booking.bookingTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{booking.numberOfGuests} guests</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendConfirmation(booking.id);
                        }}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Mail className="h-4 w-4" />
                        {sentMessages[booking.id]?.type === 'confirmation' ? 'Sent ✓' : 'Confirmation'}
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        disabled={loading}
                        className={`p-2 rounded-lg ${
                          isSelected 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        } disabled:opacity-50`}
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Message Templates & Custom Message */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Message Templates</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {templates.map((template) => (
                <div key={template.id} className="p-4 rounded-lg border border-gray-200 bg-white">
                  <h4 className="font-semibold text-gray-900 mb-2">{template.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{template.content}</p>
                  <button
                    onClick={() => handleUseTemplate(template.content)}
                    disabled={!approvedBookings.length || loading}
                    className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg disabled:opacity-50"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>

            {/* Custom Message Form */}
            {selectedBooking && currentBooking && (
              <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Send Message to {currentBooking.guestName}
                </h4>
                
                <div className="bg-white p-3 rounded mb-3 text-xs text-gray-600 space-y-1">
                  <p><strong>Email:</strong> {currentBooking.guestEmail}</p>
                  <p><strong>Phone:</strong> {currentBooking.phone}</p>
                </div>
                
                <textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                  rows={4}
                  className="w-full p-3 mb-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <p className={`text-xs mb-3 ${
                  message.length > 450 
                    ? 'text-orange-600' 
                    : 'text-gray-500'
                }`}>
                  {message.length}/500 characters
                </p>
                
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={handleSendCustomMessage}
                    disabled={!message.trim() || loading}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBooking(null);
                      setMessage('');
                    }}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>

                {lastMessage && (
                  <p className="text-xs text-green-600 bg-green-50 p-2 rounded">
                    ✓ Last message sent at {lastMessage.sentAt}
                  </p>
                )}
              </div>
            )}

            {!selectedBooking && (
              <div className="p-8 rounded-lg border border-gray-200 bg-gray-50 text-center text-gray-500">
                <p className="text-sm">Select a reservation to send a message</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationsPage;