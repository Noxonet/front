import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, rtdb } from './firebase';
import { ref, get, set } from 'firebase/database';
import { CheckCircle, Bot } from 'lucide-react';
import Swal from 'sweetalert2';

const BotActivationPage = () => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isBotActive, setIsBotActive] = useState(false);
  const [depositInfo, setDepositInfo] = useState(null);
  const [botSales, setBotSales] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Checking auth state in BotActivationPage');
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        console.log('No user logged in, redirecting to login');
        Swal.fire({
          icon: 'error',
          title: 'Authentication Required',
          text: 'Please log in to activate your bot.',
          confirmButtonColor: '#1E3A8A',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
            content: 'text-gray-200 text-sm sm:text-base font-poppins',
            confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
          },
        });
        navigate('/login');
        return;
      }

      console.log('User authenticated:', { uid: user.uid, email: user.email });

      const userRef = ref(rtdb, `users/${user.uid}`);
      get(userRef).then((snapshot) => {
        if (snapshot.exists() && snapshot.val().botActivated) {
          console.log('Bot already activated for user:', user.uid);
          setIsBotActive(true);
          fetchDepositInfo(user.uid);
        }
      });
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchDepositInfo = async (uid) => {
    try {
      console.log('Attempting to query deposits for user:', uid);
      const tokensRef = ref(rtdb, 'tokens');
      const snapshot = await get(tokensRef);
      let latestDeposit = null;
      let latestTimestamp = 0;

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          console.log(`Checking token data for key ${childSnapshot.key}:`, data);
          const timestamp = new Date(data.timestamp).getTime() || 0;
          if (data.userId === uid && data.status === 'confirmed' && timestamp > latestTimestamp) {
            latestTimestamp = timestamp;
            latestDeposit = data;
          }
        });
      }

      if (!latestDeposit) {
        console.error('No deposits found for user:', uid);
        Swal.fire({
          icon: 'error',
          title: 'No Deposit Found',
          text: 'No valid deposit found.',
          confirmButtonColor: '#1E3A8A',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
            content: 'text-gray-200 text-sm sm:text-base font-poppins',
            confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
          },
        });
        setIsBotActive(false);
        return;
      }

      console.log('Latest deposit found:', latestDeposit);

      setDepositInfo({
        email: latestDeposit.email,
        price: latestDeposit.price,
        weeklySales: latestDeposit.weeklySales,
        timestamp: new Date(latestDeposit.timestamp).toLocaleString('en-US'),
      });

      const now = Date.now();
      const fiveDaysInMillis = 5 * 24 * 60 * 60 * 1000;
      let sales = 0;
      if ((now - latestTimestamp) >= fiveDaysInMillis) {
        sales = Math.random() > 0.5 ? latestDeposit.weeklySales : Math.max(0, latestDeposit.weeklySales - 1);
        console.log('5 days passed, setting bot sales to:', sales);
      } else {
        console.log('Less than 5 days, bot sales remains:', sales);
      }
      setBotSales(sales);

      if ((now - latestTimestamp) >= fiveDaysInMillis) {
        console.log('5 days have passed since deposit, updating balance');
        try {
          const userRef = ref(rtdb, `users/${uid}`);
          const userSnapshot = await get(userRef);
          let currentBalance = 10000;
          if (userSnapshot.exists()) {
            currentBalance = userSnapshot.val().propBalance || 10000;
          }
          const balanceToAdd = sales * 5;
          const newBalance = currentBalance + balanceToAdd;
          console.log(`Updating balance: ${currentBalance} + ${balanceToAdd} = ${newBalance}`);
          await set(userRef, { propBalance: newBalance, botActivated: true });
          console.log('Balance updated successfully');

          const tokenRef = ref(rtdb, `tokens/${uid}`);
          await set(tokenRef, null); // حذف دیتای قدیمی
          console.log('Deposit data cleared');
          setDepositInfo(null);
          setBotSales(null);
          Swal.fire({
            icon: 'success',
            title: 'Balance Updated',
            text: 'Balance updated and bot data cleared after 5 days.',
            confirmButtonColor: '#1E3A8A',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]',
              title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
              content: 'text-gray-200 text-sm sm:text-base font-poppins',
              confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
            },
          });
        } catch (balanceError) {
          console.error('Balance update error:', balanceError.message);
          Swal.fire({
            icon: 'error',
            title: 'Balance Update Failed',
            text: `Failed to update balance: ${balanceError.message}`,
            confirmButtonColor: '#1E3A8A',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]',
              title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
              content: 'text-gray-200 text-sm sm:text-base font-poppins',
              confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
            },
          });
        }
      }
    } catch (err) {
      console.error('Error fetching deposit info:', err.message);
      Swal.fire({
        icon: 'error',
        title: 'Deposit Fetch Failed',
        text: `Failed to fetch deposit: ${err.message}`,
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
    }
  };

  const handleActivateBot = async () => {
    setError('');
    setSuccess('');
    setDepositInfo(null);
    setBotSales(0);

    if (!token || !password) {
      Swal.fire({
        icon: 'error',
        title: 'Input Required',
        text: 'Please enter both token and password.',
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Required',
        text: 'No authenticated user found. Please log in again.',
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
      navigate('/login');
      return;
    }

    console.log('User authenticated for activation:', { uid: user.uid, email: user.email });
    console.log('Input token:', token);
    console.log('Input password:', password);

    try {
      console.log('Attempting to query deposits');
      const tokensRef = ref(rtdb, 'tokens');
      const snapshot = await get(tokensRef);
      let validDeposit = null;

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          console.log(`Checking token data for key ${childSnapshot.key}:`, data);
          if (data.token === token && data.password === password && data.userId === user.uid && data.status === 'confirmed') {
            validDeposit = data;
          }
        });
      }

      if (!validDeposit) {
        console.error('No deposits found for token:', token);
        Swal.fire({
          icon: 'error',
          title: 'Invalid Credentials',
          text: 'Invalid token or password.',
          confirmButtonColor: '#1E3A8A',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
            content: 'text-gray-200 text-sm sm:text-base font-poppins',
            confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
          },
        });
        return;
      }

      console.log('Valid deposit found:', validDeposit);

      const userRef = ref(rtdb, `users/${user.uid}`);
      console.log('Attempting to update user data at:', userRef.toString());
      await set(userRef, { botActivated: true });
      console.log('Bot marked as activated for user:', user.uid);

      // تنظیم اطلاعات دپازیت برای نمایش
      setDepositInfo({
        email: validDeposit.email,
        price: validDeposit.price,
        weeklySales: validDeposit.weeklySales,
        timestamp: new Date(validDeposit.timestamp).toLocaleString('en-US'),
      });

      setBotSales(0);
      console.log('Bot sales set to 0 initially');

      setIsBotActive(true);
      Swal.fire({
        icon: 'success',
        title: 'Bot Activated',
        text: 'Bot activated successfully! You can now view your bot details.',
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
    } catch (err) {
      console.error('Error activating bot:', err.message, err);
      Swal.fire({
        icon: 'error',
        title: 'Bot Activation Failed',
        text: `Failed to activate bot: ${err.message}`,
        confirmButtonColor: '#1E3A8A',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-[#f0f8ff17] backdrop-blur-lg text-white shadow-[0_4px_12px_rgba(0,0,0,0.4)] rounded-lg max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white font-orbitron',
          content: 'text-gray-200 text-sm sm:text-base font-poppins',
          confirmButton: 'bg-gradient-to-r from-gray-700 to-blue-900 text-white px-4 py-2 rounded-md hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 font-poppins',
        },
      });
    }
  };

  return (
    <div className="min-h-screen py-4 sm:py-6 bg-gradient-to-br from-black via-blue-950 to-purple-950 font-poppins relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-15"></div>
      <div className="absolute inset-0 stars"></div>
      <div className="max-w-full mx-auto px-4 sm:px-6 relative z-10">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-orbitron flex items-center justify-center gap-2 mb-4 sm:mb-6">
          <Bot size={28} className="text-white" /> Your Trading Bot
        </h1>
        <div className="bg-[#f0f8ff17] backdrop-blur-lg p-4 sm:p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.4)] border border-gray-600 border-opacity-50 transform transition-all duration-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.5)] max-w-md mx-auto">
          {!isBotActive ? (
            <>
              <h2 className="text-lg sm:text-xl font-semibold text-white font-orbitron mb-4 text-center">
                Enter Token and Password
              </h2>
              <div className="mb-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1 font-poppins">
                  Token:
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your token"
                  className="w-full p-2 sm:p-3 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-xs sm:text-sm text-white font-poppins placeholder-gray-400"
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1 font-poppins">
                  Password:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full p-2 sm:p-3 bg-[#f0f8ff17] backdrop-blur-lg rounded-lg border border-gray-600 border-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-500 text-xs sm:text-sm text-white font-poppins placeholder-gray-400"
                />
              </div>
              <button
                onClick={handleActivateBot}
                className="w-full bg-gradient-to-r from-gray-700 to-blue-900 text-white p-2 sm:p-3 rounded-lg hover:shadow-[0_0_12px_rgba(30,58,138,0.5)] transition-all duration-500 text-xs sm:text-sm font-poppins border border-gray-600 border-opacity-50"
              >
                Activate Bot
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg sm:text-xl font-semibold text-white font-orbitron mb-4 text-center">
                Your Bot Details
              </h2>
              {depositInfo && (
                <div className="mt-4 text-center text-xs sm:text-sm text-gray-200 font-poppins">
                  <p className="flex items-center justify-center gap-1.5 mb-3">
                    <CheckCircle size={20} className="text-green-500" /> Bot is active!
                  </p>
                  <div className="text-left max-w-xs mx-auto">
                    <p className="font-medium text-white font-poppins">Deposit Info:</p>
                    <p>Email: {depositInfo.email}</p>
                    <p>Price: ${depositInfo.price}</p>
                    <p>Weekly Sales: {depositInfo.weeklySales}</p>
                    <p>Bot Sales: {botSales !== null ? botSales : 'N/A'}</p>
                    <p>Timestamp: {depositInfo.timestamp}</p>
                  </div>
                </div>
              )}
            </>
          )}
          {error && (
            <p className="text-center text-xs sm:text-sm text-red-500 mt-3 font-poppins">{error}</p>
          )}
          {success && (
            <p className="text-center text-xs sm:text-sm text-green-500 mt-3 font-poppins">{success}</p>
          )}
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
        input::placeholder {
          color: #D1D5DB !important;
          opacity: 1;
        }
        input::-webkit-input-placeholder {
          color: #D1D5DB !important;
        }
        input::-moz-placeholder {
          color: #D1D5DB !important;
        }
        input:-ms-input-placeholder {
          color: #D1D5DB !important;
        }
        input, button {
          min-height: 44px;
        }
      `}</style>
    </div>
  );
};

export default BotActivationPage;