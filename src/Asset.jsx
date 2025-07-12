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
          popup: 'bg-black bg-opacity-90 backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-xl max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
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
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-purple-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
        <div className="absolute inset-0 stars"></div>
        <div className="flex items-center space-x-2 relative z-10">
          <svg className="animate-spin h-6 sm:h-8 w-6 sm:w-8 text-blue-900" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-base sm:text-lg font-medium text-white font-orbitron">Initializing...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-8 bg-gradient-to-br from-black via-blue-950 to-purple-950 text-white font-poppins relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-orbitron">Cosmic Portfolio</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-0">
              <NavLink
                to="/deposit"
                className="inline-flex items-center justify-center h-9 sm:h-10 px-3 sm:px-4 bg-gradient-to-r from-gray-700 to-blue-900 text-white text-xs sm:text-sm font-medium rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 border border-blue-800 border-opacity-50 shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
              >
                Deposit
              </NavLink>
              <NavLink
                to="/withdraw"
                className="inline-flex items-center justify-center h-9 sm:h-10 px-3 sm:px-4 bg-black bg-opacity-80 backdrop-blur-lg text-white text-xs sm:text-sm font-medium rounded-md hover:bg-opacity-90 hover:shadow-[0_0_8px_rgba(96,165,250,0.4)] transition-all duration-500 border border-gray-600 border-opacity-50 shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
              >
                Withdraw
              </NavLink>
              <NavLink
                to="/transfer"
                className="inline-flex items-center justify-center h-9 sm:h-10 px-3 sm:px-4 bg-black bg-opacity-80 backdrop-blur-lg text-white text-xs sm:text-sm font-medium rounded-md hover:bg-opacity-90 hover:shadow-[0_0_8px_rgba(96,165,250,0.4)] transition-all duration-500 border border-gray-600 border-opacity-50 shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
              >
                Transfer
              </NavLink>
            </div>
          </div>
          <div
            className="rounded-2xl p-4 sm:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-gray-600 border-opacity-50 transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)]"
            style={{
              backgroundColor: '#f0f8ff17',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white font-orbitron">Stellar Balance</h2>
              <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
                <span className="text-base sm:text-lg font-medium text-white">
                  {showBalance ? `${accountBalance.toFixed(2)} USDT` : '****'}
                </span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1 sm:p-2 rounded-full hover:bg-black hover:bg-opacity-50 hover:shadow-[0_0_8px_rgba(96,165,250,0.4)] transition-all duration-500"
                >
                  {showBalance ? (
                    <EyeOff className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                  ) : (
                    <Eye className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
            {referralCode && (
              <div
                className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border border-gray-600 border-opacity-50"
                style={{
                  backgroundColor: '#f0f8ff17',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <Copy className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                    <p className="text-xs sm:text-sm font-medium text-gray-200">
                      Referral Code: <span className="text-white font-orbitron">{referralCode}</span>
                    </p>
                    <button
                      onClick={handleCopyReferralCode}
                      className="flex items-center gap-1 text-xs sm:text-sm text-white hover:text-blue-500 hover:underline transition-all duration-500"
                    >
                      <Copy className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                      Copy
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                    <p className="text-xs sm:text-sm font-medium text-gray-200">
                      Referrals: <span className="text-white font-orbitron">{referralCount}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div
              className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border border-gray-600 border-opacity-50"
              style={{
                backgroundColor: '#f0f8ff17',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                  <p className="text-xs sm:text-sm font-medium text-gray-200">
                    Referral Bonus: <span className="text-white font-orbitron">{referralBonus.toFixed(2)} USDT</span>
                  </p>
                </div>
                <button
                  onClick={handleClaimReferralBonus}
                  className="flex items-center justify-center gap-1 text-xs sm:text-sm bg-gradient-to-r from-gray-700 to-blue-900 text-white px-3 sm:px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 disabled:bg-gray-700 disabled:bg-opacity-50 disabled:cursor-not-allowed border border-blue-800 border-opacity-50 shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                  disabled={isSaving || referralBonus <= 0}
                >
                  <DollarSign className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                  Claim Referral Bonus
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {accountData.map((account) => (
                <div
                  key={account.name}
                  className="flex items-center justify-between p-3 sm:p-4 cursor-pointer transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)] border border-gray-600 border-opacity-50 rounded-lg"
                  style={{
                    backgroundColor: '#f0f8ff17',
                    backdropFilter: 'blur(10px)',
                    padding: '1rem 2rem',
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Wallet className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                    <div>
                      <p className="font-medium text-white text-sm sm:text-base font-orbitron">{account.name}</p>
                      <p className="text-xs sm:text-sm text-gray-200">{account.balance}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs sm:text-sm text-gray-200">{account.usdValue}</p>
                    <p className="text-xs sm:text-sm text-gray-200">{account.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
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

export default AssetsPage;