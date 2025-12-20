import { useState, useEffect } from 'react';
import { 
  Wallet, Plus, History, 
  CreditCard, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { paymentAPI } from '../utils/api';
import { RAZORPAY_CONFIG } from '../config';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface AspirantWalletProps {
  userId: string;
}

export function AspirantWallet({ userId }: AspirantWalletProps) {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication before fetching wallet data
    const authToken = localStorage.getItem('authToken');
    const currentUser = localStorage.getItem('currentUser');
    
    console.log('🔐 Authentication check:', {
      hasToken: !!authToken,
      hasUser: !!currentUser,
      userId: userId
    });
    
    if (!authToken) {
      setAuthError('Please log in to access your wallet');
      setLoading(false);
      return;
    }
    
    fetchWalletData();
  }, [userId]);

  const pollPaymentStatus = async (orderId: string) => {
    let attempts = 0;
    const maxAttempts = 12; // Poll for 1 minute (5 seconds * 12)
    
    const poll = async () => {
      try {
        attempts++;
        console.log(`🔄 Polling payment status (attempt ${attempts}/${maxAttempts})`);
        
        // Check if wallet balance has been updated
        const walletResponse = await fetch(`http://localhost:5000/api/wallets/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (walletResponse.ok) {
          const walletData = await walletResponse.json();
          if (walletData.success) {
            // Check if there's a recent transaction
            const recentTransaction = walletData.wallet.transactions
              .find((t: any) => t.source === 'topup' && 
                     new Date(t.timestamp).getTime() > Date.now() - 5 * 60 * 1000); // Last 5 minutes

            if (recentTransaction) {
              console.log('✅ Payment verified via webhook!');
              alert('Payment successful! Your wallet has been credited.');
              fetchWalletData(); // Refresh wallet data
              return;
            }
          }
        }

        // Continue polling if not found and haven't exceeded max attempts
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          console.log('⏰ Polling timeout - payment may still be processing');
          alert('Payment is being processed. Please check your wallet in a few minutes.');
          fetchWalletData(); // Refresh anyway
        }

      } catch (error) {
        console.error('Polling error:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        }
      }
    };

    // Start polling after a short delay
    setTimeout(poll, 2000);
  };

  const fetchWalletData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      console.log('🔐 Auth token for wallet fetch:', authToken ? 'present' : 'missing');
      console.log('👤 User ID:', userId);
      
      // Fetch wallet data
      const walletResponse = await fetch(`http://localhost:5000/api/wallets/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      console.log('📊 Wallet response status:', walletResponse.status);

      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        console.log('📊 Wallet data:', walletData);
        if (walletData.success) {
          setWallet(walletData.wallet);
          setTransactions(walletData.wallet.transactions || []);
        }
      } else {
        const errorData = await walletResponse.json();
        console.error('❌ Wallet fetch error:', errorData);
        
        if (walletResponse.status === 401) {
          setAuthError('Your session has expired. Please log in again.');
        }
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(addAmount);
    
    if (amount < 10) {
      alert('Minimum amount is ₹10');
      return;
    }

    if (amount > 50000) {
      alert('Maximum amount is ₹50,000');
      return;
    }

    try {
      setLoading(true);

      // Create Razorpay order for wallet top-up
      console.log('Creating order with amount:', Math.round(amount));
      console.log('User ID:', userId);
      console.log('Auth token:', localStorage.getItem('authToken') ? 'present' : 'missing');
      
      // Log the exact API call being made
      console.log('🔗 API call details:', {
        endpoint: '/payments/create-order',
        method: 'POST',
        body: {
          amount: Math.round(amount),
          type: 'wallet_topup',
          currency: 'INR'
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      const orderResponse = await paymentAPI.createOrder({
        amount: Math.round(amount),
        type: 'wallet_topup',
        currency: 'INR'
      });

      console.log('Order response:', orderResponse);

      if (!orderResponse || !orderResponse.success) {
        throw new Error(orderResponse?.message || 'Failed to create order');
      }

      if (!orderResponse.orderId || !orderResponse.keyId) {
        throw new Error('Invalid order response - missing orderId or keyId');
      }

      // Initialize Razorpay with test mode configuration
      const options = {
        key: orderResponse.keyId,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: RAZORPAY_CONFIG.name,
        description: 'Add Money to Wallet',
        order_id: orderResponse.orderId,
        // Enable test mode features
        config: {
          display: {
            language: 'en'
          }
        },
        handler: async (response: any) => {
          console.log('💳 Payment completed:', response);
          
          try {
            // Show processing message
            alert('Payment completed! Verifying payment...');
            
            // Verify payment with backend
            console.log('🔍 Verifying payment with backend...');
            const verifyResponse = await paymentAPI.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            
            console.log('✅ Payment verification response:', verifyResponse);
            
            if (verifyResponse.success) {
              alert('Payment successful! Your wallet has been credited.');
              fetchWalletData(); // Refresh wallet data immediately
            } else {
              alert('Payment verification failed. Please contact support.');
            }
            
          } catch (verifyError) {
            console.error('❌ Payment verification error:', verifyError);
            alert('Payment completed but verification failed. Your money will be credited shortly.');
            
            // Fallback to polling
            pollPaymentStatus(orderResponse.orderId);
          }
          
          setShowAddMoney(false);
          setAddAmount('');
        },
        prefill: {
          name: 'User',
          email: 'user@example.com',
          contact: '9999999999'
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true
        },
        theme: RAZORPAY_CONFIG.theme,
        modal: {
          confirm_close: true,
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      console.log('Initializing Razorpay with options:', options);
      
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded. Please refresh the page.');
      }

      const rzp = new window.Razorpay(options);
      
      // Add event listeners for debugging
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      
      console.log('Opening Razorpay modal...');
      rzp.open();
      setLoading(false);

    } catch (error: any) {
      console.error('Add money error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      
      let errorMessage = 'Please try again.';
      
      if (error.message.includes('Access token required') || error.message.includes('Authentication failed')) {
        errorMessage = 'Your session has expired. Please log in again.';
        setAuthError(errorMessage);
      } else if (error.message.includes('User not found')) {
        errorMessage = 'User account not found. Please contact support.';
      } else if (error.message.includes('Failed to create order')) {
        errorMessage = 'Unable to create payment order. Please check your connection and try again.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      alert(`Failed to add money: ${errorMessage}`);
      setLoading(false);
    }
  };

  if (authError) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">{authError}</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-6 h-6" />
              <span className="text-blue-100">Wallet Balance</span>
            </div>
            <div className="text-3xl font-bold">
              ₹{wallet?.balance?.toFixed(2) || '0.00'}
            </div>
          </div>
          <button
            onClick={() => setShowAddMoney(true)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Money</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={() => setShowAddMoney(true)}
          className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <ArrowDownLeft className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Add Money</div>
              <div className="text-sm text-gray-600">Top up your wallet</div>
            </div>
          </div>
        </button>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <History className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Transactions</div>
              <div className="text-sm text-gray-600">{transactions.length} total</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Secure</div>
              <div className="text-sm text-gray-600">256-bit encryption</div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h3>
        
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No transactions yet</p>
            <p className="text-gray-500 text-sm mt-2">Add money to your wallet to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'credit' ? (
                      <ArrowDownLeft className={`w-5 h-5 ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`} />
                    ) : (
                      <ArrowUpRight className={`w-5 h-5 ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`} />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {transaction.source === 'wallet_topup' ? 'Money Added' : 
                       transaction.source === 'booking' ? 'Session Booking' :
                       transaction.source === 'refund' ? 'Refund Received' :
                       transaction.description || 'Transaction'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {transaction.createdAt ? (
                        <>
                          {new Date(transaction.createdAt).toLocaleDateString()} • 
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </>
                      ) : (
                        'Date not available'
                      )}
                    </div>
                  </div>
                </div>
                <div className={`font-semibold ${
                  transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount?.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Money Modal */}
      {showAddMoney && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Money to Wallet</h2>
            
            <form onSubmit={handleAddMoney} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="10"
                  max="50000"
                  step="1"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  Minimum: ₹10 • Maximum: ₹50,000
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-blue-800">
                    <strong>Payment Options:</strong> You can pay using UPI, Cards, Net Banking, or Wallets. 
                    If UPI input is not working, try using Card or Net Banking options.
                  </p>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[100, 500, 1000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setAddAmount(amount.toString())}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMoney(false);
                    setAddAmount('');
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Add Money'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}