import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { auth } from './firebase';
import { fetchWithErrorHandling } from './fetchHelper';
import { Send } from 'lucide-react';

function WithdrawPage({ method }) {
  const cryptoTokens = [
    { symbol: 'USDT', icon: 'https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/3Kp0szXY2ARoY_7oX4hYXctF_3_RZgjsnSBXf6ImTao.png' },
    { symbol: 'BTC', icon: 'https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/btc.png' },
    { symbol: 'ETH', icon: 'https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/eth.png' },
  ];
  const [selectValue, setSelectValue] = useState('BEP20');
  const [countUsd, setCountUsd] = useState(0);
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [minimumWithdrawal, setMinimumWithdrawal] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) {
        navigate('/login');
        return;
      }
      try {
        const userData = await fetchWithErrorHandling('GET', `users/${auth.currentUser.uid}`);
        if (!userData) {
          throw new Error('User data not found');
        }
        let totalBonus = 0;
        if (userData.hasSignupBonus) totalBonus += 5;
        if (userData.hasFirstDepositBonus) totalBonus += 10;
        setMinimumWithdrawal(totalBonus * 2 || 5); // Minimum is 2x total bonuses, or 5 if no bonuses
      } catch (error) {
        console.error('Error fetching user data for minimum withdrawal:', error.message);
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleWithdraw = async () => {
    if (countUsd < minimumWithdrawal) {
      Swal.fire({
        icon: 'error',
        title: 'Minimum Withdrawal',
        text: `Minimum withdrawal is ${minimumWithdrawal} USDT`,
        confirmButtonColor: '#1f2937',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-fade-in',
          title: 'text-xl font-bold text-gray-900',
          content: 'text-gray-700',
          confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors',
        },
      });
      return;
    }
    setIsLoading(true);
    if (!auth.currentUser) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Required',
        text: 'Please log in first',
        confirmButtonColor: '#1f2937',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-fade-in',
          title: 'text-xl font-bold text-gray-900',
          content: 'text-gray-700',
          confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors',
        },
      });
      navigate('/login');
      setIsLoading(false);
      return;
    }
    try {
      const userData = await fetchWithErrorHandling('GET', `users/${auth.currentUser.uid}`);
      if (!userData) {
        throw new Error('User data not found');
      }
      if (userData.balance < countUsd) {
        Swal.fire({
          icon: 'error',
          title: 'Insufficient Balance',
          text: 'You do not have enough balance',
          confirmButtonColor: '#1f2937',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-white shadow-2xl rounded-lg animate-fade-in',
            title: 'text-xl font-bold text-gray-900',
            content: 'text-gray-700',
            confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors',
          },
        });
      } else {
        await fetchWithErrorHandling('PATCH', `users/${auth.currentUser.uid}`, {
          balance: userData.balance - parseFloat(countUsd),
        });
        const updatedData = await fetchWithErrorHandling('GET', `users/${auth.currentUser.uid}`);
        method(updatedData.balance || 0);
        Swal.fire({
          icon: 'success',
          title: 'Withdrawal Successful',
          text: `New balance: ${updatedData.balance.toFixed(2)} USDT`,
          confirmButtonColor: '#1f2937',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-white shadow-2xl rounded-lg animate-fade-in',
            title: 'text-xl font-bold text-gray-900',
            content: 'text-gray-700',
            confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors',
          },
        });
        navigate('/assets');
      }
    } catch (error) {
      let errorMessage = error.message;
      if (error.message.includes('User data not found')) {
        errorMessage = 'User data not found, please sign up';
        navigate('/signup');
      } else if (error.message.includes('Unauthorized')) {
        errorMessage = 'Invalid API secret, please contact support';
        localStorage.removeItem('token');
        auth.signOut();
        navigate('/login');
      }
      Swal.fire({
        icon: 'error',
        title: 'Withdrawal Error',
        text: errorMessage,
        confirmButtonColor: '#1f2937',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white shadow-2xl rounded-lg animate-fade-in',
          title: 'text-xl font-bold text-gray-900',
          content: 'text-gray-700',
          confirmButton: 'bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition-colors',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      <div className="mx-auto px-4 sm:px-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Withdraw</h1>
          <NavLink to="/assets" className="text-sm text-yellow-500 hover:underline">
            Back to Assets
          </NavLink>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-xl animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Currency</label>
              <select
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
              >
                <option value="BEP20">BEP20</option>
                <option value="ERC20">ERC20</option>
                <option value="TRC20">TRC20</option>
              </select>
            </div>
            <div className="my-4 p-3 border border-yellow-500 text-yellow-500 text-xs md:text-base bg-yellow-100 rounded-2xl">the below input value must be equal with amount you are withdrawing to accept that you are not a robot and understaning you are in full secure</div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USDT)</label>
              <input
                type="number"
                value={countUsd}
                onChange={(e) => setCountUsd(e.target.value)}
                placeholder={`Minimum ${minimumWithdrawal} USDT`}
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter wallet address"
              className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
            />
          </div>
          <button
            onClick={handleWithdraw}
            className="w-full bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Confirm Withdrawal
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default WithdrawPage;