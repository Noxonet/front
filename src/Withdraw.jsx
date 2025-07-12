import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { auth } from './firebase';
import { fetchWithErrorHandling } from './fetchHelper';
import { Send } from 'lucide-react';

function WithdrawPage({ updateBalance }) {
  const cryptoTokens = [
    { symbol: 'USDT', icon: 'https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/3Kp0szXY2ARoY_7oX4hYXctF_3_RZgjsnSBXf6ImTao.png' },
    { symbol: 'BTC', icon: 'https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/btc.png' },
    { symbol: 'ETH', icon: 'https://s3.ap-northeast-1.amazonaws.com/s3.toobit.com/bhop/image/eth.png' },
  ];
  const [selectValue, setSelectValue] = useState('BEP20');
  const [countUsd, setCountUsd] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [minimumWithdrawal, setMinimumWithdrawal] = useState(5);
  const navigate = useNavigate();

  const restrictToEnglish = (value, type) => {
    let regex;
    if (type === 'amount') regex = /^[0-9.]*$/;
    else if (type === 'wallet') regex = /^[a-zA-Z0-9]*$/;
    return regex.test(value);
  };

  const handleInputChange = (value, type, setter) => {
    if (!restrictToEnglish(value, type)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Only English characters and numbers are allowed',
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
      return;
    }
    setter(value);
  };

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
        if (userData.hasSignupBonusClaimed) totalBonus += 5;
        if (userData.hasFirstDepositBonusClaimed) totalBonus += 10;
        setMinimumWithdrawal(totalBonus * 2 || 5);
      } catch (error) {
        console.error('Error fetching user data for minimum withdrawal:', error.message);
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleWithdraw = async () => {
    if (!countUsd) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Amount is required',
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
      return;
    }
    const amount = parseFloat(countUsd);
    if (isNaN(amount) || amount <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter a valid positive amount',
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
      return;
    }
    if (amount < minimumWithdrawal) {
      Swal.fire({
        icon: 'error',
        title: 'Minimum Withdrawal',
        text: `Minimum withdrawal is ${minimumWithdrawal} USDT`,
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
      return;
    }
    if (!walletAddress) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Wallet address is required',
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
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
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
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
      if (userData.balance < amount) {
        Swal.fire({
          icon: 'error',
          title: 'Insufficient Balance',
          text: 'You do not have enough balance',
          confirmButtonColor: '#1E3A8A',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
            content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
      } else {
        await fetchWithErrorHandling('PATCH', `users/${auth.currentUser.uid}`, {
          balance: userData.balance - amount,
        });
        const updatedData = await fetchWithErrorHandling('GET', `users/${auth.currentUser.uid}`);
        updateBalance();
        Swal.fire({
          icon: 'success',
          title: 'Withdrawal Successful',
          text: `New balance: ${updatedData.balance.toFixed(2)} USDT`,
          confirmButtonColor: '#1E3A8A',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
            content: 'text-gray-200 text-sm sm:text-base font-poppins',
            confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
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
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-6 sm:py-8 bg-gradient-to-br from-black via-blue-950 to-purple-950 text-white font-poppins relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <div className="mx-auto px-4 sm:px-6 max-w-3xl relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-orbitron">Withdraw Assets</h1>
          <NavLink
            to="/assets"
            className="text-xs sm:text-sm text-white hover:text-blue-500 hover:underline transition-all duration-500 mt-2 sm:mt-0"
          >
            Back to Assets
          </NavLink>
        </div>
        <div
          className="rounded-2xl p-4 sm:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-gray-600 border-opacity-50 transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)]"
          style={{
            backgroundColor: '#f0f8ff17',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1 sm:mb-2 font-poppins">
                Select Network
              </label>
              <select
                className="w-full p-2 sm:p-3 rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-xs sm:text-sm text-white font-poppins"
                style={{
                  backgroundColor: '#f0f8ff17',
                  backdropFilter: 'blur(10px)',
                }}
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
              >
                <option value="BEP20">BEP20</option>
                <option value="ERC20">ERC20</option>
                <option value="TRC20">TRC20</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1 sm:mb-2 font-poppins">
                Amount (USDT)
              </label>
              <input
                type="number"
                value={countUsd}
                onChange={(e) => handleInputChange(e.target.value, 'amount', setCountUsd)}
                placeholder={`Minimum ${minimumWithdrawal} USDT`}
                className="w-full p-2 sm:p-3 rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-xs sm:text-sm text-white font-poppins"
                style={{
                  backgroundColor: '#f0f8ff17',
                  backdropFilter: 'blur(10px)',
                }}
              />
            </div>
          </div>
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1 sm:mb-2 font-poppins">
              Wallet Address
            </label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => handleInputChange(e.target.value, 'wallet', setWalletAddress)}
              placeholder="Enter wallet address"
              className="w-full p-2 sm:p-3 rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-xs sm:text-sm text-white font-poppins"
              style={{
                backgroundColor: '#f0f8ff17',
                backdropFilter: 'blur(10px)',
              }}
            />
          </div>
          <button
            onClick={handleWithdraw}
            className="w-full p-2 sm:p-3 rounded-lg border border-gray-600 border-opacity-50 text-white text-xs sm:text-sm font-medium transition-all duration-500 hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] flex items-center justify-center font-poppins"
            style={{
              backgroundColor: '#f0f8ff17',
              backdropFilter: 'blur(10px)',
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-4 sm:h-5 w-4 sm:w-5 mr-1 sm:mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <>
                <Send className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2 text-white" />
                Confirm Withdrawal
              </>
            )}
          </button>
        </div>
      </div>
      <style jsx>{`
        .stars {
          background: transparent;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
        }
        .stars::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(2px 2px at 20px 30px, #fff 1px, transparent 0),
                      radial-gradient(2px 2px at 40px 70px, #fff 1px, transparent 0),
                      radial-gradient(2px 2px at 50px 160px, #ddd 1px, transparent 0),
                      radial-gradient(2px 2px at 90px 40px, #fff 1px, transparent 0),
                      radial-gradient(2px 2px at 130px 80px, #fff 1px, transparent 0),
                      radial-gradient(2px 2px at 160px 120px, #ddd 1px, transparent 0);
          background-size: 250px 250px;
          animation: twinkle 10s infinite linear;
          opacity: 0.3;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}

export default WithdrawPage;