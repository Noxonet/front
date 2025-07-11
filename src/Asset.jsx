import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { auth } from './firebase';
import { fetchWithErrorHandling } from './fetchHelper';
import { claimReferralBonus } from './utils';
import { Eye, EyeOff, Copy, Wallet, Users, DollarSign } from 'lucide-react';

function AssetsPage({ updateBalance }) {
  const [showBalance, setShowBalance] = useState(true);
  const [accountBalance, setAccountBalance] = useState(0);
  const [referralCode, setReferralCode] = useState(null);
  const [referralCount, setReferralCount] = useState(0);
  const [referralBonus, setReferralBonus] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
        setAccountBalance(userData.balance || 0);
        setReferralCode(userData.referralCode || null);
        setReferralCount(userData.referralCount || 0);
        setReferralBonus((userData.referralCount || 0) * 2 - (userData.claimedReferralBonus || 0));
        updateBalance();
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
          title: 'Error Fetching User Data',
          text: errorMessage,
          confirmButtonColor: '#7F00FF',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-white',
            content: 'text-gray-300 text-sm sm:text-base',
            confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
          },
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [navigate, updateBalance]);

  const handleCopyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      Swal.fire({
        icon: 'success',
        title: 'Referral Code Copied',
        timer: 1000,
        customClass: {
          popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
        },
      });
    }
  };

  const handleClaimReferralBonus = async () => {
    setIsSaving(true);
    const success = await claimReferralBonus(setReferralBonus, navigate, 'Assets');
    if (success) {
      const userData = await fetchWithErrorHandling('GET', `users/${auth.currentUser.uid}`);
      setAccountBalance(userData.balance || 0);
      updateBalance();
    }
    setIsSaving(false);
  };

  const accountData = [
    { name: 'Spot Account', balance: `${accountBalance.toFixed(2)} USDT`, usdValue: `$${accountBalance.toFixed(2)}`, percentage: 100 },
    { name: 'DEX+ Account', balance: '0.00000000 USDT', usdValue: '$0.00', percentage: 0 },
    { name: 'Futures Account', balance: '0.00000000 USDT', usdValue: '$0.00', percentage: 0 },
    { name: 'Copy Trading', balance: '0.00000000 USDT', usdValue: '$0.00', percentage: 0 },
    { name: 'Earn Account', balance: '0.00000000 USDT', usdValue: '$0.00', percentage: 0 },
    { name: 'Trading Bots', balance: '0.00000000 USDT', usdValue: '$0.00', percentage: 0 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
        <div className="flex items-center space-x-2 relative z-10">
          <svg className="animate-spin h-6 sm:h-8 w-6 sm:w-8 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-base sm:text-lg font-medium text-white">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Assets Overview</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-0">
              <NavLink
                to="/deposit"
                className="inline-flex items-center justify-center h-9 sm:h-10 px-3 sm:px-4 bg-purple-600 bg-opacity-80 backdrop-blur-md text-white text-xs sm:text-sm font-medium rounded-full hover:bg-purple-700 hover:bg-opacity-90 transition-colors shadow-md hover:shadow-[0_0_10px_rgba(126,0,255,0.7)] border border-gray-700 border-opacity-20"
              >
                Deposit
              </NavLink>
              <NavLink
                to="/withdraw"
                className="inline-flex items-center justify-center h-9 sm:h-10 px-3 sm:px-4 bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white text-xs sm:text-sm font-medium rounded-full hover:bg-gray-800 hover:bg-opacity-30 transition-colors border border-gray-700 border-opacity-20 shadow-md"
              >
                Withdraw
              </NavLink>
              <NavLink
                to="/transfer"
                className="inline-flex items-center justify-center h-9 sm:h-10 px-3 sm:px-4 bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white text-xs sm:text-sm font-medium rounded-full hover:bg-gray-800 hover:bg-opacity-30 transition-colors border border-gray-700 border-opacity-20 shadow-md"
              >
                Transfer
              </NavLink>
            </div>
          </div>
          <div className="bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-2xl transform transition-all duration-300 hover:shadow-[0_0_20px_rgba(126,0,255,0.5)] border border-gray-700 border-opacity-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">Total Balance</h2>
              <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
                <span className="text-base sm:text-lg font-medium text-white">
                  {showBalance ? `${accountBalance.toFixed(2)} USDT` : '****'}
                </span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1 sm:p-2 rounded-full hover:bg-gray-800 hover:bg-opacity-30 transition-colors"
                >
                  {showBalance ? (
                    <EyeOff className="w-4 sm:w-5 h-4 sm:h-5 text-gray-300" />
                  ) : (
                    <Eye className="w-4 sm:w-5 h-4 sm:h-5 text-gray-300" />
                  )}
                </button>
              </div>
            </div>
            {referralCode && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-lg border border-gray-700 border-opacity-20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <Copy className="w-4 sm:w-5 h-4 sm:h-5 text-gray-300" />
                    <p className="text-xs sm:text-sm font-medium text-gray-300">
                      Referral Code: <span className="text-purple-400">{referralCode}</span>
                    </p>
                    <button
                      onClick={handleCopyReferralCode}
                      className="flex items-center gap-1 text-xs sm:text-sm text-purple-400 hover:underline"
                    >
                      <Copy className="w-3 sm:w-4 h-3 sm:h-4" />
                      Copy
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 sm:w-5 h-4 sm:h-5 text-gray-300" />
                    <p className="text-xs sm:text-sm font-medium text-gray-300">
                      Referrals: <span className="text-purple-400">{referralCount}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-lg border border-gray-700 border-opacity-20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 sm:w-5 h-4 sm:h-5 text-gray-300" />
                  <p className="text-xs sm:text-sm font-medium text-gray-300">
                    Referral Bonus: <span className="text-purple-400">{referralBonus.toFixed(2)} USDT</span>
                  </p>
                </div>
                <button
                  onClick={handleClaimReferralBonus}
                  className="flex items-center justify-center gap-1 text-xs sm:text-sm bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 hover:bg-opacity-90 transition-colors disabled:bg-gray-600 disabled:bg-opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-[0_0_10px_rgba(126,0,255,0.7)] border border-gray-700 border-opacity-20"
                  disabled={isSaving || referralBonus <= 0}
                >
                  <DollarSign className="w-3 sm:w-4 h-3 sm:h-4" />
                  Claim Referral Bonus
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {accountData.map((account) => (
                <div
                  key={account.name}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-lg cursor-pointer transition-all duration-300 hover:bg-gray-800 hover:bg-opacity-30 hover:shadow-[0_0_10px_rgba(126,0,255,0.7)] border border-gray-700 border-opacity-20"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Wallet className="w-6 sm:w-8 h-6 sm:h-8 text-gray-300" />
                    <div>
                      <p className="font-medium text-white text-sm sm:text-base">{account.name}</p>
                      <p className="text-xs sm:text-sm text-gray-300">{account.balance}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm text-gray-300">{account.usdValue}</p>
                    <p className="text-xs sm:text-sm text-gray-300">{account.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssetsPage;