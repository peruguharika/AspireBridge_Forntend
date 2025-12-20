import { useState, useEffect } from 'react';
import { 
  Wallet, DollarSign, TrendingUp, Download, 
  CreditCard, History, AlertCircle, CheckCircle,
  Clock, X
} from 'lucide-react';

interface WalletDashboardProps {
  userId: string;
  userType: string;
}

export function WalletDashboard({ userId, userType }: WalletDashboardProps) {
  const [wallet, setWallet] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: ''
  });

  useEffect(() => {
    fetchWalletData();
  }, [userId]);

  const fetchWalletData = async () => {
    try {
      // Fetch wallet
      const walletResponse = await fetch(`http://localhost:5000/api/wallets/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('adminToken')}`
        }
      });

      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        if (walletData.success) {
          setWallet(walletData.wallet);
          setBankDetails(walletData.wallet.bankDetails || {
            accountHolderName: '',
            accountNumber: '',
            ifscCode: '',
            bankName: ''
          });
        }
      }

      // Fetch withdrawals
      const withdrawalsResponse = await fetch(`http://localhost:5000/api/wallets/withdrawals/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('adminToken')}`
        }
      });

      if (withdrawalsResponse.ok) {
        const withdrawalsData = await withdrawalsResponse.json();
        if (withdrawalsData.success) {
          setWithdrawals(withdrawalsData.withdrawals);
        }
      }

    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount > wallet.balance) {
      alert('Insufficient balance');
      return;
    }

    if (!bankDetails.accountHolderName || !bankDetails.accountNumber || !bankDetails.ifscCode) {
      alert('Please fill in all bank details');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/wallets/withdrawal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          bankDetails
        })
      });

      const data = await response.json();
      if (data.success) {
        const processingFee = data.withdrawalRequest.processingFee;
        const netAmount = data.withdrawalRequest.netAmount;
        
        alert(`✅ Withdrawal Request Submitted Successfully!

💰 Amount Requested: ₹${amount}
💳 Processing Fee: ₹${processingFee}
💵 Net Amount: ₹${netAmount}

🏦 Bank Account: ${bankDetails.accountHolderName}
📱 Account Number: ${bankDetails.accountNumber}

⏰ Processing Time: 1-3 business days
📧 You will receive email updates on the status

💡 This transaction will appear in your Razorpay settlements dashboard under "Payouts"`);
        
        setShowWithdrawForm(false);
        setWithdrawAmount('');
        fetchWalletData(); // Refresh data
      } else {
        alert('Withdrawal failed: ' + data.message);
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('Error processing withdrawal. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">₹{wallet?.balance || 0}</div>
          <div className="text-gray-600 mt-1">Available Balance</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">₹{wallet?.totalEarnings || 0}</div>
          <div className="text-gray-600 mt-1">Total Earnings</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">₹{wallet?.totalWithdrawn || 0}</div>
          <div className="text-gray-600 mt-1">Total Withdrawn</div>
        </div>
      </div>

      {/* Withdraw Button - Only for Achievers */}
      {userType === 'achiever' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Withdraw Funds</h3>
            <button
              onClick={() => setShowWithdrawForm(true)}
              disabled={!wallet?.balance || wallet.balance <= 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Withdraw
            </button>
          </div>
          
          {wallet?.balance <= 0 && (
            <p className="text-gray-500 text-sm">No funds available for withdrawal</p>
          )}
        </div>
      )}

      {/* Admin Auto-Settlement Info */}
      {userType === 'admin' && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">Automatic Razorpay Settlements</h3>
              <p className="text-sm text-green-700">Your earnings are automatically settled to your bank account</p>
            </div>
          </div>
          
          <div className="bg-white/50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-green-900 mb-2">🏦 How admin settlements work:</h4>
            <ol className="text-sm text-green-800 space-y-1">
              <li>1. <strong>Session Completed</strong> → Platform fee credited to admin wallet</li>
              <li>2. <strong>Razorpay Auto-Settlement</strong> → Runs daily/weekly based on your settings</li>
              <li>3. <strong>Money Reaches Bank</strong> → Direct transfer to your registered bank account</li>
              <li>4. <strong>Settlement Webhook</strong> → Updates records automatically</li>
            </ol>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-green-700">
              <p><strong>Settlement Schedule:</strong> Automatic (T+1 to T+7 days)</p>
              <p><strong>No Manual Action Required:</strong> Funds transfer automatically</p>
            </div>
            <button
              onClick={() => window.open('https://dashboard.razorpay.com/app/settlements', '_blank')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              View Settlements
            </button>
          </div>
        </div>
      )}

      {/* Withdrawal Form Modal */}
      {showWithdrawForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Withdraw Funds</h3>
              <button
                onClick={() => setShowWithdrawForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Amount (Available: ₹{wallet?.balance || 0})
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={wallet?.balance || 0}
                  min="1"
                  step="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                <input
                  type="text"
                  value={bankDetails.accountHolderName}
                  onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full name as per bank account"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Bank account number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                <input
                  type="text"
                  value={bankDetails.ifscCode}
                  onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="IFSC Code (e.g., SBIN0001234)"
                  pattern="[A-Z]{4}0[A-Z0-9]{6}"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Bank name"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  <strong>Processing Fee:</strong> 2% or minimum ₹10 will be deducted from your withdrawal amount.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawForm(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <History className="w-5 h-5" />
          Recent Transactions
        </h3>
        
        {wallet?.transactions && wallet.transactions.length > 0 ? (
          <div className="space-y-3">
            {wallet.transactions.slice(-10).reverse().map((transaction: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'credit' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <Download className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`font-semibold ${
                  transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No transactions yet</p>
        )}
      </div>

      {/* Withdrawal History */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdrawal History</h3>
        
        {withdrawals.length > 0 ? (
          <div className="space-y-3">
            {withdrawals.map((withdrawal: any) => (
              <div key={withdrawal._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    withdrawal.status === 'completed' ? 'bg-green-100' :
                    withdrawal.status === 'processing' ? 'bg-yellow-100' :
                    withdrawal.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {withdrawal.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : withdrawal.status === 'processing' ? (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    ) : withdrawal.status === 'failed' ? (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      ₹{withdrawal.amount} to {withdrawal.bankDetails.accountHolderName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(withdrawal.requestedAt).toLocaleDateString()} • {withdrawal.status}
                    </p>
                    {withdrawal.razorpayPayoutId && (
                      <p className="text-xs text-blue-600">
                        Razorpay ID: {withdrawal.razorpayPayoutId}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">₹{withdrawal.netAmount}</div>
                  <div className="text-sm text-gray-500">Net Amount</div>
                  {withdrawal.status === 'completed' && (
                    <div className="text-xs text-green-600 mt-1">✅ Deposited</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No withdrawals yet</p>
        )}
      </div>

      {/* Razorpay Settlements Info - Only for Admin */}
      {userType === 'admin' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Razorpay Settlements Dashboard</h3>
              <p className="text-sm text-blue-700">Track all withdrawal transactions</p>
            </div>
          </div>
          
          <div className="bg-white/50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-900 mb-2">How to view your settlements:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Login to your Razorpay Dashboard</li>
              <li>2. Navigate to <strong>Settlements</strong> → <strong>Payouts</strong></li>
              <li>3. All withdrawal transactions will be listed there</li>
              <li>4. You can download statements and track status</li>
            </ol>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-700">
              <p><strong>Platform:</strong> MentorConnect</p>
              <p><strong>Transaction Type:</strong> mentor_earnings_withdrawal</p>
            </div>
            <a
              href="https://dashboard.razorpay.com/app/settlements"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Open Razorpay Dashboard
            </a>
          </div>
        </div>
      )}

      {/* Withdrawal Status Info - For Achievers */}
      {userType === 'achiever' && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900">Withdrawal Status Tracking</h3>
              <p className="text-sm text-green-700">Monitor your withdrawal requests</p>
            </div>
          </div>
          
          <div className="bg-white/50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">💰 How withdrawals work:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• <strong>Processing Time:</strong> 1-3 business days</li>
              <li>• <strong>Processing Fee:</strong> 2% or minimum ₹10</li>
              <li>• <strong>Status Updates:</strong> Track progress in withdrawal history above</li>
              <li>• <strong>Email Notifications:</strong> Receive updates on status changes</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}