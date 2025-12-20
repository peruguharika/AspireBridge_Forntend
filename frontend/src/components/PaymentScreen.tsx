import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Shield, CheckCircle, Calendar, Clock, User } from 'lucide-react';
import { paymentAPI, bookingAPI } from '../utils/api';
import { RAZORPAY_CONFIG } from '../config';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PaymentScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mentorId, mentorName, duration, amount, selectedSlot } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    sessionDate: selectedSlot ? selectedSlot.date.split('T')[0] : '',
    sessionTime: selectedSlot ? selectedSlot.startTime : '',
    notes: ''
  });

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create Razorpay order
      const roundedAmount = Math.round(amount);
      console.log('Creating order with:', { originalAmount: amount, roundedAmount, type: 'booking' });
      const orderResponse = await paymentAPI.createOrder({
        amount: roundedAmount,
        type: 'booking',
        currency: 'INR'
      });

      console.log('Order response:', orderResponse);

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      // Initialize Razorpay
      const options = {
        key: orderResponse.keyId,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: RAZORPAY_CONFIG.name,
        description: `Session with ${mentorName}`,
        order_id: orderResponse.orderId,
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await paymentAPI.verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });

          if (verifyResponse.success) {
            // Get current user info
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            
            // Create booking
            const bookingResponse = await bookingAPI.createBooking({
              aspirantId: currentUser.id || currentUser._id,
              achieverId: mentorId,
              aspirantName: currentUser.name,
              aspirantEmail: currentUser.email,
              mentorName,
              mentorExam: 'General', // Default value
              date: bookingDetails.sessionDate,
              time: bookingDetails.sessionTime,
              message: bookingDetails.notes,
              amount: roundedAmount,
              paymentId: response.razorpay_payment_id
            });

            if (bookingResponse.success) {
              navigate('/payment-success', {
                state: {
                  bookingId: bookingResponse.booking._id,
                  amount: roundedAmount
                }
              });
            }
          }
        },
        prefill: {
          name: 'Student Name',
          email: 'student@example.com',
          contact: '9999999999'
        },
        theme: {
          color: RAZORPAY_CONFIG.theme.color
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            alert('Payment was cancelled. Please try again.');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">Schedule your session and make payment</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Session Details</h2>
              
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                {selectedSlot ? (
                  // Show selected slot details (read-only)
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selected Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={new Date(selectedSlot.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                          readOnly
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selected Time Slot
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={`${new Date(`2000-01-01T${selectedSlot.startTime}:00`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })} - ${new Date(`2000-01-01T${selectedSlot.endTime}:00`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}`}
                          readOnly
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  // Show date/time pickers for manual selection
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          required
                          value={bookingDetails.sessionDate}
                          onChange={(e) => setBookingDetails({ ...bookingDetails, sessionDate: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="time"
                          required
                          value={bookingDetails.sessionTime}
                          onChange={(e) => setBookingDetails({ ...bookingDetails, sessionTime: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={bookingDetails.notes}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any specific topics you want to discuss..."
                  />
                </div>

                {selectedSlot && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="text-sm text-green-900">
                        <p className="font-medium mb-1">Time Slot Selected</p>
                        <p className="text-green-700">
                          You've selected a specific time slot from {mentorName}'s availability. 
                          This slot will be reserved for you upon payment confirmation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Secure Payment</p>
                      <p className="text-blue-700">
                        Your payment is processed securely through Razorpay. 
                        We never store your card details.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-6 h-6" />
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{mentorName}</div>
                    <div className="text-sm text-gray-600">Mentor</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Session Duration</span>
                    <span className="font-medium text-gray-900">{duration} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Amount</span>
                    <span className="font-medium text-gray-900">₹{Math.round(amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platform Fee</span>
                    <span className="font-medium text-gray-900">₹0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="font-medium text-gray-900">₹{Math.round(amount * 0.18)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total Amount</span>
                  <span className="text-3xl font-bold text-blue-600">
                    ₹{Math.round(amount) + Math.round(amount * 0.18)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>100% secure payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Free rescheduling</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Full refund if cancelled 24hrs before</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
