import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { CheckCircle, Bot } from 'lucide-react';
import Swal from 'sweetalert2';

const BotActivationPage = () => {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isBotActive, setIsBotActive] = useState(false);
  const [depositInfo, setDepositInfo] = useState(null);
  const [botSales, setBotSales] = useState(0); // Initially 0
  const navigate = useNavigate();

  // Check authentication and bot activation state
  useEffect(() => {
    console.log('Checking auth state in BotActivationPage');
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        console.log('No user logged in, redirecting to login');
        Swal.fire({
          icon: 'error',
          title: 'Authentication Required',
          text: 'Please log in to activate your bot.',
          confirmButtonColor: '#7F00FF',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-white',
            content: 'text-gray-300 text-sm sm:text-base',
            confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
          },
        });
        navigate('/login');
        return;
      }

      console.log('User authenticated:', { uid: user.uid, email: user.email });

      // Check if bot is already activated
      const userDoc = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDoc);
      if (userSnap.exists() && userSnap.data().botActivated) {
        console.log('Bot already activated for user:', user.uid);
        setIsBotActive(true);
        // Fetch deposit info
        await fetchDepositInfo(user.uid);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Function to fetch deposit info and handle balance update
  const fetchDepositInfo = async (uid) => {
    try {
      console.log('Attempting to query deposits for user:', uid);
      const depositsQuery = query(
        collection(db, 'deposits'),
        where('userId', '==', uid),
        where('status', '==', 'confirmed')
      );
      const depositsSnapshot = await getDocs(depositsQuery);
      console.log('Deposits snapshot size:', depositsSnapshot.size);

      if (depositsSnapshot.empty) {
        console.error('No deposits found for user:', uid);
        Swal.fire({
          icon: 'error',
          title: 'No Deposit Found',
          text: 'No valid deposit found.',
          confirmButtonColor: '#7F00FF',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-white',
            content: 'text-gray-300 text-sm sm:text-base',
            confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
          },
        });
        setIsBotActive(false);
        return;
      }

      // Get latest deposit
      let latestDeposit = null;
      let latestTimestamp = 0;
      let depositId = null;
      depositsSnapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp?.toMillis() || 0;
        if (timestamp > latestTimestamp) {
          latestTimestamp = timestamp;
          latestDeposit = data;
          depositId = doc.id;
        }
      });

      if (!latestDeposit) {
        console.error('No valid deposit found for user:', uid);
        Swal.fire({
          icon: 'error',
          title: 'No Deposit Found',
          text: 'No valid deposit found.',
          confirmButtonColor: '#7F00FF',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-white',
            content: 'text-gray-300 text-sm sm:text-base',
            confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
          },
        });
        return;
      }

      console.log('Latest deposit found:', latestDeposit);

      // Set deposit info
      setDepositInfo({
        email: latestDeposit.email, // Use email from deposit (user's actual email)
        price: latestDeposit.price,
        weeklySales: latestDeposit.weeklySales,
        timestamp: latestDeposit.timestamp?.toDate().toLocaleString('en-US') || 'N/A',
      });

      // Set bot sales: 0 initially, update after 5 days
      const now = Date.now();
      const fiveDaysInMillis = 5 * 24 * 60 * 60 * 1000;
      let sales = 0;
      if (latestTimestamp && (now - latestTimestamp) >= fiveDaysInMillis) {
        sales = Math.random() > 0.5 ? latestDeposit.weeklySales : Math.max(0, latestDeposit.weeklySales - 1);
        console.log('5 days passed, setting bot sales to:', sales);
      } else {
        console.log('Less than 5 days, bot sales remains:', sales);
      }
      setBotSales(sales);

      // Check if 5 days have passed for balance update
      if (latestTimestamp && (now - latestTimestamp) >= fiveDaysInMillis) {
        console.log('5 days have passed since deposit, updating balance');
        try {
          const userDoc = doc(db, 'users', uid);
          const userSnap = await getDoc(userDoc);
          let currentBalance = 10000; // Default balance
          if (userSnap.exists()) {
            currentBalance = userSnap.data().propBalance || 10000;
          }
          const balanceToAdd = sales * 5; // $5 per sale
          const newBalance = currentBalance + balanceToAdd;
          console.log(`Updating balance: ${currentBalance} + ${balanceToAdd} = ${newBalance}`);
          await setDoc(userDoc, { propBalance: newBalance, botActivated: true }, { merge: true });
          console.log('Balance updated successfully');

          // Delete deposit data
          console.log('Deleting deposit:', depositId);
          await deleteDoc(doc(db, 'deposits', depositId));
          console.log('Deposit deleted successfully');
          setDepositInfo(null);
          setBotSales(null);
          Swal.fire({
            icon: 'success',
            title: 'Balance Updated',
            text: 'Balance updated and bot data cleared after 5 days.',
            confirmButtonColor: '#7F00FF',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
              title: 'text-lg sm:text-xl font-bold text-white',
              content: 'text-gray-300 text-sm sm:text-base',
              confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
            },
          });
        } catch (balanceError) {
          console.error('Balance update error:', balanceError.code, balanceError.message);
          Swal.fire({
            icon: 'error',
            title: 'Balance Update Failed',
            text: `Failed to update balance: ${balanceError.message}`,
            confirmButtonColor: '#7F00FF',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
              title: 'text-lg sm:text-xl font-bold text-white',
              content: 'text-gray-300 text-sm sm:text-base',
              confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
            },
          });
        }
      }
    } catch (err) {
      console.error('Error fetching deposit info:', err.code, err.message);
      Swal.fire({
        icon: 'error',
        title: 'Deposit Fetch Failed',
        text: `Failed to fetch deposit: ${err.message}`,
        confirmButtonColor: '#7F00FF',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          content: 'text-gray-300 text-sm sm:text-base',
          confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
        },
      });
    }
  };

  // Function to activate bot
  const handleActivateBot = async () => {
    setError('');
    setSuccess('');
    setDepositInfo(null);
    setBotSales(0); // Initially 0

    if (!token || !password) {
      Swal.fire({
        icon: 'error',
        title: 'Input Required',
        text: 'Please enter both token and password.',
        confirmButtonColor: '#7F00FF',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          content: 'text-gray-300 text-sm sm:text-base',
          confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
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
        confirmButtonColor: '#7F00FF',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          content: 'text-gray-300 text-sm sm:text-base',
          confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
        },
      });
      navigate('/login');
      return;
    }

    console.log('Input token:', token);
    console.log('Input password:', password);

    try {
      console.log('Attempting to query deposits');
      const depositsQuery = query(
        collection(db, 'deposits'),
        where('token', '==', token),
        where('password', '==', password)
      );
      console.log('Executing deposits query with token:', token);
      const depositsSnapshot = await getDocs(depositsQuery);
      console.log('Deposits snapshot size:', depositsSnapshot.size);

      if (depositsSnapshot.empty) {
        console.error('No deposits found for token:', token);
        Swal.fire({
          icon: 'error',
          title: 'Invalid Credentials',
          text: 'Invalid token or password.',
          confirmButtonColor: '#7F00FF',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
            title: 'text-lg sm:text-xl font-bold text-white',
            content: 'text-gray-300 text-sm sm:text-base',
            confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
        },
      });
      return;
    }

    // Log all deposits for debugging
    console.log('All deposits found:');
    let validDeposit = null;
    let depositId = null;
    depositsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`Deposit ID: ${doc.id}, Data:`, data);
      if (data.status === 'confirmed' && data.userId === user.uid) {
        validDeposit = data;
        depositId = doc.id;
      }
    });

    if (!validDeposit) {
      console.error('No confirmed deposit found for token:', token);
      Swal.fire({
        icon: 'error',
        title: 'Invalid Credentials',
        text: 'Invalid token or password.',
        confirmButtonColor: '#7F00FF',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
          title: 'text-lg sm:text-xl font-bold text-white',
          content: 'text-gray-300 text-sm sm:text-base',
          confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
        },
      });
      return;
    }

    console.log('Valid deposit found:', validDeposit);

    // Mark bot as activated
    const userDoc = doc(db, 'users', user.uid);
    await setDoc(userDoc, { botActivated: true }, { merge: true });
    console.log('Bot marked as activated for user:', user.uid);

    // Set deposit info
    setDepositInfo({
      email: validDeposit.email, // Use email from deposit (user's actual email)
      price: validDeposit.price,
      weeklySales: validDeposit.weeklySales,
      timestamp: validDeposit.timestamp?.toDate().toLocaleString('en-US') || 'N/A',
    });

    // Set bot sales to 0 initially
    setBotSales(0);
    console.log('Bot sales set to 0 initially');

    setIsBotActive(true);
    Swal.fire({
      icon: 'success',
      title: 'Bot Activated',
      text: 'Bot activated successfully! You can now view your bot details.',
      confirmButtonColor: '#7F00FF',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
        title: 'text-lg sm:text-xl font-bold text-white',
        content: 'text-gray-300 text-sm sm:text-base',
        confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
      },
    });
  } catch (err) {
    console.error('Error activating bot:', err.code, err.message, err);
    Swal.fire({
      icon: 'error',
      title: 'Bot Activation Failed',
      text: `Failed to activate bot: ${err.message}`,
      confirmButtonColor: '#7F00FF',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-gray-900 bg-opacity-20 backdrop-blur-lg text-white shadow-2xl rounded-lg animate-object max-w-[90vw]',
        title: 'text-lg sm:text-xl font-bold text-white',
        content: 'text-gray-300 text-sm sm:text-base',
        confirmButton: 'bg-purple-600 bg-opacity-80 backdrop-blur-md text-white px-4 py-2 rounded-md hover:bg-purple-700 hover:bg-opacity-90 transition-colors',
      },
    });
  }
};

return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white flex flex-col items-center gap-5 py-5  mx-auto relative overflow-hidden">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
    <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5 relative z-10">
      <Bot size={32} className="text-purple-400" /> Your Trading Bot
    </h1>
    <div className="bg-gray-900 bg-opacity-20 backdrop-blur-lg p-5 rounded-xl shadow-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(126,0,255,0.5)] w-full max-w-md border border-gray-700 border-opacity-20 relative z-10">
      {!isBotActive ? (
        <>
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-5 text-center">
            Enter Token and Password
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Token:
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your token"
              className="w-full p-3 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-lg border border-gray-700 border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-sm text-white placeholder-gray-400"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-3 bg-gray-900 bg-opacity-20 backdrop-blur-lg rounded-lg border border-gray-700 border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-sm text-white placeholder-gray-400"
            />
          </div>
          <button
            onClick={handleActivateBot}
            className="w-full bg-purple-600 bg-opacity-80 backdrop-blur-md text-white p-3 rounded-lg hover:bg-purple-700 hover:bg-opacity-90 transition-colors text-sm font-medium shadow-md hover:shadow-[0_0_10px_rgba(126,0,255,0.7)] border border-gray-700 border-opacity-20"
          >
            Activate Bot
          </button>
        </>
      ) : (
        <>
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-5 text-center">
            Your Bot Details
          </h2>
          {depositInfo && (
            <div className="mt-5 text-center text-sm text-gray-300">
              <p className="flex items-center justify-center gap-1.5 mb-2">
                <CheckCircle size={20} className="text-green-500" /> Bot is active!
              </p>
              <div className="text-left max-w-xs mx-auto">
                <p className="font-medium text-white">Deposit Info:</p>
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
        <p className="text-red-400 text-center mt-4 text-sm">
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-400 text-center mt-4 text-sm">
          {success}
        </p>
      )}
    </div>

    <style jsx>{`
      @media (max-width: 768px) {
        .bot-activation-page {
          padding: 10px;
        }
        .bot-activation-page > div {
          max-width: 100%;
        }
      }
      input::placeholder {
        color: #9CA3AF !important;
        opacity: 1;
      }
    `}</style>
  </div>
);
};

export default BotActivationPage;