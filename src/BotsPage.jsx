import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { CheckCircle, Bot } from 'lucide-react';

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
        setError('Please log in to activate your bot.');
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
        setError('No valid deposit found.');
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
        setError('No valid deposit found.');
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
          setSuccess('Balance updated and bot data cleared after 5 days.');
        } catch (balanceError) {
          console.error('Balance update error:', balanceError.code, balanceError.message);
          setError(`Failed to update balance: ${balanceError.message}`);
        }
      }
    } catch (err) {
      console.error('Error fetching deposit info:', err.code, err.message);
      setError(`Failed to fetch deposit: ${err.message}`);
    }
  };

  // Function to activate bot
  const handleActivateBot = async () => {
    setError('');
    setSuccess('');
    setDepositInfo(null);
    setBotSales(0); // Initially 0

    if (!token || !password) {
      setError('Please enter both token and password.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError('No authenticated user found. Please log in again.');
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
        setError('Invalid token or password.');
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
        setError('Invalid token or password.');
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
      setSuccess('Bot activated successfully! You can now view your bot details.');
    } catch (err) {
      console.error('Error activating bot:', err.code, err.message, err);
      setError(`Failed to activate bot: ${err.message}`);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFE0',
        padding: '20px',
        minHeight: '100vh',
        fontFamily: "'Roboto', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}
      className="bot-activation-page"
    >
      <h1
        style={{
          color: '#FFD700',
          textAlign: 'center',
          marginBottom: '20px',
          fontSize: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <Bot size={32} /> Your Trading Bot
      </h1>
      <div
        style={{
          backgroundColor: '#FFF',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.3s, transform 0.3s',
          width: '100%',
          maxWidth: '400px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.15)';
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {!isBotActive ? (
          <>
            <h2 style={{ color: '#333', marginBottom: '20px', fontSize: '1.5rem', textAlign: 'center' }}>
              Enter Token and Password
            </h2>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#333', marginBottom: '5px', fontWeight: '500' }}>
                Token:
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your token"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  color: '#000',
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FFD700';
                  e.target.style.boxShadow = '0 0 5px rgba(255, 215, 0, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ddd';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#333', marginBottom: '5px', fontWeight: '500' }}>
                Password:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  color: '#000',
                  transition: 'border-color 0.3s, box-shadow 0.3s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FFD700';
                  e.target.style.boxShadow = '0 0 5px rgba(255, 215, 0, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ddd';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <button
              onClick={handleActivateBot}
              style={{
                backgroundColor: '#FFD700',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#333',
                width: '100%',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'background-color 0.3s, transform 0.2s, box-shadow 0.3s',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Activate Bot
            </button>
          </>
        ) : (
          <>
            <h2 style={{ color: '#333', marginBottom: '20px', fontSize: '1.5rem', textAlign: 'center' }}>
              Your Bot Details
            </h2>
            {depositInfo && (
              <div style={{ marginTop: '20px', textAlign: 'center', color: '#333', fontSize: '1rem' }}>
                <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <CheckCircle size={20} color="#4caf50" /> Bot is active!
                </p>
                <div style={{ marginTop: '10px', textAlign: 'left', maxWidth: '300px', margin: '10px auto' }}>
                  <p><strong>Deposit Info:</strong></p>
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
          <p style={{ color: '#f44336', textAlign: 'center', marginTop: '15px', fontSize: '0.9rem' }}>
            {error}
          </p>
        )}
        {success && (
          <p style={{ color: '#4caf50', textAlign: 'center', marginTop: '15px', fontSize: '0.9rem' }}>
            {success}
          </p>
        )}
      </div>

      {/* Styling */}
      <style>
        {`
          @media (max-width: 768px) {
            .bot-activation-page {
              padding: 10px;
            }
            .bot-activation-page > div {
              max-width: 100%;
            }
          }
          input::placeholder {
            color: #000 !important;
            opacity: 1;
          }
          input::-webkit-input-placeholder {
            color: #000 !important;
          }
          input::-moz-placeholder {
            color: #000 !important;
          }
          input:-ms-input-placeholder {
            color: #000 !important;
          }
        `}
      </style>
    </div>
  );
};

export default BotActivationPage;