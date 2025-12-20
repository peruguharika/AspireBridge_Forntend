import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, Download, CreditCard, ArrowRight } from 'lucide-react';
import { paymentAPI } from '../utils/api';

interface MentorWalletProps {
  userId: string;
}

export function MentorWallet({ userId }: MentorWalletProps) {
  const [earnings, setEarnings] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, [userId]);

  const fetchEarnings = async () => {
    try {
      const response = await paymentAPI.getMentorEarnings(userId);
      if (response.success) {
        setEarnings(response.earnings);
        setTransactions(response.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount > earnings?.availableBalance) {
      alert('Insufficient balance');
      return;
    }

    try {
      await paymentAPI.processPayout({
        mentorId: userId,
        amount
      });
      alert('Withdrawal request submitted successfully!');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      fetchEarnings();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('Failed to process withdrawal');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8" />
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold mb-2">₹{earnings?.totalEarnings || 0}</div>
          <div className="text-blue-100">Total Earnings</div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <CreditCard className="w-8 h-8" />
            <ArrowRight className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold mb-2">₹{earnings?.availableBalance || 0}</div>
          <div className="text-green-100">Available Balance</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8" />
            <Download className="w-6 h-6" />
          </div>
          <div className="text-3xl font-bold mb-2">₹{earnings?.pendingPayout || 0}</div>
          <div className="text-yellow-100">Pending Payout</div>
        </div>
      </div>

      {/* Withdraw Button */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Withdraw Funds</h3>
            <p className="text-sm text-gray-600">
              Transfer your earnings to your bank account
            </p>
          </div>
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={!earnings?.availableBalance || earnings.availableBalance <= 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Earnings Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Gross Earnings</span>
            <span className="font-semibold">₹{earnings?.grossEarnings || 0}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Platform Fee (10%)</span>
            <span className="font-semibold text-red-600">-₹{earnings?.platformFee || 0}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Tax (2%)</span>
            <span className="font-semibold text-red-600">-₹{earnings?.tax || 0}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-900 font-semibold">Net Earnings (88%)</span>
            <span className="font-bold text-green-600 text-lg">₹{earnings?.totalEarnings || 0}</span>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Transaction History</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No transactions yet
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{transaction.description}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                </div>
                <div className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Withdraw Funds</h2>
            
            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2">Available Balance</div>
              <div className="text-3xl font-bold text-green-600 mb-4">
                ₹{earnings?.availableBalance || 0}
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Amount
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                Funds will be transferred to your registered bank account within 2-3 business days.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
